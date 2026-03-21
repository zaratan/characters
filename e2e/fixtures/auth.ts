/* eslint-disable react-hooks/rules-of-hooks */
import { test as base } from '@playwright/test';
import type { Page, BrowserContext } from '@playwright/test';
import { seedUser, seedCharacter, cleanup } from './db';
import type { SeedCharacterOptions } from './db';

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
