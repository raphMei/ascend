import type { ThemeMode } from '@/domain/types';
import { CommitInput } from '@/components/CommitInput';
import { Link } from 'react-router-dom';
import { PageHead } from '@/components/PageHead';
import { useData } from '@/state/DataContext';
import { BackupCard } from './BackupCard';
import { RemindersCard } from './RemindersCard';

const WEEK: [number, string][] = [[1, 'Lundi'], [2, 'Mardi'], [3, 'Mercredi'], [4, 'Jeudi'], [5, 'Vendredi']];
const THEMES: [ThemeMode, string][] = [['auto', 'Automatique'], ['light', 'Clair'], ['dark', 'Sombre']];

export function SettingsScreen() {
  const { state, settings: s, setSettings, signOut } = useData();
  // Un champ vidé est ignoré (on ne remplace pas un objectif par 0).
  const num = (key: string) => (v: string | number | null) => { if (v !== null && v !== '') setSettings({ [key]: Number(v) }); };
  const txt = (key: string) => (v: string | number | null) => { if (v) setSettings({ [key]: String(v) }); };
  const toggleOnsite = (w: number, on: boolean) => {
    const cur = new Set(s.onsite);
    if (on) cur.add(w); else cur.delete(w);
    cur.add(4); // le jeudi est toujours sur site
    setSettings({ onsite: [...cur].sort() });
  };
  const { user } = state;
  return (
    <>
      <PageHead eyebrow="Réglages" title="Mon Ascend" />
      <section className="card"><h2>Compte</h2><p className="muted" style={{ margin: '4px 0 12px' }}>{user?.email || user?.displayName || ''}</p>
        <p className={'sync' + (state.sync === 'error' ? ' bad' : '')}>
          {state.sync === 'error' ? 'Synchronisation interrompue : ' + state.error : state.sync === 'demo' ? 'Mode démo : données gardées uniquement sur cet appareil' : '● Synchronisé entre tes appareils'}
        </p>
        <div className="quick"><button type="button" className="btn" onClick={() => void signOut()}>Se déconnecter</button></div>
      </section>
      <section className="card"><h2>Ma semaine de travail</h2><p className="muted" style={{ margin: '4px 0 12px' }}>Coche tes jours sur site chez AXA (le jeudi est obligatoire). Les autres jours sont en télétravail.</p>
        <div className="quick" style={{ marginTop: 0 }}>
          {WEEK.map(([w, n]) => (
            <label key={w} className="btn small" style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}>
              <input type="checkbox" checked={s.onsite.includes(w)} disabled={w === 4} onChange={(e) => toggleOnsite(w, e.target.checked)} /> {n}
            </label>
          ))}
        </div>
        <div className="fields" style={{ marginTop: 14 }}>
          <label className="f">Heures de travail (min)<CommitInput type="number" value={s.workMin} onCommit={num('workMin')} /></label>
          <label className="f">Java par jour (h)<CommitInput type="number" step={0.5} min={0} max={6} value={s.javaHours} onCommit={num('javaHours')} /></label>
          <label className="f">Réveil<CommitInput type="time" value={s.wake} onCommit={txt('wake')} /></label>
          <label className="f">Coucher<CommitInput type="time" value={s.bed} onCommit={txt('bed')} /></label>
        </div>
      </section>
      <section className="card"><h2>Mes objectifs santé</h2>
        <div className="fields" style={{ marginTop: 12 }}>
          <label className="f">Calories<CommitInput type="number" value={s.kcalGoal} onCommit={num('kcalGoal')} /></label>
          <label className="f">Protéines (g)<CommitInput type="number" value={s.protGoal} onCommit={num('protGoal')} /></label>
          <label className="f">Eau (ml)<CommitInput type="number" value={s.waterGoal} onCommit={num('waterGoal')} /></label>
          <label className="f">Sommeil (h)<CommitInput type="number" step={0.5} value={s.sleepGoal} onCommit={num('sleepGoal')} /></label>
          <label className="f">Poids visé (kg)<CommitInput type="number" step={0.1} min={30} max={250} value={s.weightGoal} placeholder="facultatif" onCommit={(v) => setSettings({ weightGoal: v === '' ? null : v })} /></label>
        </div>
      </section>
      <section className="card"><h2>Ajustement automatique</h2><p className="muted" style={{ margin: '4px 0 12px' }}>Quand tu prends du retard, le planning redistribue les tâches sur les jours à venir selon la place disponible, et explique chaque déplacement.</p>
        <label className="row" style={{ cursor: 'pointer' }}><span>Ajuster automatiquement le planning</span>
          <input type="checkbox" checked={s.autoReschedule !== false} onChange={(e) => setSettings({ autoReschedule: e.target.checked })} aria-label="Ajuster automatiquement le planning" style={{ width: 24, height: 24 }} /></label>
        <label className="row" style={{ cursor: 'pointer' }}><span>Ajuster les durées à mon rythme réel<br /><span className="muted" style={{ fontSize: 13 }}>Mesuré au minuteur. Détail dans Statistiques.</span></span>
          <input type="checkbox" checked={s.calibrate !== false} onChange={(e) => setSettings({ calibrate: e.target.checked })} aria-label="Ajuster les durées à mon rythme réel" style={{ width: 24, height: 24 }} /></label>
        <label className="row" style={{ cursor: 'pointer' }}><span>Bilan après chaque séance<br /><span className="muted" style={{ fontSize: 13 }}>Une courte note et la révision espacée, rangées dans le journal.</span></span>
          <input type="checkbox" checked={s.ui?.bilan !== false} onChange={(e) => setSettings({ ui: { bilan: e.target.checked } })} aria-label="Bilan après chaque séance" style={{ width: 24, height: 24 }} /></label>
        <div className="quick"><Link to="/domains" className="btn" style={{ textDecoration: 'none' }}>Régler mes domaines du mois</Link></div>
      </section>
      <section className="card"><h2>Mes domaines</h2><p className="muted" style={{ margin: '4px 0 12px' }}>Minutes par jour dans ton planning pour chaque domaine. 0 = désactivé : rien n'est ajouté à ta journée.</p>
        <div className="fields">
          <label className="f">Anglais (min)<CommitInput type="number" min={0} max={120} step={5} value={s.anglaisMin} onCommit={num('anglaisMin')} /></label>
          <label className="f">Lecture (min)<CommitInput type="number" min={0} max={120} step={5} value={s.lectureMin} onCommit={num('lectureMin')} /></label>
          <label className="f">Dev front (min)<CommitInput type="number" min={0} max={240} step={5} value={s.frontMin} onCommit={num('frontMin')} /></label>
          <label className="f">Cloud et DevOps (min)<CommitInput type="number" min={0} max={240} step={5} value={s.cloudMin} onCommit={num('cloudMin')} /></label>
          <label className="f">Architecture logicielle (min)<CommitInput type="number" min={0} max={240} step={5} value={s.archiMin} onCommit={num('archiMin')} /></label>
          <label className="f">Projets perso (min)<CommitInput type="number" min={0} max={240} step={5} value={s.projetsMin} onCommit={num('projetsMin')} /></label>
          <label className="f">Point finances mensuel (min)<CommitInput type="number" min={0} max={120} step={5} value={s.financesMin} onCommit={num('financesMin')} /></label>
        </div>
      </section>
      <section className="card"><h2>Chabbat</h2><p className="muted" style={{ margin: '4px 0 12px' }}>Heures calculées pour la région de Deuil-la-Barre. Ce sont des valeurs approchées : vérifie avec ton calendrier habituel et ajuste les minutes si besoin.</p>
        <div className="fields">
          <label className="f">Allumage : minutes avant le coucher du soleil<CommitInput type="number" value={s.candle} onCommit={num('candle')} /></label>
          <label className="f">Sortie : minutes après le coucher du soleil<CommitInput type="number" value={s.havdalah} onCommit={num('havdalah')} /></label>
        </div>
      </section>
      <RemindersCard />
      <BackupCard />
      <section className="card"><h2>Apparence</h2>
        <div className="quick" style={{ marginTop: 8 }}>
          {THEMES.map(([k, n]) => <button key={k} type="button" className="btn small" aria-pressed={s.theme === k} style={s.theme === k ? { outline: '2px solid var(--accent)' } : undefined} onClick={() => setSettings({ theme: k })}>{n}</button>)}
        </div>
        <label className="row" style={{ cursor: 'pointer', marginTop: 12 }}><span>Petit son de validation<br /><span className="muted" style={{ fontSize: 13 }}>Un « tic » discret quand tu coches une tâche. La vibration, elle, dépend de ton téléphone.</span></span>
          <input type="checkbox" checked={!!s.ui?.sound} onChange={(e) => setSettings({ ui: { sound: e.target.checked } })} aria-label="Petit son de validation" style={{ width: 24, height: 24 }} /></label>
      </section>
    </>
  );
}
