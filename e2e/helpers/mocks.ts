import type { Page } from '@playwright/test';

/**
 * Mock the external wod.zaratan.fr API so tests are not flaky due to network.
 */
export async function mockExternalApis(page: Page) {
  await page.route('**wod.zaratan.fr/**', (route) =>
    route.fulfill({ status: 200, body: JSON.stringify([]) })
  );
}
