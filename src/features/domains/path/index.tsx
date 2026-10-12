import type { PathDef } from '@/content/paths';
import { pathStats } from '@/domain/progress';
import { Bar } from '@/components/Bar';
import { DomainCard } from '@/components/DomainCard';
import { useData } from '@/state/DataContext';
import type { DomainModule } from '../types';
import { DisabledNotice } from '../shared/DisabledNotice';
import { PathOverviewPage, PathPhasePage } from '../shared/PathPages';

/** Module de domaine d'un parcours en phases (dev front, Cloud et DevOps, Architecture logicielle) : carte, vue d'ensemble et détail d'une phase. */
export function pathModule(def: PathDef): DomainModule {
  const useStats = () => pathStats(def.phases, def.levels, def.hours, useData().state.progress);

  function Card() {
    const s = useStats();
    return <DomainCard id={def.id} stat={`${s.level} · ${s.pct}%`}><Bar pct={s.pct} domain={def.id} /></DomainCard>;
  }

  function Page({ sub }: { sub?: string }) {
    const stats = useStats();
    const { settings } = useData();
    if (sub && def.phaseById[sub]) return <PathPhasePage domain={def.id} phase={def.phaseById[sub]} total={def.phases.length} />;
    return <PathOverviewPage domain={def.id} phases={def.phases} stats={stats} notice={settings[def.min] < 5 ? <DisabledNotice what={def.what} /> : undefined} />;
  }

  return { id: def.id, Card, Page };
}
