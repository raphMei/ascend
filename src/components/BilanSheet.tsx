import { useEffect, useState } from 'react';
import { journalKey, newEntry } from '@/domain/journal';
import { clearBilan, useBilanAsk, type BilanAsk } from '@/hooks/bilan';
import { haptic } from '@/hooks/feedback';
import { useData } from '@/state/DataContext';
import { dc } from './Icon';
import { Sheet } from './Sheet';

const DIFF = [[1, 'Facile'], [2, 'Correct'], [3, 'Dur']] as const;

function Form({ ask }: { ask: BilanAsk }) {
  const { setDay } = useData();
  const [note, setNote] = useState('');
  const [diff, setDiff] = useState<1 | 2 | 3>(2);
  const [rev, setRev] = useState(true);
  const b = ask.block;
  const save = () => {
    setDay(ask.date, { journal: { [journalKey(b)]: newEntry(b, ask.date, { note, diff, rev }) } });
    haptic([10, 30, 10]);
    clearBilan();
  };
  return (
    <Sheet title="Bilan de séance" onClose={clearBilan}>
      <div style={dc(b.domain)} className="bilan">
        <p className="bilan-lesson"><span className="ldot" aria-hidden="true" /> {b.title}</p>
        <label className="f">Ce que j'ai compris, ce qui coince
          <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} placeholder="Ex. : un conteneur partage le noyau de l'hôte, contrairement à une machine virtuelle." />
        </label>
        <div role="radiogroup" aria-label="Difficulté" className="lv-seg">
          {DIFF.map(([v, l]) => <button key={v} type="button" role="radio" aria-checked={diff === v} onClick={() => setDiff(v)}>{l}</button>)}
        </div>
        <label className="row bilan-rev" style={{ cursor: 'pointer' }}>
          <span>À revoir dans quelques jours<br /><span className="muted" style={{ fontSize: 13 }}>Une révision espacée : 2, 3, 7, 14 puis 30 jours.</span></span>
          <input type="checkbox" checked={rev} onChange={(e) => setRev(e.target.checked)} aria-label="À revoir dans quelques jours" style={{ width: 26, height: 26 }} />
        </label>
        <div className="quick">
          <button type="button" className="btn primary" onClick={save}>Enregistrer la séance</button>
          <button type="button" className="btn" onClick={clearBilan}>Passer</button>
        </div>
      </div>
    </Sheet>
  );
}

/** Hôte du bilan : à placer une fois dans la coque. Rien ne s'affiche si le bilan est désactivé dans les réglages. */
export function BilanHost() {
  const ask = useBilanAsk();
  const { settings } = useData();
  useEffect(() => clearBilan, []);   // à la fermeture de l'application ou d'un test : aucune demande ne survit
  if (!ask || settings.ui?.bilan === false) return null;
  return <Form key={ask.id} ask={ask} />;
}
