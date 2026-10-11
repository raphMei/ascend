import { FRONT_HOURS, FRONT_LEVELS, FRONT_PHASES, frontPhaseById } from '@/content/front/path';
import { pathStats } from '@/domain/progress';
import { Bar } from '@/components/Bar';
import { DomainCard } from '@/components/DomainCard';
import { useData } from '@/state/DataContext';
import type { DomainModule } from '../types';
import { DisabledNotice } from '../shared/DisabledNotice';
import { PathOverviewPage, PathPhasePage } from '../shared/PathPages';

const useStats = () => pathStats(FRONT_PHASES, FRONT_LEVELS, FRONT_HOURS, useData().state.progress);

function Card() {
  const s = useStats();
  return <DomainCard id="front" stat={`${s.level} · ${s.pct}%`}><Bar pct={s.pct} domain="front" /></DomainCard>;
}

function Page({ sub }: { sub?: string }) {
  const stats = useStats();
  const { settings } = useData();
  if (sub && frontPhaseById[sub]) return <PathPhasePage domain="front" phase={frontPhaseById[sub]} total={FRONT_PHASES.length} />;
  return <PathOverviewPage domain="front" phases={FRONT_PHASES} stats={stats} notice={settings.frontMin < 5 ? <DisabledNotice what="la séance quotidienne de dev front" /> : undefined} />;
}

export const front: DomainModule = { id: 'front', Card, Page };
