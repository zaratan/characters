import { test, expect } from '../fixtures/auth';

const TEMPLATES = [
  { type: '0', era: '0', label: 'Vampire Dark Age' },
  { type: '0', era: '1', label: 'Vampire Victorian' },
  { type: '1', era: '0', label: 'Human Dark Age' },
  { type: '1', era: '1', label: 'Human Victorian' },
  { type: '2', era: '0', label: 'Ghoul Dark Age' },
  { type: '2', era: '1', label: 'Ghoul Victorian' },
];

test.describe('Character creation form at /new', () => {
  test('submit button is disabled when name is empty', async ({
    authenticatedPage,
  }) => {
    await authenticatedPage.goto('/new');

    const submitButton = authenticatedPage.locator('input[type="submit"]');
    await expect(submitButton).toBeDisabled();
  });

  test('submit button is enabled when name is filled', async ({
    authenticatedPage,
  }) => {
    await authenticatedPage.goto('/new');

    const nameInput = authenticatedPage.locator('#new-char-name');
    await nameInput.fill('Mon personnage');

    const submitButton = authenticatedPage.locator('input[type="submit"]');
    await expect(submitButton).toBeEnabled();
  });

  for (const template of TEMPLATES) {
    test(`creates ${template.label}`, async ({ authenticatedPage }) => {
      const name = `Test ${template.label} ${Date.now()}`;

      await authenticatedPage.goto('/new');

      await authenticatedPage.locator('#new-char-name').fill(name);
      await authenticatedPage
        .locator('#new-char-era')
        .selectOption(template.era);
      await authenticatedPage
        .locator('#new-char-type')
        .selectOption(template.type);

      await authenticatedPage.locator('input[type="submit"]').click();

      await expect(authenticatedPage).toHaveURL(/\/vampires\//);
    });
  }

  test('creates character with private sheet checked', async ({
    authenticatedPage,
  }) => {
    const name = `Test Private ${Date.now()}`;

    await authenticatedPage.goto('/new');

    await authenticatedPage.locator('#new-char-name').fill(name);
    await authenticatedPage.locator('#new-char-private').check();

    await authenticatedPage.locator('input[type="submit"]').click();

    await expect(authenticatedPage).toHaveURL(/\/vampires\//);
  });

  test('character name appears on sheet after creation', async ({
    authenticatedPage,
  }) => {
    const name = `Test Sheet Name ${Date.now()}`;

    await authenticatedPage.goto('/new');

    await authenticatedPage.locator('#new-char-name').fill(name);

    await authenticatedPage.locator('input[type="submit"]').click();

    await expect(authenticatedPage).toHaveURL(/\/vampires\//);
    await expect(authenticatedPage.getByText(name)).toBeVisible();
  });
});
