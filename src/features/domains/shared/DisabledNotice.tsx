import { Link } from 'react-router-dom';

/** Rappel affiché quand un domaine n'a pas de créneau quotidien : il s'active dans les réglages. */
export function DisabledNotice({ what }: { what: string }) {
  return (
    <div className="warn" role="note">
      Pas encore de créneau dans ton planning pour {what}. Active-le dans <Link to="/settings" style={{ color: 'var(--accent)', fontWeight: 700 }}>Réglages › Mes domaines</Link> en indiquant des minutes par jour.
    </div>
  );
}
