/** Fabriques de liens vers des sources de référence (en français quand elles existent). Les adresses sont vérifiées par `npm run check:links`. */
import type { Resource } from './types';

export const fr = (src: string, title: string, url: string): Resource => ({ src, title, url, lang: 'fr' });
export const en = (src: string, title: string, url: string): Resource => ({ src, title, url, lang: 'en' });

/** MDN en français : « parcours d'apprentissage » web. `p` = chemin après /fr/docs/. */
export const mdn = (p: string, title: string) => fr('MDN', title, 'https://developer.mozilla.org/fr/docs/' + p);
export const learn = (p: string, title: string) => mdn('Learn_web_development/' + p, title);
/** javascript.info en français. */
export const jsi = (p: string, title: string) => fr('javascript.info', title, 'https://fr.javascript.info/' + p);
/** Documentation officielle de React en français. */
export const react = (p: string, title: string) => fr('React', title, 'https://fr.react.dev/' + p);
/** « Développons en Java » (Jean-Michel Doudoux), cours complet en français. */
export const jdx = (chap: string, title: string) => fr('Doudoux', title, `https://www.jmdoudoux.fr/java/dej/${chap}.htm`);
/** Wikipédia en français. `page` peut contenir des accents : ils sont encodés (sauf s'il est déjà encodé). */
export const wiki = (page: string, title: string) => fr('Wikipédia', title, 'https://fr.wikipedia.org/wiki/' + (page.includes('%') ? page : encodeURI(page)));
export const oc = (id: string, slug: string, title: string) => fr('OpenClassrooms', title, `https://openclassrooms.com/fr/courses/${id}-${slug}`);
export const sqlsh = (p: string, title: string) => fr('sql.sh', title, 'https://sql.sh/cours/' + p);
export const gha = (p: string, title: string) => fr('GitHub', title, 'https://docs.github.com/fr/' + p);
export const cnil = (p: string, title: string) => fr('CNIL', title, 'https://www.cnil.fr/fr/' + p);
export const hf = (chapter: number, title: string) => fr('Hugging Face', title, `https://huggingface.co/learn/llm-course/fr/chapter${chapter}/1`);
export const spring = (p: string, title: string) => en('Spring', title, 'https://spring.io/' + p);
export const guru = (p: string, title: string) => fr('Refactoring Guru', title, 'https://refactoring.guru/fr/' + p);
export const git = (p: string, title: string) => fr('Pro Git', title, 'https://git-scm.com/book/fr/v2/' + p);
export const docker = (p: string, title: string) => en('Docker', title, 'https://docs.docker.com/' + p);
export const k8s = (p: string, title: string) => fr('Kubernetes', title, 'https://kubernetes.io/fr/docs/' + p);
export const msl = (p: string, title: string) => fr('Microsoft Learn', title, 'https://learn.microsoft.com/fr-fr/' + p);
/** Catalogue de patrons d'architecture cloud de Microsoft (en français). */
export const azp = (p: string, title: string) => msl('azure/architecture/patterns/' + p, title);
/** Articles de Martin Fowler (anglais). */
export const fowler = (p: string, title: string) => en('Martin Fowler', title, 'https://martinfowler.com/' + p);
