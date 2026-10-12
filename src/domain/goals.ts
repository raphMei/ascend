/** Objectifs d'apprentissage : où tu en es vers chaque cible (cours MIAGE, TOEIC, parcours Java / front / Cloud / Architecture, lecture). Seuls ceux qui ont du sens pour toi apparaissent. */
import { lastDays, type ISODate } from '@/core/dates';
import { PATHS } from '@/content/paths';
import type { MiageTask } from '@/content/types';
import { TOEIC_MAX } from '@/content/english';
import { jStats, mStats, pathStats } from './progress';
import type { DayData, DomainId, Progress, Settings } from './types';

export interface Goal {
  id: string; emoji: string; label: string;
  /** Texte de valeur (« 86,5 → 82 kg »). */
  value: string;
  /** Avancement 0-100. */
  pct: number;
  domain: DomainId;
  /** Adresse de la page détaillée. */
  to: string;
}

export interface GoalsInput {
  days: Record<ISODate, DayData>; settings: Settings; progress: Progress; tasks: readonly MiageTask[]; today: ISODate;
  dropped?: ReadonlySet<string>;
}

const PATH_EMOJI = { front: '💻', cloud: '☁️', archi: '🏛️' } as const;
const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

export function buildGoals(i: GoalsInput): Goal[] {
  const out: Goal[] = [];
  const { settings: S, days, progress, today } = i;

  /* TOEIC : meilleur score vers le score visé. */
  const scores = Object.values(progress.toeic ?? {}).filter((x): x is number => x != null);
  if (S.toeicGoal && scores.length) {
    const best = Math.max(...scores);
    out.push({ id: 'toeic', emoji: '🇬🇧', label: 'TOEIC', value: `${best} / ${S.toeicGoal}`, pct: clamp((best / Math.min(S.toeicGoal, TOEIC_MAX)) * 100), domain: 'anglais', to: '/dom/anglais' });
  }

  const ms = mStats(i.tasks, progress, today, i.dropped);
  out.push({ id: 'miage', emoji: '📚', label: 'Cours MIAGE', value: `${ms.g.d} / ${ms.g.n} tâches`, pct: ms.pct, domain: 'miage', to: '/dom/miage' });

  const js = jStats(progress);
  if (js.done > 0 || S.javaHours > 0) out.push({ id: 'java', emoji: '☕', label: 'Java backend', value: js.level, pct: js.pct, domain: 'java', to: '/dom/java' });

  for (const path of PATHS) {
    const ps = pathStats(path.phases, path.levels, path.hours, progress);
    if (ps.done > 0 || S[path.min] >= 5) out.push({ id: path.id, emoji: PATH_EMOJI[path.id], label: path.name, value: ps.level, pct: ps.pct, domain: path.id, to: '/dom/' + path.id });
  }

  /* Lecture : pages des 30 derniers jours. */
  const pages = lastDays(30, today).reduce((a, d) => a + (days[d]?.pages ?? 0), 0);
  if (S.lectureMin >= 5 || pages > 0) out.push({ id: 'lecture', emoji: '📖', label: 'Lecture (30 jours)', value: `${pages} pages`, pct: clamp((pages / 300) * 100), domain: 'lecture', to: '/dom/lecture' });

  return out;
}
