/* Coach : message du jour, ton exigeant, selon l'avancement, les retards et la série. */
import { hours } from '../core/format.js';

const GENERIC = [
  'Personne ne viendra le faire à ta place. Ouvre la première tâche et commence.',
  'La motivation est un mythe. Ce qui compte, c\'est ce que tu fais quand tu n\'en as pas.',
  'Chaque case cochée est un vote pour la personne que tu veux devenir. Vote.',
  'Tu as déjà tout ce qu\'il faut. Il manque seulement de l\'exécution.',
  'Un jour médiocre fait quand même avancer. Un jour sauté, non.',
  'Fais ce qui est difficile maintenant, ta soirée te remerciera.',
  'Arrête de négocier avec toi-même. Le plan est écrit, suis-le.'
];
export function coachLine(ctx) {
  const { pct, streak: s, late, now, routineDone, shabbat, planned } = ctx;
  if (shabbat) return ['Chabbat shalom', 'Pose tout. Le travail reprend à la sortie de Chabbat.'];
  if (!planned) return ['Journée libre', 'Pas de tâche prévue. Profite, mais ne perds pas le fil de la routine.'];
  if (pct >= 100) return ['Journée bouclée.', 'Tout est coché. C\'est comme ça qu\'on construit quelqu\'un de solide. Repose-toi, demain on recommence.'];
  if (now < 600 && !routineDone) return ['Ta routine d\'abord.', 'Téphila, pompes, étirements. Pas de téléphone avant que ce soit fait.'];
  if (late >= 5) return [late + ' tâches en retard.', 'Le retard ne s\'efface pas tout seul. Prends la plus ancienne et termine-la avant de toucher au reste.'];
  if (late > 0) return [late + ' tâche' + (late > 1 ? 's' : '') + ' en retard.', 'Règle-le aujourd\'hui. Un petit retard est facile à rattraper, un gros ne l\'est plus.'];
  if (s >= 3) return [s + ' jours d\'affilée.', 'Ne casse pas la chaîne. Les jours où tu n\'as pas envie sont ceux qui comptent le plus.'];
  if (pct >= 60) return ['Plus que quelques cases.', 'Tu es lancé. Finis proprement, ne te contente pas du « presque ».'];
  const i = (now + planned) % GENERIC.length;
  return [GENERIC[i], 'Aujourd\'hui : ' + hours(planned) + ' à accomplir. Commence par la prochaine tâche.'];
}
