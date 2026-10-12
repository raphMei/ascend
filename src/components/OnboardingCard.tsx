import { Link } from 'react-router-dom';
import { useData } from '@/state/DataContext';

/** Carte de démarrage, affichée tant qu'on n'a pas commencé : les réglages qui comptent. Disparaît après « C'est fait » ou dès la première séance terminée. */
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
        <li><Link to="/domains" style={link}>Règle l'intensité de tes domaines</Link> : chaque mois, pour chaque domaine (cours MIAGE, Java, front, Cloud et DevOps, architecture, anglais…).</li>
        <li><Link to="/settings" style={link}>Active les rappels</Link> (sur iPhone : ajoute d'abord Ascend à l'écran d'accueil).</li>
        <li>Termine ta première séance : la liste, les séries et le suivi de ton apprentissage se mettent en route.</li>
      </ol>
      <div className="quick"><button type="button" className="btn primary" onClick={() => setSettings({ ui: { onboarded: true } })}>C'est fait</button></div>
    </section>
  );
}
