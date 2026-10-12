/** Éthique du numérique. Plan type à adapter au programme réel du cours. */
import { cnil, fr, wiki } from '../../sources';
import { cours } from './dsl';
import type { SubjectPlan } from './types';

export const eth: SubjectPlan = {
  subject: 'eth',
  units: [
    cours('Les grandes questions éthiques du numérique', 'Données personnelles, surveillance, algorithmes, travail, environnement : choisis le sujet qui t\'interpelle le plus et dis pourquoi.', 0.75, [wiki('%C3%89thique_de_l%27intelligence_artificielle', 'Éthique de l\'intelligence artificielle')]),
    cours('Biais algorithmiques et équité', 'D\'où viennent les biais (données, conception, usage) et comment on les repère. Un cas réel et ses conséquences.', 0.75, [wiki('Biais_algorithmique', 'Biais algorithmique')]),
    cours('Protection des données : RGPD et rôle de la CNIL', 'Les principes du RGPD et ce que change un traitement automatisé de données personnelles.', 1, [cnil('comprendre-le-rgpd', 'Comprendre le RGPD (CNIL)'), cnil('intelligence-artificielle', 'Intelligence artificielle (CNIL)')]),
    cours('Cadres de référence : Déclaration de Montréal et règlement européen sur l\'IA', 'Compare un texte de principes et un texte de loi : portée, force contraignante, exemples.', 1, [fr('Déclaration de Montréal', 'Déclaration de Montréal pour un développement responsable de l\'IA', 'https://declarationmontreal-iaresponsable.com/'), fr('AI Act', 'Le règlement européen sur l\'IA', 'https://artificialintelligenceact.eu/fr/')]),
    cours('Numérique responsable : sobriété et impact environnemental', 'Où est l\'impact du numérique (fabrication des terminaux, réseaux, centres de données) et comment le réduire.', 0.75, [wiki('Num%C3%A9rique_responsable', 'Numérique responsable'), fr('Green IT', 'Green IT', 'https://www.greenit.fr/'), fr('Numérique gouv.', 'Référentiel général d\'écoconception', 'https://ecoresponsable.numerique.gouv.fr/')])
  ],
  projects: { 'eth:p8': [cnil('intelligence-artificielle', 'Intelligence artificielle (CNIL)'), fr('Déclaration de Montréal', 'Déclaration de Montréal', 'https://declarationmontreal-iaresponsable.com/')] }
};
