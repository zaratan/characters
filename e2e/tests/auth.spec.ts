import { test as baseTest, expect } from '@playwright/test';
import { test, injectSessionCookie } from '../fixtures/auth';
import { seedUser, cleanup } from '../fixtures/db';

// ---------------------------------------------------------------------------
// Unauthenticated tests
// ---------------------------------------------------------------------------

baseTest.describe('Auth — unauthenticated', () => {
  baseTest(
    'login button visible on home when not connected',
    async ({ page }) => {
      await page.goto('/');
      await expect(
        page.getByRole('button', { name: 'Connection' })
      ).toBeVisible();
    }
  );

  baseTest('unauthenticated user on /new sees error page', async ({ page }) => {
    await page.goto('/new');
    await expect(
      page.getByText(/Vous n.êtes pas autorisé à voir cette page/)
    ).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// Authenticated tests (using the extended fixture)
// ---------------------------------------------------------------------------

test.describe('Auth — authenticated', () => {
  test('authenticated user sees avatar dropdown with Profil and Déconnection', async ({
    authenticatedPage,
  }) => {
    await authenticatedPage.goto('/');
    await authenticatedPage.waitForLoadState('networkidle');

    await expect(
      authenticatedPage.getByRole('button', { name: 'Connection', exact: true })
    ).not.toBeVisible();

    await authenticatedPage.getByTestId('user-menu-button').click();

    const profilLink = authenticatedPage.getByRole('link', { name: 'Profil' });
    await expect(profilLink).toBeVisible();

    const deconnectionButton = authenticatedPage.getByRole('button', {
      name: 'Déconnection',
    });
    await expect(deconnectionButton).toBeVisible();
  });

  test('logout clears session and "Connection" button reappears', async ({
    authenticatedPage,
  }) => {
    await authenticatedPage.goto('/');
    await authenticatedPage.waitForLoadState('networkidle');

    await expect(
      authenticatedPage.getByRole('button', { name: 'Connection', exact: true })
    ).not.toBeVisible();

    await authenticatedPage.getByTestId('user-menu-button').click();

    const deconnectionButton = authenticatedPage.getByRole('button', {
      name: 'Déconnection',
    });
    await expect(deconnectionButton).toBeVisible();
    await deconnectionButton.click();

    // NextAuth signOut() posts to /api/auth/signout then redirects to /.
    await authenticatedPage.waitForURL('/', { timeout: 15_000 });
    // Hard reload to clear SWR/session cache
    await authenticatedPage.reload();

    await expect(
      authenticatedPage.getByRole('button', { name: 'Connection', exact: true })
    ).toBeVisible({ timeout: 10_000 });
  });
});

// ---------------------------------------------------------------------------
// Onboarding redirect tests — manual session setup without the fixture
// ---------------------------------------------------------------------------

baseTest.describe('Auth — onboarding', () => {
  baseTest(
    'non-onboarded user is redirected to /profile',
    async ({ browser }) => {
      const { userId, sessionToken } = await seedUser({
        hasOnboarded: false,
      });

      const context = await browser.newContext();
      await injectSessionCookie(context, sessionToken);
      const page = await context.newPage();

      try {
        await page.goto('/');
        await page.waitForURL('/profile', { timeout: 10_000 });
        await expect(page).toHaveURL('/profile');
      } finally {
        await context.close();
        await cleanup(userId);
      }
    }
  );

  baseTest(
    'after onboarding (filling name on /profile), user is redirected to home',
    async ({ browser }) => {
      const { userId, sessionToken } = await seedUser({
        hasOnboarded: false,
      });

      const context = await browser.newContext();
      await injectSessionCookie(context, sessionToken);
      const page = await context.newPage();

      try {
        await page.goto('/profile');

        const nameInput = page.locator('#profile-name');
        await expect(nameInput).toBeVisible();
        await nameInput.fill('Mon Nouveau Nom');

        const saveButton = page.getByRole('button', { name: 'Continuer' });
        await expect(saveButton).toBeEnabled();
        await saveButton.click();

        await page.waitForURL('/', { timeout: 10_000 });
        await expect(page).toHaveURL('/');
      } finally {
        await context.close();
        await cleanup(userId);
      }
    }
  );
});
