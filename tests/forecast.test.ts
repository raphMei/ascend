import { JT } from '@/content/java/path';
import { paceForecast } from '@/domain/forecast';
import type { Progress } from '@/domain/types';

const TODAY = '2026-11-20';
const mins = (n: number) => JT.slice(0, n).reduce((a, s) => a + s.min, 0);
const total = JT.reduce((a, s) => a + s.min, 0);
const doneOn = (n: number, date: string): Progress => ({ done: Object.fromEntries(JT.slice(0, n).map((s) => [s.id, true])), doneAt: Object.fromEntries(JT.slice(0, n).map((s) => [s.id, date])) });

describe('prévision d\'achèvement', () => {
  it('aucun rythme : pas de date', () => {
    const f = paceForecast(JT, { done: {} }, TODAY);
    expect(f).toMatchObject({ eta: null, days: null, perDayMin: 0, finished: false, remainingMin: total });
  });
  it('rythme sur 14 jours : minutes par jour et date de fin cohérentes', () => {
    const f = paceForecast(JT, doneOn(10, '2026-11-15'), TODAY);
    expect(f.perDayMin).toBeCloseTo(mins(10) / 14, 5);
    expect(f.remainingMin).toBe(total - mins(10));
    expect(f.days).toBe(Math.ceil((total - mins(10)) / (mins(10) / 14)));
    expect(f.eta! > TODAY).toBe(true);
  });
  it('ne compte que la fenêtre : une étape terminée il y a 20 jours ne donne pas de rythme', () => {
    expect(paceForecast(JT, doneOn(10, '2026-10-30'), TODAY).eta).toBeNull();
  });
  it('les bornes de la fenêtre : aujourd\'hui compte, il y a 13 jours compte, il y a 14 jours non', () => {
    expect(paceForecast(JT, doneOn(1, TODAY), TODAY).eta).not.toBeNull();
    expect(paceForecast(JT, doneOn(1, '2026-11-07'), TODAY).eta).not.toBeNull();
    expect(paceForecast(JT, doneOn(1, '2026-11-06'), TODAY).eta).toBeNull();
  });
  it('des étapes cochées sans date (anciennes données) ne comptent pas dans le rythme, mais réduisent le reste', () => {
    const p: Progress = { done: { [JT[0].id]: true } };
    const f = paceForecast(JT, p, TODAY);
    expect(f.eta).toBeNull(); expect(f.remainingMin).toBe(total - JT[0].min);
  });
  it('parcours terminé', () => {
    const f = paceForecast(JT, doneOn(JT.length, TODAY), TODAY);
    expect(f).toMatchObject({ finished: true, remainingMin: 0, eta: null });
  });
  it('plus on va vite, plus la fin est proche', () => {
    const slow = paceForecast(JT, doneOn(2, TODAY), TODAY), fast = paceForecast(JT, doneOn(20, TODAY), TODAY);
    expect(fast.days!).toBeLessThan(slow.days!);
  });
});
