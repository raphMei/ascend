import { RAW_TASKS, buildTasks } from '@/content/miage/tasks';
import type { SubjectPlan } from '@/content/miage/plans/types';

const plan: SubjectPlan = {
  subject: 'dl',
  units: [{ title: 'Perceptron', detail: 'Chapitre 1', hours: 0.75 }, { title: 'Rétropropagation', detail: 'Chapitre 2' }],
  milestones: [{ date: '2026-12-10', label: 'TP noté', hours: 2 }],
  exam: { format: 'QCM, 2 h', allowed: 'une feuille A4' }
};

describe('plans de matière MIAGE', () => {
  const plain = buildTasks({});
  const planned = buildTasks({ dl: plan });
  const dailyDl = (list: typeof plain) => list.filter((t) => t.s === 'dl' && t.k === 'daily');

  it('sans plan : identique aux tâches génériques livrées', () => {
    expect(JSON.stringify(plain)).toBe(JSON.stringify(RAW_TASKS));
  });

  it('les séances du plan remplacent les premières tâches du jour de la matière, dans l\'ordre', () => {
    const [a, b, c] = dailyDl(planned);
    expect(a.t).toBe('Perceptron · Deep Learning'); expect(a.d).toBe('Chapitre 1'); expect(a.h).toBe(0.75);
    expect(b.t).toBe('Rétropropagation · Deep Learning'); expect(b.h).toBeCloseTo(0.75);   // durée par défaut : 45 min (4,5 crédits)
    expect(c.t).not.toContain('Rétropropagation');                                           // plan épuisé : retour aux tâches génériques
  });

  it('même nombre de tâches du jour, mêmes dates : seul le contenu change', () => {
    expect(dailyDl(planned).map((t) => t.id)).toEqual(dailyDl(plain).map((t) => t.id));
  });

  it('les autres matières ne sont pas touchées', () => {
    expect(JSON.stringify(planned.filter((t) => t.s === 'qa'))).toBe(JSON.stringify(plain.filter((t) => t.s === 'qa')));
  });

  it('« Envoyer le contenu » disparaît pour la matière qui a son plan', () => {
    expect(plain.some((t) => t.id === 'dl:s2')).toBe(true);
    expect(planned.some((t) => t.id === 'dl:s2')).toBe(false);
  });

  it('ajoute une tâche par jalon et complète la tâche d\'examen', () => {
    const m = planned.find((t) => t.id === 'dl:m0')!;
    expect(m).toMatchObject({ t: 'Préparer : TP noté', due: '2026-12-10', h: 2, k: 'rev' });
    expect(planned.find((t) => t.id === 'dl:exam')!.d).toContain('QCM, 2 h');
  });
});
