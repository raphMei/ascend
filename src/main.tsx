import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { ClockProvider } from './hooks/useClock';
import { ScheduleProvider } from './hooks/useSchedule';
import { DataProvider } from './state/DataContext';
// Polices hébergées avec l'application (aucune requête vers un service tiers).
import '@fontsource/dm-sans/latin-400.css';
import '@fontsource/dm-sans/latin-500.css';
import '@fontsource/dm-sans/latin-700.css';
import '@fontsource/dm-mono/latin-400.css';
import '@fontsource/dm-mono/latin-500.css';
import '@fontsource/syne/latin-600.css';
import '@fontsource/syne/latin-700.css';
import '@fontsource/syne/latin-800.css';
import './styles/index.css';

/* Application, pas page web : pas de zoom au pincement (Safari iOS ignore la balise viewport, d'où l'événement) ni au double toucher (touch-action dans base.css).
   Le zoom du texte reste possible via les réglages d'accessibilité du système (`text-size-adjust`, polices en px relatifs au système). */
for (const ev of ['gesturestart', 'gesturechange', 'gestureend']) document.addEventListener(ev, (e) => e.preventDefault());

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <DataProvider>
      <ClockProvider>
        <ScheduleProvider>
          <App />
        </ScheduleProvider>
      </ClockProvider>
    </DataProvider>
  </StrictMode>
);
