/* Soleil et Chabbat : coucher du soleil (algorithme NOAA), heures d'allumage et de sortie. */
import { dow, addDays } from '../core/dates.js';

function sunsetUTCmin(date, lat, lon) {
  const d = new Date(date + 'T12:00:00Z'); const N = Math.floor((d - Date.UTC(d.getUTCFullYear(), 0, 0)) / 864e5);
  const rad = Math.PI / 180, lh = lon / 15, t = N + ((18 - lh) / 24), Ma = 0.9856 * t - 3.289;
  let L = Ma + 1.916 * Math.sin(Ma * rad) + 0.020 * Math.sin(2 * Ma * rad) + 282.634; L = (L % 360 + 360) % 360;
  let RA = Math.atan(0.91764 * Math.tan(L * rad)) / rad; RA = (RA % 360 + 360) % 360;
  RA += Math.floor(L / 90) * 90 - Math.floor(RA / 90) * 90; RA /= 15;
  const sd = 0.39782 * Math.sin(L * rad), cd = Math.cos(Math.asin(sd));
  const cH = (Math.cos(90.833 * rad) - sd * Math.sin(lat * rad)) / (cd * Math.cos(lat * rad));
  const H = Math.acos(Math.max(-1, Math.min(1, cH))) / rad / 15;
  const Tm = H + RA - 0.06571 * t - 6.622; return (((Tm - lh) % 24 + 24) % 24) * 60;
}
function parisOffset(date) {
  const f = new Intl.DateTimeFormat('en-US', { timeZone: 'Europe/Paris', hour: 'numeric', minute: 'numeric', hourCycle: 'h23' }).formatToParts(new Date(date + 'T12:00:00Z'));
  return +f.find((p) => p.type === 'hour').value * 60 + +f.find((p) => p.type === 'minute').value - 720;
}
export function sunsetLocal(date, S) { return Math.round(sunsetUTCmin(date, S.lat, S.lon) + parisOffset(date)); }
/** Pour un vendredi F : entrée (allumage) et sortie (samedi soir). */
export function shabbatFor(friday, S) {
  return { candle: sunsetLocal(friday, S) - S.candle, havdalah: sunsetLocal(addDays(friday, 1), S) + S.havdalah };
}
export function shabbatTimesForDate(date, S) { const w = dow(date); if (w === 5) return shabbatFor(date, S); if (w === 6) return shabbatFor(addDays(date, -1), S); return null; }

/** Fenêtre de Chabbat en cours à l'instant donné (date ISO + minutes depuis minuit), ou null. */
export function shabbatNow(today, now, S) {
  const w = dow(today);
  if (w === 5) { const sh = shabbatFor(today, S); if (now >= sh.candle) return sh; }
  if (w === 6) { const sh = shabbatFor(addDays(today, -1), S); if (now < sh.havdalah) return sh; }
  return null;
}
