import { test as baseTest, expect } from '@playwright/test';
import { test } from '../fixtures/auth';
import AxeBuilder from '@axe-core/playwright';
import type { Page } from '@playwright/test';
import { mockExternalApis } from '../helpers/mocks';

// Known a11y issues to fix later — excluded so the test suite stays green.
// TODO: fix these and remove from the exclusion list (see Phase 5b in TODO.md).
const EXCLUDED_RULES: string[] = [];

async function runAxeAudit(page: Page) {
  const fullResults = await new AxeBuilder({ page }).analyze();

  const skippedViolations = fullResults.violations.filter((v) =>
    EXCLUDED_RULES.includes(v.id)
  );
  const violations = fullResults.violations.filter(
    (v) => !EXCLUDED_RULES.includes(v.id)
  );

  if (skippedViolations.length > 0) {
    console.log(
      `[a11y] Known violations (excluded): ${skippedViolations.map((v) => `${v.id} (${v.nodes.length} nodes)`).join(', ')}`
    );
  }

  for (const v of violations) {
    console.log(`[a11y] ${v.id} (${v.impact}, ${v.nodes.length} nodes):`);
    for (const node of v.nodes) {
      console.log(`  - ${node.target.join(' > ')}`);
      console.log(`    ${node.html.slice(0, 120)}`);
    }
  }
  expect(violations).toEqual([]);
}

// ---------------------------------------------------------------------------
// Unauthenticated pages
// ---------------------------------------------------------------------------

baseTest.describe('Accessibility — home page', () => {
  baseTest(
    'home page (/) has no critical accessibility violations',
    async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      await runAxeAudit(page);
    }
  );
});

// ---------------------------------------------------------------------------
// Authenticated pages
// ---------------------------------------------------------------------------

test.describe('Accessibility — authenticated pages', () => {
  test('create page (/new) has no critical accessibility violations', async ({
    authenticatedPage: page,
  }) => {
    await page.goto('/new');
    await page.waitForLoadState('networkidle');
    await runAxeAudit(page);
  });

  test('character sheet (/vampires/{id}) has no critical accessibility violations', async ({
    authenticatedPage: page,
    testDb,
  }) => {
    await mockExternalApis(page);
    const vampireId = await testDb.seedCharacter({ name: 'A11y Sheet Char' });
    await page.goto(`/vampires/${vampireId}`);
    await page.waitForLoadState('networkidle');
    await runAxeAudit(page);
  });

  test('config page (/vampires/{id}/config) has no critical accessibility violations', async ({
    authenticatedPage: page,
    testDb,
  }) => {
    await mockExternalApis(page);
    const vampireId = await testDb.seedCharacter({ name: 'A11y Config Char' });
    await page.goto(`/vampires/${vampireId}/config`);
    await page.waitForLoadState('networkidle');
    await runAxeAudit(page);
  });

  test('profile page (/profile) has no critical accessibility violations', async ({
    authenticatedPage: page,
  }) => {
    await page.goto('/profile');
    await page.waitForLoadState('networkidle');
    await runAxeAudit(page);
  });
});
