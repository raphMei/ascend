import { MOISL, shiftMonth } from '@/core/dates';
import { financeKey, monthOf } from '@/domain/habits';
import { DOM } from '@/domain/domains';
import { Bar } from '@/components/Bar';
import { Checkbox } from '@/components/Checkbox';
import { CommitInput } from '@/components/CommitInput';
import { DomainCard } from '@/components/DomainCard';
import { BackLink, PageHead } from '@/components/PageHead';
import { BarsChart } from '@/components/charts/BarsChart';
import { useClock } from '@/hooks/useClock';
import { useTick } from '@/hooks/useTick';
import { useData } from '@/state/DataContext';
import type { DomainModule } from '../types';
import { DisabledNotice } from '../shared/DisabledNotice';

const ITEMS = [
  ['point', 'Point finances du mois fait', 'Relire le mois écoulé : où est parti l\'argent.'],
  ['budget', 'Budget du mois revu', 'Revenus, charges fixes, ce qui reste.'],
  ['epargne', 'Virement d\'épargne fait', 'Le virement programmé est bien parti.'],
  ['invest', 'Versement d\'investissement fait', 'Selon ta stratégie à long terme, choisie par toi.']
] as const;

/** Les n derniers mois (AAAA-MM), du plus ancien au plus récent. */
const lastMonths = (n: number, today: string): string[] => Array.from({ length: n }, (_, i) => shiftMonth(today.slice(0, 7), -(n - 1 - i)));
const label = (month: string) => MOISL[+month.slice(5) - 1].slice(0, 4);

function useMonthDone(month: string): number {
  const { state } = useData();
  return ITEMS.filter(([k]) => state.progress.done[financeKey(month, k)]).length;
}

function Card() {
  const { today } = useClock();
  const n = useMonthDone(monthOf(today));
  return <DomainCard id="finances" stat={`${MOISL[+today.slice(5, 7) - 1]} : ${n} / ${ITEMS.length} faits`}><Bar pct={(n / ITEMS.length) * 100} domain="finances" /></DomainCard>;
}

function Page() {
  const { today } = useClock();
  const { state, settings, setProgress } = useData();
  const tick = useTick();
  const month = monthOf(today);
  const cur = state.progress.finance?.[month] ?? {};
  const months = lastMonths(6, today);
  const series = (key: 'savings' | 'invested') => months.map((m) => ({ x: label(m), y: state.progress.finance?.[m]?.[key] ?? null }));
  return (
    <>
      <BackLink to="/domains" label="Domaines" /><PageHead eyebrow="Domaine" title={DOM.finances.name} />
      {settings.financesMin < 5 && <DisabledNotice what="le point finances du premier dimanche du mois" />}
      <section className="card"><h2>{MOISL[+month.slice(5) - 1][0].toUpperCase() + MOISL[+month.slice(5) - 1].slice(1)} {month.slice(0, 4)}</h2>
        <div className="list" style={{ marginTop: 8 }}>
          {ITEMS.map(([k, t, sub]) => (
            <div className={'item' + (state.progress.done[financeKey(month, k)] ? ' done' : '')} key={k}>
              <Checkbox checked={!!state.progress.done[financeKey(month, k)]} onChange={(v) => tick(today, { scope: 'prog', key: financeKey(month, k) }, v)} domain="finances" label={t} />
              <div><div className="t">{t}</div><div className="muted" style={{ fontSize: 14 }}>{sub}</div></div>
            </div>
          ))}
        </div>
        <div className="fields" style={{ gridTemplateColumns: '1fr 1fr', marginTop: 14 }}>
          <label className="f">Épargné ce mois (€)<CommitInput type="number" min={0} step={10} value={cur.savings} onCommit={(v) => setProgress({ finance: { [month]: { savings: v } } })} /></label>
          <label className="f">Investi ce mois (€)<CommitInput type="number" min={0} step={10} value={cur.invested} onCommit={(v) => setProgress({ finance: { [month]: { invested: v } } })} /></label>
        </div>
      </section>
      <div className="grid two">
        <section className="card"><h2>Épargne</h2><p className="muted" style={{ margin: '4px 0 8px' }}>6 derniers mois, en euros</p><BarsChart items={series('savings')} color="--c-finances" label="Épargne par mois" /></section>
        <section className="card"><h2>Investissement</h2><p className="muted" style={{ margin: '4px 0 8px' }}>6 derniers mois, en euros</p><BarsChart items={series('invested')} color="--c-front" label="Investissement par mois" /></section>
      </div>
      <p className="muted" style={{ fontSize: 14 }}>Ascend enregistre tes chiffres et tes habitudes ; il ne donne aucun conseil financier ou d'investissement.</p>
    </>
  );
}

export const finances: DomainModule = { id: 'finances', Card, Page };
