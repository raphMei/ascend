/* Dates : calcul et formatage en français. Toutes les dates sont des chaînes ISO « AAAA-MM-JJ ». */
  var pad = function (n) { return (n < 10 ? "0" : "") + n; };
  function D(s) { var p = s.split("-"); return new Date(Date.UTC(+p[0], +p[1] - 1, +p[2], 12)); }
  function iso(d) { return d.getUTCFullYear() + "-" + pad(d.getUTCMonth() + 1) + "-" + pad(d.getUTCDate()); }
  function addDays(s, n) { var d = D(s); d.setUTCDate(d.getUTCDate() + n); return iso(d); }
  function dow(s) { return D(s).getUTCDay(); }
  function range(a, b) { var r = [], c = a; while (c <= b) { r.push(c); c = addDays(c, 1); } return r; }
  function diffDays(a, b) { return Math.round((D(b) - D(a)) / 86400000); }
  var MOIS = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."];
  var MOISL = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
  var JOURS = ["dim.", "lun.", "mar.", "mer.", "jeu.", "ven.", "sam."];
  var JOURSL = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];
  function fmt(s) { var d = D(s); return JOURS[d.getUTCDay()] + " " + d.getUTCDate() + " " + MOIS[d.getUTCMonth()]; }
  function fmtLong(s) { var d = D(s); return JOURSL[d.getUTCDay()] + " " + d.getUTCDate() + " " + MOISL[d.getUTCMonth()]; }
  function fmtShort(s) { var d = D(s); return d.getUTCDate() + " " + MOIS[d.getUTCMonth()]; }

/** Les n derniers jours (end inclus), du plus ancien au plus récent. */
function lastDays(n, end) { return range(addDays(end, -(n - 1)), end); }

/* Date du jour (heure locale de l'appareil) et minutes écoulées depuis minuit. */
function todayISO() { var d = new Date(); return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
function nowMin() { var d = new Date(); return d.getHours() * 60 + d.getMinutes(); }

export { pad, D, iso, addDays, dow, range, diffDays, MOIS, MOISL, JOURS, JOURSL, fmt, fmtLong, fmtShort, lastDays, todayISO, nowMin };
