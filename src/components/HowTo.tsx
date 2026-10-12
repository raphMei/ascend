import type { Resource } from '@/content/types';
import { ResourceLinks } from './ResourceLinks';

/** « Comment faire » : détail repliable d'une tâche, avec les liens vers les cours et exercices. */
export function HowTo({ text, res }: { text?: string; res?: Resource[] }) {
  if (!text && !res?.length) return null;
  return (
    <details className="how">
      <summary>{res?.length ? 'Cours et détails' : 'Comment faire'}</summary>
      <div className="txt">
        {text}
        <ResourceLinks res={res} compact />
      </div>
    </details>
  );
}
