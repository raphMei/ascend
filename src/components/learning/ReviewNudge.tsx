import { Link } from 'react-router-dom';
import type { JournalItem } from '@/domain/journal';

/** Rappel des notions à revoir aujourd'hui : un toucher ouvre le journal. N'apparaît que s'il y en a. */
export function ReviewNudge({ due }: { due: readonly JournalItem[] }) {
  if (!due.length) return null;
  return (
    <Link to="/journal" className="card reviewnudge">
      <span><b>{due.length} notion{due.length > 1 ? 's' : ''} à revoir</b><span className="muted" style={{ display: 'block' }}>Deux minutes dans le journal</span></span>
      <span className="pillbtn">Revoir</span>
    </Link>
  );
}
