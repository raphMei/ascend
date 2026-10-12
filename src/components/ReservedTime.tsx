import { dur, hm } from '@/core/format';
import type { Block } from '@/domain/types';
import { dc } from './Icon';

/** Temps réservé de la journée (routine, sport, repas, travail, trajet, sommeil) : rien à cocher, juste ce qui est bloqué dans l'agenda. Replié par défaut. */
export function ReservedTime({ blocks, now }: { blocks: readonly Block[]; now: number }) {
  if (!blocks.length) return null;
  const total = blocks.reduce((a, b) => a + b.end - b.start, 0);
  return (
    <details className="card flat reserved">
      <summary><b>Temps réservé</b> <span className="muted">· {dur(total)} · {blocks.length} créneau{blocks.length > 1 ? 'x' : ''}</span></summary>
      <ul className="list" style={{ margin: '8px 0 0', padding: 0, listStyle: 'none' }}>
        {[...blocks].sort((a, b) => a.start - b.start).map((b) => (
          <li className="row" key={b.id + b.start} style={dc(b.domain)} aria-current={now >= b.start && now < b.end ? 'time' : undefined}>
            <span className="mono">{hm(b.start)}–{hm(b.end)}</span>
            <span>{b.title}</span>
          </li>
        ))}
      </ul>
    </details>
  );
}
