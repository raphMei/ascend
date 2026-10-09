import type { ISODate } from '@/core/dates';
import { hours, sleepDuration } from '@/core/format';
import { useData } from '@/state/DataContext';
import { CommitInput } from './CommitInput';

/** Saisie des mesures du jour : poids, eau, calories, protéines, coucher / lever. */
export function TrackerFields({ date }: { date: ISODate }) {
  const { state, settings: s, setDay } = useData();
  const D = state.days[date] ?? {};
  const sl = D.sleep ?? {};
  const slDur = sl.bed && sl.wake ? sleepDuration(sl.bed, sl.wake) : null;
  const save = (key: 'weight' | 'water' | 'kcal' | 'protein') => (v: string | number | null) => setDay(date, { [key]: v });
  const saveSleep = (key: 'bed' | 'wake') => (v: string | number | null) => setDay(date, { sleep: { [key]: v } });
  const addWater = (ml: number) => setDay(date, { water: (D.water ?? 0) + ml });
  return (
    <>
      <div className="fields">
        <label className="f">Poids (kg)<CommitInput type="number" inputMode="decimal" step={0.1} min={30} max={250} value={D.weight} placeholder="87,0" onCommit={save('weight')} /></label>
        <label className="f">Eau (ml)<CommitInput type="number" inputMode="numeric" step={50} min={0} value={D.water} placeholder={String(s.waterGoal)} onCommit={save('water')} /></label>
        <label className="f">Calories<CommitInput type="number" inputMode="numeric" step={10} min={0} value={D.kcal} placeholder={String(s.kcalGoal)} onCommit={save('kcal')} /></label>
        <label className="f">Protéines (g)<CommitInput type="number" inputMode="numeric" step={1} min={0} value={D.protein} placeholder={String(s.protGoal)} onCommit={save('protein')} /></label>
        <label className="f">Coucher (la veille)<CommitInput type="time" value={sl.bed} onCommit={saveSleep('bed')} /></label>
        <label className="f">Lever<CommitInput type="time" value={sl.wake} onCommit={saveSleep('wake')} /></label>
        {slDur != null && <div className="f">Sommeil<div style={{ font: '700 22px DM Sans', color: 'var(--ink)', paddingTop: 8 }}>{hours(slDur)}</div></div>}
      </div>
      <div className="quick">
        {[[250, '+ 250 ml'], [500, '+ 500 ml'], [1000, '+ 1 L']].map(([ml, label]) => (
          <button key={ml} type="button" className="btn small" onClick={() => addWater(ml as number)}>{label}</button>
        ))}
      </div>
    </>
  );
}
