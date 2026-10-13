/** Parcours « Métier assurance » : socle de départ en deux phases (bases du métier, réglementation). À compléter avec ton programme réel :
    ajoute des phases dans `RAW` (identifiants stables i1t1, i1t2…). Les liens sont en français. */
import { buildPhases, cours, exo, valid, type RawPhase } from '../dsl';
import { cnil, fr, wiki } from '../sources';
import type { PathStep, Phase } from '../types';

const RAW: RawPhase[] = [
  { id: 'i1', title: 'Les bases de l\'assurance', core: true,
    goal: 'Comprendre comment fonctionne le métier dans lequel tu travailles : risque, prime, contrat, sinistre, réassurance. Le vocabulaire de base de toutes tes réunions.',
    steps: [
      cours('Qu\'est-ce que l\'assurance : risque et mutualisation', [wiki('Assurance', 'Assurance')], 40, { g: 'Le principe' }),
      cours('Le contrat d\'assurance : garanties, exclusions, franchise', [wiki('Contrat_d%27assurance', 'Contrat d\'assurance'), wiki('Franchise_(assurance)', 'Franchise (assurance)')], 45, { g: 'Le contrat' }),
      cours('La prime : comment le prix d\'un contrat se calcule', [wiki('Prime_d%27assurance', 'Prime d\'assurance'), wiki('Actuariat', 'Actuariat')], 45, { g: 'Le contrat' }),
      cours('Le sinistre et l\'indemnisation', [wiki('Sinistre', 'Sinistre')], 40, { g: 'La vie du contrat' }),
      cours('La réassurance : comment l\'assureur partage ses risques', [wiki('R%C3%A9assurance', 'Réassurance')], 35, { g: 'La vie du contrat' }),
      cours('Les grandes branches : auto, habitation, santé, vie', [wiki('Assurance_automobile', 'Assurance automobile'), wiki('Assurance_habitation', 'Assurance habitation'), wiki('Assurance_vie', 'Assurance vie')], 60, { g: 'Les produits' }),
      exo('Relire un vrai contrat (le tien) : retrouver garanties, exclusions, franchise et plafonds, et les écrire en cinq lignes', [], 45),
      valid('Explique à quelqu\'un qui ne connaît pas le métier comment une prime est fixée et ce qui se passe quand un sinistre survient.')
    ] },
  { id: 'i2', title: 'Réglementation et conformité', core: true,
    goal: 'Connaître les règles qui encadrent l\'assurance et les données personnelles, pour savoir pourquoi ton code et tes processus sont contraints.',
    steps: [
      cours('Solvabilité II : les fonds propres exigés d\'un assureur', [wiki('Solvabilit%C3%A9_II', 'Solvabilité II')], 45, { g: 'Prudentiel' }),
      cours('Le contrôle de l\'assurance en France : l\'ACPR', [wiki('Autorit%C3%A9_de_contr%C3%B4le_prudentiel_et_de_r%C3%A9solution', 'ACPR')], 30, { g: 'Prudentiel' }),
      cours('La distribution d\'assurance : la directive DDA et le devoir de conseil', [wiki('Directive_sur_la_distribution_d%27assurances', 'Directive sur la distribution d\'assurances')], 40, { g: 'Distribution' }),
      cours('Le RGPD : principes et droits des personnes', [cnil('rgpd-de-quoi-parle-t-on', 'RGPD : de quoi parle-t-on ?')], 45, { g: 'Données personnelles' }),
      cours('Les données de santé et d\'assurance : précautions', [fr('CNIL', 'Les droits pour maîtriser vos données personnelles', 'https://www.cnil.fr/fr/comprendre-vos-droits')], 30, { g: 'Données personnelles' }),
      exo('Repérer dans une application que tu utilises au travail trois traitements de données personnelles et leur finalité', [], 40),
      valid('Cite trois obligations réglementaires qui s\'imposent à ton équipe et ce qu\'elles changent concrètement dans ton travail.')
    ] }
];

export const ASSURANCE_LEVELS = ['Pas commencé', 'Démarrage', 'Bases du métier', 'Réglementation connue', 'Métier maîtrisé'];
export const ASSURANCE_PHASES: Phase[] = buildPhases(RAW);
export const ASSURANCE_TASKS: PathStep[] = ASSURANCE_PHASES.flatMap((p) => p.tasks);
export const ASSURANCE_HOURS = ASSURANCE_PHASES.reduce((s, p) => s + p.hours, 0);
export const assurancePhaseById: Record<string, Phase> = Object.fromEntries(ASSURANCE_PHASES.map((p) => [p.id, p]));
