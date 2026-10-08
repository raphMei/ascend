/* Point d'entrée : branche l'état sur le rendu, crée le backend, démarre. */
import { subscribe, setBackend } from './state/store.js';
import { createBackend } from './services/backend.js';
import { render } from './app/render.js';
import { bindEvents } from './app/events.js';

subscribe(render);
bindEvents();
render();
(async function start() {
  const backend = await createBackend();
  setBackend(backend);
  await backend.init();
  render();
})();
