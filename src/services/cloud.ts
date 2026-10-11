/** Backend Firebase : connexion Google + Firestore (écoute temps réel, écritures en merge).
    Le SDK est chargé à la demande pour ne pas alourdir le mode démo. */
import { FB_CONFIG } from './config';
import type { ISODate } from '@/core/dates';
import type { DayData, Progress, Settings } from '@/domain/types';
import type { Backend, BackendListener } from './types';

const POPUP_FALLBACK = ['auth/popup-blocked', 'auth/operation-not-supported-in-this-environment', 'auth/web-storage-unsupported'];
const SILENT = ['auth/popup-closed-by-user', 'auth/cancelled-popup-request'];
const codeOf = (e: unknown): string => (e && typeof e === 'object' && 'code' in e ? String((e as { code: unknown }).code) : String(e));

export async function cloudBackend(): Promise<Backend> {
  const [{ initializeApp }, A, F] = await Promise.all([import('firebase/app'), import('firebase/auth'), import('firebase/firestore')]);
  const app = initializeApp(FB_CONFIG);
  const auth = A.getAuth(app);
  const db = F.getFirestore(app);
  let listener: BackendListener | null = null;
  let unsubs: (() => void)[] = [];
  let uid: string | null = null;
  const fail = (e: unknown) => listener?.onError(codeOf(e));
  const stop = () => { unsubs.forEach((u) => u()); unsubs = []; daysUnsub?.(); daysUnsub = null; };
  let from: ISODate = '0000-00-00';
  let daysUnsub: (() => void) | null = null;
  /** Écriture : la promesse est rejetée en cas de refus (l'appelant annule alors l'affichage optimiste). */
  const write = async (path: string[], patch: Record<string, unknown>): Promise<void> => {
    if (!uid) throw new Error('not-signed-in');
    const [col, ...rest] = path;
    try { await F.setDoc(F.doc(db, 'users', uid, col, ...rest), patch, { merge: true }); }
    catch (e) { fail(e); throw e; }
  };
  /** Écoute des jours depuis `from` seulement (les identifiants sont des dates ISO : l'ordre des identifiants est l'ordre chronologique). */
  const subscribeDays = (id: string, l: BackendListener) => {
    daysUnsub?.();
    const q = F.query(F.collection(db, 'users', id, 'days'), F.where(F.documentId(), '>=', from));
    daysUnsub = F.onSnapshot(q, (snap) => {
      const days: Record<string, DayData> = {};
      snap.forEach((d) => { days[d.id] = d.data() as DayData; });
      l.onDays(days);
    }, fail);
  };
  const subscribe = (id: string, l: BackendListener) => {
    stop();
    subscribeDays(id, l);
    unsubs.push(F.onSnapshot(F.doc(db, 'users', id, 'settings', 'main'), (d) => l.onSettings(d.exists() ? (d.data() as Partial<Settings>) : {}), fail));
    unsubs.push(F.onSnapshot(F.doc(db, 'users', id, 'progress', 'main'), (d) => l.onProgress(d.exists() ? { done: {}, ...(d.data() as Partial<Progress>) } : { done: {} }), fail));
  };
  return {
    async start(l, historyFrom) {
      listener = l;
      from = historyFrom;
      try { await A.setPersistence(auth, A.browserLocalPersistence); } catch { /* ignore */ }
      try { await A.getRedirectResult(auth); } catch (e) { l.onError(codeOf(e)); }
      A.onAuthStateChanged(auth, (u) => {
        uid = u ? u.uid : null;
        if (u) { l.onAuth({ uid: u.uid, email: u.email, displayName: u.displayName }); subscribe(u.uid, l); } else { stop(); l.onAuth(null); }
      });
    },
    loadHistory(newFrom) {
      if (newFrom >= from || !uid || !listener) return;
      from = newFrom;
      subscribeDays(uid, listener);
    },
    async signIn() {
      const provider = new A.GoogleAuthProvider();
      try { await A.signInWithPopup(auth, provider); }
      catch (e) {
        const c = codeOf(e);
        if (POPUP_FALLBACK.includes(c)) await A.signInWithRedirect(auth, provider);   // iOS en mode standalone
        else if (!SILENT.includes(c)) fail(e);
      }
    },
    async signOut() { await A.signOut(auth); },
    writeDay: (date, patch) => write(['days', date], patch),
    writeSettings: (patch) => write(['settings', 'main'], patch),
    writeProgress: (patch) => write(['progress', 'main'], patch),
    writePush: (patch) => write(['push', 'main'], patch)
  };
}
