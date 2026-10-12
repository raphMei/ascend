/** Moteur de planning : construit les blocs horaires d'un jour et place sport → tâches MIAGE → Java dans les créneaux libres.
    Fonction pure : mêmes entrées, même plan. Aucune lecture d'état global, aucun accès au DOM. */
import { dow, type ISODate } from '@/core/dates';
import { dur, hm, toMin } from '@/core/format';
import { dayType } from '@/content/calendar';
import { byId } from '@/content/miage/subjects';
import { JT } from '@/content/java/path';
import type { MiageTask } from '@/content/types';
import { shabbatTimesForDate } from './shabbat';
import { SPORT, SPORT_WEEK } from './sport';
import { habitItems } from './habits';
import { settingsForDate } from './month';
import type { Block, DayData, DayEdits, Plan, PlanItem, Progress, Settings, ShabbatWindow, SportKind } from './types';

export interface PlanInput {
  date: ISODate;
  settings: Settings;
  progress: Progress;
  day: DayData | undefined;
  today: ISODate;
  /** Tâches MIAGE avec échéances ajustées (voir `adjustedTasks`). */
  tasks: readonly MiageTask[];
  /** Réajustement automatique (voir `buildSchedule`). Absent : tout le retard s'empile sur aujourd'hui, comme avant. */
  schedule?: PlanSchedule;
  /** Mode « mesure » : s'arrête après le sport et renvoie les minutes libres (à partir de `fromMin`). Sert au réajustement. */
  measure?: { fromMin?: number };
}

/** Ce que le planificateur lit du réajustement : jour assigné à chaque tâche, séances de sport remplacées. */
export interface PlanSchedule {
  dayOf: Readonly<Record<string, ISODate>>;
  sport: Readonly<Record<ISODate, { kind: SportKind; reason: string }>>;
}

type NewBlock = Partial<Block> & Pick<Block, 'id' | 'start' | 'end' | 'title' | 'domain'>;
type Item = PlanItem;

