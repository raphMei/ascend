/* Le script d'envoi des rappels, de bout en bout sur l'émulateur Firestore (mode DRY_RUN : aucun appel réseau). */
import { execFileSync } from 'node:child_process';
import { generateKeyPairSync } from 'node:crypto';
import { initializeApp, deleteApp, type App } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import webpush from 'web-push';

process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8080';
let app: App;
const pem = generateKeyPairSync('rsa', { modulusLength: 2048 }).privateKey.export({ type: 'pkcs8', format: 'pem' }) as string;
const VAPID = webpush.generateVAPIDKeys();
const SA = JSON.stringify({ type: 'service_account', project_id: 'demo-ascend', private_key: pem, client_email: 'test@demo-ascend.iam.gserviceaccount.com' });

beforeAll(() => { app = initializeApp({ projectId: 'demo-ascend' }, 'test'); });
afterAll(async () => { await deleteApp(app); });
const db = () => getFirestore(app);

const run = (at: string) => execFileSync('npx', ['tsx', 'scripts/send-reminders.ts'], {
  env: { ...process.env, FIREBASE_SERVICE_ACCOUNT: SA, VAPID_PUBLIC_KEY: VAPID.publicKey, VAPID_PRIVATE_KEY: VAPID.privateKey, VAPID_SUBJECT: 'mailto:test@example.com', DRY_RUN: '1', REMINDERS_NOW: at, GCLOUD_PROJECT: 'demo-ascend' },
  encoding: 'utf8'
});

const SUB = { endpoint: 'https://push.example/abc', keys: { p256dh: 'p', auth: 'a' } };

describe('envoi des rappels', () => {
  beforeEach(async () => {
    await fetch('http://127.0.0.1:8080/emulator/v1/projects/demo-ascend/databases/(default)/documents', { method: 'DELETE' });
    await db().doc('users/u1/push/main').set({ subscriptions: { s1: SUB } });
  });

  it('envoie la routine à 6 h 05 (heure de Paris), une seule fois', async () => {
    const first = run('2026-10-14T04:05:00Z');   // mercredi 6 h 05 à Paris (UTC+2)
    expect(first).toContain('Ta routine t\'attend');
    const sent = (await db().doc('users/u1/push/main').get()).data()!.sent;
    expect(Object.keys(sent)).toContain('2026-10-14:routine');
    expect(run('2026-10-14T04:25:00Z')).not.toContain('Ta routine t\'attend');   // pas de doublon
  });

  it('rien à envoyer tant que l\'heure n\'est pas venue', () => {
    expect(run('2026-10-14T03:00:00Z')).not.toContain('[dry-run]');   // 5 h à Paris
  });

  it('aucun rappel pendant Chabbat (vendredi soir)', () => {
    const out = run('2026-11-06T20:30:00Z');   // vendredi 21 h 30 à Paris : après l'allumage
    expect(out).not.toContain('[dry-run]');
  });

  it('un rappel déjà satisfait n\'est pas envoyé (routine cochée)', async () => {
    await db().doc('users/u1/days/2026-10-14').set({ done: { tephila: true, pompes: true, stretch: true, petitdej: true } });
    expect(run('2026-10-14T04:05:00Z')).not.toContain('Ta routine t\'attend');
  });

  it('utilisateur sans abonnement : ignoré', async () => {
    await db().doc('users/u1/push/main').set({ subscriptions: {} });
    expect(run('2026-10-14T04:05:00Z')).toContain('0 utilisateur(s) abonné(s)');
  });

  it('sans secrets : sort proprement sans rien faire', () => {
    const out = execFileSync('npx', ['tsx', 'scripts/send-reminders.ts'], { env: { PATH: process.env.PATH ?? '', HOME: process.env.HOME ?? '' }, encoding: 'utf8' });
    expect(out).toContain('non configurés');
  });
});
