/** Fond de l'application : trois halos de couleur (dégradés radiaux) derrière le verre. Statique, sans animation continue :
    la teinte change en fondu quand le moment de la journée change. Purement décoratif. */
export function Backdrop() {
  return <div className="backdrop" aria-hidden="true" />;
}
