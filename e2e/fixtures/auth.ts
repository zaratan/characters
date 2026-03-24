/* eslint-disable react-hooks/rules-of-hooks */
import { test as base } from '@playwright/test';
import type { Page, BrowserContext } from '@playwright/test';
import { seedUser, seedCharacter, cleanup } from './db';
import type { SeedCharacterOptions } from './db';
import { mockExternalApis } from '../helpers/mocks';

type DbHelpers = {
  seedCharacter: (options?: SeedCharacterOptions) => Promise<string>;
};

type AuthState = {
  userId: string;
  sessionToken: string;
  context: BrowserContext;
  page: Page;
};

type AuthFixtures = {
  _authState: AuthState;
  authenticatedPage: Page;
  testUserId: string;
  testDb: DbHelpers;
};

export async function injectSessionCookie(
  context: BrowserContext,
  sessionToken: string
): Promise<void> {
  await context.addCookies([
    {
      name: 'next-auth.session-token',
      value: sessionToken,
      domain: 'localhost',
      path: '/',
      httpOnly: true,
      sameSite: 'Lax',
    },
  ]);
}

export const test = base.extend<AuthFixtures>({
  _authState: async ({ browser }, use) => {
    const { userId, sessionToken } = await seedUser({ hasOnboarded: true });
    const context = await browser.newContext();
    await injectSessionCookie(context, sessionToken);
    const page = await context.newPage();

    // In dev mode, the first hit triggers on-demand compilation + PG pool
    // cold-start, which can 500. Warm up with a retry loop so the real
    // test navigation always hits a ready server.
    // In CI (production build), routes are pre-compiled — skip the warm-up.
    if (!process.env.CI) {
      for (let i = 0; i < 3; i++) {
        const res = await page.request
          .get('http://localhost:3000/api/auth/session')
          .catch(() => null);
        if (res?.ok()) break;
        await new Promise((r) => setTimeout(r, 500));
      }
    }

    await mockExternalApis(page);

    await use({ userId, sessionToken, context, page });

    await context.close();
    await cleanup(userId);
  },

  authenticatedPage: async ({ _authState }, use) => {
    await use(_authState.page);
  },

  testUserId: async ({ _authState }, use) => {
    await use(_authState.userId);
  },

  testDb: async ({ _authState }, use) => {
    await use({
      seedCharacter: (options?: SeedCharacterOptions) =>
        seedCharacter(_authState.userId, options),
    });
  },
});

export { expect } from '@playwright/test';
