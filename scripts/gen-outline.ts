/* Génère src/content/miage/plans/outline.generated.ts à partir des plans de matière (titres, durées, types : pas le texte ni les liens).
   Usage : npm run gen:outline — à relancer après avoir modifié un plan précis (un test échoue sinon). */
import { writeFileSync } from 'node:fs';
import { PLANS } from '../src/content/miage/plans';
import { outlineOf } from '../src/content/miage/plans/outline';

const body = JSON.stringify(outlineOf(PLANS), null, 2);
writeFileSync(
  new URL('../src/content/miage/plans/outline.generated.ts', import.meta.url),
  `/* FICHIER GÉNÉRÉ par \`npm run gen:outline\` : ne pas modifier à la main. */\nimport type { SubjectPlan } from './types';\n\nexport const OUTLINE: Record<string, SubjectPlan> = ${body};\n`
);
console.log('outline.generated.ts écrit.');
