# Ascend

Tableau de bord personnel : journée planifiée heure par heure, suivi de plusieurs domaines de vie, graphiques, rappels,
synchronisé entre iPhone et Mac. React + TypeScript + Vite, Firebase (Auth Google + Firestore), GitHub Pages.

```
npm install
npm run dev        # http://localhost:5173/ascend/?demo   (mode démo : données locales, sans connexion)
npm run check      # types + lint + tests
npm run test:all   # + bout en bout (Chromium) + règles Firestore sur émulateur (Java requis)
npm run unused     # code mort ; npm run check:links : liens des cours ; npm run size : budget de taille
```

| Document | Sujet |
|---|---|
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | couches, flux de données, planning, ajout d'un domaine, tests, déploiement |
| [docs/RAPPELS.md](docs/RAPPELS.md) | mise en route des notifications (clés, compte de service, iPhone) |
| [docs/CONTENU-MIAGE.md](docs/CONTENU-MIAGE.md) | remplacer les tâches génériques par le vrai contenu des matières |
| [docs/COMPTE-RENDU.md](docs/COMPTE-RENDU.md) | tout ce qui a été fait, et ce qu'il reste à faire |
| [docs/AMELIORATIONS.md](docs/AMELIORATIONS.md) | la liste d'améliorations (performance, usage, progression) |
| [docs/DESIGN.md](docs/DESIGN.md) | direction « néon verre » : verre, couleurs par domaine, effets et gestes |
| [docs/CALIBRAGE.md](docs/CALIBRAGE.md) | durées réelles mesurées au minuteur et dette de retard (« Repartir à zéro ») |
