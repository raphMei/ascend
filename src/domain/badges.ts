/** Badges : récompenses attribuées à des seuils précis. Fonctions pures. */
import { dow, range, type ISODate } from '@/core/dates';
import { PHASES } from '@/content/java/path';
import { FRONT_PHASES } from '@/content/front/path';
import type { DayData, Progress } from './types';

export interface Badge {
  id: string; emoji: string; title: string; description: string;
  earned: boolean;
  /** Avancement vers le seuil (value plafonnée à target). */
  value: number; target: number;
}

/** Plus longue série de jours à ≥ 70 % : le samedi (Chabbat) ne la casse pas, un jour sans donnée oui. */
export function longestStreak(days: Record<ISODate, DayData>): number {
  const dates = Object.keys(days).filter((d) => days[d].stats).sort();
  if (!dates.length) return 0;
  let best = 0, cur = 0;
  for (const d of range(dates[0], dates[dates.length - 1])) {
    if (dow(d) === 6) continue;
    if ((days[d]?.stats?.pct ?? 0) >= 70) { cur++; best = Math.max(best, cur); } else cur = 0;
  }
  return best;
}

const count = (days: Record<ISODate, DayData>, f: (d: DayData) => boolean) => Object.values(days).filter(f).length;
const phaseDone = (phases: typeof PHASES, progress: Progress) => phases.filter((p) => p.tasks.every((t) => progress.done[t.id])).length;

export function badges(days: Record<ISODate, DayData>, progress: Progress): Badge[] {
  const best = longestStreak(days);
  const sport = count(days, (d) => !!d.done?.sport);
  const anglais = count(days, (d) => !!d.done?.anglais);
  const pages = Object.values(days).reduce((a, d) => a + (d.pages ?? 0), 0);
  const javaPhases = phaseDone(PHASES, progress);
  const corePhases = PHASES.filter((p) => p.core);
  const coreDone = corePhases.filter((p) => p.tasks.every((t) => progress.done[t.id])).length;
  const frontPhases = phaseDone(FRONT_PHASES, progress);
  const make = (id: string, emoji: string, title: string, description: string, value: number, target: number): Badge => ({ id, emoji, title, description, earned: value >= target, value: Math.min(value, target), target });
  return [
    make('serie-7', '🔥', 'Une semaine d\'affilée', '7 jours de suite à 70 % ou plus', best, 7),
    make('serie-30', '🏅', 'Un mois d\'affilée', '30 jours de suite à 70 % ou plus', best, 30),
    make('serie-100', '👑', 'Cent jours', '100 jours de suite à 70 % ou plus', best, 100),
    make('sport-20', '🏋️', 'Vingt séances de sport', '20 séances de sport faites', sport, 20),
    make('anglais-30', '🇬🇧', 'Trente séances d\'anglais', '30 séances d\'anglais faites', anglais, 30),
    make('lecteur-500', '📖', 'Cinq cents pages', '500 pages lues', pages, 500),
    make('java-1', '☕', 'Première phase Java', 'Terminer une phase du parcours Java', javaPhases, 1),
    make('java-socle', '🎓', 'Socle Java', `Terminer les ${corePhases.length} phases du socle Java`, coreDone, corePhases.length),
    make('front-1', '💻', 'Première phase front', 'Terminer une phase du parcours dev front', frontPhases, 1)
  ];
}
