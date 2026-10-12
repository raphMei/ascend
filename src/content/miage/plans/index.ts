/** Plans par matière : un chapitre, un exercice ou un projet par séance, avec les liens vers le cours correspondant (français d'abord).
    Ce sont des plans types, construits sur le contenu habituel de chaque matière : à ajuster dès que tu as le programme réel
    (voir docs/CONTENU-MIAGE.md). Les séances sont réparties régulièrement sur la saison jusqu'aux examens. */
import { big } from './big';
import { dl } from './dl';
import { eth } from './eth';
import { gov } from './gov';
import { llm } from './llm';
import { proj } from './proj';
import { qa } from './qa';
import { ri } from './ri';
import { sec } from './sec';
import { toeic } from './toeic';
import type { SubjectPlan } from './types';

export const PLANS: Record<string, SubjectPlan> = { dl, qa, sec, llm, big, ri, gov, eth, toeic, proj };
