/* Écrans de connexion et de Chabbat. */
import { hm, esc } from '../core/format.js';
import { store } from '../state/store.js';
import { ICON } from '../ui/icons.js';

export function screenSignIn() {
  return `<div class="center"><img class="logo" src="assets/icon.svg" alt=""><div><h1>Ascend</h1><p style="margin-top:8px">Un jour à la fois, deviens une meilleure version de toi-même.</p></div>
  <div><button class="btn primary" data-act="signin" style="width:100%;font-size:18px;padding:14px">Continuer avec Google</button>${store.error ? `<p class="err" style="margin-top:12px">Connexion impossible : ${esc(store.error)}</p>` : ''}</div></div>`;
}
export function screenShabbat(sh) {
  return `<div class="center shabbat"><div class="logo" style="display:grid;place-content:center;background:var(--surface);color:var(--c-chabbat)"><svg viewBox="0 0 24 24" width="44" height="44" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${ICON.star}</svg></div>
  <div><h1>Chabbat shalom</h1><p style="margin-top:10px">Aucune tâche, aucun rappel. Repose-toi.<br>Sortie vers <b class="mono" style="color:var(--ink)">${hm(sh.havdalah)}</b>.</p></div>
  <button class="btn small" data-act="peek" style="justify-self:center;opacity:.7">Afficher quand même</button></div>`;
}
