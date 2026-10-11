/* Règles de sécurité Firestore, exécutées sur l'émulateur : chacun ne lit et n'écrit que users/{son uid}/**. */
import { readFileSync } from 'node:fs';
import { assertFails, assertSucceeds, initializeTestEnvironment, type RulesTestEnvironment } from '@firebase/rules-unit-testing';
import { collection, doc, documentId, getDoc, getDocs, query, setDoc, where } from 'firebase/firestore';

let env: RulesTestEnvironment;

beforeAll(async () => {
  env = await initializeTestEnvironment({ projectId: 'demo-ascend', firestore: { rules: readFileSync('firestore.rules', 'utf8'), host: '127.0.0.1', port: 8080 } });
});
afterAll(async () => { await env.cleanup(); });
beforeEach(async () => { await env.clearFirestore(); });

const alice = () => env.authenticatedContext('alice').firestore();
const bob = () => env.authenticatedContext('bob').firestore();
const anon = () => env.unauthenticatedContext().firestore();

describe('lecture / écriture de ses propres données', () => {
  it('un utilisateur connecté écrit et relit ses jours, réglages et progression', async () => {
    const db = alice();
    await assertSucceeds(setDoc(doc(db, 'users/alice/days/2026-11-03'), { weight: 87, done: { tephila: true } }, { merge: true }));
    await assertSucceeds(setDoc(doc(db, 'users/alice/settings/main'), { theme: 'dark' }, { merge: true }));
    await assertSucceeds(setDoc(doc(db, 'users/alice/progress/main'), { done: { p1t1: true } }, { merge: true }));
    expect((await assertSucceeds(getDoc(doc(db, 'users/alice/days/2026-11-03')))).data()).toMatchObject({ weight: 87 });
  });

  it('la requête fenêtrée de l\'application (id ≥ date) est autorisée et renvoie les bons jours', async () => {
    const db = alice();
    for (const d of ['2026-01-01', '2026-10-01', '2026-11-03']) await setDoc(doc(db, `users/alice/days/${d}`), { weight: 1 });
    const q = query(collection(db, 'users/alice/days'), where(documentId(), '>=', '2026-10-01'));
    const snap = await assertSucceeds(getDocs(q));
    expect(snap.docs.map((d) => d.id).sort()).toEqual(['2026-10-01', '2026-11-03']);
  });
});

describe('isolation entre utilisateurs', () => {
  it('Bob ne lit ni n\'écrit les données d\'Alice', async () => {
    await env.withSecurityRulesDisabled(async (ctx) => { await setDoc(doc(ctx.firestore(), 'users/alice/days/2026-11-03'), { weight: 87 }); });
    await assertFails(getDoc(doc(bob(), 'users/alice/days/2026-11-03')));
    await assertFails(setDoc(doc(bob(), 'users/alice/days/2026-11-03'), { weight: 1 }));
    await assertFails(getDocs(collection(bob(), 'users/alice/days')));
    await assertFails(setDoc(doc(bob(), 'users/alice/settings/main'), { theme: 'dark' }));
  });
});

describe('utilisateur non connecté', () => {
  it('ne peut rien lire ni écrire', async () => {
    await assertFails(getDoc(doc(anon(), 'users/alice/days/2026-11-03')));
    await assertFails(setDoc(doc(anon(), 'users/alice/days/2026-11-03'), { weight: 1 }));
  });
});

describe('données connues seulement', () => {
  it('l\'application peut utiliser ses quatre collections', async () => {
    const db = alice();
    await assertSucceeds(setDoc(doc(db, 'users/alice/push/main'), { subscriptions: {} }, { merge: true }));
    await assertSucceeds(getDoc(doc(db, 'users/alice/push/main')));
  });
  it('une collection inconnue est interdite, même pour son propriétaire', async () => {
    await assertFails(setDoc(doc(alice(), 'users/alice/secret/x'), { a: 1 }));
    await assertFails(getDoc(doc(alice(), 'users/alice/secret/x')));
  });
  it('un jour dont l\'identifiant n\'est pas une date est refusé en écriture', async () => {
    await assertFails(setDoc(doc(alice(), 'users/alice/days/pas-une-date'), { weight: 1 }));
    await assertFails(setDoc(doc(alice(), 'users/alice/days/2026-13'), { weight: 1 }));
  });
  it('un seul document « main » pour les réglages et la progression', async () => {
    await assertFails(setDoc(doc(alice(), 'users/alice/settings/autre'), { theme: 'dark' }));
    await assertFails(setDoc(doc(alice(), 'users/alice/progress/autre'), { done: {} }));
  });
});

describe('hors de users/{uid}', () => {
  it('toute autre collection est interdite, même connecté', async () => {
    await assertFails(setDoc(doc(alice(), 'public/x'), { a: 1 }));
    await assertFails(getDoc(doc(alice(), 'public/x')));
    await assertFails(setDoc(doc(alice(), 'users/alice'), { a: 1 }).then(() => getDoc(doc(bob(), 'users/alice'))));
  });
});
