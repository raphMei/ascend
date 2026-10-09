/** Formatage des durées et heures. Les durées sont exprimées en minutes. */
export const pad2 = (n: number): string => String(n).padStart(2, '0');
/** « HH:MM » → minutes depuis minuit. */
export const toMin = (s: string): number => { const [h, m] = String(s).split(':').map(Number); return h * 60 + (m || 0); };
/** minutes depuis minuit → « HH:MM ». */
export const hm = (m: number): string => { m = Math.round(m); if (m >= 1440) m -= 1440; return pad2(Math.floor(m / 60)) + ':' + pad2(m % 60); };
/** 135 → « 2 h 15 », 40 → « 40 min ». */
export const dur = (m: number): string => m >= 60 ? Math.floor(m / 60) + ' h' + (m % 60 ? ' ' + pad2(m % 60) : '') : m + ' min';
/** 135 → « 2,3 h ». */
export const hours = (m: number): string => (Math.round(m / 6) / 10).toString().replace('.', ',') + ' h';
/** Nombre décimal à la française. */
export const frNum = (n: number | string): string => String(n).replace('.', ',');
/** Durée de sommeil en minutes entre un coucher et un lever « HH:MM » (peut franchir minuit). */
export const sleepDuration = (bed: string, wake: string): number => (toMin(wake) - toMin(bed) + 1440) % 1440;
