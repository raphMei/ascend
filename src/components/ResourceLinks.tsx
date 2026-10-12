import type { Resource } from '@/content/types';

/** Liens vers les cours et exercices : une ligne par ressource, avec la source et la langue (FR / EN). Le français vient en premier. */
export function ResourceLinks({ res, compact }: { res: Resource[] | undefined; compact?: boolean }) {
  if (!res?.length) return null;
  const sorted = [...res].sort((a, b) => (a.lang === b.lang ? 0 : a.lang === 'fr' ? -1 : 1));
  return (
    <ul className={'reslinks' + (compact ? ' compact' : '')} aria-label="Ressources">
      {sorted.map((r) => (
        <li key={r.url}>
          <a href={r.url} target="_blank" rel="noopener noreferrer">
            <span className={'lang ' + r.lang} aria-label={r.lang === 'fr' ? 'en français' : 'en anglais'}>{r.lang.toUpperCase()}</span>
            <span className="rtitle">{r.title}</span>
            <span className="rsrc">{r.src} ↗</span>
          </a>
        </li>
      ))}
    </ul>
  );
}
