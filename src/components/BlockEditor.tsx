import { useState } from 'react';
import type { ISODate } from '@/core/dates';
import { hm, toMin } from '@/core/format';
import { DOM } from '@/domain/domains';
import type { Block, DomainId } from '@/domain/types';
import { useData } from '@/state/DataContext';
import { Modal } from './Modal';

/** Domaines proposés pour un bloc ajouté à la main. */
const CHOICES: DomainId[] = ['autre', 'sport', 'miage', 'java', 'alim', 'matin', 'sommeil'];
const newId = () => Date.now().toString(36);

/** Modifier un bloc : changer l'horaire, le passer, rétablir l'original ; un bloc ajouté à la main peut être supprimé. */
export function BlockEditor({ block, date, onClose }: { block: Block; date: ISODate; onClose: () => void }) {
  const { state, setDay } = useData();
  const edits = state.days[date]?.edits;
  const isExtra = block.id.startsWith('x:');
  const rawId = isExtra ? block.id.slice(2) : block.id;
  const [start, setStart] = useState(hm(block.start));
  const [minutes, setMinutes] = useState(String(block.end - block.start));
  const mins = Number(minutes);
  const s = toMin(start);
  const valid = /^\d{2}:\d{2}$/.test(start) && mins >= 5 && mins <= 720 && s + mins <= 1440;
  const modified = !!edits?.move?.[block.id];

  const save = () => {
    if (!valid) return;
    if (isExtra) {
      const cur = edits?.extra?.[rawId];
      if (cur) setDay(date, { edits: { extra: { [rawId]: { ...cur, start: s, end: s + mins } } } });
    } else setDay(date, { edits: { move: { [block.id]: { start: s, end: s + mins } } } });
    onClose();
  };
  return (
    <Modal title={isExtra ? 'Modifier mon bloc' : 'Modifier ce créneau'} onClose={onClose}>
      <p className="muted">{block.title}</p>
      <div className="fields" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <label className="f">Début<input type="time" value={start} onChange={(e) => setStart(e.target.value)} /></label>
        <label className="f">Durée (min)<input type="number" min={5} max={720} step={5} value={minutes} onChange={(e) => setMinutes(e.target.value)} /></label>
      </div>
      {!valid && <p className="err">Choisis une heure valide, une durée entre 5 et 720 minutes, qui se termine avant minuit.</p>}
      <div className="actions">
        <button type="button" className="btn primary" disabled={!valid} onClick={save}>Enregistrer</button>
        {isExtra
          ? <button type="button" className="btn" onClick={() => { setDay(date, { edits: { extra: { [rawId]: null } } }); onClose(); }}>Supprimer ce bloc</button>
          : <button type="button" className="btn" onClick={() => { setDay(date, { edits: { skip: { [block.id]: true } } }); onClose(); }}>Passer ce bloc aujourd'hui</button>}
        {modified && <button type="button" className="btn" onClick={() => { setDay(date, { edits: { move: { [block.id]: null } } }); onClose(); }}>Rétablir l'horaire d'origine</button>}
      </div>
    </Modal>
  );
}

/** Ajouter un bloc à la main sur un jour. */
export function AddBlock({ date, onClose }: { date: ISODate; onClose: () => void }) {
  const { setDay } = useData();
  const [title, setTitle] = useState('');
  const [start, setStart] = useState('18:00');
  const [minutes, setMinutes] = useState('30');
  const [domain, setDomain] = useState<DomainId>('autre');
  const mins = Number(minutes), s = toMin(start);
  const valid = title.trim().length > 0 && /^\d{2}:\d{2}$/.test(start) && mins >= 5 && mins <= 720 && s + mins <= 1440;
  const save = () => {
    if (!valid) return;
    setDay(date, { edits: { extra: { [newId()]: { title: title.trim(), start: s, end: s + mins, domain, checkable: true } } } });
    onClose();
  };
  return (
    <Modal title="Ajouter un bloc" onClose={onClose}>
      <label className="f">Titre<input type="text" value={title} maxLength={80} onChange={(e) => setTitle(e.target.value)} placeholder="Appeler le dentiste, courses…" /></label>
      <div className="fields" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <label className="f">Début<input type="time" value={start} onChange={(e) => setStart(e.target.value)} /></label>
        <label className="f">Durée (min)<input type="number" min={5} max={720} step={5} value={minutes} onChange={(e) => setMinutes(e.target.value)} /></label>
      </div>
      <label className="f">Domaine<select value={domain} onChange={(e) => setDomain(e.target.value as DomainId)}>{CHOICES.map((d) => <option key={d} value={d}>{DOM[d].name}</option>)}</select></label>
      <div className="actions"><button type="button" className="btn primary" disabled={!valid} onClick={save}>Ajouter</button></div>
    </Modal>
  );
}
