import type { StepKind } from './types';

/** Libellé affiché pour chaque type d'étape d'un parcours. */
export const STEP_LABEL: Record<StepKind, string> = { cours: 'Cours', exo: 'Exercice', projet: 'Projet', valid: 'Validation' };
