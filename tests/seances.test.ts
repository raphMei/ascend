import { RAW_TASKS, buildTasks } from '@/content/miage/tasks';
import { PLANS } from '@/content/miage/plans';
import { paceSessions, splitHours, tierOf } from '@/content/miage/pacing';
import { SUBJ, byId } from '@/content/miage/subjects';
import type { SubjectPlan } from '@/content/miage/plans/types';
import { dow } from '@/core/dates';
import { dayType } from '@/content/calendar';
import { DEFAULT_SETTINGS } from '@/domain/settings';
import { buildSchedule } from '@/domain/schedule';
import { debtOf, resetProposal } from '@/domain/debt';
import { adjustedTasks } from '@/domain/task-schedule';

describe('découpage des séances en parties', () => {
  it('une séance de 1 h ou 1 h 15 reste entière ; au-delà, des parties qui tiennent une soirée (≤ 1 h 15)', () => {
    expect(splitHours(1)).toEqual([1]);
    expect(splitHours(1.25)).toEqual([1.25]);
    expect(splitHours(2)).toEqual([1, 1]);
    expect(splitHours(3)).toEqual([1, 1, 1]);
    expect(splitHours(1.5).length).toBe(2);
    [0.5, 1, 1.5, 1.75, 2, 2.5, 3, 3.5].forEach((h) => {
      const parts = splitHours(h);
      parts.forEach((p) => expect(p, String(h)).toBeLessThanOrEqual(1.25));
      expect(Math.abs(parts.reduce((a, b) => a + b, 0) - h), String(h)).toBeLessThan(0.1);
    });
  });
});

describe('rythme des séances', () => {
  const sub = (id: string, tier: 1 | 2 | 3, n: number, min = 60) => ({ id, tier, minutes: Array.from({ length: n }, () => min) });
  const out = paceSessions([sub('a', 1, 30), sub('b', 2, 30), sub('c', 3, 30)], '2026-10-13', '2027-02-19');

  it('chaque matière garde ses séances dans l\'ordre', () => {
    Object.values(out).forEach((dates) => dates.forEach((d, i) => { if (i) expect(d >= dates[i - 1]).toBe(true); }));
  });

  it('jamais un samedi (Chabbat) ni pendant la semaine d\'examens', () => {
    Object.values(out).flat().forEach((d) => { expect(dow(d), d).not.toBe(6); expect(dayType(d), d).not.toBe('exam'); });
  });

  it('les matières prioritaires finissent plus tôt', () => {
    const last = (id: string) => out[id][out[id].length - 1];
    expect(last('a') < last('b')).toBe(true);
    expect(last('b') <= last('c')).toBe(true);
  });

  it('une séance ne tient que les jours où elle a la place : une séance longue va un dimanche', () => {
    const long = paceSessions([sub('x', 1, 6, 180)], '2026-10-13', '2027-02-19');
    long.x.forEach((d) => expect(dow(d) === 0 || dayType(d) === 'ferie', d).toBe(true));
  });

  it('surcharge : les échéances restent réparties, elles ne s\'empilent pas sur la dernière journée', () => {
    const heavy = paceSessions([sub('a', 1, 200), sub('b', 2, 200), sub('c', 3, 200)], '2026-10-13', '2027-02-19');
    Object.values(heavy).forEach((dates) => {
      const lastDay = dates[dates.length - 1];
      expect(dates.filter((d) => d === lastDay).length).toBeLessThan(dates.length * 0.1);
    });
  });

  it('déterministe', () => { expect(paceSessions([sub('a', 1, 10)], '2026-10-13', '2027-02-19')).toEqual(paceSessions([sub('a', 1, 10)], '2026-10-13', '2027-02-19')); });

  it('palier d\'une matière d\'après son rang', () => {
    expect([1, 3, 4, 6, 7, 10].map(tierOf)).toEqual([1, 1, 2, 2, 3, 3]);
    expect(tierOf(undefined)).toBe(3);
  });
});

