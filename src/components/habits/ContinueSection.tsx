import { Link } from 'react-router-dom';
import { dur } from '@/core/format';
import type { ContinueCard } from '@/domain/continue';
import { emojiFor } from '@/domain/habit-meta';
import { dc } from '../Icon';

/** « Continuer mes cours » : la prochaine étape de chaque parcours, avec le lien direct vers le cours. */
export function ContinueSection({ cards }: { cards: ContinueCard[] }) {
  if (!cards.length) return null;
  return (
    <section className="group" style={dc('java')} aria-label="Continuer mes cours">
      <div className="group-head static"><span className="group-ico" aria-hidden="true">▶️</span><span className="group-name">Continuer mes cours</span></div>
      <div className="group-body">
        {cards.map((c) => (
          <div key={c.domain} className="habit continue" style={dc(c.domain)}>
            <span className="habit-ico" aria-hidden="true">{emojiFor({ id: c.domain, domain: c.domain })}</span>
            <span className="habit-main">
              <span className="habit-title">{c.step.t}</span>
              <span className="habit-sub">{c.label} · phase {c.step.phase.n} : {c.step.phase.title} · {c.phaseDone}/{c.phaseTotal} · {dur(c.step.min)}</span>
            </span>
            <span className="continue-actions">
              {c.link && <a className="btn small primary" href={c.link} target="_blank" rel="noopener noreferrer" aria-label={`Ouvrir le cours : ${c.step.t}`}>Ouvrir ↗</a>}
              <Link className="btn small" to={`/dom/${c.domain}/${c.step.phase.id}`} aria-label={`Voir la phase ${c.step.phase.n} de ${c.label}`}>Phase</Link>
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
