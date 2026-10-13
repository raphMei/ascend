/** Interrupteur de verre (une case à cocher accessible, habillée comme celui d'iOS). */
export function Switch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <span className="switch">
      <input type="checkbox" role="switch" checked={checked} onChange={(e) => onChange(e.target.checked)} aria-label={label} />
      <span className="track" aria-hidden="true"><i /></span>
    </span>
  );
}
