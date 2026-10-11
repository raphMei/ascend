import { PHASES, phaseById } from '@/content/java/path';
import { jStats } from '@/domain/progress';
import { Bar } from '@/components/Bar';
import { DomainCard } from '@/components/DomainCard';
import { useData } from '@/state/DataContext';
import type { DomainModule } from '../types';
import { PathOverviewPage, PathPhasePage } from '../shared/PathPages';

function Card() {
  const { state } = useData();
  const js = jStats(state.progress);
  return <DomainCard id="java" stat={`${js.level} · ${js.pct}%`}><Bar pct={js.pct} domain="java" /></DomainCard>;
}

function Page({ sub }: { sub?: string }) {
  const { state } = useData();
  if (sub && phaseById[sub]) return <PathPhasePage domain="java" phase={phaseById[sub]} total={PHASES.length} />;
  return <PathOverviewPage domain="java" phases={PHASES} stats={jStats(state.progress)} />;
}

export const java: DomainModule = { id: 'java', Card, Page };
