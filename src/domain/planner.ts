/** Moteur de planning : construit les blocs horaires d'un jour et place sport → tâches MIAGE → Java dans les créneaux libres.
    Fonction pure : mêmes entrées, même plan. Aucune lecture d'état global, aucun accès au DOM. */
import { dow, type ISODate } from '@/core/dates';
import { hm, toMin } from '@/core/format';
import { dayType } from '@/content/calendar';
import { byId } from '@/content/miage/subjects';
import { JT } from '@/content/java/path';
import type { MiageTask } from '@/content/types';
import { shabbatTimesForDate } from './shabbat';
import { SPORT, SPORT_WEEK } from './sport';
import type { Block, DayData, Plan, Progress, Settings } from './types';

export interface PlanInput {
  date: ISODate;
  settings: Settings;
  progress: Progress;
  day: DayData | undefined;
  today: ISODate;
  /** Tâches MIAGE avec échéances ajustées (voir `adjustedTasks`). */
  tasks: readonly MiageTask[];
}

type NewBlock = Partial<Block> & Pick<Block, 'id' | 'start' | 'end' | 'title' | 'domain'>;
interface Item { min: number; left?: number; blk: Partial<Block> & Pick<Block, 'id' | 'title' | 'domain'> }

export function planDay({ date, settings: S, progress: prog, day: DD, today, tasks: T }: PlanInput): Plan {
  const w = dow(date), type = dayType(date), blocks: Block[] = [], warnings: string[] = [], overflow = { n: 0, min: 0 };
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
  const onsite = ent && S.onsite.includes(w);
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
  const sp = SPORT_WEEK[w];
  const sat = (w === 6);
  if (sp) {
    const k = SPORT[sp], len = sportShort ? 45 : 75;
    const it: Item = { min: len, blk: { id: 'sport', fixed: false, checkable: true, title: 'Séance : ' + k.name, domain: 'sport', sub: k.sub, sport: sp, detail: k.ex.map((e) => e[0] + ' : ' + e[1]).join('\n') + '\nFinisher : corde à sauter, 3 × 2 minutes.\nAdapte les charges à ton programme actuel.' } };
    if (!place(it, w === 0 ? 600 : 960)) { overflow.n++; overflow.min += it.left ?? it.min; }
  }
  if (sat) {
    const it: Item = { min: 45, blk: { id: 'sport', fixed: false, checkable: true, title: 'Jambes (si pas fait vendredi)', domain: 'sport', sub: 'Rattrapage après Chabbat', sport: 'legs', detail: SPORT.legs.ex.map((e) => e[0] + ' : ' + e[1]).join('\n') } };
    if (!(DD && DD.done && DD.done.sport)) place(it, areaStart);
  }

  /* MIAGE : tâches du jour (et retards si aujourd'hui) */
  let mi: MiageTask[];
  if (date === today) mi = T.filter((t) => t.due <= date && !(prog.done && prog.done[t.id]));
  else mi = T.filter((t) => t.due === date);
  mi.sort((a, b) => (a.due < b.due ? -1 : a.due > b.due ? 1 : 0));
  const miLate = mi.filter((t) => t.due < date).length;
  for (const t of mi) {
    const sub = byId[t.s];
    const it: Item = { min: Math.max(15, Math.round(t.h * 60)), blk: { id: 'm:' + t.id, taskId: t.id, scope: 'prog', fixed: false, checkable: true, title: t.t, domain: 'miage', sub: sub ? sub.short : '', due: t.due, detail: t.d } };
    const free = wins.reduce((s, x) => s + (x[1] - x[0]), 0);
    if (free < 15 || !place(it)) { overflow.n++; overflow.min += it.left == null ? it.min : Math.max(it.left, 0); }
  }

  /* Java : séance quotidienne */
  const jmin = Math.round(S.javaHours * 60);
  if (jmin >= 25 && type !== 'exam') {
    const next = JT.find((t) => !(prog.done && prog.done[t.id]));
    const free = wins.reduce((s, x) => s + (x[1] - x[0]), 0);
    if (free >= 25) {
      const it: Item = { min: Math.min(jmin, free), blk: { id: 'java', fixed: false, checkable: true, title: 'Java backend', domain: 'java', sub: next ? 'Phase ' + next.phase.n + ' : ' + next.phase.title : 'Parcours terminé', detail: next ? next.t : '' , link: next && next.u } };
      place(it);
    }
  }

  blocks.sort((a, b) => a.start - b.start || a.end - b.end);
  blocks.forEach((b) => { b.done = b.checkable ? done(b) : false; });
  return { date, type, onsite, blocks, warnings, overflow, sh, late: miLate, isShabbatDay: w === 6 };
}
