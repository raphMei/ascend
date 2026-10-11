import { useState } from 'react';
import { hours } from '@/core/format';
import { DOM } from '@/domain/domains';
import type { Project, ProjectStatus } from '@/domain/types';
import { CommitInput } from '@/components/CommitInput';
import { DomainCard } from '@/components/DomainCard';
import { BackLink, PageHead } from '@/components/PageHead';
import { useClock } from '@/hooks/useClock';
import { useData } from '@/state/DataContext';
import type { DomainModule } from '../types';
import { DisabledNotice } from '../shared/DisabledNotice';

const STATUS: [ProjectStatus, string][] = [['actif', 'Actif'], ['pause', 'En pause'], ['fini', 'Terminé']];
const newId = () => Date.now().toString(36);

function useProjects(): [string, Project][] {
  const { state } = useData();
  return Object.entries(state.progress.projects ?? {}).filter((e): e is [string, Project] => !!e[1]).sort(([, a], [, b]) => (a.created < b.created ? -1 : 1));
}

function Card() {
  const list = useProjects();
  const active = list.filter(([, p]) => p.status === 'actif').length;
  return <DomainCard id="projets" stat={list.length ? `${active} actif${active > 1 ? 's' : ''} sur ${list.length}` : 'Aucun projet pour l\'instant'} />;
}

function Page() {
  const { today } = useClock();
  const { settings, setProgress } = useData();
  const list = useProjects();
  const [name, setName] = useState('');
  const [next, setNext] = useState('');
  const update = (id: string, patch: Partial<Project>) => setProgress({ projects: { [id]: patch } });
  const add = () => {
    if (!name.trim()) return;
    setProgress({ projects: { [newId()]: { name: name.trim(), next: next.trim() || 'Définir la première action', status: 'actif', minutes: 0, created: today } } });
    setName(''); setNext('');
  };
  return (
    <>
      <BackLink to="/domains" label="Domaines" /><PageHead eyebrow="Domaine" title={DOM.projets.name} />
      {settings.projetsMin < 5 && <DisabledNotice what="la séance quotidienne sur tes projets" />}
      <section className="card"><h2>Nouveau projet</h2>
        <div className="fields" style={{ gridTemplateColumns: '1fr', marginTop: 10 }}>
          <label className="f">Nom<input type="text" value={name} maxLength={80} onChange={(e) => setName(e.target.value)} placeholder="Site pour un client, application perso…" /></label>
          <label className="f">Première action concrète<input type="text" value={next} maxLength={120} onChange={(e) => setNext(e.target.value)} placeholder="Écrire le cahier des charges en une page" /></label>
        </div>
        <div className="quick"><button type="button" className="btn primary" disabled={!name.trim()} onClick={add}>Ajouter le projet</button></div>
      </section>
      {list.length === 0 && <p className="muted">Un projet = un nom et une prochaine action assez petite pour tenir en une séance. Le bloc quotidien du planning affichera celle du premier projet actif.</p>}
      {list.map(([id, p]) => (
        <section className="card" key={id}>
          <div className="sectionhead"><h2 style={{ fontSize: 20 }}>{p.name}</h2><span className="mono muted">{hours(p.minutes)}</span></div>
          <div className="fields" style={{ gridTemplateColumns: '1fr', marginTop: 10 }}>
            <label className="f">Prochaine action<CommitInput type="text" value={p.next} onCommit={(v) => update(id, { next: String(v ?? '') })} /></label>
            <label className="f">Statut
              <select value={p.status} onChange={(e) => update(id, { status: e.target.value as ProjectStatus })}>{STATUS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>
            </label>
          </div>
          <div className="quick">
            <button type="button" className="btn small" onClick={() => update(id, { minutes: p.minutes + 30 })}>+ 30 min</button>
            <button type="button" className="btn small" onClick={() => update(id, { minutes: p.minutes + 60 })}>+ 1 h</button>
            <button type="button" className="btn small" onClick={() => { if (window.confirm(`Supprimer le projet « ${p.name} » ?`)) setProgress({ projects: { [id]: null } }); }}>Supprimer</button>
          </div>
        </section>
      ))}
    </>
  );
}

export const projets: DomainModule = { id: 'projets', Card, Page };
