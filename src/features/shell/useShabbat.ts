import { shabbatNow } from '@/domain/shabbat';
import { useClock } from '@/hooks/useClock';
import { useData } from '@/state/DataContext';
import type { ShabbatWindow } from '@/domain/types';

/** Fenêtre de Chabbat en cours maintenant, ou null. */
export function useShabbat(): ShabbatWindow | null {
  const { settings } = useData();
  const { today, now } = useClock();
  return shabbatNow(today, now, settings);
}
