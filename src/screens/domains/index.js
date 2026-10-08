/* Registre des pages de domaine. L'ordre ici = l'ordre des cartes dans « Mes domaines ».
   Un domaine = un fichier qui exporte { id, card(), page(sous-page) } + une entrée dans domain/domains.js. */
import matin from './matin.js';
import sport from './sport.js';
import alim from './alim.js';
import sommeil from './sommeil.js';
import miage from './miage.js';
import java from './java.js';

export const DOMAIN_PAGES = [matin, sport, alim, sommeil, miage, java];
export const domainPage = (id) => DOMAIN_PAGES.find((d) => d.id === id) || null;
