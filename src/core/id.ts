/** Identifiant court, unique à l'échelle d'un utilisateur (horodatage en base 36) : blocs ajoutés, projets. */
export const newId = (): string => Date.now().toString(36);
