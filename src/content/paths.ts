/** Registre des parcours en phases (hors Java, qui a son propre module) : dev front, Cloud et DevOps, Architecture logicielle.
    Ajouter un parcours : créer son fichier de contenu, l'ajouter ici, déclarer son identifiant dans `DomainId`/`MonthDomain`, sa couleur et ses minutes (voir docs/ARCHITECTURE.md). */
import { ARCHI_HOURS, ARCHI_LEVELS, ARCHI_PHASES, ARCHI_TASKS, archiPhaseById } from './archi/path';
import { CLOUD_HOURS, CLOUD_LEVELS, CLOUD_PHASES, CLOUD_TASKS, cloudPhaseById } from './cloud/path';
import { FRONT_HOURS, FRONT_LEVELS, FRONT_PHASES, FRONT_TASKS, frontPhaseById } from './front/path';
import type { PathStep, Phase } from './types';

export type PathId = 'front' | 'cloud' | 'archi';
/** Réglage des minutes par jour de chaque parcours (0 = désactivé : aucune séance dans le planning). */
type PathMinKey = 'frontMin' | 'cloudMin' | 'archiMin';

export interface PathDef {
  id: PathId;
  /** Nom court (cartes, blocs du planning). */
  name: string;
  /** Texte pour le message « désactivé » : « la séance quotidienne de … ». */
  what: string;
  min: PathMinKey;
  levels: string[];
  phases: Phase[];
  tasks: PathStep[];
  hours: number;
  phaseById: Record<string, Phase>;
}

export const PATHS: readonly PathDef[] = [
  { id: 'front', name: 'Dev front', what: 'la séance quotidienne de dev front', min: 'frontMin', levels: FRONT_LEVELS, phases: FRONT_PHASES, tasks: FRONT_TASKS, hours: FRONT_HOURS, phaseById: frontPhaseById },
  { id: 'cloud', name: 'Cloud et DevOps', what: 'la séance quotidienne de cloud et DevOps', min: 'cloudMin', levels: CLOUD_LEVELS, phases: CLOUD_PHASES, tasks: CLOUD_TASKS, hours: CLOUD_HOURS, phaseById: cloudPhaseById },
  { id: 'archi', name: 'Architecture logicielle', what: 'la séance quotidienne d\'architecture logicielle', min: 'archiMin', levels: ARCHI_LEVELS, phases: ARCHI_PHASES, tasks: ARCHI_TASKS, hours: ARCHI_HOURS, phaseById: archiPhaseById }
];
export const pathById = (id: string): PathDef | undefined => PATHS.find((p) => p.id === id);
