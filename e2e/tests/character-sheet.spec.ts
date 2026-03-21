import type { Page } from '@playwright/test';
import { test, expect } from '../fixtures/auth';
import { mockExternalApis } from '../helpers/mocks';

/**
 * Toggle to edit mode by clicking the "Modifier" footer button.
 * Works for both desktop (role=button) and mobile (text visible).
 */
async function switchToEditMode(page: Page) {
  // The desktop footer renders a span.full-text with the action name inside a
  // role="button" element. We match by the accessible name which Playwright
  // resolves from the full text content of the element.
  const modifierButton = page.getByRole('button', { name: 'Modifier' }).first();
  await modifierButton.click();
  // Confirm transition: button text should now be "Jouer"
  await expect(
    page.getByRole('button', { name: 'Jouer' }).first()
  ).toBeVisible();
}

// ---------------------------------------------------------------------------
// describe: Play Mode
// ---------------------------------------------------------------------------

test.describe('Play Mode', () => {
  test('health squares are clickable', async ({
    authenticatedPage: page,
    testDb,
  }) => {
    await mockExternalApis(page);

    const vampireId = await testDb.seedCharacter({
      name: 'Test Vampire',
      type: 0,
      era: 1,
    });

    await page.goto(`/vampires/${vampireId}`);

    // Wait for the sheet to hydrate
    await page.waitForLoadState('networkidle');

    // Health values: 0=nothing, 1=bashing, 2=lethal, 3=aggravated
    // Click Contusion square to set health from 0 to 1 (bashing)
    const contusionSquare = page
      .getByRole('button', {
        name: 'Contusion',
        exact: true,
      })
      .first();
    await expect(contusionSquare).toBeVisible();
    await expect(contusionSquare).not.toHaveClass(/inactive/);

    const patchPromise = page.waitForResponse(
      (res) =>
        res.url().includes(`/api/vampires/${vampireId}`) &&
        res.request().method() === 'PATCH'
    );

    await contusionSquare.click();

    // After click: SVG path.first should gain "checked" class (value >= 1)
    await expect(contusionSquare.locator('path.first')).toHaveClass(/checked/);

    // Auto-save fires after 500ms debounce
    const patchResponse = await patchPromise;
    expect(patchResponse.ok()).toBeTruthy();
  });

  test('attributes are not editable in play mode', async ({
    authenticatedPage: page,
    testDb,
  }) => {
    await mockExternalApis(page);

    const vampireId = await testDb.seedCharacter({
      name: 'Test Vampire',
      type: 0,
      era: 1,
    });

    await page.goto(`/vampires/${vampireId}`);
    await page.waitForLoadState('networkidle');

    // Dots for the "Force" attribute have aria-label "Force {value}" and
    // role="radio". When inactive, the DotContainer has class "disabled" and
    // tabIndex=-1. We check that the dot at value 3 has the "disabled" class.
    // Default strength is 1, so dot at value 3 is an unselected, inactive dot.
    const strengthDot3 = page.getByRole('radio', { name: 'Force 3' });
    await expect(strengthDot3).toBeVisible();

    // In play mode inactive=true → DotContainer gets class "disabled"
    await expect(strengthDot3).toHaveClass(/disabled/);
  });
});

// ---------------------------------------------------------------------------
// describe: Edit Mode
// ---------------------------------------------------------------------------

