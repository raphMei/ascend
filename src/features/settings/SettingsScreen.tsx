import type { ThemeMode } from '@/domain/types';
import { CommitInput } from '@/components/CommitInput';
import { PageHead } from '@/components/PageHead';
import { exportData } from '@/services/exportData';
import { useData } from '@/state/DataContext';

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
        <div className="quick"><button type="button" className="btn" onClick={() => void signOut()}>Se déconnecter</button><button type="button" className="btn" onClick={() => exportData(state)}>Exporter mes données</button></div>
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
        </div>
      </section>
      <section className="card"><h2>Chabbat</h2><p className="muted" style={{ margin: '4px 0 12px' }}>Heures calculées pour la région de Deuil-la-Barre. Ce sont des valeurs approchées : vérifie avec ton calendrier habituel et ajuste les minutes si besoin.</p>
        <div className="fields">
          <label className="f">Allumage : minutes avant le coucher du soleil<CommitInput type="number" value={s.candle} onCommit={num('candle')} /></label>
          <label className="f">Sortie : minutes après le coucher du soleil<CommitInput type="number" value={s.havdalah} onCommit={num('havdalah')} /></label>
        </div>
      </section>
      <section className="card"><h2>Apparence</h2>
        <div className="quick" style={{ marginTop: 8 }}>
          {THEMES.map(([k, n]) => <button key={k} type="button" className="btn small" aria-pressed={s.theme === k} style={s.theme === k ? { outline: '2px solid var(--accent)' } : undefined} onClick={() => setSettings({ theme: k })}>{n}</button>)}
        </div>
      </section>
    </>
  );
}