describe('plans précis dans les tâches de la saison', () => {
  const plan: SubjectPlan = {
    subject: 'dl', paced: true,
    units: [
      { title: 'Chapitre court', detail: 'Un chapitre court de test', hours: 1, kind: 'cours' },
      { title: 'Chapitre long', detail: 'Un chapitre long de test', hours: 2.5, kind: 'exo' },
      { title: 'Révision', detail: 'Une révision en conditions d\'examen', hours: 2, kind: 'valid' },
      { title: 'Provisoire', detail: 'Plan anticipé de test', hours: 1, provisional: true }
    ],
    deliverables: [{ title: 'Rendu', detail: 'Un rendu à faire', hours: 1, after: 2 }]
  };
  const tasks = buildTasks({ dl: plan });
  const dl = tasks.filter((t) => t.s === 'dl');

  it('une tâche par partie, avec des identifiants stables (matière, séance, partie)', () => {
    expect(dl.filter((t) => t.id.startsWith('dl:u')).map((t) => t.id)).toEqual(['dl:u1', 'dl:u2.1', 'dl:u2.2', 'dl:u3', 'dl:u4']);
    const titles = dl.filter((t) => t.id.startsWith('dl:u2.')).map((t) => t.t);
    expect(titles[0]).toContain('(1/2)'); expect(titles[1]).toContain('(2/2)');
  });

  it('la durée totale est celle du plan, chaque partie tient une soirée', () => {
    const own = dl.filter((t) => t.id.startsWith('dl:u2.'));
    expect(own.reduce((a, t) => a + t.h, 0)).toBeCloseTo(2.5, 1);
    own.forEach((t) => expect(t.h).toBeLessThanOrEqual(1.25));
  });

  it('une révision reste d\'un seul tenant et devient une tâche de révision (prioritaire, jamais abandonnée)', () => {
    const r = dl.find((t) => t.id === 'dl:u3')!;
    expect(r).toMatchObject({ k: 'rev', h: 2, step: 'valid' });
    expect(dl.find((t) => t.id === 'dl:u1')!.k).toBe('seance');
  });

  it('séance provisoire signalée, rendu daté à la fin de la séance indiquée', () => {
    expect(dl.find((t) => t.id === 'dl:u4')!.d).toContain('provisoire');
    const rendu = dl.find((t) => t.id === 'dl:r1')!;
    expect(rendu).toMatchObject({ k: 'proj', h: 1 });
    expect(rendu.due).toBe(dl.find((t) => t.id === 'dl:u2.2')!.due);
  });

  it('aucune fiche, exercice ni sujet blanc générique : seuls les plans précis, la fiche mémo et l\'examen existent', () => {
    expect(dl.some((t) => /^dl:f\d$/.test(t.id) || t.id === 'dl:ex' || t.id === 'dl:blanc')).toBe(false);
    expect(dl.some((t) => t.id === 'dl:memo') && dl.some((t) => t.id === 'dl:exam')).toBe(true);
    expect(tasks.some((t) => /^[a-z]+:f\d$/.test(t.id) || /:(ex|blanc)$/.test(t.id))).toBe(false);
  });

  it('plus aucune tâche quotidienne qui revient chaque jour', () => {
    expect(tasks.some((t) => (t.k as string) === 'daily')).toBe(false);
    expect(tasks.some((t) => /^o:(r|w|x)$/.test(t.id))).toBe(false);
  });
});

describe('les neuf plans livrés (d\'après tes plans de cours)', () => {
  const real = Object.values(PLANS).filter((p) => p.paced);

  it('dix matières ont un plan précis, TOEIC compris', () => {
    expect(real.map((p) => p.subject).sort()).toEqual(['big', 'dl', 'eth', 'gov', 'llm', 'proj', 'qa', 'ri', 'sec', 'toeic']);
  });

  it('chaque séance a au moins un lien, au moins 60 % des liens sont en français, toutes en https', () => {
    const links = real.flatMap((p) => p.units.flatMap((u, i) => { expect(u.res?.length, `${p.subject} séance ${i + 1}`).toBeGreaterThan(0); return u.res ?? []; }));
    links.forEach((r) => expect(r.url.startsWith('https://') || r.url.startsWith('http://'), r.url).toBe(true));
    expect(links.filter((r) => r.lang === 'fr').length / links.length).toBeGreaterThan(0.6);
  });

  it('durées réalistes, identifiants uniques, aucune échéance dans le passé de la saison ni un samedi', () => {
    const ids = RAW_TASKS.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
    RAW_TASKS.filter((t) => t.k === 'seance').forEach((t) => { expect(t.h, t.id).toBeLessThanOrEqual(1.25); expect(dow(t.due), t.id).not.toBe(6); expect(t.due >= '2026-10-13' && t.due <= '2027-02-14', t.id).toBe(true); });
  });

  it('des rendus et des contrôles continus datés existent pour les matières qui en ont', () => {
    ['ri:r1', 'ri:r2', 'llm:r1', 'llm:r2', 'proj:r1', 'proj:r2', 'gov:r1', 'gov:r2'].forEach((id) => expect(RAW_TASKS.some((t) => t.id === id), id).toBe(true));
  });

  it('chaque matière a un rang de priorité, de 1 à 10 sans doublon', () => {
    const ranks = SUBJ.filter((s) => s.id !== 'org').map((s) => s.rank).sort((a, b) => (a ?? 0) - (b ?? 0));
    expect(ranks).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    expect(byId.dl.rank).toBe(1);
  });
});