export function planDay({ date, settings, progress: prog, day: DD, today, tasks: T, schedule, measure }: PlanInput): Plan {
  const S = settingsForDate(settings, date);
  const dayEdit = DD?.edits?.day ?? undefined;
  // Un congé ressemble à un jour férié : ni travail, ni cours, ni trajet.
  const w = dow(date), type = dayEdit === 'conge' && dow(date) >= 1 && dow(date) <= 5 ? 'ferie' : dayType(date), blocks: Block[] = [], warnings: string[] = [], overflow = { n: 0, min: 0 };
  const wake = toMin(S.wake), bed = toMin(S.bed);
  const sh = shabbatTimesForDate(date, S);
  const add = (b: NewBlock) => { blocks.push(Object.assign({ fixed: true, checkable: false, done: false }, b)); return b; };
  const done = (b: Block) => (b.scope === 'prog' ? !!(prog.done && prog.done[b.taskId!]) : !!(DD && DD.done && DD.done[b.id]));

  /* Samedi : Chabbat jusqu'à la sortie */
  if (w === 6) {
    add({ id: 'chabbat-sam', start: 0, end: sh!.havdalah, title: 'Chabbat', domain: 'chabbat', blocked: true, sub: 'Repos. Sortie vers ' + hm(sh!.havdalah) + '.' });
  }

  const busy: [number, number][] = []; let areaStart: number, areaEnd: number;
  const lunch = (a: number, b: number) => add({ id: 'dejeuner', start: a, end: b, title: 'Déjeuner', domain: 'alim', sub: 'Vise 40 g de protéines.' });
  const dinnerAt = (a: number) => add({ id: 'diner', start: a, end: a + 45, title: 'Dîner', domain: 'alim', sub: 'Vise 40 g de protéines.' });
  let endOfDayWork = wake + 75;

  /* Routine du matin (sauf samedi) */
  if (w !== 6) {
    add({ id: 'tephila', start: wake, end: wake + 20, title: 'Téphila', domain: 'matin', checkable: true, detail: 'Ta prière du matin, avant tout écran. Le téléphone reste en mode avion jusqu\'à la fin de la routine.' });
    add({ id: 'pompes', start: wake + 20, end: wake + 30, title: 'Pompes', domain: 'matin', checkable: true, detail: 'Trois séries proches de l\'échec, dos gainé, poitrine qui touche presque le sol. Note ton total dans ta tête et bats-le la semaine suivante.' });
    add({ id: 'stretch', start: wake + 30, end: wake + 60, title: 'Étirements', domain: 'matin', checkable: true, detail: 'Trente minutes : hanches, ischios, mollets, épaules, nuque. Respire lentement, tiens chaque position 45 secondes. Ménage le bas du dos : pas de flexion forcée.' });
    add({ id: 'petitdej', start: wake + 60, end: wake + 75, title: 'Petit-déjeuner', domain: 'matin', checkable: true, detail: 'Vise 30 g de protéines (œufs, skyr, fromage blanc, flocons d\'avoine). Un verre d\'eau avant le café.' });
  }

  /* Journée de travail ou de cours */
  const ent = type === 'ent', school = type === 'ecole' || type === 'exam';
  const onsite = ent && (dayEdit === 'onsite' ? true : dayEdit === 'remote' ? false : S.onsite.includes(w));
  let sportShort = false;
  if (w >= 1 && w <= 5) {
    if (school) {
      add({ id: 'trajet-a', start: 450, end: 510, title: 'Trajet vers l\'école', domain: 'trajet', sub: 'Une heure. Écoute un podcast ou relis une fiche.' });
      add({ id: 'cours', start: 510, end: 1080, title: type === 'exam' ? 'Examen' : 'Cours MIAGE', domain: 'pro', sub: '8h30 – 18h00' });
      add({ id: 'trajet-r', start: 1080, end: 1140, title: 'Trajet retour', domain: 'trajet' });
      endOfDayWork = 1140; sportShort = true;
      if (w === 5 && sh && sh.candle < 1140 + 30) warnings.push('Chabbat entre à ' + hm(sh.candle) + ', avant la fin des cours et du trajet. Il faut voir avec le CFA comment partir plus tôt ce vendredi.');
    } else if (ent) {
      if (onsite) {
        add({ id: 'trajet-a', start: 450, end: 510, title: 'Trajet vers AXA', domain: 'trajet' });
        add({ id: 'travail-1', start: 510, end: 750, title: 'Travail chez AXA', domain: 'pro', sub: 'Sur site' });
        lunch(750, 810);
        add({ id: 'travail-2', start: 810, end: 810 + (S.workMin - 240), title: 'Travail chez AXA', domain: 'pro', sub: 'Sur site' });
        const e = 810 + (S.workMin - 240);
        add({ id: 'trajet-r', start: e, end: e + 60, title: 'Trajet retour', domain: 'trajet' });
        endOfDayWork = e + 60;
      } else {
        const lunchLen = w === 5 ? 30 : 60;
        add({ id: 'travail-1', start: 450, end: 720, title: 'Travail chez AXA', domain: 'pro', sub: 'Télétravail' });
        lunch(720, 720 + lunchLen);
        const e = 720 + lunchLen + (S.workMin - 270);
        add({ id: 'travail-2', start: 720 + lunchLen, end: e, title: 'Travail chez AXA', domain: 'pro', sub: 'Télétravail' });
        endOfDayWork = e;
      }
    }
  }
  if (!blocks.some((b) => b.id === 'dejeuner') && w !== 6 && !school) {
    if (w === 0 || type === 'ferie' || w === 5) lunch(w === 5 ? 765 : 750, w === 5 ? 795 : 795);
  }
  if (school && w !== 6) { /* le déjeuner se fait pendant les cours */ }

  /* Fin de journée */
  let dinnerStart: number;
  if (w === 5) {
    add({ id: 'prep-chabbat', start: sh!.candle - 60, end: sh!.candle, title: 'Préparation de Chabbat', domain: 'chabbat', sub: 'Douche, table, dernières courses.' });
    add({ id: 'chabbat-ven', start: sh!.candle, end: 1440, title: 'Chabbat', domain: 'chabbat', blocked: true, sub: 'Entrée à ' + hm(sh!.candle) + '. Aucune tâche, aucun rappel.' });
    areaStart = endOfDayWork; areaEnd = sh!.candle - 60;
  } else if (w === 6) {
    areaStart = sh!.havdalah + 20; areaEnd = bed - 50;
  } else {
    dinnerStart = Math.max(endOfDayWork + 10, w === 0 ? 1170 : 1140);
    dinnerAt(dinnerStart);
    areaStart = Math.max(endOfDayWork, wake + 75); areaEnd = bed - 50;
  }
  if (w !== 5) {
    add({ id: 'bilan', start: bed - 50, end: bed - 40, title: 'Bilan du soir', domain: 'sommeil', checkable: true, detail: 'Trois minutes : note ton poids du matin, ton eau et tes protéines dans l\'onglet Aujourd\'hui, puis relis ce que tu as fait. Prépare tes affaires de demain.' });
    add({ id: 'coucher', start: bed, end: bed + 30, title: 'Au lit à l\'heure', domain: 'sommeil', checkable: true, detail: 'Téléphone loin du lit. Objectif : ' + S.sleepGoal.toString().replace('.', ',') + ' h de sommeil.' });
  }

  /* Créneaux libres */
  blocks.forEach((b) => { if (b.id !== 'coucher' && !(b.id === 'chabbat-ven') && b.id !== 'chabbat-sam') busy.push([b.start, b.end]); });
  busy.sort((a, b) => a[0] - b[0]);
  let wins: [number, number][] = [], cur = areaStart;
  const lo = areaStart, hi = areaEnd;
  busy.forEach(([s, e]) => { if (e <= cur) return; if (s > cur && cur < hi) wins.push([cur, Math.min(s, hi)]); cur = Math.max(cur, e); });
  if (cur < hi) wins.push([cur, hi]);
  wins = wins.map(([s, e]): [number, number] => [Math.max(s, lo), Math.min(e, hi)]).filter(([s, e]) => e - s >= 15);
  const place = (item: Item, startPref?: number | null): boolean => {
    // renvoie true si placé en entier (avec découpage possible)
    let left = item.min, pieces = 0;
    const order = wins.map((x, i): [[number, number], number] => [x, i]).sort((a, b) => (startPref != null ? Math.abs(a[0][0] - startPref) - Math.abs(b[0][0] - startPref) : a[0][0] - b[0][0]));
    for (const [win] of order) {
      if (left <= 0) break;
      const avail = win[1] - win[0]; if (avail < 15) continue;
      let s = win[0];
      if (startPref != null && pieces === 0 && win[1] - Math.max(win[0], startPref) >= Math.min(left, 45)) s = Math.max(win[0], startPref);
      const len = Math.min(left, win[1] - s); if (len < 15 && left > len) continue;
      if (left - len > 0 && left - len <= 10) left = len; // on accepte 10 min de moins plutôt qu'un fragment
      add(Object.assign({}, item.blk, { start: s, end: s + len, cont: pieces > 0 }));
      if (s === win[0] && s + len === win[1]) win[0] = win[1];
      else if (s === win[0]) win[0] = s + len;
      else if (s + len === win[1]) win[1] = s;
      else { wins.push([s + len, win[1]]); win[1] = s; }
      left -= len; pieces++;
    }
    item.left = left; return left <= 0;
  };

  /* Sport */
  const override = schedule?.sport[date];
  const sp = override ? override.kind : (S.sportWeek ?? SPORT_WEEK)[w];
  const sat = (w === 6);
  if (sp) {
    const k = SPORT[sp], len = sportShort ? 45 : 75;
    const it: Item = { min: len, blk: { id: 'sport', fixed: false, checkable: true, title: 'Séance : ' + k.name + (override ? ' (rattrapage)' : ''), domain: 'sport', sub: override ? override.reason : k.sub, sport: sp, detail: k.ex.map((e) => e[0] + ' : ' + e[1]).join('\n') + '\nFinisher : corde à sauter, 3 × 2 minutes.\nAdapte les charges à ton programme actuel.' } };
    if (!place(it, w === 0 ? 600 : 960)) { overflow.n++; overflow.min += it.left ?? it.min; }
  }
  if (sat) {
    const it: Item = { min: 45, blk: { id: 'sport', fixed: false, checkable: true, title: 'Jambes (si pas fait vendredi)', domain: 'sport', sub: 'Rattrapage après Chabbat', sport: 'legs', detail: SPORT.legs.ex.map((e) => e[0] + ' : ' + e[1]).join('\n') } };
    if (!(DD && DD.done && DD.done.sport)) place(it, areaStart);
  }

  /* Mode mesure : on s'arrête ici et on rapporte le temps libre restant (à partir de `fromMin`). */
  if (measure) {
    const from = measure.fromMin ?? 0;
    const freeMin = wins.reduce((s, x) => s + Math.max(0, x[1] - Math.max(x[0], from)), 0);
    return { date, type, onsite, blocks, warnings, overflow, sh, late: 0, isShabbatDay: w === 6, freeMin };
  }

  /* MIAGE : tâches du jour. Avec réajustement : celles qui lui sont assignées. Sans : celles du jour, et tout le retard si aujourd'hui. */
  let mi: MiageTask[];
  if (schedule && date >= today) mi = T.filter((t) => schedule.dayOf[t.id] === date);
  else if (date === today) mi = T.filter((t) => t.due <= date && !(prog.done && prog.done[t.id]));
  else mi = T.filter((t) => t.due === date);
  mi.sort((a, b) => (a.due < b.due ? -1 : a.due > b.due ? 1 : 0));
  const miLate = mi.filter((t) => t.due < date).length;
  for (const t of mi) {
    const sub = byId[t.s];
    const it: Item = { min: Math.max(15, Math.round(t.h * 60)), blk: { id: 'm:' + t.id, taskId: t.id, scope: 'prog', fixed: false, checkable: true, title: t.t, domain: 'miage', sub: sub ? sub.short : '', due: t.due, detail: t.h0 != null ? t.d + '\nDurée ajustée à ton rythme réel : ' + dur(Math.round(t.h0 * 60)) + ' prévues, ' + dur(Math.round(t.h * 60)) + ' comptées.' : t.d, res: t.res } };
    const free = wins.reduce((s, x) => s + (x[1] - x[0]), 0);
    if (free < 15 || !place(it)) { overflow.n++; overflow.min += it.left == null ? it.min : Math.max(it.left, 0); }
  }

  /* Domaines optionnels (anglais, lecture, dev front, projets, point finances) : avant Java, qui prend le temps restant. */
  for (const it of habitItems(date, S, prog)) {
    const free = wins.reduce((s, x) => s + (x[1] - x[0]), 0);
    if (free < 15 || !place(it)) { overflow.n++; overflow.min += it.left == null ? it.min : Math.max(it.left, 0); }
  }

  /* Java : séance quotidienne */
  const jmin = Math.round(S.javaHours * 60);
  if (jmin >= 25 && type !== 'exam') {
    const next = JT.find((t) => !(prog.done && prog.done[t.id]));
    const free = wins.reduce((s, x) => s + (x[1] - x[0]), 0);
    if (free >= 25) {
      const it: Item = { min: Math.min(jmin, free), blk: { id: 'java', fixed: false, checkable: true, title: 'Java backend', domain: 'java', sub: next ? 'Phase ' + next.phase.n + ' : ' + next.phase.title : 'Parcours terminé', detail: next ? next.t : '' , res: next?.res } };
      place(it);
    }
  }

  const skipped = applyEdits(blocks, DD?.edits, warnings, sh);
  blocks.sort((a, b) => a.start - b.start || a.end - b.end);
  blocks.forEach((b) => { b.done = b.checkable ? done(b) : false; });
  const plan: Plan = { date, type, onsite, blocks, warnings, overflow, sh, late: miLate, isShabbatDay: w === 6 };
  if (skipped.length) plan.skipped = skipped;
  if (dayEdit && w >= 1 && w <= 5) plan.dayEdit = dayEdit;
  return plan;
}

