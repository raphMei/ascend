import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { ClockProvider } from './hooks/useClock';
import { ScheduleProvider } from './hooks/useSchedule';
import { DataProvider } from './state/DataContext';
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
