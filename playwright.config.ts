import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import { defineConfig, devices } from '@playwright/test';

// Load only POSTGRES_URL from .env.local — do NOT load sensitive keys
// (RESEND_API_KEY, etc.) to avoid sending real emails during tests.
if (!process.env.POSTGRES_URL) {
  const envPath = resolve(process.cwd(), '.env.local');
  if (existsSync(envPath)) {
    const content = readFileSync(envPath, 'utf-8');
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIndex = trimmed.indexOf('=');
      if (eqIndex === -1) continue;
      const key = trimmed.slice(0, eqIndex);
      if (key === 'POSTGRES_URL') {
        const value = trimmed.slice(eqIndex + 1).replace(/^['"]|['"]$/g, '');
        process.env.POSTGRES_URL = value;
      }
    }
  }
}

export default defineConfig({
  testDir: './e2e/tests',
  workers: process.env.CI ? undefined : 3,
  retries: process.env.CI ? 2 : 1,
  reporter: [['html'], ['list']],
  timeout: 10_000,
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'desktop-chrome',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
      dependencies: ['desktop-chrome'],
    },
  ],
  webServer: {
    command: process.env.CI ? 'pnpm start' : 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
