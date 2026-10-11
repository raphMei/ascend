import { fmtShort, lastDays } from '@/core/dates';
import { englishExerciseFor, TOEIC_MAX } from '@/content/english';
import { DOM } from '@/domain/domains';
import { Bar } from '@/components/Bar';
import { BlockRow } from '@/components/BlockRow';
import { CommitInput } from '@/components/CommitInput';
import { DomainCard } from '@/components/DomainCard';
import { BackLink, PageHead } from '@/components/PageHead';
import { Strip14 } from '@/components/Strip14';
import { LineChart } from '@/components/charts/LineChart';
import { useClock } from '@/hooks/useClock';
import { usePlan } from '@/hooks/usePlan';
import { useData } from '@/state/DataContext';
import type { DomainModule } from '../types';
import { DisabledNotice } from '../shared/DisabledNotice';

/** Séances d'anglais faites sur les 7 derniers jours. */
function useWeek(): number {
  const { state } = useData();
  const { today } = useClock();
  return lastDays(7, today).filter((d) => state.days[d]?.done?.anglais).length;
}

function Card() {
  const n = useWeek();
  const { settings } = useData();
  return <DomainCard id="anglais" stat={settings.anglaisMin >= 5 ? `${n} séance${n > 1 ? 's' : ''} sur 7 jours` : 'Pas encore activé'}>{settings.anglaisMin >= 5 && <Bar pct={(n / 7) * 100} domain="anglais" />}</DomainCard>;
}

function Page() {
  const { today, now } = useClock();
  const { state, settings, setProgress, setSettings } = useData();
  const { plan } = usePlan(today);
  const blocks = plan.blocks.filter((b) => b.domain === 'anglais');
  const [name, text] = englishExerciseFor(today);
  const scores = Object.entries(state.progress.toeic ?? {}).filter((e): e is [string, number] => e[1] != null).sort(([a], [b]) => (a < b ? -1 : 1));
  const last = scores[scores.length - 1];
  const goal = settings.toeicGoal ?? undefined;
  return (
    <>
      <BackLink to="/domains" label="Domaines" /><PageHead eyebrow="Domaine" title={DOM.anglais.name} />
      {settings.anglaisMin < 5 && <DisabledNotice what="la séance d'anglais" />}
      <section className="card"><h2>Séance du jour : {name}</h2><p style={{ marginTop: 8 }}>{text}</p></section>
      {blocks.length > 0 && <section className="tl">{blocks.map((b) => <BlockRow key={b.id} block={b} date={today} today={today} now={now} />)}</section>}
      <section className="card"><h2>14 derniers jours</h2><div style={{ marginTop: 12 }}><Strip14 today={today} on={(d) => !!state.days[d]?.done?.anglais} domain="anglais" /></div></section>
      <section className="card"><h2>Mes scores TOEIC</h2>
        <p className="muted" style={{ margin: '4px 0 12px' }}>{last ? `Dernier test blanc : ${last[1]} / ${TOEIC_MAX} le ${fmtShort(last[0])}.` : 'Ajoute le score de chaque test blanc : la courbe montre si tu progresses.'}</p>
        <div className="fields" style={{ gridTemplateColumns: '1fr 1fr' }}>
          <label className="f">Score du test d'aujourd'hui<CommitInput type="number" min={0} max={TOEIC_MAX} step={5} value={state.progress.toeic?.[today]} placeholder={`/ ${TOEIC_MAX}`} onCommit={(v) => setProgress({ toeic: { [today]: v === '' ? null : v } })} /></label>
          <label className="f">Score visé<CommitInput type="number" min={0} max={TOEIC_MAX} step={5} value={settings.toeicGoal} placeholder="facultatif" onCommit={(v) => setSettings({ toeicGoal: v === '' ? null : v })} /></label>
        </div>
        <div style={{ marginTop: 12 }}><LineChart points={scores.map(([d, y]) => ({ x: fmtShort(d), y }))} color="--c-anglais" goal={goal} label="Scores TOEIC" /></div>
      </section>
    </>
  );
}

export const anglais: DomainModule = { id: 'anglais', Card, Page };
