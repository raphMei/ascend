/** Coach : message du jour, ton exigeant, selon l'avancement, les retards et la série. */
import { hours } from '@/core/format';

export interface CoachContext {
  pct: number; streak: number; late: number; now: number;
  shabbat: boolean; planned: number;
}

const GENERIC = [
  'Personne ne viendra le faire à ta place. Ouvre la première séance et commence.',
  'La motivation est un mythe. Ce qui compte, c\'est ce que tu fais quand tu n\'en as pas.',
  'Chaque séance terminée est un vote pour le développeur que tu veux devenir. Vote.',
  'Tu as déjà tout ce qu\'il faut. Il manque seulement de l\'exécution.',
  'Un jour médiocre fait quand même avancer. Un jour sauté, non.',
  'Fais ce qui est difficile maintenant, ta soirée te remerciera.',
  'Arrête de négocier avec toi-même. Le plan est écrit, suis-le.'
];
/** Retourne [titre, sous-titre]. */
export function coachLine(ctx: CoachContext): [string, string] {
  const { pct, streak: s, late, shabbat, planned } = ctx;
  if (shabbat) return ['Chabbat shalom', 'Pose tout. Le travail reprend à la sortie de Chabbat.'];
  if (!planned) return ['Journée libre', 'Pas de séance prévue. Profite, mais ne perds pas le fil de ce que tu apprends.'];
  if (pct >= 100) return ['Journée bouclée.', 'Toutes tes séances sont faites. C\'est comme ça qu\'on construit une vraie compétence. Repose-toi, demain on continue.'];
  if (late >= 5) return [late + ' tâches en retard.', 'Le retard ne s\'efface pas tout seul. Prends la plus ancienne et termine-la avant de toucher au reste.'];
  if (late > 0) return [late + ' tâche' + (late > 1 ? 's' : '') + ' en retard.', 'Règle-le aujourd\'hui. Un petit retard est facile à rattraper, un gros ne l\'est plus.'];
  if (s >= 3) return [s + ' jours d\'affilée.', 'Ne casse pas la chaîne. Les jours où tu n\'as pas envie sont ceux qui comptent le plus.'];
  if (pct >= 60) return ['Plus que quelques séances.', 'Tu es lancé. Finis proprement, ne te contente pas du « presque ».'];
  const i = (ctx.now + planned) % GENERIC.length;
  return [GENERIC[i], 'Aujourd\'hui : ' + hours(planned) + ' d\'apprentissage prévues. Commence par la prochaine séance.'];
}
