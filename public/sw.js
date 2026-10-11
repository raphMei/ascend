/* Service worker d'Ascend : uniquement les notifications push. Aucun cache, aucun mode hors-ligne
   (abandonné volontairement). Le fichier est servi tel quel, sans compilation. */
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));

self.addEventListener('push', (event) => {
  let data;
  try { data = event.data ? event.data.json() : {}; } catch { data = { title: 'Ascend', body: event.data ? event.data.text() : '' }; }
  const title = data.title || 'Ascend';
  event.waitUntil(self.registration.showNotification(title, {
    body: data.body || '',
    tag: data.tag || undefined,          // une notification de même tag remplace la précédente
    icon: 'icon-192.png',
    badge: 'icon-192.png',
    data: { url: data.url || './#/today' }
  }));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const target = new URL(event.notification.data && event.notification.data.url ? event.notification.data.url : './#/today', self.registration.scope).href;
  event.waitUntil((async () => {
    const all = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const c of all) { if (c.url.startsWith(self.registration.scope)) { await c.focus(); if ('navigate' in c) await c.navigate(target); return; } }
    await self.clients.openWindow(target);
  })());
});
