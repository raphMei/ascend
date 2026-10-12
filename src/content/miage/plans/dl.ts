/** Deep Learning : des neurones aux transformeurs, avec PyTorch. Plan type à adapter au programme réel du cours. */
import { en, fr, hf, wiki } from '../../sources';
import { cours, exo } from './dsl';
import type { SubjectPlan } from './types';

export const dl: SubjectPlan = {
  subject: 'dl',
  units: [
    cours('Du perceptron aux réseaux de neurones', 'Lis la page, puis écris en trois lignes : ce que calcule un neurone, le rôle des poids, du biais et de la fonction d\'activation.', 0.75, [wiki('Perceptron', 'Perceptron'), wiki('Fonction_d%27activation', 'Fonction d\'activation'), wiki('Apprentissage_profond', 'Apprentissage profond')]),
    cours('Descente de gradient et fonction de coût', 'Comprends comment on corrige les poids pas à pas. Refais à la main deux itérations sur un exemple à un seul poids.', 0.75, [wiki('Descente_de_gradient', 'Descente de gradient'), fr('Machine Learnia', 'Machine Learnia : deep learning en français', 'https://www.youtube.com/@MachineLearnia')]),
    cours('Rétropropagation du gradient', 'Suis le calcul sur un réseau à deux couches : pourquoi on remonte du résultat vers l\'entrée, et ce que fait la règle de dérivation en chaîne.', 1, [wiki('R%C3%A9tropropagation_du_gradient', 'Rétropropagation du gradient'), en('3Blue1Brown', 'Les réseaux de neurones (vidéos)', 'https://www.3blue1brown.com/topics/neural-networks')]),
    exo('Un réseau à deux couches en NumPy', 'Implémente propagation avant, rétropropagation et mise à jour des poids, sans framework. Entraîne-le sur un petit jeu de données (XOR ou chiffres).', 1.5, [en('Livre en ligne', 'Neural Networks and Deep Learning', 'http://neuralnetworksanddeeplearning.com/chap1.html')]),
    cours('Surapprentissage et régularisation', 'Repère le surapprentissage sur une courbe d\'entraînement contre validation. Liste trois remèdes : plus de données, régularisation, arrêt anticipé.', 0.75, [wiki('Surapprentissage', 'Surapprentissage')]),
    cours('Premiers pas avec PyTorch', 'Tenseurs, autograd, boucle d\'entraînement. Fais le parcours « Learn the Basics » jusqu\'à l\'entraînement d\'un modèle.', 1.5, [en('PyTorch', 'Learn the Basics', 'https://pytorch.org/tutorials/beginner/basics/intro.html')]),
    cours('Réseaux convolutifs (CNN)', 'Convolution, pooling, champ réceptif : pourquoi un CNN voit mieux une image qu\'un réseau dense.', 1, [wiki('R%C3%A9seau_neuronal_convolutif', 'Réseau neuronal convolutif'), en('Stanford CS231n', 'Convolutional Networks', 'https://cs231n.github.io/convolutional-networks/')]),
    exo('Classer des images avec un CNN', 'Entraîne un petit CNN sur CIFAR-10 avec PyTorch. Trace les courbes de perte et de précision (entraînement contre validation).', 2, [en('PyTorch', 'Entraîner un classifieur CIFAR-10', 'https://pytorch.org/tutorials/beginner/blitz/cifar10_tutorial.html')]),
    cours('Réseaux récurrents et LSTM', 'Pourquoi une séquence demande de la mémoire, et ce que corrige un LSTM par rapport à un réseau récurrent simple.', 1, [wiki('R%C3%A9seau_de_neurones_r%C3%A9currents', 'Réseaux de neurones récurrents'), wiki('Long_short-term_memory', 'Long short-term memory')]),
    cours('Attention et transformeurs', 'Comprends l\'attention (qui regarde quoi) et l\'architecture transformeur, base des modèles de langage actuels.', 1.25, [wiki('Transformeur', 'Transformeur'), hf(1, 'Cours Hugging Face : les transformeurs (français)')]),
    cours('Réutiliser un modèle pré-entraîné (fine-tuning)', 'Affine un modèle existant sur ta tâche plutôt que d\'en entraîner un de zéro : quand c\'est utile, et ce que ça coûte.', 1, [hf(3, 'Cours Hugging Face : affiner un modèle (français)')])
  ],
  projects: { 'dl:p5': [wiki('R%C3%A9seau_neuronal_convolutif', 'Réseau neuronal convolutif'), en('PyTorch', 'Entraîner un classifieur CIFAR-10', 'https://pytorch.org/tutorials/beginner/blitz/cifar10_tutorial.html')] }
};
