/**
 * Playwright fixtures for API testing
 */

import { test as base } from '@playwright/test';
import { LiFiApiClient } from '../utils/api-client';

type ApiFixtures = {
  apiClient: LiFiApiClient;
};

/**
 * Extended test with API client fixture
 */
export const test = base.extend<ApiFixtures>({
  apiClient: async ({ request }, use) => {
    const client = new LiFiApiClient(request);
    await use(client);
  },
});

export { expect } from '@playwright/test';
