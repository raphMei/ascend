/** Emoji associés aux blocs et aux domaines (identité visuelle de la liste d'habitudes). */
import type { Block, DomainId } from './types';

const BY_ID: Record<string, string> = {
  tephila: '🙏', pompes: '💪', stretch: '🧘', petitdej: '🍳', sport: '🏋️', dejeuner: '🥗', diner: '🍽️',
  java: '☕', anglais: '🇬🇧', lecture: '📖', front: '💻', cloud: '☁️', archi: '🏛️', projets: '🚀', bilan: '📝', coucher: '😴',
  'fin-point': '💰', cours: '🎓', 'prep-chabbat': '🕯️'
};
const BY_DOMAIN: Record<DomainId, string> = {
  matin: '🌅', sport: '🏋️', alim: '🥗', sommeil: '😴', miage: '📚', java: '☕', pro: '💼', trajet: '🚆', chabbat: '✨', autre: '📌',
  anglais: '🇬🇧', lecture: '📖', front: '💻', cloud: '☁️', archi: '🏛️', finances: '💰', projets: '🚀'
};

export const emojiFor = (b: Pick<Block, 'id' | 'domain'>): string => BY_ID[b.id] ?? BY_DOMAIN[b.domain];
