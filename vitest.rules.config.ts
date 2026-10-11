import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

// Tests des règles de sécurité : nécessitent l'émulateur Firestore (voir `npm run test:rules`).
export default defineConfig({
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  test: { environment: 'node', globals: true, include: ['rules-tests/**/*.test.ts'], testTimeout: 20000, hookTimeout: 30000, fileParallelism: false }
});
