import { addDays, diffDays, dow, fmt, fmtLong, lastDays, range } from '@/core/dates';
import { dur, hm, hours, sleepDuration, toMin } from '@/core/format';
import { merge } from '@/core/merge';

describe('dates', () => {
  it('calcule sans décalage d\'heure d\'été', () => {
    expect(addDays('2026-10-24', 2)).toBe('2026-10-26');   // passage à l'heure d'hiver le 25 octobre
    expect(addDays('2027-03-27', 2)).toBe('2027-03-29');   // passage à l'heure d'été le 28 mars
    expect(diffDays('2026-10-24', '2026-10-26')).toBe(2);
  });
  it('jours de la semaine, plages et formats français', () => {
    expect(dow('2026-11-03')).toBe(2);
    expect(range('2026-11-01', '2026-11-03')).toEqual(['2026-11-01', '2026-11-02', '2026-11-03']);
    expect(lastDays(3, '2026-11-03')).toEqual(['2026-11-01', '2026-11-02', '2026-11-03']);
    expect(fmt('2026-11-03')).toBe('mar. 3 nov.');
    expect(fmtLong('2026-11-03')).toBe('mardi 3 novembre');
  });
});

describe('format', () => {
  it('heures et durées', () => {
    expect(hm(75)).toBe('01:15'); expect(hm(1500)).toBe('01:00');
    expect(dur(135)).toBe('2 h 15'); expect(dur(40)).toBe('40 min'); expect(hours(90)).toBe('1,5 h');
    expect(toMin('22:30')).toBe(1350);
  });
  it('sommeil qui franchit minuit', () => {
    expect(sleepDuration('22:30', '06:00')).toBe(450);
    expect(sleepDuration('00:30', '07:00')).toBe(390);
  });
});

describe('merge', () => {
  it('fusionne en profondeur sans muter les entrées', () => {
    const a = { done: { x: true }, w: 1 };
    const out = merge(a, { done: { y: false } });
    expect(out).toEqual({ done: { x: true, y: false }, w: 1 });
    expect(a).toEqual({ done: { x: true }, w: 1 });
  });
  it('remplace les tableaux et accepte undefined', () => {
    expect(merge({ onsite: [2, 4] }, { onsite: [1] })).toEqual({ onsite: [1] });
    expect(merge(undefined, { a: { b: 1 } })).toEqual({ a: { b: 1 } });
  });
});
