import { useEffect, useState } from 'react';
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { DomainPage } from '@/features/domains/DomainPage';
import { DomainsScreen } from '@/features/domains/DomainsScreen';
import { HomeScreen } from '@/features/home/HomeScreen';
import { SettingsScreen } from '@/features/settings/SettingsScreen';
import { Layout } from '@/features/shell/Layout';
import { ShabbatScreen } from '@/features/shell/ShabbatScreen';
import { SignInScreen } from '@/features/shell/SignInScreen';
import { useShabbat } from '@/features/shell/useShabbat';
import { TodayScreen } from '@/features/today/TodayScreen';
import { forceShabbatInDemo, isDemo } from '@/services/config';
import { useData } from '@/state/DataContext';

/** Applique le thème choisi (clair / sombre / automatique) sur <html>. */
function useTheme() {
  const { settings } = useData();
  useEffect(() => {
    const root = document.documentElement;
    if (settings.theme === 'light' || settings.theme === 'dark') root.setAttribute('data-theme', settings.theme);
    else root.removeAttribute('data-theme');
  }, [settings.theme]);
}

export function App() {
  const { state } = useData();
  const shabbat = useShabbat();
  const [peek, setPeek] = useState(false);
  useTheme();

  if (!state.authReady) return <div className="center"><p>Chargement…</p></div>;
  if (!state.user) return <SignInScreen />;
  if (shabbat && !peek && (!isDemo() || forceShabbatInDemo())) return <ShabbatScreen window={shabbat} onPeek={() => setPeek(true)} />;
  return (
    <HashRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Navigate to="/home" replace />} />
          <Route path="home" element={<HomeScreen />} />
          <Route path="today" element={<TodayScreen />} />
          <Route path="today/:date" element={<TodayScreen />} />
          <Route path="domains" element={<DomainsScreen />} />
          <Route path="dom/:id" element={<DomainPage />} />
          <Route path="dom/:id/:sub" element={<DomainPage />} />
          <Route path="settings" element={<SettingsScreen />} />
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
