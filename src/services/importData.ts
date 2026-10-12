/** Import d'une sauvegarde JSON (celle que produit « Exporter mes données ») : validation stricte, rien n'est écrit si le fichier est invalide.
    Les champs inconnus sont ignorés ; les valeurs de type inattendu font échouer l'import avec un message précis. */
import type { ISODate } from '@/core/dates';
import type { DayData, Progress, Settings } from '@/domain/types';

export interface Backup { days: Record<ISODate, DayData>; settings: Partial<Settings>; progress: Progress }
export type ImportResult =
  | { ok: true; data: Backup; counts: { days: number; settings: number; tasks: number } }
  | { ok: false; errors: string[] };

const MAX_DAYS = 5000;
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;
const isObj = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v);
const isNum = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);

const NUM_SETTINGS = ['lat', 'lon', 'javaHours', 'waterGoal', 'protGoal', 'kcalGoal', 'sleepGoal', 'workMin', 'candle', 'havdalah', 'weightGoal', 'anglaisMin', 'lectureMin', 'frontMin', 'projetsMin', 'financesMin', 'toeicGoal'] as const;
const STR_SETTINGS = ['wake', 'bed', 'livre'] as const;
const DAY_NUMS = ['weight', 'water', 'kcal', 'protein', 'pages'] as const;

function boolMap(v: unknown, where: string, errors: string[]): Record<string, boolean> {
  const out: Record<string, boolean> = {};
  if (!isObj(v)) { errors.push(`${where} : un objet est attendu.`); return out; }
  for (const [k, x] of Object.entries(v)) { if (typeof x === 'boolean') out[k] = x; else errors.push(`${where}.${k} : vrai ou faux attendu.`); }
  return out;
}

function parseDay(date: string, raw: unknown, errors: string[]): DayData {
  const out: DayData = {};
  if (!isObj(raw)) { errors.push(`Jour ${date} : un objet est attendu.`); return out; }
  for (const k of DAY_NUMS) if (raw[k] != null) { if (isNum(raw[k])) out[k] = raw[k] as number; else errors.push(`Jour ${date} : « ${k} » doit être un nombre.`); }
  if (raw.done !== undefined) out.done = boolMap(raw.done, `Jour ${date} : done`, errors);
  if (raw.sleep !== undefined) {
    const s = raw.sleep;
    if (isObj(s) && [s.bed, s.wake].every((t) => t == null || (typeof t === 'string' && TIME.test(t)))) out.sleep = { bed: (s.bed as string | null | undefined) ?? null, wake: (s.wake as string | null | undefined) ?? null };
    else errors.push(`Jour ${date} : « sleep » attend des heures HH:MM.`);
  }
  if (raw.stats !== undefined) {
    const s = raw.stats;
    if (isObj(s) && [s.pct, s.pl, s.dn].every(isNum) && isObj(s.planned) && isObj(s.done)) out.stats = s as unknown as DayData['stats'];
    else errors.push(`Jour ${date} : « stats » est invalide.`);
  }
  if (raw.edits !== undefined) { if (isObj(raw.edits)) out.edits = raw.edits as DayData['edits']; else errors.push(`Jour ${date} : « edits » est invalide.`); }
  return out;
}

export function parseBackup(text: string): ImportResult {
  let raw: unknown;
  try { raw = JSON.parse(text); } catch { return { ok: false, errors: ['Ce fichier n\'est pas du JSON valide.'] }; }
  if (!isObj(raw)) return { ok: false, errors: ['Le fichier doit contenir un objet avec « days », « settings » et « progress ».'] };
  if (!('days' in raw) && !('settings' in raw) && !('progress' in raw)) return { ok: false, errors: ['Ce fichier ne ressemble pas à une sauvegarde Ascend : « days », « settings » ou « progress » manquent.'] };

  const errors: string[] = [];
  const data: Backup = { days: {}, settings: {}, progress: { done: {} } };

  if (raw.days !== undefined) {
    if (!isObj(raw.days)) errors.push('« days » doit être un objet.');
    else {
      const entries = Object.entries(raw.days);
      if (entries.length > MAX_DAYS) errors.push(`Trop de jours (${entries.length}) : la limite est ${MAX_DAYS}.`);
      for (const [d, v] of entries) { if (!DATE.test(d)) errors.push(`« ${d} » n'est pas une date AAAA-MM-JJ.`); else data.days[d] = parseDay(d, v, errors); }
    }
  }
  if (raw.settings !== undefined) {
    if (!isObj(raw.settings)) errors.push('« settings » doit être un objet.');
    else {
      const s = raw.settings, out: Record<string, unknown> = {};
      for (const k of NUM_SETTINGS) if (s[k] != null) { if (isNum(s[k])) out[k] = s[k]; else errors.push(`Réglage « ${k} » : nombre attendu.`); }
      for (const k of STR_SETTINGS) if (s[k] != null) { if (typeof s[k] === 'string') out[k] = s[k]; else errors.push(`Réglage « ${k} » : texte attendu.`); }
      if (s.theme != null) { if (['auto', 'light', 'dark'].includes(s.theme as string)) out.theme = s.theme; else errors.push('Réglage « theme » : auto, light ou dark.'); }
      if (s.onsite != null) { if (Array.isArray(s.onsite) && s.onsite.every((x) => Number.isInteger(x) && x >= 1 && x <= 5)) out.onsite = s.onsite; else errors.push('Réglage « onsite » : liste de jours de 1 à 5.'); }
      if (s.autoReschedule != null) { if (typeof s.autoReschedule === 'boolean') out.autoReschedule = s.autoReschedule; else errors.push('Réglage « autoReschedule » : vrai ou faux.'); }
      for (const k of ['months', 'reminders', 'ui'] as const) if (s[k] != null) { if (isObj(s[k])) out[k] = s[k]; else errors.push(`Réglage « ${k} » : objet attendu.`); }
      data.settings = out as Partial<Settings>;
    }
  }
  if (raw.progress !== undefined) {
    if (!isObj(raw.progress)) errors.push('« progress » doit être un objet.');
    else {
      const p = raw.progress;
      data.progress = { done: p.done === undefined ? {} : boolMap(p.done, 'progress.done', errors) };
      for (const k of ['projects', 'finance', 'toeic', 'pins', 'doneAt'] as const) if (p[k] != null) { if (isObj(p[k])) (data.progress as unknown as Record<string, unknown>)[k] = p[k]; else errors.push(`progress.${k} : objet attendu.`); }
    }
  }
  if (errors.length) return { ok: false, errors: errors.slice(0, 8).concat(errors.length > 8 ? [`… et ${errors.length - 8} autre(s) problème(s).`] : []) };
  return { ok: true, data, counts: { days: Object.keys(data.days).length, settings: Object.keys(data.settings).length, tasks: Object.keys(data.progress.done).length } };
}
