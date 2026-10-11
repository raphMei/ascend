/** Registre des domaines : l'ordre ici = l'ordre des cartes dans « Mes domaines ».
    Ajouter un domaine : créer son dossier (Card + Page), l'ajouter ici, déclarer sa couleur et son entrée dans `domain/domains.ts`. */
import type { DomainModule } from './types';
import { matin } from './matin';
import { sport } from './sport';
import { alim } from './alim';
import { sommeil } from './sommeil';
import { miage } from './miage';
import { java } from './java';
import { front } from './front';
import { anglais } from './anglais';
import { lecture } from './lecture';
import { finances } from './finances';
import { projets } from './projets';

export const DOMAIN_MODULES: DomainModule[] = [matin, sport, alim, sommeil, miage, java, front, anglais, lecture, finances, projets];
export const findDomain = (id: string | undefined): DomainModule | undefined => DOMAIN_MODULES.find((d) => d.id === id);
