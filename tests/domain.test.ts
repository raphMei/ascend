import { dow, range } from '@/core/dates';
import { hm } from '@/core/format';
import { RAW_TASKS } from '@/content/miage/tasks';
import { PHASES, JT } from '@/content/java/path';
import { dayType } from '@/content/calendar';
import { coachLine } from '@/domain/coach';
import { planDay } from '@/domain/planner';
import { jStats, mStats } from '@/domain/progress';
import { DEFAULT_SETTINGS } from '@/domain/settings';
import { shabbatFor, shabbatNow } from '@/domain/shabbat';
import { dayStats, streak } from '@/domain/stats';
import { adjustedTasks } from '@/domain/task-schedule';
import type { DayData } from '@/domain/types';

const S = DEFAULT_SETTINGS;
const tasks = adjustedTasks(S);
const progress = { done: {} };
const DAYS = range('2026-10-08', '2027-02-28');
const plan = (date: string, day?: DayData) => planDay({ date, settings: S, progress, day, today: '2026-11-03', tasks });

describe('calendrier', () => {
  it('types de jours', () => {
    expect(dayType('2026-11-02')).toBe('ecole'); expect(dayType('2027-02-22')).toBe('exam');
    expect(dayType('2026-12-25')).toBe('ferie'); expect(dayType('2026-10-10')).toBe('we'); expect(dayType('2026-10-13')).toBe('ent');
  });
});

describe('Chabbat', () => {
  it('allumage et sortie plausibles chaque vendredi', () => {
    DAYS.filter((d) => dow(d) === 5).forEach((f) => {
      const sh = shabbatFor(f, S);
      expect(sh.candle, `allumage ${f}: ${hm(sh.candle)}`).toBeGreaterThan(15 * 60);
      expect(sh.candle).toBeLessThan(21 * 60);
      expect(sh.havdalah, `sortie ${f}: ${hm(sh.havdalah)}`).toBeGreaterThan(17 * 60);
    });
  });
  it('fenêtre en cours : vendredi soir oui, samedi soir après la sortie non', () => {
    const sh = shabbatFor('2026-11-06', S);
    expect(shabbatNow('2026-11-06', sh.candle - 1, S)).toBeNull();
    expect(shabbatNow('2026-11-06', sh.candle, S)).not.toBeNull();
    expect(shabbatNow('2026-11-07', sh.havdalah - 1, S)).not.toBeNull();
    expect(shabbatNow('2026-11-07', sh.havdalah, S)).toBeNull();
    expect(shabbatNow('2026-11-04', 1200, S)).toBeNull();
  });
});

describe('planning', () => {
  it('rien de cochable pendant Chabbat, blocs bornés dans la journée', () => {
    for (const d of DAYS) {
      const p = plan(d);
      p.blocks.forEach((b) => {
        expect(b.end, `${d} ${b.id}`).toBeGreaterThan(b.start);
        expect(b.start).toBeGreaterThanOrEqual(0);
        if (p.sh && dow(d) === 6 && b.checkable) expect(b.start, `${d} ${b.id} samedi`).toBeGreaterThanOrEqual(p.sh.havdalah);
        if (p.sh && dow(d) === 5 && b.checkable) expect(b.end, `${d} ${b.id} vendredi`).toBeLessThanOrEqual(p.sh.candle);
      });
    }
  });
  it('journée type : routine du matin à 6 h 00, 75 minutes', () => {
    const morning = plan('2026-11-03').blocks.filter((b) => b.domain === 'matin');
    expect(morning.map((b) => b.id)).toEqual(['tephila', 'pompes', 'stretch', 'petitdej']);
    expect(morning[0].start).toBe(360); expect(morning[3].end).toBe(435);
  });
  it('jour sur site : 1 h de trajet de chaque côté, 7 h 16 de travail', () => {
    const b = plan('2026-10-13').blocks;           // mardi sur site par défaut
    expect(b.filter((x) => x.domain === 'trajet')).toHaveLength(2);
    expect(b.filter((x) => x.domain === 'pro').reduce((a, x) => a + x.end - x.start, 0)).toBe(436);
  });
  it('est pure : mêmes entrées, même plan', () => {
    expect(JSON.stringify(plan('2026-11-03'))).toBe(JSON.stringify(plan('2026-11-03')));
  });
  it('cocher un bloc est lu depuis les données du jour', () => {
    const st = dayStats(plan('2026-11-03', { done: { tephila: true } }));
    expect(st.dn).toBe(20);
    expect(st.pct).toBeGreaterThan(0);
  });
});

describe('tâches MIAGE', () => {
  it('aucune échéance un samedi après ajustement', () => {
    tasks.forEach((t) => expect(dow(t.due), `${t.id} ${t.due}`).not.toBe(6));
  });
  it('l\'ajustement ne modifie pas les données brutes et reste mémoïsé', () => {
    const before = JSON.stringify(RAW_TASKS);
    adjustedTasks({ ...S, candle: 30 });
    expect(JSON.stringify(RAW_TASKS)).toBe(before);
    expect(adjustedTasks(S)).toBe(adjustedTasks({ ...S }));
  });
  it('statistiques : retard et pourcentage', () => {
    const ms = mStats(tasks, { done: { [tasks[0].id]: true } }, '2027-03-01');
    expect(ms.g.n).toBe(tasks.length); expect(ms.g.d).toBe(1); expect(ms.g.late).toBe(tasks.length - 1);
  });
});

describe('parcours Java', () => {
  it('14 phases, identifiants stables, niveau initial', () => {
    expect(PHASES).toHaveLength(14);
    expect(JT[0].id).toBe('p1t1'); expect(JT[0].phase).toBe(PHASES[0]);
    expect(jStats({ done: {} }).level).toBe('Pas commencé');
    expect(jStats({ done: { p1t1: true } }).level).toBe('Démarrage');
  });
});

const snap = (pct: number): DayData => ({ stats: { pct, pl: 100, dn: pct, planned: {}, done: {} } });

describe('série et coach', () => {
  it('série : jours consécutifs ≥ 70 %, samedi ignoré', () => {
    const days = { '2026-11-05': snap(80), '2026-11-04': snap(80), '2026-11-03': snap(80) };
    expect(streak(days, '2026-11-05')).toBe(3);
    const wk = { '2026-11-06': snap(90), '2026-11-05': snap(90) };
    expect(streak(wk, '2026-11-07')).toBe(2);
  });
  it('le coach adapte son message', () => {
    const base = { pct: 40, streak: 0, late: 0, now: 700, routineDone: true, shabbat: false, planned: 300 };
    expect(coachLine({ ...base, shabbat: true })[0]).toBe('Chabbat shalom');
    expect(coachLine({ ...base, pct: 100 })[0]).toBe('Journée bouclée.');
    expect(coachLine({ ...base, late: 6 })[0]).toBe('6 tâches en retard.');
    expect(coachLine({ ...base, now: 500, routineDone: false })[0]).toBe('Ta routine d\'abord.');
  });
});
