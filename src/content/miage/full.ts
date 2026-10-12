/** Tâches MIAGE complètes, avec le texte de chaque séance et ses liens. Fichier chargé à la demande juste après le démarrage
    (il embarque les neuf plans, ≈ 40 Ko compressés) : les dates, durées et titres sont déjà connus grâce à `RAW_TASKS`. */
import { PLANS } from './plans';
import { buildTasks } from './tasks';
import type { MiageTask } from '../types';

export const FULL_TASKS: readonly MiageTask[] = buildTasks(PLANS);
