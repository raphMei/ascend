/** Squelette d'un plan précis : titres, durées, types et rendus, sans le texte des séances ni les liens.
    C'est ce qui sert à dater les tâches au démarrage ; le texte et les liens (≈ 40 Ko compressés) arrivent juste après, dans un fichier chargé à
    la demande (voir `content/miage/full.ts`). Le fichier `outline.generated.ts` est produit par `npm run gen:outline` ; un test vérifie qu'il est à jour. */
import type { SubjectPlan } from './types';

export function outlineOf(plans: Record<string, SubjectPlan>): Record<string, SubjectPlan> {
  return Object.fromEntries(
    Object.entries(plans)
      .filter(([, p]) => p.paced)
      .map(([id, p]) => [id, {
        subject: p.subject, paced: true,
        units: p.units.map((u) => ({ title: u.title, detail: '', hours: u.hours, kind: u.kind, ...(u.provisional ? { provisional: true } : {}) })),
        ...(p.deliverables ? { deliverables: p.deliverables.map((d) => ({ title: d.title, detail: '', hours: d.hours, after: d.after })) } : {})
      } satisfies SubjectPlan])
  );
}
