/* Tâches MIAGE : générées jour par jour à partir du calendrier (génériques en attendant le contenu précis de chaque matière). */
import { range, dow } from "../../core/dates.js";
import { dayType } from "../calendar.js";
import { SUBJ, byId } from "./subjects.js";

var T = [];
function push(id, s, k, t, d, due, h) { T.push({ id: id, s: s, k: k, t: t, d: d, due: due, h: h }); }
var ALL = range("2026-10-08", "2027-02-26");
var ent = ALL.filter(function (d) { return dayType(d) === "ent"; });
function entIn(a, b) { return ent.filter(function (d) { return d >= a && d <= b; }); }
function spread(list, i, n) { return list[Math.min(list.length - 1, Math.floor(i * list.length / n))]; }
var STD = ["dl", "qa", "sec", "llm", "big", "ri", "gov", "eth", "toeic"];
var SETUP_DAYS = range("2026-10-12", "2026-10-23").filter(function (d) { var w = dow(d); return w !== 0 && w !== 6; });

SUBJ.forEach(function (s, i) {
  if (s.id === "org") return;
  push(s.id + ":s1", s.id, "setup", "Récupérer les supports et créer le dossier",
    "Télécharge tous les supports de « " + s.name + " » (cours, TD, sujets d'annales s'il y en a). Crée un dossier à ce nom avec quatre sous-dossiers : cours, td, fiches, projet. Cinq minutes, mais tout le reste s'appuie dessus.", "2026-10-11", 0.25);
  push(s.id + ":s2", s.id, "setup", "Envoyer le contenu de la matière à Claude",
    "Envoie-moi le programme de « " + s.name + " » : plan du cours, liste des chapitres, ce qui a déjà été vu, et les consignes des travaux demandés. Je remplace alors les tâches génériques de cette matière par des tâches précises sur ton vrai contenu.", SETUP_DAYS[i], 0.25);
  push(s.id + ":s3", s.id, "setup", "Noter les modalités du contrôle continu et de l'examen",
    "Écris au même endroit : la date et le format du contrôle continu, son coefficient, la durée et le format de l'examen final, et les documents autorisés. Si une information manque, demande-la au responsable de la matière. Reporte ensuite chaque date dans ton agenda.", "2026-11-01", 0.25);
});

var ROT = ["dl", "qa", "sec", "llm", "big", "ri", "gov", "toeic", "eth", "proj"];
var MICRO = [
  ["Relire et annoter", function (n) { return "Reprends tes notes de la dernière séance de « " + n + " ». Surligne les 5 notions les plus importantes et écris en marge une phrase avec tes mots pour chacune. Si une notion reste floue, ajoute-la à une liste « à demander » pour la prochaine séance."; }],
  ["Exercice sans filet", function (n) { return "Prends un exercice ou un TD de « " + n + " » déjà corrigé, cache la correction et refais-le depuis le début. Compare ensuite avec la correction : note chaque endroit où tu as hésité ou fait une erreur."; }],
  ["Cinq questions-réponses", function (n) { return "Écris 5 questions sur ce que tu as vu en « " + n + " », avec la réponse au dos (papier ou application de cartes mémoire). Garde-les : elles serviront pour les révisions de janvier."; }],
  ["Explique-le à un débutant", function (n) { return "Choisis une notion de « " + n + " » et explique-la à voix haute en 3 minutes, comme à quelqu'un qui n'y connaît rien, avec un exemple concret. Là où tu bloques, ouvre le cours et complète."; }]
];
var MICRO_T = [
  ["Écoute active", "Écoute 15 minutes d'anglais (podcast, vidéo sans sous-titres). Note 5 mots ou expressions que tu ne connaissais pas, avec la phrase où ils apparaissent."],
  ["Dix mots du jour", "Apprends 10 mots de vocabulaire professionnel (réunions, e-mails, voyages). Écris une phrase par mot, puis cache les définitions et teste-toi."],
  ["Une partie de grammaire", "Fais une série d'exercices sur un point de grammaire du TOEIC (temps, prépositions, mots de liaison). Relis chaque erreur et écris la règle en une ligne."],
  ["Lecture chronométrée", "Lis un texte court en 5 minutes puis réponds à 5 questions. Relis ce que tu as raté pour comprendre pourquoi la bonne réponse était la bonne."]
];
var rc = 0, occ = {};
ent.forEach(function (d) {
  var sid = ROT[rc % ROT.length]; rc++;
  var s = byId[sid]; occ[sid] = occ[sid] || 0; var k = occ[sid] % 4; occ[sid]++;
  var m = s.cr >= 4.5 ? 45 : (s.cr >= 3 ? 30 : 20);
  if (sid === "toeic") push("d:" + d, sid, "daily", MICRO_T[k][0] + " · " + s.short, MICRO_T[k][1], d, m / 60);
  else push("d:" + d, sid, "daily", MICRO[k][0] + " · " + s.short, MICRO[k][1](s.name), d, m / 60);
});

