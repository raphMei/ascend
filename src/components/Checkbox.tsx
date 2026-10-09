import { Icon, dc } from './Icon';

/** Case ronde à cocher (zone tactile agrandie en CSS). */
export function Checkbox({ checked, onChange, domain, label }: { checked: boolean; onChange: (v: boolean) => void; domain: string; label?: string }) {
  return (
    <label className="cb" style={dc(domain)}>
      <input type="checkbox" className="sr" checked={checked} aria-label={label} onChange={(e) => onChange(e.target.checked)} />
      <span className="box"><Icon name="check" strokeWidth={3} /></span>
    </label>
  );
}
