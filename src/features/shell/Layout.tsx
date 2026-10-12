import { useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Backdrop } from '@/components/Backdrop';
import { BilanHost } from '@/components/BilanSheet';
import { MiniPlayer } from '@/components/habits/MiniPlayer';
import { Icon, type IconKey } from '@/components/Icon';
import { momentOf } from '@/domain/moment';
import { haptic } from '@/hooks/feedback';
import { useClock } from '@/hooks/useClock';

// Quatre onglets : la journée (agenda), la semaine, les domaines (avancement et intensité du mois), le journal d'apprentissage.
const NAV: [string, string, IconKey][] = [['today', "Aujourd'hui", 'today'], ['week', 'Semaine', 'week'], ['domains', 'Domaines', 'compass'], ['journal', 'Journal', 'journal']];
const TAB_OF: Record<string, string> = { dom: 'domains', month: 'domains', today: 'today', week: 'week', domains: 'domains', journal: 'journal' };

/** Coque de l'application : navigation flottante en verre (basse sur mobile, latérale sur bureau), réglages, contenu de la page. */
export function Layout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { now } = useClock();
  const first = pathname.split('/')[1] || 'today';
  const current = TAB_OF[first];
  const index = NAV.findIndex(([k]) => k === current);
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return (
    <div className="shell" data-moment={momentOf(now)}>
      <Backdrop />
      {first !== 'settings' && <Link className="gear" to="/settings" aria-label="Réglages" onClick={() => haptic(6)}><Icon name="gear" /></Link>}
      <nav className="nav" aria-label="Navigation principale" style={{ ['--i' as string]: Math.max(0, index) }} data-none={index < 0 ? '' : undefined}>
        <div className="brand"><img src={`${import.meta.env.BASE_URL}icon.svg`} alt="" />Ascend</div>
        <span className="nav-ind" aria-hidden="true" />
        {NAV.map(([k, n, i]) => (
          <button key={k} type="button" aria-current={current === k ? 'page' : undefined} onClick={() => { haptic(6); navigate('/' + k); }}><Icon name={i} /><span>{n}</span></button>
        ))}
      </nav>
      <main><Outlet /></main>
      <MiniPlayer />
      <BilanHost />
    </div>
  );
}