ALL.forEach(function (d) {
  var ty = dayType(d);
  if (ty === "ecole" && d !== "2026-12-03" && d !== "2026-12-04")
    push("o:r:" + d, "org", "org", "Relecture du soir", "Le soir même, relis tes notes de la journée et écris trois lignes : ce que tu as compris, ce qui reste flou, une question à poser demain. Quinze minutes au plus.", d, 0.25);
  if (ty === "exam")
    push("o:x:" + d, "org", "org", "Relecture ciblée avant l'examen suivant", "Relis la fiche mémo de ton prochain examen, puis refais 2 exercices types sans la correction. Arrête-toi à une heure fixe et dors : une nuit complète rapporte plus qu'une heure de relecture.", d, 0.75);
});
push("o:nuit", "org", "org", "Nuit de l'info : participer et noter ce que tu as appris", "Participe à l'événement des 3 et 4 décembre. À la fin, écris en trois lignes ce que tu as appris et une idée de projet que tu veux garder.", "2026-12-04", 0.5);
push("o:tetp", "org", "org", "Préparer la réunion TE/TP du 12 octobre", "Liste tes missions du moment, les compétences vues en cours que tu peux y mettre en pratique, et deux questions à poser. Écris tout sur une demi-page que tu peux lire pendant la réunion.", "2026-10-11", 0.5);
push("o:plan", "org", "org", "Planifier les quatre semaines de révisions", "Prends ton calendrier : les examens commencent le 22 février. Pour chaque matière, place dans l'agenda une session de sujet blanc et une session de fiche mémo. Garde un créneau libre par semaine pour rattraper.", "2027-01-24", 0.5);
push("o:exdates", "org", "org", "Noter les dates et heures des examens", "Dès que les convocations sont disponibles, note la date, l'heure et la salle de chaque examen dans ton agenda, avec un rappel la veille.", "2027-02-07", 0.25);
push("o:relgen", "org", "org", "Relecture générale des fiches mémo", "Relis dans l'ordre des examens les fiches mémo d'une page de chaque matière, sans ouvrir les cours. Marque en rouge ce qui ne te revient pas et rouvre le cours uniquement pour ces points.", "2027-02-21", 2);
range("2026-10-11", "2027-02-21").filter(function (d) { return dow(d) === 0; }).forEach(function (d) {
  push("o:w:" + d, "org", "org", "Revue de la semaine", "Regarde les tâches en retard sur l'accueil : refais-les, ou décide lesquelles tu abandonnes. Puis lis la semaine qui vient (jours de cours, entreprise, examens) et repère la tâche la plus lourde pour la placer au bon moment. Vingt minutes.", d, 0.33);
});

