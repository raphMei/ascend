import type { Block } from '@/domain/types';
import { Sheet } from '../Sheet';

export interface MenuActions {
  /** Absent quand l'action n'a pas de sens pour ce bloc (elle est alors masquée, pas grisée). */
  timer?: () => void;
  edit?: () => void;
  postpone?: () => void;
  skip?: () => void;
}

/** Menu d'une habitude (appui long ou bouton « Options ») : feuille de verre avec les actions rapides. */
export function HabitMenu({ block: b, actions, onClose }: { block: Block; actions: MenuActions; onClose: () => void }) {
  const run = (f?: () => void) => () => { onClose(); f?.(); };
  return (
    <Sheet title={b.title} onClose={onClose}>
      <div className="menu">
        {actions.timer && <button type="button" className="mi" onClick={run(actions.timer)}><i aria-hidden="true">▶</i>Démarrer le minuteur</button>}
        {actions.edit && <button type="button" className="mi" onClick={run(actions.edit)}><i aria-hidden="true">✎</i>Modifier l'horaire</button>}
        {actions.postpone && <button type="button" className="mi" onClick={run(actions.postpone)}><i aria-hidden="true">↷</i>Reporter à demain</button>}
        {actions.skip && <button type="button" className="mi danger" onClick={run(actions.skip)}><i aria-hidden="true">⤼</i>Passer aujourd'hui</button>}
      </div>
    </Sheet>
  );
}
