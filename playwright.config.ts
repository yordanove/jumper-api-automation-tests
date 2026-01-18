import { defineConfig } from '@playwright/test';

// Normalize API_BASE_URL to ensure trailing slash
const baseUrl = (() => {
  const url = process.env.API_BASE_URL || 'https://li.quest/v1/';
  return url.endsWith('/') ? url : `${url}/`;
})();

export default defineConfig({
  testDir: './automation/tests',

  // API-only testing - no browser needed
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined, // Serial execution in CI to avoid API rate limits

  // Reporter configuration
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
    [
      'allure-playwright',
      {
        detail: true,
        outputFolder: 'allure-results',
        suiteTitle: true,
        environmentInfo: {
          'Base URL': baseUrl,
          'Node Version': process.version,
          'Test Environment': process.env.TEST_ENV || 'production',
        },
      },
    ],
  ],

  // Global timeout settings
  timeout: 60000,
  expect: {
    timeout: 10000,
  },

  // Use configuration for API testing
  use: {
    baseURL: baseUrl,
    extraHTTPHeaders: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    trace: 'on-first-retry',
  },

  // Project configuration - single project, use --grep for filtering
  projects: [
    {
      name: 'api-tests',
      testMatch: /.*\.spec\.ts$/,
    },
  ],
});
