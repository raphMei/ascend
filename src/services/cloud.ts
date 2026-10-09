/** Backend Firebase : connexion Google + Firestore (écoute temps réel, écritures en merge).
    Le SDK est chargé à la demande pour ne pas alourdir le mode démo. */
import { FB_CONFIG } from './config';
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
  const stop = () => { unsubs.forEach((u) => u()); unsubs = []; };
  const write = (path: string[], patch: Record<string, unknown>) => {
    if (!uid) return;
    const [col, ...rest] = path;
    F.setDoc(F.doc(db, 'users', uid, col, ...rest), patch, { merge: true }).catch(fail);
  };
  const subscribe = (id: string, l: BackendListener) => {
    stop();
    unsubs.push(F.onSnapshot(F.collection(db, 'users', id, 'days'), (snap) => {
      const days: Record<string, DayData> = {};
      snap.forEach((d) => { days[d.id] = d.data() as DayData; });
      l.onDays(days);
    }, fail));
    unsubs.push(F.onSnapshot(F.doc(db, 'users', id, 'settings', 'main'), (d) => l.onSettings(d.exists() ? (d.data() as Partial<Settings>) : {}), fail));
    unsubs.push(F.onSnapshot(F.doc(db, 'users', id, 'progress', 'main'), (d) => l.onProgress(d.exists() ? { done: {}, ...(d.data() as Partial<Progress>) } : { done: {} }), fail));
  };
  return {
    async start(l) {
      listener = l;
      try { await A.setPersistence(auth, A.browserLocalPersistence); } catch { /* ignore */ }
      try { await A.getRedirectResult(auth); } catch (e) { l.onError(codeOf(e)); }
      A.onAuthStateChanged(auth, (u) => {
        uid = u ? u.uid : null;
        if (u) { l.onAuth({ uid: u.uid, email: u.email, displayName: u.displayName }); subscribe(u.uid, l); } else { stop(); l.onAuth(null); }
      });
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
    writeDay(date, patch) { write(['days', date], patch); },
    writeSettings(patch) { write(['settings', 'main'], patch); },
    writeProgress(patch) { write(['progress', 'main'], patch); }
  };
}
