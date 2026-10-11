import { Icon, dc } from './Icon';

/** Case ronde à cocher (zone tactile agrandie en CSS). */
export function Checkbox({ checked, onChange, domain, label, big }: { checked: boolean; onChange: (v: boolean) => void; domain: string; label?: string; big?: boolean }) {
  return (
    <label className={big ? 'cb big' : 'cb'} style={dc(domain)}>
      <input type="checkbox" className="sr" checked={checked} aria-label={label} onChange={(e) => onChange(e.target.checked)} />
      <span className="box"><Icon name="check" strokeWidth={3} /></span>
    </label>
  );
}
