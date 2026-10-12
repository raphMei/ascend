/** Gouvernance des systèmes d'information. Plan type à adapter au programme réel du cours. */
import { cnil, fr, wiki } from '../../sources';
import { cours } from './dsl';
import type { SubjectPlan } from './types';

export const gov: SubjectPlan = {
  subject: 'gov',
  units: [
    cours('Gouvernance des SI : définition et enjeux', 'Différence entre gérer, piloter et gouverner un SI. Qui décide quoi dans une organisation ?', 0.75, [wiki('Gouvernance_des_syst%C3%A8mes_d%27information', 'Gouvernance des systèmes d\'information'), fr('CIGREF', 'CIGREF : réseau de grandes entreprises du numérique', 'https://www.cigref.fr/')]),
    cours('Alignement stratégique et schéma directeur', 'Comment le SI sert la stratégie de l\'entreprise ; à quoi sert un schéma directeur.', 0.75, [wiki('Sch%C3%A9ma_directeur_informatique', 'Schéma directeur informatique')]),
    cours('Urbanisation du SI et architecture d\'entreprise (TOGAF)', 'Cartographier un SI : processus, applications, données, infrastructure. Le principe de la ville et du plan d\'urbanisme.', 1, [wiki('Urbanisation_des_syst%C3%A8mes_d%27information', 'Urbanisation des systèmes d\'information'), wiki('The_Open_Group_Architecture_Framework', 'TOGAF')]),
    cours('ITIL : la gestion des services informatiques', 'Incident, problème, changement, demande : distingue ces quatre notions avec un exemple chacune.', 1, [wiki('ITIL', 'ITIL')]),
    cours('COBIT : gouverner et contrôler', 'À quoi sert un référentiel de gouvernance, et en quoi COBIT complète ITIL.', 0.75, [wiki('COBIT', 'COBIT')]),
    cours('Sécurité : ISO 27001 et analyse de risques', 'Système de management de la sécurité de l\'information, et lien avec l\'analyse de risques.', 1, [wiki('ISO/CEI_27001', 'ISO/CEI 27001'), fr('ANSSI', 'La méthode EBIOS Risk Manager', 'https://cyber.gouv.fr/securisation/analyse-des-risques/methode-ebios-rm/')]),
    cours('Conformité : le RGPD', 'Les principes (finalité, minimisation, durée), les droits des personnes, le rôle du délégué à la protection des données.', 1.25, [cnil('comprendre-le-rgpd', 'Comprendre le RGPD (CNIL)'), wiki('R%C3%A8glement_g%C3%A9n%C3%A9ral_sur_la_protection_des_donn%C3%A9es', 'Règlement général sur la protection des données')]),
    cours('Gestion de projet et méthodes agiles', 'Cycle en V contre agile : quand l\'un ou l\'autre, et comment gouverner un projet agile.', 0.75, [wiki('M%C3%A9thode_agile', 'Méthode agile'), wiki('Gestion_de_projet', 'Gestion de projet')])
  ],
  projects: { 'gov:p7': [wiki('Urbanisation_des_syst%C3%A8mes_d%27information', 'Urbanisation des systèmes d\'information'), fr('CIGREF', 'CIGREF', 'https://www.cigref.fr/')] }
};
