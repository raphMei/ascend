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
  const planned = buildTasks({ dl: { ...plan, paced: true, deliverables: [{ title: 'Rendu TP', detail: 'Rendre le TP noté.', hours: 2, after: 1, res: [{ src: 'PyTorch', title: 'CIFAR-10', url: 'https://pytorch.org/tutorials/', lang: 'en' }] }] } });
  const sessions = (list: typeof plain) => list.filter((t) => t.s === 'dl' && t.k === 'seance');

  it('un plan sans « paced » ne crée aucune séance : plus de tâche quotidienne', () => {
    expect(buildTasks({ dl: plan }).filter((t) => t.s === 'dl' && (t.k === 'seance' || t.k === ('daily' as string)))).toEqual([]);
    expect(plain.some((t) => (t.k as string) === 'daily')).toBe(false);
  });

  it('les séances du plan gardent l\'ordre du plan et des échéances croissantes', () => {
    const own = sessions(planned);
    expect(own.map((t) => t.t.split(' · ')[0].replace(/ \(\d\/\d\)$/, ''))).toEqual(['Perceptron', 'Rétropropagation', 'Rétropropagation']);   // la 2e séance (1 h 30 par défaut) est coupée en deux parties
    own.slice(1).forEach((t, i) => expect(own[i].due <= t.due).toBe(true));
  });

  it('une séance garde ses liens, son type et sa durée', () => {
    const t = planned.find((x) => x.t.startsWith('Perceptron'))!;
    expect(t).toMatchObject({ h: 0.75, step: 'cours' });
    expect(t.d).toContain('Chapitre 1');
    expect(t.res?.[0].url).toBe('https://fr.wikipedia.org/wiki/Perceptron');
    expect(planned.find((x) => x.t.startsWith('Rétropropagation'))!.h).toBe(0.75);   // durée par défaut
  });

  it('plusieurs séances reçoivent des identifiants distincts', () => {
    const many = buildTasks({ dl: { ...plan, paced: true, units: Array.from({ length: 40 }, (_, i) => ({ title: 'Séance ' + (i + 1), detail: 'x' })) } });
    const ids = many.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(sessions(many).filter((t) => t.t.startsWith('Séance ')).length).toBe(80);   // 40 séances de 1 h 30 : deux parties chacune
  });

  it('les autres matières ne sont pas touchées', () => {
    expect(JSON.stringify(planned.filter((t) => t.s === 'qa'))).toBe(JSON.stringify(plain.filter((t) => t.s === 'qa')));
  });

  it('« Envoyer le contenu » disparaît pour la matière qui a son plan', () => {
    expect(plain.some((t) => t.id === 'dl:s2')).toBe(true);
    expect(planned.some((t) => t.id === 'dl:s2')).toBe(false);
  });

  it('un rendu daté après une séance reçoit ses liens, chaque jalon devient une tâche, et l\'examen est complété', () => {
    expect(planned.find((t) => t.id === 'dl:r1')!.res?.[0].title).toBe('CIFAR-10');
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
