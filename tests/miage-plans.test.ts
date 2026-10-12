import { RAW_TASKS, buildTasks } from '@/content/miage/tasks';
import { PLANS } from '@/content/miage/plans';
import type { SubjectPlan } from '@/content/miage/plans/types';
import { SUBJ } from '@/content/miage/subjects';

const plan: SubjectPlan = {
  subject: 'dl',
  units: [
    { title: 'Perceptron', detail: 'Chapitre 1', hours: 0.75, kind: 'cours', res: [{ src: 'Wikipédia', title: 'Perceptron', url: 'https://fr.wikipedia.org/wiki/Perceptron', lang: 'fr' }] },
    { title: 'Rétropropagation', detail: 'Chapitre 2' }
  ],
  projects: { 'dl:p5': [{ src: 'PyTorch', title: 'CIFAR-10', url: 'https://pytorch.org/tutorials/', lang: 'en' }] },
  milestones: [{ date: '2026-12-10', label: 'TP noté', hours: 2 }],
  exam: { format: 'QCM, 2 h', allowed: 'une feuille A4' }
};

describe('plans de matière MIAGE (mécanisme)', () => {
  const plain = buildTasks({});
  const planned = buildTasks({ dl: plan });
  const dailyDl = (list: typeof plain) => list.filter((t) => t.s === 'dl' && t.k === 'daily');

  it('les séances du plan sont réparties régulièrement sur les créneaux de la matière, dans l\'ordre', () => {
    const own = dailyDl(planned).filter((t) => t.t.includes(' · Deep Learning') && (t.t.startsWith('Perceptron') || t.t.startsWith('Rétropropagation')));
    expect(own.map((t) => t.t.split(' · ')[0])).toEqual(['Perceptron', 'Rétropropagation']);
    const slots = dailyDl(plain).length;
    expect(own[0].due).toBe(dailyDl(plain)[0].due);                        // la première séance prend le premier créneau
    expect(own[1].due).toBe(dailyDl(plain)[Math.floor(slots / 2)].due);    // la deuxième est à mi-parcours
  });

  it('une séance garde ses liens, son type et sa durée', () => {
    const t = planned.find((x) => x.t.startsWith('Perceptron'))!;
    expect(t).toMatchObject({ h: 0.75, step: 'cours', d: 'Chapitre 1' });
    expect(t.res?.[0].url).toBe('https://fr.wikipedia.org/wiki/Perceptron');
    expect(planned.find((x) => x.t.startsWith('Rétropropagation'))!.h).toBe(0.75);   // durée par défaut
  });

  it('plusieurs séances dans un même créneau reçoivent des identifiants distincts', () => {
    const many = buildTasks({ dl: { ...plan, units: Array.from({ length: 40 }, (_, i) => ({ title: 'Séance ' + (i + 1), detail: 'x' })) } });
    const ids = many.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(dailyDl(many).filter((t) => t.t.startsWith('Séance ')).length).toBe(40);
  });

  it('les autres matières ne sont pas touchées', () => {
    expect(JSON.stringify(planned.filter((t) => t.s === 'qa'))).toBe(JSON.stringify(plain.filter((t) => t.s === 'qa')));
  });

  it('« Envoyer le contenu » disparaît pour la matière qui a son plan', () => {
    expect(plain.some((t) => t.id === 'dl:s2')).toBe(true);
    expect(planned.some((t) => t.id === 'dl:s2')).toBe(false);
  });

  it('ajoute les liens aux projets datés, une tâche par jalon, et complète la tâche d\'examen', () => {
    expect(planned.find((t) => t.id === 'dl:p5')!.res?.[0].title).toBe('CIFAR-10');
    expect(planned.find((t) => t.id === 'dl:m0')).toMatchObject({ t: 'Préparer : TP noté', due: '2026-12-10', h: 2, k: 'rev' });
    expect(planned.find((t) => t.id === 'dl:exam')!.d).toContain('QCM, 2 h');
  });
});

describe('plans livrés pour les dix matières', () => {
  it('chaque matière du programme (hors organisation) a un plan', () => {
    SUBJ.filter((s) => s.id !== 'org').forEach((s) => expect(PLANS[s.id], s.id).toBeDefined());
  });

  it('les tâches de la saison ont des identifiants uniques et des durées raisonnables', () => {
    const ids = RAW_TASKS.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
    RAW_TASKS.forEach((t) => { expect(t.h, t.id).toBeGreaterThan(0); expect(t.h, t.id).toBeLessThanOrEqual(5); });
  });

  it('chaque chapitre à lire a au moins un lien, et au moins la moitié des liens de cours sont en français', () => {
    const units = Object.values(PLANS).flatMap((p) => p.units);
    units.filter((u) => u.kind === 'cours').forEach((u) => expect(u.res?.length, u.title).toBeGreaterThan(0));
    const links = units.flatMap((u) => u.res ?? []);
    expect(links.filter((r) => r.lang === 'fr').length / links.length).toBeGreaterThan(0.5);
  });

  it('les liens des projets datés correspondent à de vraies tâches', () => {
    const ids = new Set(RAW_TASKS.map((t) => t.id));
    Object.values(PLANS).forEach((p) => Object.keys(p.projects ?? {}).forEach((id) => expect(ids.has(id), id).toBe(true)));
  });

  it('la matière TOEIC reste en anglais (pratique de la langue) mais présente l\'examen en français', () => {
    const toeic = PLANS.toeic.units.flatMap((u) => u.res ?? []);
    expect(toeic.some((r) => r.lang === 'fr')).toBe(true);
    expect(toeic.some((r) => r.lang === 'en')).toBe(true);
  });

  it('chaque séance de chaque plan a un titre, un détail et une durée', () => {
    Object.entries(PLANS).forEach(([sid, p]) => p.units.forEach((u, i) => {
      expect(u.title.length, `${sid} ${i}`).toBeGreaterThan(5);
      expect(u.detail.length, `${sid} ${i}`).toBeGreaterThan(20);
      expect(u.hours ?? 0.75, `${sid} ${i}`).toBeGreaterThan(0);
    }));
  });
});
