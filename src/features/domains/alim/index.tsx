import { JOURS, dow, fmtShort, lastDays } from '@/core/dates';
import { BackLink, PageHead } from '@/components/PageHead';
import { Bar } from '@/components/Bar';
import { DomainCard } from '@/components/DomainCard';
import { TrackerFields } from '@/components/TrackerFields';
import { BarsChart } from '@/components/charts/BarsChart';
import { LineChart } from '@/components/charts/LineChart';
import { DOM } from '@/domain/domains';
import type { DayData } from '@/domain/types';
import { useClock } from '@/hooks/useClock';
import { useData } from '@/state/DataContext';
import type { DomainModule } from '../types';

function Card() {
  const { state, settings: s } = useData();
  const { today } = useClock();
  const water = state.days[today]?.water ?? 0;
  return <DomainCard id="alim" stat={`${water} / ${s.waterGoal} ml d'eau`}><Bar pct={(water / s.waterGoal) * 100} domain="alim" /></DomainCard>;
}

function Page() {
  const { state, settings: s } = useData();
  const { today } = useClock();
  const dates = lastDays(10, today);
  const series = (key: keyof Pick<DayData, 'protein' | 'water' | 'kcal'>, scale = 1) =>
    dates.map((d) => { const v = state.days[d]?.[key]; return { x: JOURS[dow(d)].slice(0, 2), y: v != null ? +v / scale : null }; });
  const weight = lastDays(30, today).map((d) => { const w = state.days[d]?.weight; return { x: fmtShort(d), y: w != null ? +w : null }; });
  return (
    <>
      <BackLink to="/domains" label="Domaines" /><PageHead eyebrow="Domaine" title={DOM.alim.name} />
      <section className="card"><h2>Aujourd'hui</h2><p className="muted" style={{ margin: '4px 0 14px' }}>Objectifs : {s.kcalGoal} kcal, {s.protGoal} g de protéines, {s.waterGoal / 1000} L d'eau. Modifiables dans les réglages.</p><TrackerFields date={today} /></section>
      <div className="grid two">
        <section className="card"><h2>Protéines</h2><p className="muted" style={{ margin: '4px 0 8px' }}>grammes par jour</p><BarsChart items={series('protein')} color="--c-alim" goal={s.protGoal} goalLabel={s.protGoal + ' g'} label="Protéines" /></section>
        <section className="card"><h2>Eau</h2><p className="muted" style={{ margin: '4px 0 8px' }}>litres par jour</p><BarsChart items={series('water', 1000)} color="--c-sommeil" goal={s.waterGoal / 1000} goalLabel={s.waterGoal / 1000 + ' L'} label="Eau" /></section>
        <section className="card"><h2>Calories</h2><p className="muted" style={{ margin: '4px 0 8px' }}>par jour</p><BarsChart items={series('kcal')} color="--c-java" goal={s.kcalGoal} goalLabel={String(s.kcalGoal)} label="Calories" /></section>
        <section className="card"><h2>Poids</h2><p className="muted" style={{ margin: '4px 0 8px' }}>30 derniers jours</p><LineChart points={weight} color="--c-alim" label="Poids" /></section>
      </div>
    </>
  );
}

export const alim: DomainModule = { id: 'alim', Card, Page };
