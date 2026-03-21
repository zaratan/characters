import { test as baseTest, expect } from '@playwright/test';
import { test } from '../fixtures/auth';

// ---------------------------------------------------------------------------
// Tests that do NOT require authentication
// ---------------------------------------------------------------------------

baseTest.describe('Navigation — unauthenticated', () => {
  baseTest(
    'home page loads and shows title "Personnages"',
    async ({ page }) => {
      await page.goto('/');
      await expect(page.getByText('Personnages').first()).toBeVisible();
    }
  );

  baseTest('login button visible when not connected', async ({ page }) => {
    await page.goto('/');
    await expect(
      page.getByRole('button', { name: 'Connection', exact: true })
    ).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// Tests that require authentication
// ---------------------------------------------------------------------------

test.describe('Navigation — authenticated', () => {
  test('authenticated user sees avatar menu, not login button', async ({
    authenticatedPage,
  }) => {
    await authenticatedPage.goto('/');
    await authenticatedPage.waitForLoadState('networkidle');
    await expect(
      authenticatedPage.getByRole('button', { name: 'Connection', exact: true })
    ).not.toBeVisible();
  });

  test('clicking "Personnages" title from sheet returns to home', async ({
    authenticatedPage,
    testDb,
  }) => {
    const characterId = await testDb.seedCharacter({
      name: `NavHome ${Date.now()}`,
    });

    await authenticatedPage.goto(`/vampires/${characterId}`);
    await authenticatedPage.getByRole('link', { name: 'Personnages' }).click();
    await expect(authenticatedPage).toHaveURL('/');
  });

  test('clicking character on home navigates to sheet', async ({
    authenticatedPage,
    testDb,
  }) => {
    const characterName = `ClickTest ${Date.now()}`;
    const characterId = await testDb.seedCharacter({ name: characterName });

    await authenticatedPage.goto('/');
    await authenticatedPage.getByRole('link', { name: characterName }).click();
    await expect(authenticatedPage).toHaveURL(`/vampires/${characterId}`);
  });

  test('navigate to profile via user dropdown', async ({
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
    // On mobile, the dropdown may overflow the viewport.
    // Use JavaScript click to bypass viewport/stability checks.
    await profilLink.dispatchEvent('click');

    await expect(authenticatedPage).toHaveURL('/profile');
  });

  test('navigate to config from character sheet', async ({
    authenticatedPage,
    testDb,
  }) => {
    const characterId = await testDb.seedCharacter({
      name: `ConfigTest ${Date.now()}`,
    });

    await authenticatedPage.goto(`/vampires/${characterId}`);

    const configLink = authenticatedPage
      .getByRole('link', { name: 'Configuration' })
      .first();
    await expect(configLink).toBeVisible();
    await configLink.click();

    await expect(authenticatedPage).toHaveURL(
      new RegExp(`/vampires/${characterId}/config`)
    );
  });
});
