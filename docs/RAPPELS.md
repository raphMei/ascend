# Rappels (notifications) : mise en route

Ascend envoie **un seul type de rappel** sur ton iPhone et ton Mac : ta prochaine séance d'apprentissage (5 minutes avant, si elle n'est pas faite).
La routine du matin, le sport, les repas et le sommeil sont du temps réservé : aucun rappel (tu utilises Grit pour ça). **Jamais pendant Chabbat.** Aucun serveur payant : un script tourne toutes les 20 minutes
dans GitHub Actions (gratuit pour un dépôt public).

## Comment ça marche

```
GitHub Actions (toutes les 20 min)
   └─ scripts/send-reminders.ts
        ├─ lit Firestore (compte de service) : réglages, jour, progression, abonnements
        ├─ calcule les rappels dus  (src/domain/reminders.ts : même planning que l'application)
        ├─ envoie en Web Push        (clé VAPID)
        └─ note « envoyé » dans users/{uid}/push/main → jamais de doublon

Ton appareil : service worker (public/sw.js) → affiche la notification → un toucher ouvre « Aujourd'hui ».
```

Un rappel est envoyé dans les 90 minutes qui suivent son heure (le planificateur de GitHub a parfois du retard).
Il n'est envoyé que si la séance n'est pas déjà faite, et seulement pour la première séance du jour qui reste à faire.

## Mise en route (une seule fois, ~15 minutes)

### 1. Générer les clés VAPID
Dans le dossier du projet :
```
npx web-push generate-vapid-keys
```
Tu obtiens une clé **publique** et une clé **privée**. La privée ne doit jamais être commitée ni partagée.

### 2. Créer le compte de service Firebase
Console Firebase › Paramètres du projet (roue dentée) › **Comptes de service** › *Générer une nouvelle clé privée*. Un fichier JSON est téléchargé.
Ce fichier donne un accès complet à ta base : ne le commite pas, ne l'envoie à personne.

### 3. Renseigner GitHub (Settings › Secrets and variables › Actions)
| Type | Nom | Valeur |
|---|---|---|
| **Secret** | `FIREBASE_SERVICE_ACCOUNT` | tout le contenu du fichier JSON |
| **Secret** | `VAPID_PRIVATE_KEY` | la clé privée |
| **Variable** | `VAPID_PUBLIC_KEY` | la clé publique |
| **Variable** | `VAPID_SUBJECT` | `mailto:ton-adresse@exemple.fr` |

### 4. Republier le site
Actions › *Déploiement GitHub Pages* › Run workflow (la clé publique est intégrée au site à la construction).

### 5. Activer sur chaque appareil
- **iPhone** (iOS 16.4 minimum) : Safari › Partager › *Sur l'écran d'accueil*, puis ouvre Ascend **depuis l'icône** (pas depuis Safari).
- Ascend › Réglages › **Rappels** › *Activer les rappels* › accepte l'autorisation.
- Le bouton *Notification de test* vérifie que l'appareil sait afficher les rappels (sans passer par le serveur).
- Pour tester le serveur : GitHub › Actions › *Rappels* › Run workflow, à un moment où un rappel est dû.

## Dépannage

| Symptôme | Cause probable |
|---|---|
| « Pas encore configurés » dans Réglages | `VAPID_PUBLIC_KEY` absente au moment de la construction : refaire l'étape 4 |
| « Sur iPhone, ça ne marche que pour une application installée » | ouvrir Ascend depuis l'icône de l'écran d'accueil |
| Aucune notification | l'abonnement a expiré (il est retiré automatiquement) : réactiver dans Réglages. Vérifier aussi Réglages iOS › Notifications › Ascend |
| Le journal de l'action dit « non configurés » | un secret manque (étape 3) |

## Limites connues
- Précision : ±20 minutes (planificateur GitHub), pas à la minute.
- Les rappels ne concernent pas encore les tâches MIAGE en retard ni les échéances.
- Un seul compte est prévu (le script sert tous les utilisateurs abonnés, mais l'application n'a pas de gestion multi-comptes).
