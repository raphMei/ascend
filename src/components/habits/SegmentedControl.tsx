/** Choix exclusif présenté en boutons accolés (vue Liste / Frise, groupes Moments / Thèmes…). */
export function SegmentedControl<T extends string>({ label, value, options, onChange }: { label: string; value: T; options: [T, string][]; onChange: (v: T) => void }) {
  return (
    <div className="seg" role="radiogroup" aria-label={label}>
      {options.map(([k, text]) => (
        <button key={k} type="button" role="radio" aria-checked={value === k} className={value === k ? 'on' : ''} onClick={() => onChange(k)}>{text}</button>
      ))}
    </div>
  );
}
