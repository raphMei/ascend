/* Envoi des rappels : exécuté toutes les 20 minutes par GitHub Actions (.github/workflows/reminders.yml).
   Lit les données de chaque utilisateur avec un compte de service Firebase, calcule les rappels dus (logique de
   src/domain/reminders.ts, hors Chabbat) et les envoie en Web Push. Chaque rappel n'est envoyé qu'une fois (clé « sent »).

   Variables d'environnement : FIREBASE_SERVICE_ACCOUNT (JSON), VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT (mailto:…). */
import { cert, initializeApp } from 'firebase-admin/app';
import { FieldPath, FieldValue, getFirestore } from 'firebase-admin/firestore';
import webpush from 'web-push';
import { addDays } from '../src/core/dates';
import { parisNow } from '../src/core/paris';
import { resolveSettings } from '../src/domain/settings';
import { remindersToSend } from '../src/domain/reminders';
import type { DayData, Progress, Settings } from '../src/domain/types';

const { FIREBASE_SERVICE_ACCOUNT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT } = process.env;
if (!FIREBASE_SERVICE_ACCOUNT || !VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY || !VAPID_SUBJECT) {
  console.log('Rappels non configurés (secrets manquants) : rien à faire. Voir docs/RAPPELS.md.');
  process.exit(0);
}

initializeApp({ credential: cert(JSON.parse(FIREBASE_SERVICE_ACCOUNT)) });
webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
const db = getFirestore();

interface Sub { endpoint: string; keys: { p256dh: string; auth: string } }
// Variables de test uniquement : REMINDERS_NOW fige l'heure, DRY_RUN n'envoie rien (aucun appel réseau).
const { date, minutes } = parisNow(process.env.REMINDERS_NOW ? new Date(process.env.REMINDERS_NOW) : new Date());
const DRY_RUN = process.env.DRY_RUN === '1';
let sentCount = 0, users = 0;

for (const userRef of await db.collection('users').listDocuments()) {
  try {
    const [pushSnap, setSnap, progSnap, daySnap] = await Promise.all([
      userRef.collection('push').doc('main').get(), userRef.collection('settings').doc('main').get(),
      userRef.collection('progress').doc('main').get(), userRef.collection('days').doc(date).get()
    ]);
    const push = pushSnap.data() as { subscriptions?: Record<string, Sub | null>; sent?: Record<string, string> } | undefined;
    const subs = Object.entries(push?.subscriptions ?? {}).filter((e): e is [string, Sub] => !!e[1]);
    if (!subs.length) continue;
    users++;
    const settings: Settings = resolveSettings(setSnap.data() as Partial<Settings> | undefined);
    const progress: Progress = { done: {}, ...(progSnap.data() as Partial<Progress> | undefined) };
    const due = remindersToSend({ date, now: minutes, settings, progress, day: daySnap.data() as DayData | undefined, sent: push?.sent ?? {} });

    for (const r of due) {
      const payload = JSON.stringify({ title: r.title, body: r.body, tag: r.key, url: './#/today' });
      let delivered = false;
      for (const [id, sub] of subs) {
        try { if (DRY_RUN) console.log('[dry-run]', id, payload); else await webpush.sendNotification(sub, payload, { TTL: 3600 }); delivered = true; }
        catch (e) {
          const status = (e as { statusCode?: number }).statusCode;
          if (status === 404 || status === 410) await userRef.collection('push').doc('main').set({ subscriptions: { [id]: null } }, { merge: true });   // abonnement expiré
          else console.error('Envoi échoué', id, status ?? e);
        }
      }
      // On marque « envoyé » même si aucun appareil n'a répondu : mieux vaut manquer un rappel que spammer.
      await userRef.collection('push').doc('main').set({ sent: { [r.key]: new Date().toISOString() } }, { merge: true });
      if (delivered) sentCount++;
    }
    // Ménage : on oublie les rappels de plus de 3 jours.
    const old = Object.keys(push?.sent ?? {}).filter((k) => k.slice(0, 10) < addDays(date, -3));
    for (const k of old) await userRef.collection('push').doc('main').update(new FieldPath('sent', k), FieldValue.delete());
  } catch (e) { console.error('Utilisateur ignoré (erreur) :', userRef.id, e); }
}
console.log(`Rappels : ${sentCount} envoyé(s), ${users} utilisateur(s) abonné(s), ${date} ${Math.floor(minutes / 60)}h${String(minutes % 60).padStart(2, '0')} (Paris).`);
