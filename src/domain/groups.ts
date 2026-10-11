/** Groupes de tâches pour la liste du jour : par moment de la journée ou par thème. Fonctions pures. */
import type { Block, DomainId } from './types';

export type GroupingMode = 'moments' | 'themes';

export interface BlockGroup {
  id: string; name: string; emoji: string;
  /** Domaine dont la couleur est utilisée pour le groupe. */
  color: DomainId;
  blocks: Block[];
  /** Première heure (minutes) : sert à ordonner les groupes de la journée. */
  start: number;
}

interface GroupDef { id: string; name: string; emoji: string; color: DomainId }

const MOMENTS: Record<string, GroupDef> = {
  matin: { id: 'matin', name: 'Matin', emoji: '🌅', color: 'matin' },
  trajet: { id: 'trajet', name: 'Trajet', emoji: '🚆', color: 'trajet' },
  travail: { id: 'travail', name: 'Travail et cours', emoji: '💼', color: 'pro' },
  apresmidi: { id: 'apresmidi', name: 'Après-midi', emoji: '☀️', color: 'java' },
  soiree: { id: 'soiree', name: 'Soirée', emoji: '🌆', color: 'sommeil' },
  nuit: { id: 'nuit', name: 'Avant de dormir', emoji: '🌙', color: 'sommeil' },
  chabbat: { id: 'chabbat', name: 'Chabbat', emoji: '✨', color: 'chabbat' }
};

/** Thèmes, dans l'ordre d'affichage. */
const THEMES: GroupDef[] = [
  { id: 'routine', name: 'Routine du matin', emoji: '🧘', color: 'matin' },
  { id: 'productivite', name: 'Productivité', emoji: '🎯', color: 'miage' },
  { id: 'apprentissage', name: 'Apprentissage', emoji: '📚', color: 'anglais' },
  { id: 'sante', name: 'Santé', emoji: '💪', color: 'sport' },
  { id: 'repas', name: 'Repas', emoji: '🥗', color: 'alim' },
  { id: 'finances', name: 'Finances', emoji: '💰', color: 'finances' },
  { id: 'sommeil', name: 'Sommeil', emoji: '😴', color: 'sommeil' },
  { id: 'trajets', name: 'Trajets et travail', emoji: '🚆', color: 'trajet' },
  { id: 'autre', name: 'Autre', emoji: '📌', color: 'autre' },
  { id: 'chabbat', name: 'Chabbat', emoji: '✨', color: 'chabbat' }
];
const THEME_OF: Record<DomainId, string> = {
  matin: 'routine', miage: 'productivite', java: 'productivite', front: 'productivite', projets: 'productivite',
  anglais: 'apprentissage', lecture: 'apprentissage', sport: 'sante', alim: 'repas', finances: 'finances',
  sommeil: 'sommeil', trajet: 'trajets', pro: 'trajets', autre: 'autre', chabbat: 'chabbat'
};

/** Moment de la journée d'un bloc. `bed` = heure du coucher (minutes) : « Avant de dormir » commence 55 minutes avant (le bilan du soir). */
export function momentOf(b: Block, bed: number): string {
  if (b.domain === 'chabbat') return 'chabbat';
  if (b.domain === 'trajet') return 'trajet';
  if (b.domain === 'pro') return 'travail';
  if (b.start >= bed - 55) return 'nuit';
  if (b.start >= 1080) return 'soiree';
  if (b.start >= 720) return 'apresmidi';
  return 'matin';
}

/** Répartit les blocs en groupes (les groupes vides n'apparaissent pas). Moments : dans l'ordre de la journée ; thèmes : ordre fixe. */
export function groupBlocks(blocks: Block[], mode: GroupingMode, bed: number): BlockGroup[] {
  const defs = new Map<string, GroupDef>();
  const bucket = new Map<string, Block[]>();
  const add = (def: GroupDef, b: Block) => { defs.set(def.id, def); (bucket.get(def.id) ?? bucket.set(def.id, []).get(def.id)!).push(b); };
  for (const b of [...blocks].sort((x, y) => x.start - y.start || x.end - y.end)) {
    if (mode === 'moments') add(MOMENTS[momentOf(b, bed)], b);
    else add(THEMES.find((t) => t.id === THEME_OF[b.domain])!, b);
  }
  const groups: BlockGroup[] = [...bucket.entries()].map(([id, bl]) => ({ ...defs.get(id)!, blocks: bl, start: bl[0].start }));
  if (mode === 'themes') return groups.sort((a, b) => THEMES.findIndex((t) => t.id === a.id) - THEMES.findIndex((t) => t.id === b.id));
  return groups.sort((a, b) => (a.id === 'chabbat' ? 1 : b.id === 'chabbat' ? -1 : a.start - b.start));
}

/** Avancement d'un groupe : cases faites / à faire (les blocs sans case — travail, trajet, repas — ne comptent pas). */
export function groupProgress(g: BlockGroup): { done: number; total: number } {
  const c = g.blocks.filter((b) => b.checkable);
  return { done: c.filter((b) => b.done).length, total: c.length };
}
