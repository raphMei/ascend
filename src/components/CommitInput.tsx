import { useEffect, useState, type InputHTMLAttributes } from 'react';

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'type'> & {
  type: 'number' | 'time' | 'text';
  value: string | number | null | undefined;
  /** Appelé à la fin de la saisie (blur ou Entrée) avec la valeur convertie : nombre | null pour `number`, texte sinon. */
  onCommit: (v: string | number | null) => void;
};

/** Champ qui n'enregistre qu'à la fin de la saisie (comportement de l'événement « change » natif),
    pour ne pas écrire dans Firestore à chaque frappe ni perdre le focus. */
export function CommitInput({ value, onCommit, type, ...rest }: Props) {
  const external = value == null ? '' : String(value);
  const [draft, setDraft] = useState(external);
  useEffect(() => setDraft(external), [external]);
  const commit = () => {
    if (draft === external) return;
    onCommit(type === 'number' ? (draft === '' ? null : Number(draft)) : draft);
  };
  return (
    <input {...rest} type={type} value={draft}
      onChange={(e) => setDraft(e.target.value)} onBlur={commit}
      onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur(); }} />
  );
}
