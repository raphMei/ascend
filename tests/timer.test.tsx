import { act, fireEvent, render, screen } from '@testing-library/react';
import { FocusTimer } from '@/components/habits/FocusTimer';
import { clearTimers } from '@/hooks/useTimer';
import { clock, isFinished, pauseTimer, remainingMs, resumeTimer, startTimer } from '@/domain/timer';

describe('minuteur (logique)', () => {
  it('compte à rebours, pause et reprise', () => {
    const t = startTimer(25, 0);
    expect(remainingMs(t, 0)).toBe(25 * 60_000);
    expect(remainingMs(t, 5 * 60_000)).toBe(20 * 60_000);
    const p = pauseTimer(t, 5 * 60_000);
    expect(p.kind).toBe('paused');
    expect(remainingMs(p, 999 * 60_000)).toBe(20 * 60_000);          // en pause : le temps ne passe pas
    const r = resumeTimer(p, 100 * 60_000);
    expect(remainingMs(r, 110 * 60_000)).toBe(10 * 60_000);
  });
  it('fini à zéro, jamais négatif', () => {
    const t = startTimer(1, 0);
    expect(isFinished(t, 59_999)).toBe(false); expect(isFinished(t, 60_000)).toBe(true);
    expect(remainingMs(t, 10 * 60_000)).toBe(0);
  });
  it('affichage mm:ss, arrondi supérieur', () => {
    expect(clock(25 * 60_000)).toBe('25:00'); expect(clock(61_000)).toBe('01:01'); expect(clock(500)).toBe('00:01'); expect(clock(0)).toBe('00:00');
  });
  it('ignore pause/reprise hors de leur état', () => {
    const t = startTimer(5, 0);
    expect(resumeTimer(t, 1000)).toBe(t); const p = pauseTimer(t, 1000); expect(pauseTimer(p, 2000)).toBe(p);
  });
});

describe('minuteur (composant)', () => {
  beforeEach(() => { vi.useFakeTimers(); vi.setSystemTime(new Date('2026-11-03T10:00:00')); clearTimers(); });
  afterEach(() => { vi.useRealTimers(); clearTimers(); });

  it('démarre, décompte, se met en pause et reprend', () => {
    render(<FocusTimer id="j:b:1" minutes={25} done={false} onComplete={() => {}} />);
    expect(screen.getByRole('timer')).toHaveTextContent('25:00');
    fireEvent.click(screen.getByRole('button', { name: /Démarrer \(25 min\)/ }));
    act(() => { vi.advanceTimersByTime(65_000); });
    expect(screen.getByRole('timer')).toHaveTextContent('23:55');
    fireEvent.click(screen.getByRole('button', { name: /Pause/ }));
    act(() => { vi.advanceTimersByTime(120_000); });
    expect(screen.getByRole('timer')).toHaveTextContent('23:55');
    fireEvent.click(screen.getByRole('button', { name: /Reprendre/ }));
    act(() => { vi.advanceTimersByTime(55_000); });
    expect(screen.getByRole('timer')).toHaveTextContent('23:00');
  });

  it('à la fin : signale la fin, vibre et propose de cocher', () => {
    const vibrate = vi.fn(); Object.defineProperty(navigator, 'vibrate', { value: vibrate, configurable: true });
    const onComplete = vi.fn();
    render(<FocusTimer id="j:b:2" minutes={10} done={false} onComplete={onComplete} />);
    fireEvent.click(screen.getByRole('button', { name: /Démarrer/ }));
    act(() => { vi.advanceTimersByTime(10 * 60_000 + 1000); });
    expect(screen.getByRole('status')).toHaveTextContent('Séance terminée');
    expect(vibrate).toHaveBeenCalledOnce();
    fireEvent.click(screen.getByRole('button', { name: 'Marquer comme fait' }));
    expect(onComplete).toHaveBeenCalledOnce();
    expect(screen.getByRole('timer')).toHaveTextContent('10:00');   // remis à zéro
  });

  it('« Recommencer » remet le minuteur à sa durée', () => {
    render(<FocusTimer id="j:b:3" minutes={15} done={false} onComplete={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: /Démarrer/ }));
    act(() => { vi.advanceTimersByTime(30_000); });
    fireEvent.click(screen.getByRole('button', { name: 'Recommencer' }));
    expect(screen.getByRole('timer')).toHaveTextContent('15:00');
    expect(screen.getByRole('button', { name: /Démarrer/ })).toBeInTheDocument();
  });

  it('un bloc déjà fait n\'affiche pas de minuteur', () => {
    const { container } = render(<FocusTimer id="j:b:4" minutes={15} done onComplete={() => {}} />);
    expect(container).toBeEmptyDOMElement();
  });
});
