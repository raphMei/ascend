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