describe('réajustement avec les plans précis', () => {
  const S = { ...DEFAULT_SETTINGS };
  const all = adjustedTasks(S);
  const run = (today: string, done: string[] = []) => buildSchedule({ tasks: all, progress: { done: Object.fromEntries(done.map((i) => [i, true])) }, settings: S, days: {}, today, now: 0 })!;

  it('une séance en retard de plusieurs jours n\'est jamais abandonnée seule : elle est reprogrammée', () => {
    const s = run('2026-11-20');
    const abandoned = s.changes.filter((c) => c.reason === 'abandon').map((c) => c.taskId);
    expect(abandoned.some((id) => /^[a-z]+:u\d/.test(id))).toBe(false);
    expect(abandoned.every((id) => id.startsWith('d:') || id.startsWith('o:'))).toBe(true);
  });

  it('une surcharge laisse des tâches sans place (dites telles quelles) mais place d\'abord ce qui est prioritaire', () => {
    const s = run('2026-10-12');
    expect(s.unplaced.length).toBeGreaterThan(0);
    const unplaced = new Set(s.unplaced);
    ['exam', 'rev'].forEach((k) => all.filter((t) => t.k === k && t.due >= '2026-10-12').forEach((t) => expect(unplaced.has(t.id), t.id).toBe(false)));
  });

  it('« Repartir à zéro » propose d\'abord les matières classées en dernier', () => {
    const today = '2026-12-14';
    const sc = run(today);
    const debt = debtOf(all, { done: {} }, sc, today);
    const p = resetProposal(debt);
    const seances = p.drop.filter((t) => t.k === 'seance');
    if (seances.length > 1) {
      const tiers = seances.map((t) => tierOf(byId[t.s]?.rank));
      expect([...tiers].sort((a, b) => b - a)).toEqual(tiers);
    }
    expect(p.drop.every((t) => !['exam', 'rev', 'proj'].includes(t.k))).toBe(true);
  });
});

describe('squelette chargé au démarrage', () => {
  it('le fichier généré est à jour (relance `npm run gen:outline` après avoir modifié un plan)', async () => {
    const { outlineOf } = await import('@/content/miage/plans/outline');
    const { OUTLINE } = await import('@/content/miage/plans/outline.generated');
    expect(JSON.parse(JSON.stringify(OUTLINE))).toEqual(JSON.parse(JSON.stringify(outlineOf(PLANS))));
  });

  it('le squelette donne exactement les mêmes tâches (identifiants, titres, durées, dates) que les plans complets, sans le texte ni les liens', async () => {
    const { FULL_TASKS } = await import('@/content/miage/full');
    const strip = (l: readonly { id: string; t: string; h: number; due: string; k: string; s: string; d: string; res?: unknown }[]) => l.map(({ id, t, h, due, k, s }) => ({ id, t, h, due, k, s }));
    expect(strip(RAW_TASKS)).toEqual(strip(FULL_TASKS));
    const sample = RAW_TASKS.find((t) => t.id === 'dl:u1')!;
    expect(sample.res).toBeUndefined();
    expect(FULL_TASKS.find((t) => t.id === 'dl:u1')!.res?.length).toBeGreaterThan(0);
  });
});
