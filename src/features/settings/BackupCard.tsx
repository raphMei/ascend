import { useState, type ChangeEvent } from 'react';
import { exportData } from '@/services/exportData';
import { parseBackup, type Backup } from '@/services/importData';
import { useData } from '@/state/DataContext';

const MAX_BYTES = 10 * 1024 * 1024;

/** Sauvegarde : exporter toutes ses données, ou en restaurer depuis un fichier (validé avant toute écriture). */
export function BackupCard() {
  const { state, importBackup } = useData();
  const [pending, setPending] = useState<{ data: Backup; days: number; settings: number; tasks: number } | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [message, setMessage] = useState('');

  const onFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';                      // permet de choisir deux fois le même fichier
    setErrors([]); setMessage(''); setPending(null);
    if (!file) return;
    if (file.size > MAX_BYTES) { setErrors(['Ce fichier est trop volumineux (10 Mo maximum).']); return; }
    const r = parseBackup(await file.text());
    if (!r.ok) setErrors(r.errors); else setPending({ data: r.data, ...r.counts });
  };
  const apply = () => {
    if (!pending) return;
    importBackup(pending.data);
    setMessage(`Importé : ${pending.days} jour${pending.days > 1 ? 's' : ''}, ${pending.settings} réglage${pending.settings > 1 ? 's' : ''}, ${pending.tasks} tâche${pending.tasks > 1 ? 's' : ''} cochée${pending.tasks > 1 ? 's' : ''}.`);
    setPending(null);
  };

  return (
    <section className="card"><h2>Sauvegarde</h2>
      <p className="muted" style={{ margin: '4px 0 12px' }}>Exporte toutes tes données dans un fichier, ou restaure-les depuis une sauvegarde. À l'import, les valeurs du fichier remplacent celles de même date ou de même nom ; le reste est conservé.</p>
      <div className="quick" style={{ marginTop: 0 }}>
        <button type="button" className="btn" onClick={() => exportData(state)}>Exporter mes données</button>
        <label className="btn" style={{ cursor: 'pointer' }}>Importer une sauvegarde
          <input type="file" accept="application/json,.json" className="sr" aria-label="Importer une sauvegarde" onChange={(e) => void onFile(e)} />
        </label>
      </div>
      {errors.length > 0 && (
        <div className="warn" role="alert" style={{ marginTop: 12 }}>
          <b>Import refusé, rien n'a été modifié.</b>
          <ul style={{ margin: '6px 0 0', paddingLeft: 18 }}>{errors.map((m) => <li key={m}>{m}</li>)}</ul>
        </div>
      )}
      {pending && (
        <div className="warn" role="status" style={{ marginTop: 12 }}>
          Ce fichier contient <b>{pending.days} jour{pending.days > 1 ? 's' : ''}</b>, <b>{pending.settings} réglage{pending.settings > 1 ? 's' : ''}</b> et <b>{pending.tasks} tâche{pending.tasks > 1 ? 's' : ''} cochée{pending.tasks > 1 ? 's' : ''}</b>. Importer ?
          <div className="quick"><button type="button" className="btn primary" onClick={apply}>Importer</button><button type="button" className="btn" onClick={() => setPending(null)}>Annuler</button></div>
        </div>
      )}
      {message && <p role="status" className="muted" style={{ marginTop: 12 }}>{message}</p>}
    </section>
  );
}
