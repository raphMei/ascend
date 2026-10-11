/* Le service worker (public/sw.js) est exécuté dans un faux contexte : affichage d'une notification, clic. */
import { readFileSync } from 'node:fs';

function loadSw() {
  const handlers: Record<string, (e: unknown) => void> = {};
  const shown: { title: string; opts: Record<string, unknown> }[] = [];
  const opened: string[] = [];
  const focused: string[] = [];
  const self = {
    addEventListener: (t: string, fn: (e: unknown) => void) => { handlers[t] = fn; },
    skipWaiting: () => {},
    clients: {
      claim: async () => {},
      matchAll: async () => existing,
      openWindow: async (u: string) => { opened.push(u); }
    },
    registration: { scope: 'https://raphmei.github.io/ascend/', showNotification: async (title: string, opts: Record<string, unknown>) => { shown.push({ title, opts }); } }
  };
  const existing: { url: string; focus: () => Promise<void>; navigate?: (u: string) => Promise<void> }[] = [];
  new Function('self', readFileSync('public/sw.js', 'utf8'))(self);
  const waitable = () => { const p: Promise<unknown>[] = []; return { waitUntil: (x: Promise<unknown>) => { p.push(x); }, done: () => Promise.all(p) }; };
  return { handlers, shown, opened, focused, existing, waitable };
}

describe('service worker', () => {
  it('affiche la notification reçue', async () => {
    const sw = loadSw(); const w = sw.waitable();
    sw.handlers.push({ ...w, data: { json: () => ({ title: 'Ta routine t\'attend', body: '75 minutes', tag: '2026-10-14:routine' }) } });
    await w.done();
    expect(sw.shown).toHaveLength(1);
    expect(sw.shown[0].title).toBe('Ta routine t\'attend');
    expect(sw.shown[0].opts).toMatchObject({ body: '75 minutes', tag: '2026-10-14:routine' });
  });

  it('résiste à un message vide ou illisible', async () => {
    const sw = loadSw();
    const w1 = sw.waitable(); sw.handlers.push({ ...w1, data: null }); await w1.done();
    const w2 = sw.waitable(); sw.handlers.push({ ...w2, data: { json: () => { throw new Error('x'); }, text: () => 'brut' } }); await w2.done();
    expect(sw.shown.map((s) => s.title)).toEqual(['Ascend', 'Ascend']);
    expect(sw.shown[1].opts.body).toBe('brut');
  });

  it('le clic ouvre l\'application (ou la remet au premier plan)', async () => {
    const sw = loadSw(); const w = sw.waitable(); let closed = false;
    sw.handlers.notificationclick({ ...w, notification: { close: () => { closed = true; }, data: { url: './#/today' } } });
    await w.done();
    expect(closed).toBe(true);
    expect(sw.opened).toEqual(['https://raphmei.github.io/ascend/#/today']);

    const sw2 = loadSw(); const w2 = sw2.waitable(); const nav: string[] = [];
    sw2.existing.push({ url: 'https://raphmei.github.io/ascend/#/home', focus: async () => { sw2.focused.push('x'); }, navigate: async (u) => { nav.push(u); } });
    sw2.handlers.notificationclick({ ...w2, notification: { close: () => {}, data: {} } });
    await w2.done();
    expect(sw2.focused).toEqual(['x']); expect(nav).toEqual(['https://raphmei.github.io/ascend/#/today']); expect(sw2.opened).toEqual([]);
  });
});
