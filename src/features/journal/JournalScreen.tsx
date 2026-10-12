import { useMemo, useState } from 'react';
import { fmtLong, type ISODate } from '@/core/dates';
import { DOM } from '@/domain/domains';
import { dueReviews, journalItems, reviewPatch, type JournalItem } from '@/domain/journal';
import type { DomainId } from '@/domain/types';
import { dc } from '@/components/Icon';
import { PageHead } from '@/components/PageHead';
import { showUndo } from '@/components/UndoToast';
import { haptic } from '@/hooks/feedback';
import { useClock } from '@/hooks/useClock';
import { useData } from '@/state/DataContext';

const DIFF = { 1: 'Facile', 2: 'Correct', 3: 'Dur' } as const;

/** Journal d'apprentissage : les notions à revoir aujourd'hui (révision espacée), puis le fil des bilans de séance, par jour. */
export function JournalScreen() {
  const { state, setDay } = useData();
  const { today } = useClock();
  const [filter, setFilter] = useState<DomainId | 'all'>('all');
  const items = useMemo(() => journalItems(state.days), [state.days]);
  const due = useMemo(() => dueReviews(items, today), [items, today]);
  const domains = useMemo(() => [...new Set(items.map((i) => i.k))], [items]);
  const shown = items.filter((i) => filter === 'all' || i.k === filter);
  const groups = [...new Set(shown.map((i) => i.date))];

  const review = (it: JournalItem, known: boolean) => {
    const before = { n: it.n ?? 0, next: it.next ?? null, rev: it.rev ?? false };
    setDay(it.date, { journal: { [it.id]: reviewPatch(it, known, today) } });
    haptic(known ? [10, 30] : 8);
    showUndo(known ? `« ${it.t} » : on te le redemande plus tard` : `« ${it.t} » : on te le redemande demain`, () => setDay(it.date, { journal: { [it.id]: before } }));
  };
  const dayLabel = (d: ISODate) => (d === today ? "Aujourd'hui" : fmtLong(d));

  return (
    <>
      <PageHead eyebrow="Journal" title="Ce que j'ai appris" />
      {domains.length > 1 && (
        <div className="filters" role="group" aria-label="Filtrer par domaine">
          <button type="button" aria-pressed={filter === 'all'} onClick={() => setFilter('all')}>Tout</button>
          {domains.map((d) => <button key={d} type="button" aria-pressed={filter === d} onClick={() => setFilter(d)}>{DOM[d].name}</button>)}
        </div>
      )}

      <section aria-label="À revoir">
        <div className="sectionhead"><h2 style={{ fontSize: 18 }}>À revoir aujourd'hui</h2><span className="muted">{due.length}</span></div>
        {due.length ? (
          <div className="revs">
            {due.filter((i) => filter === 'all' || i.k === filter).map((it) => (
              <div className="revc" key={it.date + it.id} style={dc(it.k)}>
                <span className="muted">{DOM[it.k].name}</span>
                <b>{it.t}</b>
                {it.note && <span className="muted revnote">{it.note}</span>}
                <div className="acts">
                  <button type="button" className="btn" onClick={() => review(it, false)} aria-label={`Flou : ${it.t}`}>Flou</button>
                  <button type="button" className="btn primary" onClick={() => review(it, true)} aria-label={`Je sais : ${it.t}`}>Je sais</button>
                </div>
              </div>
            ))}
          </div>
        ) : <div className="card"><p className="muted">{items.some((i) => i.rev) ? 'Rien à revoir aujourd\'hui. Bien joué.' : 'Quand tu termines une séance, note ce que tu as compris et marque « à revoir » : la notion revient ici au bon moment.'}</p></div>}
      </section>

      {groups.map((g) => (
        <section key={g} aria-label={dayLabel(g)}>
          <h2 className="jday">{dayLabel(g)}</h2>
          {shown.filter((i) => i.date === g).map((it, k) => (
            <article className="jentry" key={it.id} style={{ ...dc(it.k), ['--n' as string]: k }}>
              <i aria-hidden="true" />
              <div>
                <div className="row"><b>{it.t}</b>{it.rev && it.next && <span className="stag rev">À revoir · {it.next === today ? "aujourd'hui" : it.next.slice(8) + '/' + it.next.slice(5, 7)}</span>}</div>
                <div className="muted">{DOM[it.k].name}{it.diff ? ` · ${DIFF[it.diff]}` : ''}</div>
                {it.note && <p>{it.note}</p>}
              </div>
            </article>
          ))}
        </section>
      ))}
      {!items.length && <section className="card"><h2>Ton journal est vide</h2><p className="muted" style={{ marginTop: 6 }}>Termine une séance : un court bilan te sera proposé. Il se range ici, et les notions à revoir te reviennent au bon moment.</p></section>}
    </>
  );
}
