/** « Comment faire » : détail repliable d'une tâche, avec lien de ressource optionnel. */
export function HowTo({ text, link }: { text?: string; link?: string }) {
  if (!text) return null;
  return (
    <details className="how">
      <summary>Comment faire</summary>
      <div className="txt">
        {text}
        {link && <><br /><a href={link} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', fontWeight: 700 }}>Ouvrir la ressource ↗</a></>}
      </div>
    </details>
  );
}
