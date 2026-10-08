/* Écran « Mes domaines » : une carte par domaine enregistré. */
import { DOMAIN_PAGES } from './domains/index.js';
import { head } from '../ui/components.js';

export function screenDomains() {
  return `${head('Mes domaines', 'Où je progresse')}
  <div class="grid three">${DOMAIN_PAGES.map((d) => d.card()).join('')}</div>
  <p class="muted">D'autres domaines arriveront dans les prochaines mises à jour : dev front, anglais, finances, projets perso et lecture.</p>`;
}
