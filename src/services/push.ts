/** Notifications push côté application : autorisation, abonnement, enregistrement de l'abonnement.
    Les API du navigateur sont injectables pour les tests. Sur iPhone : iOS 16.4 minimum, application ajoutée à l'écran d'accueil. */

/** Clé publique VAPID (publique par conception), fournie au moment de la construction du site. */
export const VAPID_PUBLIC_KEY: string = import.meta.env.VITE_VAPID_PUBLIC_KEY ?? '';

export type PushStatus =
  | 'unsupported'      // navigateur sans notifications push
  | 'needs-install'    // iPhone/iPad hors écran d'accueil : iOS n'autorise les notifications que pour une application installée
  | 'unconfigured'     // clé VAPID absente de cette version du site
  | 'denied'           // refusées dans les réglages du navigateur
  | 'off'              // possible mais pas encore activé sur cet appareil
  | 'on';

export interface PushEnv {
  hasServiceWorker: boolean; hasPushManager: boolean; hasNotification: boolean;
  permission: NotificationPermission | 'unsupported'; standalone: boolean; ios: boolean;
}

export function readEnv(w: Window = window): PushEnv {
  const nav = w.navigator as Navigator & { standalone?: boolean };
  return {
    hasServiceWorker: 'serviceWorker' in nav, hasPushManager: 'PushManager' in w, hasNotification: 'Notification' in w,
    permission: 'Notification' in w ? Notification.permission : 'unsupported',
    standalone: !!nav.standalone || w.matchMedia?.('(display-mode: standalone)').matches === true,
    ios: /iPad|iPhone|iPod/.test(nav.userAgent) || (nav.platform === 'MacIntel' && nav.maxTouchPoints > 1)
  };
}

/** Statut affichable dans les réglages. `subscribed` : cet appareil a déjà un abonnement. */
export function pushStatus(env: PushEnv, subscribed: boolean, vapidKey = VAPID_PUBLIC_KEY): PushStatus {
  if (env.ios && !env.standalone) return 'needs-install';
  if (!env.hasServiceWorker || !env.hasPushManager || !env.hasNotification) return 'unsupported';
  if (!vapidKey) return 'unconfigured';
  if (env.permission === 'denied') return 'denied';
  return subscribed && env.permission === 'granted' ? 'on' : 'off';
}

export const swUrl = (): string => `${import.meta.env.BASE_URL}sw.js`;

/** Clé VAPID (base64url) → octets, format attendu par `pushManager.subscribe`. */
export function urlBase64ToBytes(b64: string): Uint8Array {
  const pad = '='.repeat((4 - (b64.length % 4)) % 4);
  const raw = atob((b64 + pad).replace(/-/g, '+').replace(/_/g, '/'));
  return Uint8Array.from(raw, (c) => c.charCodeAt(0));
}

/** Empreinte courte et stable de l'adresse d'un abonnement (sert d'identifiant dans Firestore). */
export async function subscriptionId(endpoint: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(endpoint));
  return Array.from(new Uint8Array(buf)).slice(0, 12).map((b) => b.toString(16).padStart(2, '0')).join('');
}

export interface StoredSubscription { endpoint: string; keys: { p256dh: string; auth: string }; created: string; ua: string }

export async function currentSubscription(): Promise<PushSubscription | null> {
  if (!('serviceWorker' in navigator)) return null;
  const reg = await navigator.serviceWorker.getRegistration(swUrl());
  return reg ? reg.pushManager.getSubscription() : null;
}

/** À appeler depuis un geste de l'utilisateur (iOS l'exige). Retourne l'abonnement à enregistrer côté serveur. */
export async function enablePush(vapidKey = VAPID_PUBLIC_KEY): Promise<{ id: string; sub: StoredSubscription }> {
  const perm = await Notification.requestPermission();
  if (perm !== 'granted') throw new Error('permission-' + perm);
  const reg = await navigator.serviceWorker.register(swUrl());
  await navigator.serviceWorker.ready;
  const existing = await reg.pushManager.getSubscription();
  const sub = existing ?? await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlBase64ToBytes(vapidKey) as BufferSource });
  const json = sub.toJSON();
  if (!json.endpoint || !json.keys?.p256dh || !json.keys.auth) throw new Error('subscription-invalid');
  return { id: await subscriptionId(json.endpoint), sub: { endpoint: json.endpoint, keys: { p256dh: json.keys.p256dh, auth: json.keys.auth }, created: new Date().toISOString(), ua: navigator.userAgent.slice(0, 120) } };
}

export async function disablePush(): Promise<string | null> {
  const sub = await currentSubscription();
  if (!sub) return null;
  const id = await subscriptionId(sub.endpoint);
  await sub.unsubscribe();
  return id;
}

/** Notification locale de test (ne passe pas par le serveur) : vérifie que l'appareil sait afficher les rappels. */
export async function showTestNotification(): Promise<void> {
  const reg = await navigator.serviceWorker.getRegistration(swUrl());
  await (reg ?? await navigator.serviceWorker.register(swUrl())).showNotification('Ascend', { body: 'Les rappels fonctionnent sur cet appareil.', icon: 'icon-192.png', tag: 'test' });
}
