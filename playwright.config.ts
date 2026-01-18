import { defineConfig } from '@playwright/test';

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
          'Base URL': process.env.API_BASE_URL || 'https://li.quest/v1',
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
    baseURL: process.env.API_BASE_URL || 'https://li.quest/v1/',
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
