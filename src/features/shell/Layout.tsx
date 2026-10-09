import { useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Icon, type IconKey } from '@/components/Icon';

const NAV: [string, string, IconKey][] = [['home', 'Accueil', 'home'], ['today', "Aujourd'hui", 'today'], ['domains', 'Domaines', 'grid'], ['settings', 'Réglages', 'gear']];

/** Coque de l'application : navigation (basse sur mobile, latérale sur bureau) + contenu de la page. */
export function Layout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const tab = pathname.split('/')[1] || 'home';
  const current = tab === 'dom' ? 'domains' : tab;
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return (
    <div className="shell">
      <nav className="nav" aria-label="Navigation principale">
        <div className="brand"><img src={`${import.meta.env.BASE_URL}icon.svg`} alt="" />Ascend</div>
        {NAV.map(([k, n, i]) => (
          <button key={k} type="button" aria-current={current === k ? 'page' : undefined} onClick={() => navigate('/' + k)}><Icon name={i} /><span>{n}</span></button>
        ))}
      </nav>
      <main><Outlet /></main>
    </div>
  );
}
