/**
 * GET /v1/tokens & GET /v1/token - Negative Tests
 *
 * Tests error handling for invalid token requests.
 */

import { test, expect } from '@playwright/test';
import { CHAINS } from '../../../data/chains';
import { TEST_ADDRESSES } from '../../../data/test-addresses';
import { ERROR_CODES } from '../../schemas/error.schema';

test.describe('GET /v1/tokens - Negative Tests @tokens @negative', () => {
  test('@regression - Invalid chain ID returns empty or error', async ({ request }) => {
    const params = new URLSearchParams({
      chains: '999999',
    });

    const response = await request.get(`tokens?${params}`);
    const body = await response.json();

    // API may return 200 with empty tokens or error
    if (response.status() === 200) {
      expect(body.tokens, 'Should have tokens object').toBeDefined();
      const tokens = body.tokens['999999'];
      expect(
        tokens === undefined || tokens.length === 0,
        'Should have no tokens for invalid chain'
      ).toBe(true);
    } else {
      expect([400, 404]).toContain(response.status());
      if (body.code !== undefined) {
        expect(
          [ERROR_CODES.VALIDATION_ERROR, ERROR_CODES.NOT_FOUND_ERROR].includes(body.code),
          'Should return ValidationError or NotFoundError code'
        ).toBe(true);
      }
      expect(body.message, 'Error message should mention chain').toMatch(/chain/i);
    }
  });

  test('@regression - Non-numeric chain ID returns error', async ({ request }) => {
    const params = new URLSearchParams({
      chains: 'invalid',
    });

    const response = await request.get(`tokens?${params}`);
    const body = await response.json();

    expect([400, 404]).toContain(response.status());
    if (body.code !== undefined) {
      expect(
        [ERROR_CODES.VALIDATION_ERROR, ERROR_CODES.NOT_FOUND_ERROR].includes(body.code),
        'Should return ValidationError or NotFoundError code'
      ).toBe(true);
    }
    expect(typeof body.message, 'Error message should be a string').toBe('string');
    expect(body.message, 'Error message should mention chain').toMatch(/chain/i);
  });

  test('@regression - Negative chain ID returns error or empty', async ({ request }) => {
    const params = new URLSearchParams({
      chains: '-1',
    });

    const response = await request.get(`tokens?${params}`);
    const body = await response.json();

    if (response.status() === 200) {
      expect(body.tokens['-1'], 'Should have no tokens for negative chain').toBeUndefined();
    } else {
      expect([400, 404]).toContain(response.status());
      if (body.code !== undefined) {
        expect(
          [ERROR_CODES.VALIDATION_ERROR, ERROR_CODES.NOT_FOUND_ERROR].includes(body.code),
          'Should return ValidationError or NotFoundError code'
        ).toBe(true);
      }
      expect(body.message, 'Error message should mention chain').toMatch(/chain/i);
    }
  });
});

test.describe('GET /v1/token - Negative Tests @tokens @negative', () => {
  test('@regression - Invalid token symbol returns 400', async ({ request }) => {
    const params = new URLSearchParams({
      chain: CHAINS.ETHEREUM.toString(),
      token: 'INVALID_TOKEN_XYZ',
    });

    const response = await request.get(`token?${params}`);
    const body = await response.json();

    expect(response.status(), 'Should return 400 for invalid token').toBe(400);
    expect(body.code, 'Should return ValidationError code').toBe(ERROR_CODES.VALIDATION_ERROR);
    expect(typeof body.message, 'Error message should be a string').toBe('string');
    expect(body.message, 'Error message should mention token').toMatch(/token/i);
  });

  test('@regression - Missing token parameter returns 400', async ({ request }) => {
    const params = new URLSearchParams({
      chain: CHAINS.ETHEREUM.toString(),
    });

    const response = await request.get(`token?${params}`);
    const body = await response.json();

    expect(response.status(), 'Should return 400 for missing token').toBe(400);
    expect(body.code, 'Should return ValidationError code').toBe(ERROR_CODES.VALIDATION_ERROR);
    expect(body.message, 'Error message should mention token').toMatch(/token/i);
  });

  test('@regression - Missing chain parameter returns 400', async ({ request }) => {
    const params = new URLSearchParams({
      token: 'USDC',
    });

    const response = await request.get(`token?${params}`);
    const body = await response.json();

    expect(response.status(), 'Should return 400 for missing chain').toBe(400);
    expect(body.code, 'Should return ValidationError code').toBe(ERROR_CODES.VALIDATION_ERROR);
    expect(body.message, 'Error message should mention chain').toMatch(/chain/i);
  });

  test('@regression - Invalid chain ID returns 400', async ({ request }) => {
    const params = new URLSearchParams({
      chain: '999999',
      token: 'USDC',
    });

    const response = await request.get(`token?${params}`);
    const body = await response.json();

    expect(response.status(), 'Should return 400 for invalid chain').toBe(400);
    expect(body.code, 'Should return ValidationError code').toBe(ERROR_CODES.VALIDATION_ERROR);
  });

  test('@regression - Non-numeric chain ID returns 400', async ({ request }) => {
    const params = new URLSearchParams({
      chain: 'invalid',
      token: 'USDC',
    });

    const response = await request.get(`token?${params}`);
    const body = await response.json();

    expect(response.status(), 'Should return 400 for non-numeric chain').toBe(400);
    expect(body.code, 'Should return ValidationError code').toBe(ERROR_CODES.VALIDATION_ERROR);
  });

  test('@regression - Invalid token address format returns 400', async ({ request }) => {
    const params = new URLSearchParams({
      chain: CHAINS.ETHEREUM.toString(),
      token: TEST_ADDRESSES.INVALID.NOT_HEX,
    });

    const response = await request.get(`token?${params}`);
    const body = await response.json();

    expect(response.status(), 'Should return 400 for invalid address').toBe(400);
    expect(body.code, 'Should return ValidationError code').toBe(ERROR_CODES.VALIDATION_ERROR);
    expect(body.message, 'Error message should mention token or address').toMatch(/token|address/i);
  });

  test('@regression - Non-existent token address returns 400', async ({ request }) => {
    const params = new URLSearchParams({
      chain: CHAINS.ETHEREUM.toString(),
      token: '0x0000000000000000000000000000000000000001', // Valid format but not a real token
    });

    const response = await request.get(`token?${params}`);
    const body = await response.json();

    expect(response.status(), 'Should return 400 for non-existent token').toBe(400);
    expect(body.code, 'Should return ValidationError code').toBe(ERROR_CODES.VALIDATION_ERROR);
  });
});
