import { test, expect, injectSessionCookie } from '../fixtures/auth';
import { seedUser, seedCharacter, cleanup } from '../fixtures/db';
import { mockExternalApis } from '../helpers/mocks';

// ---------------------------------------------------------------------------
// describe: Config page structure
// ---------------------------------------------------------------------------

test.describe('Config page structure', () => {
  test('config page loads and shows the character name', async ({
    authenticatedPage: page,
    testDb,
  }) => {
    await mockExternalApis(page);

    const vampireId = await testDb.seedCharacter({ name: 'Config Name Test' });

    await page.goto(`/vampires/${vampireId}/config`);
    await page.waitForLoadState('networkidle');

    await expect(page.getByText('Options pour Config Name Test')).toBeVisible();
  });

  test('preferences section is visible on config page', async ({
    authenticatedPage: page,
    testDb,
  }) => {
    await mockExternalApis(page);

    const vampireId = await testDb.seedCharacter({ name: 'Prefs Test Char' });

    await page.goto(`/vampires/${vampireId}/config`);
    await page.waitForLoadState('networkidle');

    await expect(
      page.getByText('Sections disponibles sur la fiche')
    ).toBeVisible();

    await expect(page.getByText(/Sang/)).toBeVisible();
  });

  test('access section is visible on config page', async ({
    authenticatedPage: page,
    testDb,
  }) => {
    await mockExternalApis(page);

    const vampireId = await testDb.seedCharacter({ name: 'Access Test Char' });

    await page.goto(`/vampires/${vampireId}/config`);
    await page.waitForLoadState('networkidle');

    await expect(page.getByText('Éditeurs')).toBeVisible();
  });

  test('dangerous section is visible on config page', async ({
    authenticatedPage: page,
    testDb,
  }) => {
    await mockExternalApis(page);

    const vampireId = await testDb.seedCharacter({
      name: 'Dangerous Test Char',
    });

    await page.goto(`/vampires/${vampireId}/config`);
    await page.waitForLoadState('networkidle');

    await expect(
      page.getByRole('button', { name: 'Supprimer le personnage' })
    ).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// describe: Config access control
// ---------------------------------------------------------------------------

test.describe('Config access control', () => {
  test('non-editor cannot access the config page', async ({ browser }) => {
    const { userId: userAId } = await seedUser({
      hasOnboarded: true,
    });
    const characterId = await seedCharacter(userAId, {
      name: `AccessControl ${Date.now()}`,
    });

    const { userId: userBId, sessionToken: tokenB } = await seedUser({
      hasOnboarded: true,
    });

    const context = await browser.newContext();
    await injectSessionCookie(context, tokenB);
    const page = await context.newPage();

    try {
      await mockExternalApis(page);
      await page.goto(`/vampires/${characterId}/config`);
      await page.waitForLoadState('networkidle');

      await expect(
        page.getByText(
          "Vous n'avez pas accès à la configuration de ce personnage."
        )
      ).toBeVisible();
    } finally {
      await context.close();
      await cleanup(userAId);
      await cleanup(userBId);
    }
  });

  test('private sheet is not visible to a non-editor', async ({ browser }) => {
    const { userId: userAId } = await seedUser({
      hasOnboarded: true,
    });
    const characterId = await seedCharacter(userAId, {
      name: `PrivateSheet ${Date.now()}`,
      privateSheet: true,
    });

    const { userId: userBId, sessionToken: tokenB } = await seedUser({
      hasOnboarded: true,
    });

    const context = await browser.newContext();
    await injectSessionCookie(context, tokenB);
    const page = await context.newPage();

    try {
      await mockExternalApis(page);
      await page.goto(`/vampires/${characterId}`);
      await page.waitForLoadState('networkidle');

      await expect(
        page.getByText("Vous n'êtes pas autorisé à voir cette page.")
      ).toBeVisible();
    } finally {
      await context.close();
      await cleanup(userAId);
      await cleanup(userBId);
    }
  });
});
