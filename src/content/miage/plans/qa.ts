/** Contrats, tests et assurance qualité. Plan type à adapter au programme réel du cours. */
import { en, fr, gha, jdx, wiki } from '../../sources';
import { cours, exo } from './dsl';
import type { SubjectPlan } from './types';

export const qa: SubjectPlan = {
  subject: 'qa',
  units: [
    cours('Qualité logicielle : définitions et enjeux', 'Distingue qualité du produit et qualité du processus. Cite cinq critères de qualité d\'un logiciel et un exemple concret pour chacun.', 0.75, [wiki('Assurance_qualit%C3%A9_logicielle', 'Assurance qualité logicielle'), wiki('Test_logiciel', 'Test logiciel')]),
    cours('Niveaux de tests : unitaire, intégration, système, acceptation', 'Dessine la pyramide des tests et place chaque niveau : qui teste quoi, avec quel outil, à quelle vitesse.', 0.75, [wiki('Test_unitaire', 'Test unitaire'), wiki('Test_d%27int%C3%A9gration', 'Test d\'intégration'), fr('CFTL', 'Comité français des tests logiciels', 'https://www.cftl.fr/')]),
    cours('Concevoir des cas de test : classes d\'équivalence et valeurs limites', 'Sur une fonction simple (calcul d\'une remise), écris la liste des cas de test avec les classes d\'équivalence et les valeurs aux bornes.', 1, [fr('CFTL', 'Comité français des tests logiciels', 'https://www.cftl.fr/')]),
    cours('JUnit 5 : écrire de bons tests unitaires', 'Cycle de vie, assertions, tests paramétrés. Un test = un comportement, un nom lisible.', 1, [jdx('chap-junit5', 'JUnit 5'), en('JUnit', 'Guide de l\'utilisateur JUnit 5', 'https://junit.org/junit5/docs/current/user-guide/')]),
    exo('Tester une classe avec JUnit 5', 'Prends une de tes classes, écris au moins 8 tests (cas nominal, bornes, erreurs). Vérifie qu\'un test échoue quand tu casses volontairement le code.', 1.5, [jdx('chap-junit5', 'JUnit 5')]),
    cours('Doublures de test : mocks et stubs avec Mockito', 'Isoler une classe de ses dépendances. Quand mocker, et quand préférer un vrai objet.', 1, [jdx('chap-objets-mock', 'Les objets de type mock'), en('Mockito', 'Documentation Mockito', 'https://site.mockito.org/')]),
    cours('Développement piloté par les tests (TDD)', 'Rouge, vert, refactor. Fais un kata (FizzBuzz puis chiffres romains) en respectant le cycle.', 1, [wiki('D%C3%A9veloppement_pilot%C3%A9_par_les_tests', 'Développement piloté par les tests')]),
    cours('Couverture de code et tests de mutation', 'Ce que la couverture mesure (et ne mesure pas). Compare 100 % de couverture et un test qui ne vérifie rien : c\'est le rôle des mutants.', 1, [wiki('Couverture_de_code', 'Couverture de code'), wiki('Test_de_mutation', 'Test de mutation')]),
    cours('Programmation par contrat : préconditions, postconditions, invariants', 'Pour chaque méthode d\'une classe de ton choix, écris la précondition, la postcondition et l\'invariant de classe en une phrase.', 1, [wiki('Programmation_par_contrat', 'Programmation par contrat'), en('OpenJML', 'Java Modeling Language (JML)', 'https://www.openjml.org/')]),
    exo('Ajouter des contrats à une classe', 'Traduis tes contrats en code : vérifications explicites (IllegalArgumentException, assert) ou JML. Écris les tests qui violent chaque contrat.', 1.5),
    cours('Intégration continue : lancer les tests à chaque push', 'Comprends pourquoi un test qui ne tourne pas tout seul finit oublié. Écris un workflow minimal.', 1, [wiki('Int%C3%A9gration_continue', 'Intégration continue'), gha('actions/get-started/quickstart', 'Démarrage rapide de GitHub Actions')])
  ],
  projects: { 'qa:p6': [jdx('chap-junit5', 'JUnit 5'), wiki('Couverture_de_code', 'Couverture de code'), gha('actions/get-started/quickstart', 'Démarrage rapide de GitHub Actions')] }
};