test.describe('Edit Mode', () => {
  test('toggle to edit mode changes button text to Jouer', async ({
    authenticatedPage: page,
    testDb,
  }) => {
    await mockExternalApis(page);

    const vampireId = await testDb.seedCharacter({
      name: 'Test Vampire',
      type: 0,
      era: 1,
    });

    await page.goto(`/vampires/${vampireId}`);
    await page.waitForLoadState('networkidle');

    await expect(
      page.getByRole('button', { name: 'Modifier' }).first()
    ).toBeVisible();

    await switchToEditMode(page);

    // After switching, "Jouer" is shown and "Modifier" is gone
    await expect(
      page.getByRole('button', { name: 'Jouer' }).first()
    ).toBeVisible();
  });

  test('modify an attribute dot fills it', async ({
    authenticatedPage: page,
    testDb,
  }) => {
    await mockExternalApis(page);

    const vampireId = await testDb.seedCharacter({
      name: 'Test Vampire',
      type: 0,
      era: 1,
    });

    await page.goto(`/vampires/${vampireId}`);
    await page.waitForLoadState('networkidle');

    await switchToEditMode(page);

    // Default strength is 1. Clicking dot at value 3 should set strength to 3.
    const strengthDot3 = page.getByRole('radio', { name: 'Force 3' });
    await expect(strengthDot3).toBeVisible();

    // In edit mode the dot should NOT have the disabled class
    await expect(strengthDot3).not.toHaveClass(/disabled/);

    await strengthDot3.click();

    // After clicking, the dot at value 3 becomes selected (class "selected")
    await expect(strengthDot3).toHaveClass(/selected/);
  });

  test('save button appears after modifying an attribute', async ({
    authenticatedPage: page,
    testDb,
  }) => {
    await mockExternalApis(page);

    const vampireId = await testDb.seedCharacter({
      name: 'Test Vampire',
      type: 0,
      era: 1,
    });

    await page.goto(`/vampires/${vampireId}`);
    await page.waitForLoadState('networkidle');

    await switchToEditMode(page);

    // Save button should not be visible yet (no unsaved changes)
    await expect(
      page.getByRole('button', { name: 'Sauver' }).first()
    ).not.toBeVisible();

    // Modify an attribute
    const strengthDot3 = page.getByRole('radio', { name: 'Force 3' });
    await strengthDot3.click();

    // The 💾 save button appears when editMode && unsavedChanges
    await expect(
      page.getByRole('button', { name: 'Sauver' }).first()
    ).toBeVisible();
  });

  test('save persists attribute change after page reload', async ({
    authenticatedPage: page,
    testDb,
  }) => {
    await mockExternalApis(page);

    const vampireId = await testDb.seedCharacter({
      name: 'Test Vampire',
      type: 0,
      era: 1,
    });

    await page.goto(`/vampires/${vampireId}`);
    await page.waitForLoadState('networkidle');

    await switchToEditMode(page);

    // Modify strength to 3
    const strengthDot3 = page.getByRole('radio', { name: 'Force 3' });
    await strengthDot3.click();

    // Wait for save button to appear, then click it
    const saveButton = page.getByRole('button', { name: 'Sauver' }).first();
    await expect(saveButton).toBeVisible();

    // The save action issues a PUT to /api/vampires/{id}
    const putPromise = page.waitForResponse(
      (res) =>
        res.url().includes(`/api/vampires/${vampireId}`) &&
        res.request().method() === 'PUT'
    );

    await saveButton.click();
    await putPromise;

    // Reload and verify the change persisted
    await mockExternalApis(page);
    await page.goto(`/vampires/${vampireId}`);
    await page.waitForLoadState('networkidle');

    // After reload we are back in play mode; switch to edit mode to inspect dots
    await switchToEditMode(page);

    // Dot at value 3 should now be "selected" (strength === 3)
    await expect(page.getByRole('radio', { name: 'Force 3' })).toHaveClass(
      /selected/
    );
  });

  test('rollback reverts attribute change', async ({
    authenticatedPage: page,
    testDb,
  }) => {
    await mockExternalApis(page);

    const vampireId = await testDb.seedCharacter({
      name: 'Test Vampire',
      type: 0,
      era: 1,
    });

    await page.goto(`/vampires/${vampireId}`);
    await page.waitForLoadState('networkidle');

    await switchToEditMode(page);

    // Modify strength to 3
    const strengthDot3 = page.getByRole('radio', { name: 'Force 3' });
    await strengthDot3.click();
    await expect(strengthDot3).toHaveClass(/selected/);

    // Click rollback (←)
    const rollbackButton = page
      .getByRole('button', { name: 'Annuler' })
      .first();
    await expect(rollbackButton).toBeVisible();
    await rollbackButton.click();

    // After rollback the dot at 3 should no longer be selected;
    // strength returns to 1 (dot 1 is selected)
    await expect(strengthDot3).not.toHaveClass(/selected/);
    const strengthDot1 = page.getByRole('radio', { name: 'Force 1' });
    await expect(strengthDot1).toHaveClass(/selected/);
  });
});

