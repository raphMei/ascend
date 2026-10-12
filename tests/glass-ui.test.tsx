import { act, fireEvent, render, renderHook, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Celebration, useDayCelebration } from '@/components/habits/Celebration';
import { sparks } from '@/components/fx/sparks';
import { extendTimer, pauseTimer, remainingMs, startTimer } from '@/domain/timer';
import { haptic } from '@/hooks/feedback';
import { clearTimers } from '@/hooks/useTimer';
import { useRoll } from '@/hooks/useRoll';
import { DataProvider } from '@/state/DataContext';
import { fakeBackend, renderApp, TUESDAY } from './helpers';

/** jsdom n'a pas toujours PointerEvent : on en fournit un minimal pour simuler doigt et souris. */
beforeAll(() => {
  if (typeof window.PointerEvent === 'undefined') {
    class P extends MouseEvent { pointerId: number; pointerType: string; constructor(type: string, init: PointerEventInit = {}) { super(type, init); this.pointerId = init.pointerId ?? 1; this.pointerType = init.pointerType ?? 'touch'; } }
    (window as unknown as { PointerEvent: typeof P }).PointerEvent = P;
  }
});
beforeEach(() => { clearTimers(); try { localStorage.clear(); } catch { /* ignoré */ } });

const swipeCard = () => screen.getByRole('checkbox', { name: 'Téphila' }).closest('.habit-swipe') as HTMLElement;
const todayWrites = (writes: { days: [string, Record<string, unknown>][] }) => writes.days.filter(([d]) => d === TUESDAY.today).map(([, p]) => p);

