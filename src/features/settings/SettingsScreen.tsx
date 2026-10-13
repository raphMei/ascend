import { Link } from 'react-router-dom';
import { LEVELS, LEVEL_LABEL, levelOf } from '@/domain/month';
import type { Level, ThemeMode } from '@/domain/types';
import { CommitInput } from '@/components/CommitInput';
import { PageHead } from '@/components/PageHead';
import { Switch } from '@/components/Switch';
import { useClock } from '@/hooks/useClock';
import { useData } from '@/state/DataContext';
import { BackupCard } from './BackupCard';
import { RemindersCard } from './RemindersCard';

const WEEK: [number, string][] = [[1, 'Lun'], [2, 'Mar'], [3, 'Mer'], [4, 'Jeu'], [5, 'Ven']];
const THEMES: [ThemeMode, string][] = [['auto', 'Automatique'], ['light', 'Clair'], ['dark', 'Sombre']];

/** Une ligne de réglage : titre, explication, interrupteur. */
function Toggle({ title, hint, checked, onChange }: { title: string; hint: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="set-row">
      <span><b>{title}</b><span className="muted">{hint}</span></span>
      <Switch checked={checked} onChange={onChange} label={title} />
    </label>
  );
}

/** Réglages : compte, semaine de travail, temps réservé (sport), apprentissage, Chabbat, rappels, sauvegarde, apparence.
    Les minutes de chaque domaine ne se règlent plus ici : c'est l'intensité du mois, dans « Domaines ». */
export function SettingsScreen() {
  const { state, settings: s, setSettings, signOut } = useData();
  const { today } = useClock();
  const month = today.slice(0, 7);
  // Un champ vidé est ignoré (on ne remplace pas une valeur par 0).
  const num = (key: string) => (v: string | number | null) => { if (v !== null && v !== '') setSettings({ [key]: Number(v) }); };
  const txt = (key: string) => (v: string | number | null) => { if (v) setSettings({ [key]: String(v) }); };
  const toggleOnsite = (w: number, on: boolean) => {
    const cur = new Set(s.onsite);
    if (on) cur.add(w); else cur.delete(w);
    cur.add(4); // le jeudi est toujours sur site
    setSettings({ onsite: [...cur].sort() });
  };
  const sport = levelOf(s, 'sport', today);
  const setSport = (l: Level) => setSettings({ months: { [month]: { sport: l } } });
  const { user } = state;
  return (
    <>
      <PageHead eyebrow="Réglages" title="Mon Ascend" />

      <section className="card set" aria-label="Compte">
        <h2>Compte</h2>
        <p className="muted">{user?.email || user?.displayName || ''}</p>
        <p className={'sync' + (state.sync === 'error' ? ' bad' : '')}>
          {state.sync === 'error' ? 'Synchronisation interrompue : ' + state.error : state.sync === 'demo' ? 'Mode démo : données gardées uniquement sur cet appareil' : '● Synchronisé entre tes appareils'}
        </p>
        <div className="quick"><button type="button" className="btn" onClick={() => void signOut()}>Se déconnecter</button></div>
      </section>

      <section className="card set" aria-label="Ma semaine">
        <h2>Ma semaine</h2>
        <p className="muted">Tes jours sur site chez AXA (le jeudi est obligatoire) : les autres jours sont en télétravail. Travail, trajets et repas sont du temps réservé : l'apprentissage se place autour.</p>
        <div className="lv-seg" role="group" aria-label="Jours sur site">
          {WEEK.map(([w, n]) => (
            <button key={w} type="button" role="checkbox" aria-checked={s.onsite.includes(w)} disabled={w === 4} onClick={() => toggleOnsite(w, !s.onsite.includes(w))}>{n}</button>
          ))}
        </div>
        <div className="fields" style={{ marginTop: 14 }}>
          <label className="f">Réveil<CommitInput type="time" value={s.wake} onCommit={txt('wake')} /></label>
          <label className="f">Coucher<CommitInput type="time" value={s.bed} onCommit={txt('bed')} /></label>
          <label className="f">Temps de travail par jour (min)<CommitInput type="number" value={s.workMin} onCommit={num('workMin')} /></label>
        </div>
      </section>

      <section className="card set" aria-label="Sport">
        <h2>Sport</h2>
        <p className="muted">Temps réservé : il bloque ton agenda, il n'y a rien à cocher. Moins de séances, c'est plus de temps libre pour apprendre.</p>
        <div className="lv-seg" role="radiogroup" aria-label="Séances de sport par semaine">
          {LEVELS.map((l) => <button key={l} type="button" role="radio" aria-checked={sport === l} onClick={() => setSport(l)}>{l === 'off' ? 'Aucune' : l === 'leger' ? '3 / semaine' : l === 'normal' ? '5 / semaine' : '6 / semaine'}</button>)}
        </div>
        <p className="muted" style={{ marginTop: 8, fontSize: 13 }}>Réglage du mois en cours ({LEVEL_LABEL[sport]}). Les mois suivants le reprennent tant que tu ne le changes pas.</p>
      </section>

      <section className="card set" aria-label="Apprentissage">
        <h2>Apprentissage</h2>
        <Toggle title="Ajuster automatiquement le planning" hint="Si tu rates une séance, elle est replacée au prochain créneau libre et le reste est décalé." checked={s.autoReschedule !== false} onChange={(v) => setSettings({ autoReschedule: v })} />
        <Toggle title="Ajuster les durées à mon rythme réel" hint="Mesuré au minuteur. Détail dans Statistiques." checked={s.calibrate !== false} onChange={(v) => setSettings({ calibrate: v })} />
        <Toggle title="Bilan après chaque séance" hint="Une courte note et la révision espacée, rangées dans le journal." checked={s.ui?.bilan !== false} onChange={(v) => setSettings({ ui: { bilan: v } })} />
        <Toggle title="Petit son de validation" hint="Un « tic » discret quand tu termines une séance. La vibration dépend de ton téléphone." checked={!!s.ui?.sound} onChange={(v) => setSettings({ ui: { sound: v } })} />
        <div className="quick"><Link to="/domains" className="btn" style={{ textDecoration: 'none' }}>Régler mes domaines du mois</Link></div>
      </section>

      <section className="card set" aria-label="Chabbat">
        <h2>Chabbat</h2>
        <p className="muted">Aucune séance ni rappel du vendredi à l'allumage au samedi à la sortie. Heures calculées pour la région de Deuil-la-Barre : des valeurs approchées, ajuste si besoin.</p>
        <div className="fields">
          <label className="f">Allumage : minutes avant le coucher du soleil<CommitInput type="number" value={s.candle} onCommit={num('candle')} /></label>
          <label className="f">Sortie : minutes après le coucher du soleil<CommitInput type="number" value={s.havdalah} onCommit={num('havdalah')} /></label>
        </div>
      </section>

      <RemindersCard />

      <section className="card set" aria-label="Apparence">
        <h2>Apparence</h2>
        <div className="lv-seg" role="radiogroup" aria-label="Thème">
          {THEMES.map(([k, n]) => <button key={k} type="button" role="radio" aria-checked={s.theme === k} onClick={() => setSettings({ theme: k })}>{n}</button>)}
        </div>
      </section>

      <BackupCard />

    </>
  );
}
