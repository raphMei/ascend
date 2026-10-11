import { defineConfig, devices } from '@playwright/test';

// Tests de bout en bout : le site de production (npm run build) est servi tel qu'il le sera sur GitHub Pages
// (sous /ascend/), en mode démo (aucune connexion Firebase). iPhone et bureau.
export default defineConfig({
  testDir: 'e2e',
  fullyParallel: true,
  reporter: [['list']],
  use: { baseURL: 'http://localhost:4173', trace: 'retain-on-failure' },
  webServer: { command: 'npm run build && npx vite preview --port 4173 --strictPort', url: 'http://localhost:4173/ascend/', reuseExistingServer: true, timeout: 120_000 },
  projects: [
    { name: 'iphone', use: { ...devices['iPhone 14'], browserName: 'chromium' } },
    { name: 'bureau', use: { ...devices['Desktop Chrome'] } }
  ]
});
