import { useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Backdrop } from '@/components/Backdrop';
import { MiniPlayer } from '@/components/habits/MiniPlayer';
import { Icon, type IconKey } from '@/components/Icon';
import { momentOf } from '@/domain/moment';
import { useClock } from '@/hooks/useClock';

// L'application s'ouvre sur « Aujourd'hui » (la liste du jour) ; le tableau de bord complet s'appelle « Bilan ».
const NAV: [string, string, IconKey][] = [['today', "Aujourd'hui", 'today'], ['home', 'Bilan', 'home'], ['domains', 'Domaines', 'grid'], ['settings', 'Réglages', 'gear']];

/** Coque de l'application : navigation (basse sur mobile, latérale sur bureau) + contenu de la page. */
export function Layout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { now } = useClock();
  const tab = pathname.split('/')[1] || 'today';
  const current = tab === 'dom' || tab === 'month' ? 'domains' : tab === 'stats' ? 'home' : tab;
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return (
    <div className="shell" data-moment={momentOf(now)}>
      <Backdrop />
      <nav className="nav" aria-label="Navigation principale">
        <div className="brand"><img src={`${import.meta.env.BASE_URL}icon.svg`} alt="" />Ascend</div>
        {NAV.map(([k, n, i]) => (
          <button key={k} type="button" aria-current={current === k ? 'page' : undefined} onClick={() => navigate('/' + k)}><Icon name={i} /><span>{n}</span></button>
        ))}
      </nav>
      <main><Outlet /></main>
      <MiniPlayer />
    </div>
  );
}
