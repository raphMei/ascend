/* Tâches MIAGE de la saison : séances des plans de matière (une tâche par partie de séance), rendus, révisions, fiche mémo et examen de chaque
   matière, et quelques tâches uniques. Aucune tâche « du jour » qui revient chaque jour : l'apprentissage se suit par séances et par parcours. */
import { range, dow, type ISODate } from '../../core/dates';
import { dayType } from '../calendar';
import { SUBJ, byId } from './subjects';
import type { MiageTask, TaskKind } from '../types';
import { OUTLINE } from './plans/outline.generated';
import { paceSessions, splitHours, tierOf } from './pacing';
import type { SubjectPlan } from './plans/types';

/** Une séance de révision ou d'examen blanc reste d'un seul tenant (c'est le but) ; les autres sont découpées en parties qui tiennent une soirée. */
const partsOf = (u: { hours?: number; kind?: string }) => (u.kind === 'valid' ? [u.hours ?? 1.5] : splitHours(u.hours ?? 1.5));

/** Construit toutes les tâches MIAGE. Triée par échéance ; jamais modifiée après le chargement (voir `adjustedTasks` pour les décalages). */
export function buildTasks(plans: Record<string, SubjectPlan> = {}): MiageTask[] {
  const tasks: MiageTask[] = [];
  const push = (id: string, s: string, k: TaskKind, t: string, d: string, due: ISODate, h: number) => { tasks.push({ id, s, k, t, d, due, h }); };
  const weekdays = range('2026-10-12', '2026-10-23').filter((d) => dow(d) !== 0 && dow(d) !== 6);

  /* Mise en place, une fois par matière. */
  SUBJ.filter((s) => s.id !== 'org').forEach((s, i) => {
    push(s.id + ':s1', s.id, 'setup', 'Récupérer les supports et créer le dossier',
      'Télécharge tous les supports de « ' + s.name + ' » (cours, TD, sujets d\'annales s\'il y en a). Crée un dossier à ce nom avec quatre sous-dossiers : cours, td, fiches, projet. Cinq minutes, mais tout le reste s\'appuie dessus.', '2026-10-11', 0.25);
    if (!plans[s.id]) push(s.id + ':s2', s.id, 'setup', 'Envoyer le contenu de la matière à Claude',
      'Envoie-moi le programme de « ' + s.name + ' » : plan du cours, liste des chapitres, ce qui a déjà été vu, et les consignes des travaux demandés. Je remplace alors les tâches de cette matière par des séances précises sur ton vrai contenu.', weekdays[i % weekdays.length], 0.25);
    push(s.id + ':s3', s.id, 'setup', 'Noter les modalités du contrôle continu et de l\'examen',
      'Écris au même endroit : la date et le format du contrôle continu, son coefficient, la durée et le format de l\'examen final, et les documents autorisés. Si une information manque, demande-la au responsable de la matière. Reporte ensuite chaque date dans ton agenda.', '2026-11-01', 0.25);
  });

  /* Séances des plans précis : une tâche par partie, avec sa propre échéance (voir pacing.ts), puis les rendus dus après certaines séances. */
  const paced = Object.values(plans).filter((p) => p.paced);
  const dues = paceSessions(
    paced.map((p) => ({ id: p.subject, tier: tierOf(byId[p.subject]?.rank), minutes: p.units.flatMap((u) => partsOf(u).map((h) => Math.round(h * 60))) })),
    '2026-10-13', '2027-02-14'
  );
  paced.forEach((p) => {
    const s = byId[p.subject]; if (!s) return;
    let at = 0;
    const lastOf: number[] = [];                       // rang de la dernière partie de chaque séance, pour dater les rendus
    p.units.forEach((u, i) => {
      const parts = partsOf(u);
      parts.forEach((h, k) => {
        const hint = parts.length === 1 ? '' : k === 0 ? `Partie 1 sur ${parts.length} : lis et comprends les notions. ` : k === parts.length - 1 ? `Partie ${k + 1} sur ${parts.length} : refais les exercices, passe l'auto-test et écris ta fiche récap. ` : `Partie ${k + 1} sur ${parts.length} : continue la séance. `;
        const task: MiageTask = {
          id: p.subject + ':u' + (i + 1) + (parts.length > 1 ? '.' + (k + 1) : ''), s: p.subject, k: u.kind === 'valid' ? 'rev' : 'seance',
          t: u.title + (parts.length > 1 ? ' (' + (k + 1) + '/' + parts.length + ')' : '') + ' · ' + s.short,
          d: (u.provisional ? 'Séance provisoire (plan anticipé) : à réaligner dès que ton professeur publie le contenu. ' : '') + hint + u.detail,
          due: dues[p.subject][at], h
        };
        if (u.res?.length) task.res = u.res;
        if (u.kind) task.step = u.kind;
        tasks.push(task); at++;
      });
      lastOf[i] = at - 1;
    });
    (p.deliverables ?? []).forEach((r, i) => {
      const task: MiageTask = { id: p.subject + ':r' + (i + 1), s: p.subject, k: 'proj', t: r.title, d: r.detail, due: dues[p.subject][lastOf[Math.min(r.after, p.units.length) - 1]], h: r.hours };
      if (r.res?.length) task.res = r.res;
      tasks.push(task);
    });
  });

  /* Fiche mémo et examen de chaque matière. */
  const memoDays = range('2027-02-15', '2027-02-19').filter((d) => dayType(d) === 'ent');
  const MEMO = ['dl', 'qa', 'sec', 'llm', 'big', 'ri', 'gov', 'eth', 'toeic'];
  MEMO.forEach((sid, i) => {
    push(sid + ':memo', sid, 'rev', 'Fiche mémo d\'une page', 'Condense tes fiches de séance en une seule page recto : les définitions, formules, schémas et pièges à connaître par cœur. Elle doit tenir à la lecture en 5 minutes la veille de l\'examen.', memoDays[Math.min(memoDays.length - 1, Math.floor((i * memoDays.length) / MEMO.length))], 1);
    push(sid + ':exam', sid, 'exam', 'Passer l\'examen final', 'Renseigne la date exacte de l\'examen de « ' + byId[sid].name + ' » dans ton agenda. La veille : relis ta fiche mémo, prépare ton matériel, couche-toi tôt. Le jour même : lis tout le sujet avant de commencer et commence par les questions que tu maîtrises.', '2027-02-26', 2);
  });

  /* Tâches uniques (pas de routine : ni relecture quotidienne, ni revue hebdomadaire à cocher). */
  push('o:nuit', 'org', 'org', 'Nuit de l\'info : participer et noter ce que tu as appris', 'Participe à l\'événement des 3 et 4 décembre. À la fin, écris en trois lignes ce que tu as appris et une idée de projet que tu veux garder.', '2026-12-04', 0.5);
  push('o:tetp', 'org', 'org', 'Préparer la réunion TE/TP du 12 octobre', 'Liste tes missions du moment, les compétences vues en cours que tu peux y mettre en pratique, et deux questions à poser. Écris tout sur une demi-page que tu peux lire pendant la réunion.', '2026-10-11', 0.5);
  push('o:plan', 'org', 'org', 'Planifier les quatre semaines de révisions', 'Les examens commencent le 22 février. Pour chaque matière, place dans l\'agenda une session de sujet blanc et une session de fiche mémo. Garde un créneau libre par semaine pour rattraper.', '2027-01-24', 0.5);
  push('o:exdates', 'org', 'org', 'Noter les dates et heures des examens', 'Dès que les convocations sont disponibles, note la date, l\'heure et la salle de chaque examen dans ton agenda, avec un rappel la veille.', '2027-02-07', 0.25);
  push('o:relgen', 'org', 'org', 'Relecture générale des fiches mémo', 'Relis dans l\'ordre des examens les fiches mémo d\'une page de chaque matière, sans ouvrir les cours. Marque en rouge ce qui ne te revient pas et rouvre le cours uniquement pour ces points.', '2027-02-21', 2);

  /* Jalons et modalités d'examen fournis par les plans de matière. */
  Object.values(plans).forEach((pl) => {
    const s = byId[pl.subject]; if (!s) return;
    (pl.milestones ?? []).forEach((ms, i) => push(pl.subject + ':m' + i, pl.subject, 'rev', 'Préparer : ' + ms.label, 'Date : ' + ms.date + '. Revois les séances déjà faites sur ce point, refais un exercice sans correction et prépare ce qu\'il faut apporter.', ms.date, ms.hours ?? 1));
    if (pl.exam) {
      const t = tasks.find((x) => x.id === pl.subject + ':exam');
      if (t) t.d = 'Examen de « ' + s.name + ' » : ' + pl.exam.format + '. Documents autorisés : ' + pl.exam.allowed + '. ' + t.d;
    }
  });
  tasks.sort((a, b) => (a.due < b.due ? -1 : a.due > b.due ? 1 : a.id < b.id ? -1 : 1));
  return tasks;
}

/** Tâches MIAGE brutes (échéances d'origine), au démarrage : les séances des plans précis y figurent sans leur texte ni leurs liens
    (voir `full.ts` pour la version complète, chargée juste après). */
export const RAW_TASKS: readonly MiageTask[] = buildTasks(OUTLINE);
