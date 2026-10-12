import { Fragment, useMemo } from 'react';
import type { ISODate } from '@/core/dates';
import { dur, hm } from '@/core/format';
import { lessonTag } from '@/domain/lesson';
import type { Block } from '@/domain/types';
import { useData } from '@/state/DataContext';
import { dc } from '../Icon';
import { HabitRow } from '../habits/HabitRow';

/** Agenda de la journée : le temps réservé (routine, sport, repas, travail, trajet) en bandes hachurées, sans case ; les séances d'apprentissage en cartes de verre.
    Une ligne « maintenant » se place dans la journée affichée si c'est aujourd'hui (`now` = -1 sinon). */
export function DayAgenda({ blocks, date, streaks, now }: { blocks: readonly Block[]; date: ISODate; streaks: Record<string, number>; now: number }) {
  const { tasks } = useData();
  const rows = useMemo(() => [...blocks].sort((a, b) => a.start - b.start || a.end - b.end), [blocks]);
  const nowAt = now >= 0 ? rows.findIndex((b) => b.end > now) : -2;
  const marker = <li className="ag-now" aria-hidden="true" key="now"><span>{hm(now)}</span><i /></li>;
  return (
    <ol className="agenda" aria-label="Agenda du jour">
      {rows.map((b, i) => (
        <Fragment key={b.id + b.start}>
          {nowAt === i && now < b.start && marker}
          <li className={'ag-row' + (b.checkable ? ' ses' : ' res')} style={{ ['--n' as string]: Math.min(i, 12) }}>
            <time className="ag-t" dateTime={hm(b.start)}>{hm(b.start)}</time>
            {b.checkable
              ? <HabitRow block={b} date={date} streak={streaks[b.id] ?? 0} now={now} tag={lessonTag(b, tasks)} />
              : (
                <div className="ag-band" style={dc(b.domain)}>
                  <span>{b.title}</span><span className="muted">{dur(b.end - b.start)}</span>
                </div>
              )}
          </li>
        </Fragment>
      ))}
      {nowAt === -1 && marker}
    </ol>
  );
}
