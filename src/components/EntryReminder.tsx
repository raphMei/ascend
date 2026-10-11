import type { ISODate } from '@/core/dates';
import { toMin } from '@/core/format';
import { useClock } from '@/hooks/useClock';
import { useData } from '@/state/DataContext';

/** Rappel de saisie : poids et nuit du jour, une fois le réveil passé de 30 minutes. Disparaît dès que c'est renseigné. */
export function EntryReminder({ date }: { date: ISODate }) {
  const { state, settings } = useData();
  const { now } = useClock();
  const D = state.days[date];
  if (now < toMin(settings.wake) + 30) return null;
  const missing: string[] = [];
  if (D?.weight == null) missing.push('ton poids');
  if (!D?.sleep?.bed || !D.sleep.wake) missing.push('ta nuit (coucher et lever)');
  if (!missing.length) return null;
  return <div className="warn" role="status">Pense à saisir {missing.join(' et ')} : en bas de cette page, dans « Mes mesures du jour ».</div>;
}
