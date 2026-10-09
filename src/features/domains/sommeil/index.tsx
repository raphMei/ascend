import { JOURS, dow, lastDays } from '@/core/dates';
import { hours, sleepDuration, toMin } from '@/core/format';
import { BackLink, PageHead } from '@/components/PageHead';
import { Bar } from '@/components/Bar';
import { DomainCard } from '@/components/DomainCard';
import { TrackerFields } from '@/components/TrackerFields';
import { BarsChart } from '@/components/charts/BarsChart';
import { DOM } from '@/domain/domains';
import { useClock } from '@/hooks/useClock';
import { useData } from '@/state/DataContext';
import type { DomainModule } from '../types';

function useSleepMinutes(date: string): number | null {
  const { state } = useData();
  const sl = state.days[date]?.sleep;
  return sl?.bed && sl.wake ? sleepDuration(sl.bed, sl.wake) : null;
}

function Card() {
  const { settings: s } = useData();
  const { today } = useClock();
  const sl = useSleepMinutes(today);
  return <DomainCard id="sommeil" stat={sl != null ? 'Dernière nuit : ' + hours(sl) : 'Pas de nuit saisie'}>{sl != null && <Bar pct={(sl / 60 / s.sleepGoal) * 100} domain="sommeil" />}</DomainCard>;
}

function Page() {
  const { state, settings: s } = useData();
  const { today } = useClock();
  const dates = lastDays(14, today);
  const durs = dates.map((d) => { const sl = state.days[d]?.sleep; return sl?.bed && sl.wake ? sleepDuration(sl.bed, sl.wake) : null; });
  const ok = durs.filter((x): x is number => x != null);
  const avg = ok.length ? ok.reduce((a, b) => a + b, 0) / ok.length : null;
  // Régularité : écart-type de l'heure de coucher (après minuit = +24 h).
  const beds = dates.flatMap((d) => { const b = state.days[d]?.sleep?.bed; return b ? [toMin(b) < 360 ? toMin(b) + 1440 : toMin(b)] : []; });
  const mean = beds.reduce((a, b) => a + b, 0) / (beds.length || 1);
  const sd = beds.length > 2 ? Math.sqrt(beds.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / beds.length) : null;
  const goal = String(s.sleepGoal).replace('.', ',');
  return (
    <>
      <BackLink to="/domains" label="Domaines" /><PageHead eyebrow="Domaine" title={DOM.sommeil.name} />
      <section className="card">
        <div className="kpis"><div className="kpi"><b>{avg != null ? hours(avg) : '–'}</b><span>moyenne sur 14 jours</span></div><div className="kpi"><b>{goal} h</b><span>objectif</span></div><div className="kpi"><b>{sd != null ? Math.round(sd) + ' min' : '–'}</b><span>écart d'heure de coucher</span></div></div>
        <p className="muted" style={{ marginTop: 12 }}>Couche-toi à {s.bed} pour te lever à {s.wake} avec {goal} h de sommeil. Plus l'écart d'heure de coucher est petit, meilleur est le sommeil.</p>
      </section>
      <section className="card"><h2>Ma nuit</h2><p className="muted" style={{ margin: '4px 0 14px' }}>Saisis l'heure de coucher d'hier soir et l'heure de lever de ce matin.</p><TrackerFields date={today} /></section>
      <section className="card"><h2>14 dernières nuits</h2><p className="muted" style={{ margin: '4px 0 8px' }}>heures de sommeil</p>
        <BarsChart items={dates.map((d, i) => ({ x: JOURS[dow(d)].slice(0, 2), y: durs[i] != null ? Math.round(durs[i]! / 6) / 10 : null }))} color="--c-sommeil" goal={s.sleepGoal} goalLabel={goal + ' h'} label="Sommeil" />
      </section>
    </>
  );
}

export const sommeil: DomainModule = { id: 'sommeil', Card, Page };
