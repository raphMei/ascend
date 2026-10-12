/** Moment de la journée : teinte des halos de fond et mode « soir calme ». Fonction pure. */
export type Moment = 'matin' | 'apres' | 'soir';

/** `now` : minutes depuis minuit. Matin avant 12 h, après-midi jusqu'à 19 h, soir ensuite. */
export const momentOf = (now: number): Moment => (now < 12 * 60 ? 'matin' : now < 19 * 60 ? 'apres' : 'soir');
