import { Link } from 'react-router-dom';
import { useData } from '@/state/DataContext';

/** Carte de démarrage, affichée tant qu'on n'a pas commencé : les quatre réglages qui comptent. Disparaît après « C'est fait » ou dès la première case cochée. */
export function OnboardingCard() {
  const { state, settings, setSettings } = useData();
  const started = Object.values(state.days).some((d) => d.done && Object.values(d.done).some(Boolean));
  if (settings.ui?.onboarded || started) return null;
  const link = { color: 'var(--accent)', fontWeight: 700 } as const;
  return (
    <section className="card" aria-label="Pour bien démarrer">
      <h2>Pour bien démarrer</h2>
      <ol style={{ margin: '10px 0 0', paddingLeft: 20, display: 'grid', gap: 10 }}>
        <li><Link to="/settings" style={link}>Choisis tes jours sur site</Link> et tes horaires : le planning en dépend.</li>
        <li><Link to="/month" style={link}>Règle ton mois</Link> : l'intensité de chaque domaine (cours, sport, anglais…).</li>
        <li><Link to="/settings" style={link}>Active les rappels</Link> (sur iPhone : ajoute d'abord Ascend à l'écran d'accueil).</li>
        <li>Coche ta première tâche : la liste, les séries et les objectifs se mettent en route.</li>
      </ol>
      <div className="quick"><button type="button" className="btn primary" onClick={() => setSettings({ ui: { onboarded: true } })}>C'est fait</button></div>
    </section>
  );
}
