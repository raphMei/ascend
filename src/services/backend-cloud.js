/* Backend Firebase : connexion Google + Firestore (écoute temps réel, écritures en merge). */
import { FB_CONFIG, SDK } from './config.js';
import { store, notify, clearData } from '../state/store.js';

export async function cloudBackend() {
  const [appM, authM, fsM] = await Promise.all([import(SDK + 'firebase-app.js'), import(SDK + 'firebase-auth.js'), import(SDK + 'firebase-firestore.js')]);
  const app = appM.initializeApp(FB_CONFIG);
  const auth = authM.getAuth(app);
  const db = fsM.getFirestore(app);
  let unsubs = [];
  const stop = () => { unsubs.forEach((u) => u()); unsubs = []; };
  const fail = (e) => { store.sync = 'error'; store.error = (e && e.code) || String(e); notify(); };
  const userDoc = (...path) => fsM.doc(db, 'users', store.user.uid, ...path);
  const subscribe = (uid) => {
    stop();
    unsubs.push(fsM.onSnapshot(fsM.collection(db, 'users', uid, 'days'), (snap) => {
      const days = {}; snap.forEach((d) => { days[d.id] = d.data(); }); store.days = days; store.sync = 'ok'; notify();
    }, fail));
    unsubs.push(fsM.onSnapshot(fsM.doc(db, 'users', uid, 'settings', 'main'), (d) => { store.settings = d.exists() ? d.data() : {}; notify(); }, fail));
    unsubs.push(fsM.onSnapshot(fsM.doc(db, 'users', uid, 'progress', 'main'), (d) => { store.prog = d.exists() ? Object.assign({ done: {} }, d.data()) : { done: {} }; notify(); }, fail));
  };
  const write = (ref, patch) => fsM.setDoc(ref, patch, { merge: true }).catch(fail);
  return {
    async init() {
      try { await authM.setPersistence(auth, authM.browserLocalPersistence); } catch (e) { /* ignore */ }
      try { await authM.getRedirectResult(auth); } catch (e) { store.error = e.code || String(e); }
      authM.onAuthStateChanged(auth, (u) => {
        store.user = u; store.authReady = true;
        if (u) { store.sync = 'loading'; subscribe(u.uid); } else { stop(); clearData(); }
        notify();
      });
    },
    async signIn() {
      const provider = new authM.GoogleAuthProvider();
      try { await authM.signInWithPopup(auth, provider); }
      catch (e) {
        if (['auth/popup-blocked', 'auth/operation-not-supported-in-this-environment', 'auth/web-storage-unsupported'].includes(e.code)) await authM.signInWithRedirect(auth, provider);
        else if (e.code !== 'auth/popup-closed-by-user' && e.code !== 'auth/cancelled-popup-request') { store.error = e.code || String(e); notify(); }
      }
    },
    async signOut() { await authM.signOut(auth); },
    setDay(date, patch) { write(userDoc('days', date), patch); },
    setSettings(patch) { write(userDoc('settings', 'main'), patch); },
    setProg(patch) { write(userDoc('progress', 'main'), patch); }
  };
}
