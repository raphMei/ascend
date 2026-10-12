# Design : « néon verre »

Direction choisie parmi trois maquettes (`docs/maquettes/index.html`). Sombre profond et couleurs vives, panneaux de verre
translucides, gestes et petits effets. Thème clair, sombre ou automatique (suit l'appareil).

## Principes
- **Verre** : `--glass` (fond translucide), `--glass-b` (bordure lumineuse), `--hi` (reflet du haut), `--blur` (flou). Cartes, boutons
  (en capsule), feuilles, barre du bas. Sans `backdrop-filter`, repli sur un fond presque opaque.
- **Couleur par domaine** : `--c-<domaine>` pour le texte et les traits (contraste vérifié par axe dans les deux thèmes), `--f-<domaine>`
  pour les remplissages vifs (identiques en clair et en sombre). `dc(domaine)` pose `--dc` et `--df` sur un composant.
  Une tâche faite se remplit de `--df` ; le texte dessus est toujours `--done-ink` (encre foncée).
- **Fond** : trois halos (dégradés radiaux, jamais animés) dont la teinte suit le moment de la journée (`domain/moment.ts`).
  Le soir, l'interface se calme (cartes un peu moins saturées, ton des messages adouci).
- **Contraste** : les halos restent faibles (`--halo-o`) pour que le texte secondaire (`--muted`) garde 4,5 : 1 même sur le halo le plus clair.
- **Mouvement** : `--spring` (ressort), `--out`, `--dur-1..4`. Animer `transform`, `opacity`, `clip-path`, `stroke-dasharray`.
  Mouvement réduit : plus d'animation ni d'étincelles, valeurs affichées tout de suite.

## Effets (écran Aujourd'hui)
| Effet | Où |
|---|---|
| La couleur du domaine envahit la carte depuis la case, coche qui se trace, étincelles, vibration, son optionnel | `HabitRow`, `habits.css`, `fx/sparks.ts`, `hooks/feedback.ts` |
| Anneau du jour dégradé, pourcentage qui défile | `DayHero`, `hooks/useRoll.ts` |
| Carte « Maintenant » (ou « À suivre », « En retard »), lueur sur la tâche en cours | `NextCard`, `domain/next.ts` |
| Balayer à droite = fait, à gauche = passer (avec « Annuler »), appui long = menu | `hooks/useCardGestures.ts`, `HabitMenu`, `UndoToast` |
| Groupe terminé : il pulse | `GroupSection` |
| Journée à 100 % : célébration, palier à 7, 30, 100 jours | `Celebration` (une fois par jour, jamais au chargement) |
| Mini-lecteur de verre, mode concentration plein écran (pause, +5 min, terminer) | `MiniPlayer`, `hooks/useTimer.ts` |

Alternatives sans geste : case à cocher native, bouton « Options » dans le détail de la carte, bouton « Modifier l'horaire ».

## Limites connues
- La vibration web (`navigator.vibrate`) n'existe pas sur iPhone : le retour haptique y est absent.
- Beaucoup de verre flouté pèse sur un iPhone ancien.
- Écrans autres qu'Aujourd'hui : cartes, boutons et barre du bas en verre ; leurs contenus propres n'ont pas encore été retravaillés.