// ---------------------------------------------------------------------------
// describe: Generation
// ---------------------------------------------------------------------------

test.describe('Generation', () => {
  test('changing generation from 12 to 8 increases blood pool size', async ({
    authenticatedPage: page,
    testDb,
  }) => {
    await mockExternalApis(page);

    // Default generation is 12 → maxBlood(12) = 11 squares
    const vampireId = await testDb.seedCharacter({
      name: 'Test Vampire',
      type: 0,
      era: 1,
    });

    await page.goto(`/vampires/${vampireId}`);
    await page.waitForLoadState('networkidle');

    // Count blood squares at gen 12: there should be 11 (indices 0–10)
    // Each square has aria-label "Sang {i}" (from SquareLine: name=`${type} ${i}`)
    const bloodSquaresInitial = page.getByRole('button', {
      name: /^Sang \d+$/,
    });
    await expect(bloodSquaresInitial).toHaveCount(11);

    await switchToEditMode(page);

    // Change generation to 8 → maxBlood(8) = 15 squares
    const generationInput = page.locator(
      'input[type="number"][min="3"][max="15"]'
    );
    await expect(generationInput).toBeVisible();
    await generationInput.fill('8');
    // Trigger the change event
    await generationInput.dispatchEvent('input');
    await generationInput.blur();

    // Blood pool should now show 15 squares
    const bloodSquaresUpdated = page.getByRole('button', {
      name: /^Sang \d+$/,
    });
    await expect(bloodSquaresUpdated).toHaveCount(15);
  });
});

// ---------------------------------------------------------------------------
// describe: Thaumaturgy
// ---------------------------------------------------------------------------

test.describe('Thaumaturgy', () => {
  test('toggling Th on a clan discipline shows Voies section', async ({
    authenticatedPage: page,
    testDb,
  }) => {
    await mockExternalApis(page);

    const vampireId = await testDb.seedCharacter({
      name: 'Test Vampire',
      type: 0,
      era: 1,
    });

    await page.goto(`/vampires/${vampireId}`);
    await page.waitForLoadState('networkidle');

    await switchToEditMode(page);

    // Add a clan discipline — ColumnButton has aria-label="Add a new Clan"
    const addClanButton = page.getByRole('button', {
      name: 'Add a new Clan',
    });
    await addClanButton.click();

    // The Th toggle button is a Glyph with aria-label="Action {title}"
    // For a new empty discipline, title is "", so aria-label="Action "
    // Use the .line-button container text as a reliable selector
    const thButton = page.locator('.line-button').getByText('Th').first();
    await thButton.click();

    // "Voies de " section heading should now be visible
    await expect(page.getByText(/Voies de/)).toBeVisible();
  });

  test('adding a path to thaumaturgy shows a new path row', async ({
    authenticatedPage: page,
    testDb,
  }) => {
    await mockExternalApis(page);

    const vampireId = await testDb.seedCharacter({
      name: 'Test Vampire',
      type: 0,
      era: 1,
    });

    await page.goto(`/vampires/${vampireId}`);
    await page.waitForLoadState('networkidle');

    await switchToEditMode(page);

    // Add a clan discipline
    const addClanButton = page.getByRole('button', {
      name: 'Add a new Clan',
    });
    await addClanButton.click();

    // Enable thaumaturgy on it
    const thButton = page.locator('.line-button').getByText('Th').first();
    await thButton.click();

    // "Voies de" section is now visible
    await expect(page.getByText(/Voies de/)).toBeVisible();

    // The "+" button to add a path — ColumnButton has aria-label="Add a new Voies de {name}"
    const addPathButton = page.getByRole('button', {
      name: /Add a new Voies de/,
    });
    await addPathButton.click();

    // A new path Line should appear — it has a placeholder "Nom de la voie"
    const pathInput = page.getByPlaceholder('Nom de la voie');
    await expect(pathInput).toBeVisible();
  });
});
