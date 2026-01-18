/**
 * GET /v1/tools - Negative Tests
 *
 * Tests error handling and edge cases for the tools endpoint.
 */

import { test, expect } from '@playwright/test';
import { ERROR_CODES } from '../../schemas/error.schema';

test.describe('GET /v1/tools - Negative Tests @tools @negative', () => {
  test('@regression - Invalid chain ID returns 400', async ({ request }) => {
    const response = await request.get('tools?chains=999999999');
    const body = await response.json();

    expect(response.status(), 'Should return 400 for invalid chain').toBe(400);
    expect(body.code, 'Should return ValidationError code').toBe(ERROR_CODES.VALIDATION_ERROR);
    expect(typeof body.message, 'Error message should be a string').toBe('string');
    expect(body.message.length, 'Error message should not be empty').toBeGreaterThan(0);
    expect(body.message, 'Error message should mention chain').toMatch(/chain/i);
  });

  test('@regression - Invalid chain format returns 400', async ({ request }) => {
    const response = await request.get('tools?chains=invalid');
    const body = await response.json();

    expect(response.status(), 'Should return 400 for invalid chain format').toBe(400);
    expect(body.code, 'Should return ValidationError code').toBe(ERROR_CODES.VALIDATION_ERROR);
    expect(typeof body.message, 'Error message should be a string').toBe('string');
    expect(body.message.length, 'Error message should not be empty').toBeGreaterThan(0);
    expect(body.message, 'Error message should mention chain').toMatch(/chain/i);
  });

  test('@regression - Empty chains parameter returns error', async ({ request }) => {
    const response = await request.get('tools?chains=');
    const body = await response.json();

    expect(response.status(), 'Should return 400 for empty chains').toBe(400);
    expect(body.code, 'Should return ValidationError code').toBe(ERROR_CODES.VALIDATION_ERROR);
    expect(typeof body.message, 'Error message should be a string').toBe('string');
    expect(body.message.length, 'Error message should not be empty').toBeGreaterThan(0);
    expect(body.message, 'Error message should mention chain').toMatch(/chain/i);
  });

  test('@regression - Very large chain ID returns 400', async ({ request }) => {
    const response = await request.get('tools?chains=99999999999999999999');
    const body = await response.json();

    expect(response.status(), 'Should return 400 for very large chain ID').toBe(400);
    expect(body.code, 'Should return ValidationError code').toBe(ERROR_CODES.VALIDATION_ERROR);
    expect(typeof body.message, 'Error message should be a string').toBe('string');
    expect(body.message.length, 'Error message should not be empty').toBeGreaterThan(0);
    expect(body.message, 'Error message should mention chain').toMatch(/chain/i);
  });

  test('@regression - Negative chain ID returns 400', async ({ request }) => {
    const response = await request.get('tools?chains=-1');
    const body = await response.json();

    expect(response.status(), 'Should return 400 for negative chain ID').toBe(400);
    expect(body.code, 'Should return ValidationError code').toBe(ERROR_CODES.VALIDATION_ERROR);
    expect(typeof body.message, 'Error message should be a string').toBe('string');
    expect(body.message.length, 'Error message should not be empty').toBeGreaterThan(0);
    expect(body.message, 'Error message should mention chain').toMatch(/chain/i);
  });

  test('@regression - Mixed valid and invalid chains returns 400', async ({ request }) => {
    const response = await request.get('tools?chains=1,invalid,137');
    const body = await response.json();

    expect(response.status(), 'Should return 400 for mixed valid/invalid chains').toBe(400);
    expect(body.code, 'Should return ValidationError code').toBe(ERROR_CODES.VALIDATION_ERROR);
    expect(typeof body.message, 'Error message should be a string').toBe('string');
    expect(body.message.length, 'Error message should not be empty').toBeGreaterThan(0);
    expect(body.message, 'Error message should mention chain').toMatch(/chain/i);
  });

  test('@regression - Duplicate chain IDs are handled', async ({ request }) => {
    const response = await request.get('tools?chains=1,1,1');
    const body = await response.json();

    expect(response.status()).toBe(200);
    expect(Array.isArray(body.bridges), 'bridges should be an array').toBe(true);
    expect(Array.isArray(body.exchanges), 'exchanges should be an array').toBe(true);
  });
});
