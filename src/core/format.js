/* Formatage des durées, heures et textes (HTML-safe). Les durées sont exprimées en minutes. */
export const pad2 = (n) => String(n).padStart(2, '0');
/** « HH:MM » → minutes depuis minuit. */
export const toMin = (s) => { const [h, m] = String(s).split(':').map(Number); return h * 60 + (m || 0); };
/** minutes depuis minuit → « HH:MM ». */
export const hm = (m) => { m = Math.round(m); if (m >= 1440) m -= 1440; return pad2(Math.floor(m / 60)) + ':' + pad2(m % 60); };
/** 135 → « 2 h 15 », 40 → « 40 min ». */
export const dur = (m) => m >= 60 ? Math.floor(m / 60) + ' h' + (m % 60 ? ' ' + pad2(m % 60) : '') : m + ' min';
/** 135 → « 2,3 h ». */
export const hours = (m) => (Math.round(m / 6) / 10).toString().replace('.', ',') + ' h';
/** Nombre décimal à la française. */
export const frNum = (n) => String(n).replace('.', ',');
export const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
