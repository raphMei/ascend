import { hm } from '@/core/format';
import type { ShabbatWindow } from '@/domain/types';
import { ICON } from '@/components/Icon';

/** Écran de repos : aucune tâche, aucun rappel pendant Chabbat. */
export function ShabbatScreen({ window: sh, onPeek }: { window: ShabbatWindow; onPeek: () => void }) {
  return (
    <div className="center shabbat">
      <div className="logo" style={{ display: 'grid', placeContent: 'center', background: 'var(--surface)', color: 'var(--c-chabbat)' }}>
        <svg viewBox="0 0 24 24" width="44" height="44" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" dangerouslySetInnerHTML={{ __html: ICON.star }} />
      </div>
      <div><h1>Chabbat shalom</h1><p style={{ marginTop: 10 }}>Aucune tâche, aucun rappel. Repose-toi.<br />Sortie vers <b className="mono" style={{ color: 'var(--ink)' }}>{hm(sh.havdalah)}</b>.</p></div>
      <button type="button" className="btn small" onClick={onPeek} style={{ justifySelf: 'center', opacity: 0.7 }}>Afficher quand même</button>
    </div>
  );
}
