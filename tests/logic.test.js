import test from 'node:test';
import assert from 'node:assert/strict';
import { range, dow, addDays } from '../src/core/dates.js';
import { merge } from '../src/core/merge.js';
import { hm, dur, hours } from '../src/core/format.js';
import { DEF } from '../src/domain/settings.js';
import { dayType } from '../src/content/calendar.js';
import { shabbatFor } from '../src/domain/shabbat.js';
import { planDay } from '../src/domain/planner.js';
import { dayStats, streak } from '../src/domain/stats.js';
import { adjustTasks } from '../src/domain/task-schedule.js';
import { T } from '../src/content/miage/tasks.js';

const S = Object.assign({}, DEF);
adjustTasks(S);
const prog = { done: {} };
const DAYS = range('2026-10-08', '2027-02-28');

test('format', () => {
  assert.equal(hm(75), '01:15'); assert.equal(dur(135), '2 h 15'); assert.equal(dur(40), '40 min'); assert.equal(hours(90), '1,5 h');
});

test('merge profond, sans toucher aux entrées', () => {
  const a = { done: { x: true }, w: 1 }, b = { done: { y: false } };
  assert.deepEqual(merge(a, b), { done: { x: true, y: false }, w: 1 });
  assert.deepEqual(a, { done: { x: true }, w: 1 });
});

test('calendrier : types de jours', () => {
  assert.equal(dayType('2026-11-02'), 'ecole'); assert.equal(dayType('2027-02-22'), 'exam');
  assert.equal(dayType('2026-12-25'), 'ferie'); assert.equal(dayType('2026-10-10'), 'we'); assert.equal(dayType('2026-10-13'), 'ent');
});

test('Chabbat : allumage le vendredi, sortie le samedi soir', () => {
  DAYS.filter((d) => dow(d) === 5).forEach((f) => {
    const sh = shabbatFor(f, S);
    assert.ok(sh.candle > 15 * 60 && sh.candle < 21 * 60, `allumage plausible le ${f}: ${hm(sh.candle)}`);
    assert.ok(sh.havdalah > 17 * 60 && sh.havdalah < 23 * 60, `sortie plausible le ${f}: ${hm(sh.havdalah)}`);
  });
});

test('planning : rien de cochable pendant Chabbat, blocs ordonnés et dans la journée', () => {
  for (const d of DAYS) {
    const pl = planDay(d, S, prog, {}, '2026-11-03');
    pl.blocks.forEach((b) => {
      assert.ok(b.start >= 0 && b.end <= 1500 && b.end > b.start, `${d} ${b.id} bornes ${b.start}-${b.end}`);
      if (pl.sh && dow(d) === 6) assert.ok(!b.checkable || b.start >= pl.sh.havdalah, `${d} ${b.id} cochable pendant Chabbat`);
      if (pl.sh && dow(d) === 5) assert.ok(!b.checkable || b.end <= pl.sh.candle, `${d} ${b.id} cochable après l'allumage`);
    });
  }
});

test('planning : aucune tâche MIAGE datée un samedi', () => {
  T.forEach((t) => assert.notEqual(dow(t.due), 6, `${t.id} le ${t.due}`));
});

test('stats : pourcentage borné, instantané cohérent', () => {
  const pl = planDay('2026-11-03', S, prog, { done: { tephila: true } }, '2026-11-03');
  const st = dayStats(pl);
  assert.ok(st.pct >= 0 && st.pct <= 100); assert.ok(st.dn <= st.pl);
});

test('série : jours consécutifs ≥ 70 %, samedi ignoré', () => {
  const days = {};
  ['2026-11-05', '2026-11-04', '2026-11-03'].forEach((d) => { days[d] = { stats: { pct: 80 } }; });
  assert.equal(streak(days, '2026-11-05', S), 3);
  assert.equal(streak({ '2026-11-06': { stats: { pct: 90 } }, '2026-11-05': { stats: { pct: 90 } } }, '2026-11-07', S), 2);
});