var BLOCKS = [["novembre", entIn("2026-11-23", "2026-11-27")], ["décembre", entIn("2026-12-21", "2026-12-31")], ["janvier", entIn("2027-01-18", "2027-01-22")]];
var FICHE = "Après le bloc de cours, rédige une fiche de 1 à 2 pages. D'abord, sans regarder tes notes, liste de mémoire tout ce que tu as retenu. Ensuite, complète avec les notes : les notions clés avec une phrase de définition chacune, un schéma ou un exemple pour les trois plus importantes, les formules ou commandes à connaître, et 5 questions que l'enseignant pourrait poser.";
STD.forEach(function (sid, i) {
  BLOCKS.forEach(function (b, bi) { push(sid + ":f" + bi, sid, "fiche", "Fiche de synthèse · bloc de " + b[0], FICHE, spread(b[1], i, STD.length), 1); });
  push(sid + ":ex", sid, "rev", "Refaire 3 exercices types sans correction", "Choisis 3 exercices de « " + byId[sid].name + " » (TD, annales ou exercices de ta fiche). Fais-les chronométrés, correction fermée. Pour chaque erreur, écris la règle ou la méthode qui t'aurait évité de la faire.", spread(entIn("2027-01-26", "2027-02-05"), i, STD.length), 1.5);
  push(sid + ":memo", sid, "rev", "Fiche mémo d'une page", "Condense tes fiches de bloc en une seule page recto : les définitions, formules, schémas et pièges à connaître par cœur. Elle doit tenir à la lecture en 5 minutes la veille de l'examen. Le bloc du 8 au 12 février y est inclus.", spread(entIn("2027-02-15", "2027-02-19"), i, STD.length), 1);
  push(sid + ":exam", sid, "exam", "Passer l'examen final", "Renseigne la date exacte de l'examen de « " + byId[sid].name + " » dans ton agenda. La veille : relis ta fiche mémo, prépare ton matériel, couche-toi tôt. Le jour même : lis tout le sujet avant de commencer et commence par les questions que tu maîtrises.", "2027-02-26", 2);
});
var BLANC = { "2027-01-31": ["dl", "qa"], "2027-02-07": ["sec", "llm", "big"], "2027-02-14": ["ri", "gov", "eth"] };
Object.keys(BLANC).forEach(function (d) {
  BLANC[d].forEach(function (sid) {
    push(sid + ":blanc", sid, "rev", "Sujet blanc chronométré", "Prends un sujet d'annales de « " + byId[sid].name + " » (à défaut, demande-moi d'en écrire un à partir de ton cours). Fais-le dans la durée réelle de l'examen, sans notes. Corrige ensuite avec une autre couleur et liste les 3 points à retravailler.", d, 1.5);
  });
});
var HINT = "Idée de départ, à ajuster quand tu m'auras envoyé le contenu du cours. ";
var PROJ = [
  { s: "llm", due: "2026-10-18", h: 4, t: "Un RAG minimal", d: HINT + "1) Rassemble 20 à 50 documents texte libres de droits. 2) Découpe-les en passages d'environ 300 mots. 3) Calcule un embedding pour chaque passage et stocke-les dans une base vectorielle locale (Chroma ou FAISS). 4) Pour une question, retrouve les 3 passages les plus proches et donne-les à un modèle de langage pour qu'il réponde en citant sa source. Livrable : un script qui répond à 5 questions avec les sources." },
  { s: "big", due: "2026-10-25", h: 4, t: "Un pipeline Spark", d: HINT + "1) Trouve un jeu de données public de plusieurs millions de lignes. 2) Fais la même agrégation (par exemple une moyenne par jour) avec pandas, puis avec PySpark. 3) Mesure le temps et la mémoire de chaque version. 4) Note à partir de quelle taille Spark devient plus intéressant. Livrable : un notebook avec les deux versions et un tableau de mesures." },
  { s: "ri", due: "2026-11-01", h: 4, t: "Un moteur de recherche", d: HINT + "1) Prends un corpus de 500 à 5 000 documents. 2) Construis un index inversé. 3) Implémente le classement TF-IDF puis BM25. 4) Écris 10 requêtes avec les documents attendus et calcule la précision et le rappel de chaque méthode. Livrable : un script de recherche et un tableau comparatif." },
  { s: "proj", due: "2026-11-15", h: 3, t: "Cadrer le sujet du projet", d: "Rédige une demi-page : la question à laquelle ton analyse répond, le jeu de données choisi avec sa source, les trois analyses prévues et la forme du livrable. Si le sujet t'est imposé, note les consignes et les dates de rendu à la place, puis envoie-les-moi pour adapter les étapes suivantes." },
  { s: "sec", due: "2026-11-22", h: 4, t: "Auditer ta propre application", d: HINT + "1) Choisis une petite application qui t'appartient, ou une application volontairement vulnérable faite pour s'entraîner. Ne teste jamais un site qui n'est pas le tien. 2) Parcours la liste OWASP Top 10 entrée par entrée. 3) Pour chacune, note : concernée ou non, comment tu l'as vérifié, correctif. 4) Corrige au moins 3 failles. Livrable : un tableau d'audit d'une page." },
  { s: "dl", due: "2026-11-29", h: 5, t: "Classer des images", d: HINT + "1) Prends un jeu de données public d'images avec une dizaine de classes. 2) Entraîne un petit réseau convolutif avec PyTorch ou Keras. 3) Trace les courbes de perte et de précision, entraînement contre validation. 4) Repère le surapprentissage et essaie un correctif (régularisation ou augmentation de données). Livrable : un notebook avec les courbes et une conclusion d'une page." },
  { s: "qa", due: "2026-12-06", h: 4, t: "Mettre un projet sous tests", d: HINT + "1) Prends un de tes projets existants. 2) Écris des tests unitaires sur sa logique métier. 3) Ajoute au moins 3 contrats explicites (préconditions, postconditions ou invariants). 4) Mesure la couverture et lance les tests automatiquement à chaque push avec GitHub Actions. Livrable : un dépôt avec tests, rapport de couverture et pipeline vert." },
  { s: "gov", due: "2026-12-13", h: 3, t: "Cartographier un système d'information", d: HINT + "1) Choisis une organisation dont les informations sont publiques (pas ton entreprise : rien de confidentiel). 2) Dessine ses principaux processus et applications. 3) Identifie 3 risques. 4) Propose pour chacun un contrôle ou une règle de gouvernance. Livrable : un schéma et une note de 2 pages." },
  { s: "eth", due: "2026-12-20", h: 2, t: "Note argumentée sur un cas réel", d: HINT + "1) Choisis un cas réel (biais d'un algorithme, reconnaissance faciale, usage de données personnelles). 2) Décris les faits et les parties prenantes. 3) Écris les arguments pour et contre. 4) Prends position. Livrable : une note d'une page avec ses sources." },
  { s: "toeic", due: "2026-12-20", h: 2, k: "rev", t: "Test blanc TOEIC n°1", d: "Fais un test complet en conditions réelles : 2 heures, sans pause ni dictionnaire, écoute puis lecture. Note ton score par partie et les types de questions où tu perds le plus de points. Livrable : tes scores et une liste de 5 points faibles à travailler dans les tâches du jour." },
  { s: "proj", due: "2026-12-27", h: 3, t: "Avancer l'analyse du projet", d: "Reprends la demi-page de cadrage. Réalise les deux premières analyses prévues, avec leurs graphiques. Note ce qui t'a surpris et ce qui doit changer dans le plan. Livrable : un notebook ou un document avec les résultats intermédiaires." },
  { s: "llm", due: "2027-01-03", h: 3, t: "Mesurer et améliorer le RAG", d: HINT + "1) Écris 15 questions avec la réponse attendue. 2) Mesure combien de fois le bon passage est retrouvé. 3) Teste deux changements (taille des passages, nombre de passages fournis). Livrable : un tableau avant/après et ta conclusion." },
  { s: "proj", due: "2027-01-17", h: 3, t: "Finaliser et rendre le projet", d: "Termine les analyses, relis le livrable comme si tu ne connaissais pas le sujet, vérifie chaque chiffre et chaque graphique, puis rends-le avant la date limite. Garde une copie du rendu et note la date de rendu dans ton agenda." },
  { s: "toeic", due: "2027-01-24", h: 2, k: "rev", t: "Test blanc TOEIC n°2", d: "Même protocole que le premier : 2 heures, conditions réelles. Compare avec ton premier score et vérifie que tes 5 points faibles ont progressé." },
  { s: "toeic", due: "2027-02-14", h: 2, k: "rev", t: "Test blanc TOEIC n°3", d: "Dernier test complet avant l'examen. Sers-toi du résultat pour décider où passer ton temps de révision de la dernière semaine." }
];
PROJ.forEach(function (p, i) { push(p.s + ":p" + i, p.s, p.k || "proj", p.t, p.d, p.due, p.h); });
T.sort(function (a, b) { return a.due < b.due ? -1 : a.due > b.due ? 1 : (a.id < b.id ? -1 : 1); });


export { T };
