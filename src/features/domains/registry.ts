/** Registre des domaines : l'ordre ici = l'ordre des cartes dans « Mes domaines ».
    Ajouter un domaine : créer son dossier (Card + Page), l'ajouter ici, déclarer sa couleur et son entrée dans `domain/domains.ts`. */
import type { DomainModule } from './types';
import { miage } from './miage';
import { java } from './java';
import { anglais } from './anglais';
import { lecture } from './lecture';
import { projets } from './projets';
import { PATHS } from '@/content/paths';
import { pathModule } from './path';

const DOMAIN_MODULES: DomainModule[] = [miage, java, ...PATHS.map(pathModule), anglais, lecture, projets];
export const findDomain = (id: string | undefined): DomainModule | undefined => DOMAIN_MODULES.find((d) => d.id === id);