describe('cartes de verre : gestes', () => {
  it('appui long : le menu s\'ouvre avec les actions utiles', async () => {
    renderApp({ hash: '#/today' });
    const card = swipeCard();
    fireEvent.pointerDown(card, { pointerId: 1, clientX: 40, clientY: 40 });
    const menu = await screen.findByRole('dialog', { name: 'Téphila' }, { timeout: 2000 });
    expect(within(menu).getByRole('button', { name: /Démarrer le minuteur/ })).toBeInTheDocument();
    expect(within(menu).getByRole('button', { name: /Modifier l'horaire/ })).toBeInTheDocument();
    expect(within(menu).getByRole('button', { name: /Passer aujourd'hui/ })).toBeInTheDocument();
    expect(within(menu).queryByRole('button', { name: /Reporter à demain/ })).not.toBeInTheDocument();   // tâches MIAGE seulement
  });

  it('passer depuis le menu écrit l\'abandon du jour et propose « Annuler »', async () => {
    const { writes } = renderApp({ hash: '#/today' });
    fireEvent.pointerDown(swipeCard(), { pointerId: 1, clientX: 40, clientY: 40 });
    const menu = await screen.findByRole('dialog', { name: 'Téphila' }, { timeout: 2000 });
    await userEvent.click(within(menu).getByRole('button', { name: /Passer aujourd'hui/ }));
    expect(todayWrites(writes)).toContainEqual({ edits: { skip: { tephila: true } } });
    expect(screen.queryByRole('checkbox', { name: 'Téphila' })).not.toBeInTheDocument();
    const toast = await screen.findByText(/« Téphila » passée/);
    await userEvent.click(within(toast.parentElement as HTMLElement).getByRole('button', { name: 'Annuler' }));
    expect(todayWrites(writes)).toContainEqual({ edits: { skip: { tephila: null } } });
    expect(await screen.findByRole('checkbox', { name: 'Téphila' })).toBeInTheDocument();
  });

  it('balayer vers la droite coche la tâche', () => {
    const { writes } = renderApp({ hash: '#/today' });
    const card = swipeCard();
    fireEvent.pointerDown(card, { pointerId: 1, clientX: 20, clientY: 40 });
    fireEvent.pointerMove(card, { pointerId: 1, clientX: 60, clientY: 42 });
    fireEvent.pointerMove(card, { pointerId: 1, clientX: 260, clientY: 44 });
    fireEvent.pointerUp(card, { pointerId: 1, clientX: 260, clientY: 44 });
    expect(todayWrites(writes).some((p) => (p.done as Record<string, boolean> | undefined)?.tephila === true)).toBe(true);
  });

  it('balayer vers le bas (défilement) ne fait rien', () => {
    const { writes } = renderApp({ hash: '#/today' });
    const card = swipeCard();
    fireEvent.pointerDown(card, { pointerId: 1, clientX: 20, clientY: 40 });
    fireEvent.pointerMove(card, { pointerId: 1, clientX: 24, clientY: 120 });
    fireEvent.pointerUp(card, { pointerId: 1, clientX: 24, clientY: 120 });
    expect(todayWrites(writes)).toEqual([]);
  });

  it('un balayage court (sous le seuil) ne coche pas', () => {
    const { writes } = renderApp({ hash: '#/today' });
    const card = swipeCard();
    Object.defineProperty(card, 'offsetWidth', { value: 300, configurable: true });
    fireEvent.pointerDown(card, { pointerId: 1, clientX: 20, clientY: 40 });
    fireEvent.pointerMove(card, { pointerId: 1, clientX: 60, clientY: 41 });
    fireEvent.pointerMove(card, { pointerId: 1, clientX: 90, clientY: 42 });   // 70 px < 35 % de 300
    fireEvent.pointerUp(card, { pointerId: 1, clientX: 90, clientY: 42 });
    expect(todayWrites(writes)).toEqual([]);
  });

  it('le bouton « Options » du détail ouvre le même menu (alternative sans geste)', async () => {
    renderApp({ hash: '#/today' });
    await userEvent.click(screen.getByRole('button', { name: /Téphila/, expanded: false }));
    await userEvent.click(screen.getByRole('button', { name: 'Options de Téphila' }));
    expect(await screen.findByRole('dialog', { name: 'Téphila' })).toBeInTheDocument();
  });
});

describe('carte « Maintenant », mini-lecteur et concentration', () => {
  it('affiche la prochaine action, la lance au minuteur et la termine depuis le plein écran', async () => {
    const { writes } = renderApp({ hash: '#/today' });
    const next = screen.getByRole('region', { name: 'Prochaine action' });
    await userEvent.click(within(next).getByRole('button', { name: '▶ Démarrer' }));
    await userEvent.click(await screen.findByRole('button', { name: /Ouvrir le mode concentration/ }));
    const focus = await screen.findByRole('dialog', { name: /Concentration/ });
    await userEvent.click(within(focus).getByRole('button', { name: '+5 min' }));
    await userEvent.click(within(focus).getByRole('button', { name: /Pause/ }));
    expect(within(focus).getByRole('button', { name: /Reprendre/ })).toBeInTheDocument();
    await userEvent.click(within(focus).getByRole('button', { name: 'Terminer' }));
    expect(screen.queryByRole('dialog', { name: /Concentration/ })).not.toBeInTheDocument();
    expect(todayWrites(writes).some((p) => p.done)).toBe(true);
    expect(screen.queryByRole('button', { name: /Ouvrir le mode concentration/ })).not.toBeInTheDocument();   // minuteur arrêté
  });

  it('le mini-lecteur peut être fermé : le minuteur s\'arrête', async () => {
    renderApp({ hash: '#/today' });
    await userEvent.click(within(screen.getByRole('region', { name: 'Prochaine action' })).getByRole('button', { name: '▶ Démarrer' }));
    await userEvent.click(await screen.findByRole('button', { name: 'Arrêter le minuteur' }));
    expect(screen.queryByRole('button', { name: /Ouvrir le mode concentration/ })).not.toBeInTheDocument();
  });
});

describe('célébration', () => {
  it('seulement quand la journée passe à 100 % pendant que l\'appli est ouverte, une fois par jour', () => {
    const { result, rerender } = renderHook(({ c, d }) => useDayCelebration(c, d), { initialProps: { c: true, d: '2026-11-03' } });
    expect(result.current[0]).toBe(false);                    // déjà à 100 % au chargement : rien
    rerender({ c: false, d: '2026-11-03' });
    rerender({ c: true, d: '2026-11-03' });
    expect(result.current[0]).toBe(true);
    act(() => result.current[1]());
    expect(result.current[0]).toBe(false);
    rerender({ c: false, d: '2026-11-03' });
    rerender({ c: true, d: '2026-11-03' });
    expect(result.current[0]).toBe(false);                    // déjà fêtée aujourd'hui
  });

  it('changer de jour affiché ne déclenche rien', () => {
    const { result, rerender } = renderHook(({ c, d }) => useDayCelebration(c, d), { initialProps: { c: false, d: '2026-11-02' } });
    rerender({ c: true, d: '2026-11-03' });
    expect(result.current[0]).toBe(false);
  });
});

describe('retours et effets', () => {
  it('la vibration est appelée si elle existe, sans erreur sinon', () => {
    const vibrate = vi.fn();
    Object.defineProperty(navigator, 'vibrate', { value: vibrate, configurable: true });
    haptic(12);
    expect(vibrate).toHaveBeenCalledWith(12);
    Object.defineProperty(navigator, 'vibrate', { value: () => { throw new Error('non'); }, configurable: true });
    expect(() => haptic(12)).not.toThrow();
    Object.defineProperty(navigator, 'vibrate', { value: undefined, configurable: true });
    expect(() => haptic()).not.toThrow();
  });

  it('étincelles : rien sans taille (jsdom), 16 particules avec une taille, aucune si le mouvement est réduit', () => {
    const el = document.createElement('div');
    document.body.appendChild(el);
    sparks(el);
    expect(document.querySelectorAll('.spark')).toHaveLength(0);
    el.getBoundingClientRect = () => ({ left: 10, top: 10, width: 50, height: 50, right: 60, bottom: 60, x: 10, y: 10, toJSON() {} });
    const anim = vi.fn(() => ({}));
    (HTMLElement.prototype as unknown as { animate: unknown }).animate = anim;
    sparks(el);
    expect(document.querySelectorAll('.spark')).toHaveLength(16);
    expect(anim).toHaveBeenCalledTimes(16);
    document.querySelectorAll('.spark').forEach((s) => s.remove());
    window.matchMedia = ((q: string) => ({ matches: q.includes('reduce'), media: q, addEventListener() {}, removeEventListener() {} })) as unknown as typeof window.matchMedia;
    sparks(el);
    expect(document.querySelectorAll('.spark')).toHaveLength(0);
    delete (HTMLElement.prototype as unknown as { animate?: unknown }).animate;
    (window as { matchMedia?: unknown }).matchMedia = undefined;
  });
});

describe('compteur qui défile', () => {
  beforeEach(() => { vi.useFakeTimers(); });
  afterEach(() => { vi.useRealTimers(); (window as { matchMedia?: unknown }).matchMedia = undefined; });

  it('affiche la valeur tout de suite, puis roule vers la nouvelle', () => {
    const { result, rerender } = renderHook(({ v }) => useRoll(v), { initialProps: { v: 10 } });
    expect(result.current).toBe(10);
    rerender({ v: 50 });
    act(() => { vi.advanceTimersByTime(300); });
    expect(result.current).toBeGreaterThan(10);
    expect(result.current).toBeLessThan(50);
    act(() => { vi.advanceTimersByTime(800); });
    expect(result.current).toBe(50);
  });

  it('mouvement réduit : la valeur change tout de suite', () => {
    window.matchMedia = ((q: string) => ({ matches: q.includes('reduce'), media: q, addEventListener() {}, removeEventListener() {} })) as unknown as typeof window.matchMedia;
    const { result, rerender } = renderHook(({ v }) => useRoll(v), { initialProps: { v: 10 } });
    rerender({ v: 80 });
    expect(result.current).toBe(80);
  });
});

describe('minuteur rallongé', () => {
  it('+5 min en marche ou en pause', () => {
    const t = startTimer(25, 0);
    expect(remainingMs(extendTimer(t, 5 * 60_000), 0)).toBe(30 * 60_000);
    const p = pauseTimer(t, 10 * 60_000);
    expect(remainingMs(extendTimer(p, 5 * 60_000), 0)).toBe(20 * 60_000);
  });
});

describe('célébration (rendu)', () => {
  const show = (streak: number, onClose = () => {}) => render(
    <DataProvider backend={fakeBackend().backend}><Celebration streak={streak} onClose={onClose} /></DataProvider>
  );
  it('palier à 7 jours : message spécial', () => {
    show(7);
    const d = screen.getByRole('dialog', { name: 'Journée terminée' });
    expect(within(d).getByText("Palier : 7 jours d'affilée !")).toBeInTheDocument();
    expect(within(d).getByText('7')).toBeInTheDocument();
  });
  it('jour ordinaire : message sobre, et « Continuer » ferme', async () => {
    const onClose = vi.fn();
    show(12, onClose);
    expect(screen.getByText("jours d'affilée")).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Continuer' }));
    expect(onClose).toHaveBeenCalledOnce();
  });
});

describe('réglage du son', () => {
  it('le petit son de validation est désactivé par défaut et s\'active sans écraser les autres préférences d\'affichage', async () => {
    const { writes } = renderApp({ hash: '#/settings', seed: { settings: { ui: { today: 'frise' } } } });
    const box = await screen.findByRole('checkbox', { name: 'Petit son de validation' });
    expect(box).not.toBeChecked();
    await userEvent.click(box);
    expect(writes.settings).toContainEqual({ ui: { sound: true } });
  });
});
