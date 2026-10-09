import { dc } from './Icon';

/** Barre de progression colorée par domaine (0-100). */
export function Bar({ pct, domain }: { pct: number; domain: string }) {
  return <div className="bar" style={dc(domain)}><i style={{ width: `${Math.max(0, Math.min(100, pct))}%` }} /></div>;
}
