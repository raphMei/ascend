/* Écran des réglages (compte, semaine de travail, objectifs, Chabbat, thème). */
import { esc } from '../core/format.js';
import { store, S } from '../state/store.js';
import { head } from '../ui/components.js';

export function screenSettings() {
  const s = S(), user = store.user;
  const days = [[1, 'Lundi'], [2, 'Mardi'], [3, 'Mercredi'], [4, 'Jeudi'], [5, 'Vendredi']];
  return `${head('Réglages', 'Mon Ascend')}
  <section class="card"><h2>Compte</h2><p class="muted" style="margin:4px 0 12px">${esc(user && (user.email || user.displayName) || '')}</p>
    <p class="sync ${store.sync === 'error' ? 'bad' : ''}">${store.sync === 'error' ? 'Synchronisation interrompue : ' + esc(store.error) : store.sync === 'demo' ? 'Mode démo : données gardées uniquement sur cet appareil' : '● Synchronisé entre tes appareils'}</p>
    <div class="quick"><button class="btn" data-act="signout">Se déconnecter</button><button class="btn" data-act="export">Exporter mes données</button></div></section>
  <section class="card"><h2>Ma semaine de travail</h2><p class="muted" style="margin:4px 0 12px">Coche tes jours sur site chez AXA (le jeudi est obligatoire). Les autres jours sont en télétravail.</p>
    <div class="quick" style="margin-top:0">${days.map(([w, n]) => `<label class="btn small" style="display:inline-flex;gap:8px;align-items:center"><input type="checkbox" data-set-onsite="${w}" ${s.onsite.includes(w) ? 'checked' : ''} ${w === 4 ? 'disabled' : ''}> ${n}</label>`).join('')}</div>
    <div class="fields" style="margin-top:14px"><label class="f">Heures de travail (min)<input type="number" data-set="workMin" value="${s.workMin}"></label>
    <label class="f">Java par jour (h)<input type="number" step="0.5" min="0" max="6" data-set="javaHours" value="${s.javaHours}"></label>
    <label class="f">Réveil<input type="time" data-set="wake" value="${s.wake}"></label><label class="f">Coucher<input type="time" data-set="bed" value="${s.bed}"></label></div></section>
  <section class="card"><h2>Mes objectifs santé</h2><div class="fields" style="margin-top:12px"><label class="f">Calories<input type="number" data-set="kcalGoal" value="${s.kcalGoal}"></label><label class="f">Protéines (g)<input type="number" data-set="protGoal" value="${s.protGoal}"></label><label class="f">Eau (ml)<input type="number" data-set="waterGoal" value="${s.waterGoal}"></label><label class="f">Sommeil (h)<input type="number" step="0.5" data-set="sleepGoal" value="${s.sleepGoal}"></label></div></section>
  <section class="card"><h2>Chabbat</h2><p class="muted" style="margin:4px 0 12px">Heures calculées pour la région de Deuil-la-Barre. Ce sont des valeurs approchées : vérifie avec ton calendrier habituel et ajuste les minutes si besoin.</p>
    <div class="fields"><label class="f">Allumage : minutes avant le coucher du soleil<input type="number" data-set="candle" value="${s.candle}"></label><label class="f">Sortie : minutes après le coucher du soleil<input type="number" data-set="havdalah" value="${s.havdalah}"></label></div></section>
  <section class="card"><h2>Apparence</h2><div class="quick" style="margin-top:8px">${[['auto', 'Automatique'], ['light', 'Clair'], ['dark', 'Sombre']].map(([k, n]) => `<button class="btn small" data-act="theme" data-theme="${k}" ${s.theme === k ? 'style="outline:2px solid var(--accent)"' : ''}>${n}</button>`).join('')}</div></section>`;
}