/** Applique les modifications libres de l'utilisateur après le placement automatique : blocs passés, déplacés, ajoutés.
    Retourne les blocs passés. Signale (sans bloquer) les chevauchements et les blocs placés pendant Chabbat. */
function applyEdits(blocks: Block[], edits: DayEdits | undefined, warnings: string[], sh: ShabbatWindow | null): Block[] {
  if (!edits) return [];
  const skipped: Block[] = [];
  const touched: Block[] = [];
  for (let i = blocks.length - 1; i >= 0; i--) {
    const b = blocks[i];
    if (edits.skip?.[b.id] && b.checkable && !b.blocked) { skipped.unshift(b); blocks.splice(i, 1); }
  }
  const moved = new Set<string>();
  for (const b of blocks) {
    const m = edits.move?.[b.id];
    if (m && !moved.has(b.id) && !b.cont && !b.blocked) { b.start = m.start; b.end = m.end; moved.add(b.id); touched.push(b); }
  }
  for (const [id, x] of Object.entries(edits.extra ?? {})) {
    if (!x) continue;
    const b: Block = { id: 'x:' + id, start: x.start, end: x.end, title: x.title, domain: x.domain, fixed: false, checkable: x.checkable !== false, done: false, sub: 'Ajouté par toi' };
    blocks.push(b); touched.push(b);
  }
  for (const t of touched) {
    const other = blocks.find((o) => o !== t && !o.blocked && o.start < t.end && t.start < o.end);
    if (other) warnings.push('« ' + t.title + ' » (' + hm(t.start) + '–' + hm(t.end) + ') chevauche « ' + other.title + ' » (' + hm(other.start) + '–' + hm(other.end) + ').');
    if (sh && ((t.end > sh.candle && t.start < 1440 && blocks.some((o) => o.id === 'chabbat-ven')) || (t.start < sh.havdalah && blocks.some((o) => o.id === 'chabbat-sam')))) {
      warnings.push('« ' + t.title + ' » tombe pendant Chabbat.');
    }
  }
  return skipped;
}
