/** Sécurité des systèmes informatiques. Plan type à adapter au programme réel du cours. */
import { en, fr, wiki } from '../../sources';
import { cours, exo } from './dsl';
import type { SubjectPlan } from './types';

export const sec: SubjectPlan = {
  subject: 'sec',
  units: [
    cours('Les fondamentaux : confidentialité, intégrité, disponibilité', 'Pour trois systèmes que tu connais (messagerie, banque en ligne, ton application), dis quelle propriété compte le plus et pourquoi.', 0.75, [wiki('S%C3%A9curit%C3%A9_des_syst%C3%A8mes_d%27information', 'Sécurité des systèmes d\'information'), fr('ANSSI', 'Guide d\'hygiène informatique', 'https://cyber.gouv.fr/publications/guide-dhygiene-informatique')]),
    cours('Cryptographie : chiffrement symétrique, asymétrique, hachage', 'Distingue les trois : à quoi sert chacun, quel exemple concret (HTTPS, mots de passe, signature).', 1.25, [wiki('Cryptographie', 'Cryptographie'), wiki('Chiffrement_sym%C3%A9trique', 'Chiffrement symétrique'), wiki('Cryptographie_asym%C3%A9trique', 'Cryptographie asymétrique'), wiki('Hachage', 'Hachage')]),
    cours('Authentification et TLS', 'Comment un navigateur vérifie l\'identité d\'un site (certificats) et pourquoi on ne stocke jamais un mot de passe en clair.', 1, [wiki('Authentification', 'Authentification'), wiki('Transport_Layer_Security', 'Transport Layer Security')]),
    cours('OWASP Top 10 : les failles web les plus courantes', 'Lis les 10 entrées en français. Pour chacune, note en une ligne le scénario d\'attaque et la parade.', 1.25, [fr('OWASP', 'OWASP Top 10 (français)', 'https://top10.owasp.org/fr/')]),
    cours('Injection SQL, XSS et CSRF', 'Reproduis chaque attaque sur une application d\'entraînement (jamais sur un site qui n\'est pas le tien), puis applique la protection.', 1.25, [wiki('Injection_SQL', 'Injection SQL'), wiki('Cross-site_scripting', 'Cross-site scripting'), wiki('Cross-site_request_forgery', 'Cross-site request forgery')]),
    exo('Challenges d\'application web sur Root-Me', 'Valide au moins trois challenges « Web – Serveur » : injection, authentification, vulnérabilité de session.', 2, [fr('Root-Me', 'Root-Me : challenges (français)', 'https://www.root-me.org/')]),
    cours('Cours en ligne SecNumacadémie', 'Suis les modules sur la sécurité du poste de travail, du réseau et de l\'authentification (MOOC officiel de l\'ANSSI, en français).', 2, [fr('ANSSI', 'SecNumacadémie', 'https://secnumacademie.gouv.fr/')]),
    cours('Tests d\'intrusion : méthode et cadre légal', 'Les étapes d\'un audit, et pourquoi on n\'attaque jamais un système sans autorisation écrite.', 0.75, [wiki('Test_d%27intrusion', 'Test d\'intrusion'), en('PortSwigger', 'Web Security Academy', 'https://portswigger.net/web-security')]),
    cours('Analyse de risques : la méthode EBIOS Risk Manager', 'Comprends les cinq ateliers : socle de sécurité, sources de risque, scénarios stratégiques et opérationnels, traitement.', 1, [fr('ANSSI', 'La méthode EBIOS Risk Manager', 'https://cyber.gouv.fr/securisation/analyse-des-risques/methode-ebios-rm/')])
  ],
  projects: { 'sec:p4': [fr('OWASP', 'OWASP Top 10 (français)', 'https://top10.owasp.org/fr/'), en('PortSwigger', 'Web Security Academy', 'https://portswigger.net/web-security')] }
};
