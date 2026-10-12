import { Suspense, lazy, useEffect, useState } from 'react';
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Toast } from '@/components/Toast';
import { UndoToastHost } from '@/components/UndoToast';
import { Layout } from '@/features/shell/Layout';
import { ShabbatScreen } from '@/features/shell/ShabbatScreen';
import { SignInScreen } from '@/features/shell/SignInScreen';
import { useShabbat } from '@/features/shell/useShabbat';
import { TodayScreen } from '@/features/today/TodayScreen';

// « Aujourd'hui » est chargé tout de suite ; les autres écrans seulement quand on les ouvre.
const HomeScreen = lazy(() => import('@/features/home/HomeScreen').then((m) => ({ default: m.HomeScreen })));
const DomainsScreen = lazy(() => import('@/features/domains/DomainsScreen').then((m) => ({ default: m.DomainsScreen })));
const DomainPage = lazy(() => import('@/features/domains/DomainPage').then((m) => ({ default: m.DomainPage })));
const MonthScreen = lazy(() => import('@/features/month/MonthScreen').then((m) => ({ default: m.MonthScreen })));
const StatsScreen = lazy(() => import('@/features/stats/StatsScreen').then((m) => ({ default: m.StatsScreen })));
const SettingsScreen = lazy(() => import('@/features/settings/SettingsScreen').then((m) => ({ default: m.SettingsScreen })));
import { useBackfillStats } from '@/hooks/useBackfillStats';
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
  useBackfillStats();

  if (!state.authReady) return <div className="center"><p>Chargement…</p></div>;
  if (!state.user) return <SignInScreen />;
  if (shabbat && !peek && (!isDemo() || forceShabbatInDemo())) return <ShabbatScreen window={shabbat} onPeek={() => setPeek(true)} />;
  return (
    <HashRouter>
      <Toast />
      <UndoToastHost />
      <Suspense fallback={<div className="center"><p>Chargement…</p></div>}>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Navigate to="/today" replace />} />
          <Route path="home" element={<HomeScreen />} />
          <Route path="today" element={<TodayScreen />} />
          <Route path="today/:date" element={<TodayScreen />} />
          <Route path="domains" element={<DomainsScreen />} />
          <Route path="month" element={<MonthScreen />} />
          <Route path="stats" element={<StatsScreen />} />
          <Route path="dom/:id" element={<DomainPage />} />
          <Route path="dom/:id/:sub" element={<DomainPage />} />
          <Route path="settings" element={<SettingsScreen />} />
          <Route path="*" element={<Navigate to="/today" replace />} />
        </Route>
      </Routes>
      </Suspense>
    </HashRouter>
  );
}
