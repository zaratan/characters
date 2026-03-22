import { test, expect } from '../fixtures/auth';
import { mockExternalApis } from '../helpers/mocks';

// ---------------------------------------------------------------------------
// Visual regression — authenticated pages with controlled data
// ---------------------------------------------------------------------------

test.describe('Visual regression', () => {
  test('character sheet — light mode', async ({
    authenticatedPage,
    testDb,
  }) => {
    await mockExternalApis(authenticatedPage);
    const characterId = await testDb.seedCharacter({
      name: 'VisualTest',
    });

    await authenticatedPage.goto(`/vampires/${characterId}`);
    await authenticatedPage.waitForLoadState('networkidle');
    await expect(authenticatedPage).toHaveScreenshot('sheet-light.png');
  });

  test('character sheet — dark mode', async ({ authenticatedPage, testDb }) => {
    await mockExternalApis(authenticatedPage);
    await authenticatedPage.addInitScript(() => {
      localStorage.setItem('ThemeContext:darkMode', 'true');
    });
    const characterId = await testDb.seedCharacter({
      name: 'VisualTest',
    });

    await authenticatedPage.goto(`/vampires/${characterId}`);
    await authenticatedPage.waitForLoadState('networkidle');
    await expect(authenticatedPage).toHaveScreenshot('sheet-dark.png');
  });

  test('config page — light mode', async ({ authenticatedPage, testDb }) => {
    await mockExternalApis(authenticatedPage);
    const characterId = await testDb.seedCharacter({
      name: 'VisualConfig',
    });

    await authenticatedPage.goto(`/vampires/${characterId}/config`);
    await authenticatedPage.waitForLoadState('networkidle');
    await expect(authenticatedPage).toHaveScreenshot('config-light.png');
  });

  test('config page — dark mode', async ({ authenticatedPage, testDb }) => {
    await mockExternalApis(authenticatedPage);
    await authenticatedPage.addInitScript(() => {
      localStorage.setItem('ThemeContext:darkMode', 'true');
    });
    const characterId = await testDb.seedCharacter({
      name: 'VisualConfig',
    });

    await authenticatedPage.goto(`/vampires/${characterId}/config`);
    await authenticatedPage.waitForLoadState('networkidle');
    await expect(authenticatedPage).toHaveScreenshot('config-dark.png');
  });
});
