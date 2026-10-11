/** Objectifs : où tu en es vers chaque cible (poids, TOEIC, parcours, sport…). Seuls ceux qui ont du sens pour toi apparaissent. */
import { lastDays, type ISODate } from '@/core/dates';
import { frNum, sleepDuration } from '@/core/format';
import { FRONT_HOURS, FRONT_LEVELS, FRONT_PHASES } from '@/content/front/path';
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

const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

export function buildGoals(i: GoalsInput): Goal[] {
  const out: Goal[] = [];
  const { settings: S, days, progress, today } = i;

  /* Poids : du premier poids saisi (sur 400 jours) vers l'objectif. */
  if (S.weightGoal) {
    const ws = lastDays(400, today).flatMap((d) => (days[d]?.weight != null ? [{ d, w: Number(days[d]!.weight) }] : []));
    if (ws.length) {
      const start = ws[0].w, now = ws[ws.length - 1].w, goal = S.weightGoal;
      const pct = start === goal ? 100 : ((start - now) / (start - goal)) * 100;
      out.push({ id: 'poids', emoji: '⚖️', label: 'Poids', value: `${frNum(now)} → ${frNum(goal)} kg`, pct: clamp(pct), domain: 'alim', to: '/dom/alim' });
    }
  }

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

  const fs = pathStats(FRONT_PHASES, FRONT_LEVELS, FRONT_HOURS, progress);
  if (fs.done > 0 || S.frontMin >= 5) out.push({ id: 'front', emoji: '💻', label: 'Dev front', value: fs.level, pct: fs.pct, domain: 'front', to: '/dom/front' });

  /* Sport : séances de la semaine glissante. */
  const sessions = lastDays(7, today).filter((d) => days[d]?.done?.sport).length;
  out.push({ id: 'sport', emoji: '🏋️', label: 'Sport (7 jours)', value: `${sessions} / 6 séances`, pct: clamp((sessions / 6) * 100), domain: 'sport', to: '/dom/sport' });

  /* Sommeil : moyenne des 7 dernières nuits par rapport à l'objectif. */
  const nights = lastDays(7, today).flatMap((d) => { const s = days[d]?.sleep; return s?.bed && s.wake ? [sleepDuration(s.bed, s.wake)] : []; });
  if (nights.length) {
    const avg = nights.reduce((a, b) => a + b, 0) / nights.length / 60;
    out.push({ id: 'sommeil', emoji: '😴', label: 'Sommeil (moyenne 7 nuits)', value: `${frNum(Math.round(avg * 10) / 10)} h / ${frNum(S.sleepGoal)} h`, pct: clamp((avg / S.sleepGoal) * 100), domain: 'sommeil', to: '/dom/sommeil' });
  }

  /* Lecture : pages des 30 derniers jours. */
  const pages = lastDays(30, today).reduce((a, d) => a + (days[d]?.pages ?? 0), 0);
  if (S.lectureMin >= 5 || pages > 0) out.push({ id: 'lecture', emoji: '📖', label: 'Lecture (30 jours)', value: `${pages} pages`, pct: clamp((pages / 300) * 100), domain: 'lecture', to: '/dom/lecture' });

  return out;
}
