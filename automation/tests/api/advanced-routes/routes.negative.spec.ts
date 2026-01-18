/**
 * POST /v1/advanced/routes - Negative Tests
 *
 * Tests error handling for invalid route requests.
 */

import { test, expect } from '@playwright/test';
import { TEST_ADDRESSES } from '../../../data/test-addresses';
import { CHAINS } from '../../../data/chains';
import { TOKENS } from '../../../data/tokens';
import { errorResponseSchema, ERROR_CODES } from '../../schemas/error.schema';
import { validateSchema } from '../../../utils/schema-validator';

test.describe('POST /v1/advanced/routes - Negative Tests @routes @negative', () => {
  test('@regression - Zero amount returns 400', async ({ request }) => {
    const requestBody = {
      fromChainId: CHAINS.ETHEREUM,
      fromAmount: '0',
      fromTokenAddress: TOKENS[CHAINS.ETHEREUM].USDC.address,
      toChainId: CHAINS.POLYGON,
      toTokenAddress: TOKENS[CHAINS.POLYGON].USDC.address,
      fromAddress: TEST_ADDRESSES.EVM_DEFAULT,
    };

    const response = await request.post('advanced/routes', {
      data: requestBody,
    });
    const body = await response.json();

    expect(response.status(), 'Should return 400 for zero amount').toBe(400);
    expect(body.code, 'Should return ValidationError code').toBe(ERROR_CODES.VALIDATION_ERROR);
    expect(typeof body.message, 'Error message should be a string').toBe('string');
    expect(body.message.length, 'Error message should not be empty').toBeGreaterThan(0);
    expect(body.message, 'Error message should mention amount').toMatch(/amount/i);
  });

  test('@regression - Negative amount returns 400', async ({ request }) => {
    const requestBody = {
      fromChainId: CHAINS.ETHEREUM,
      fromAmount: '-1000000',
      fromTokenAddress: TOKENS[CHAINS.ETHEREUM].USDC.address,
      toChainId: CHAINS.POLYGON,
      toTokenAddress: TOKENS[CHAINS.POLYGON].USDC.address,
      fromAddress: TEST_ADDRESSES.EVM_DEFAULT,
    };

    const response = await request.post('advanced/routes', {
      data: requestBody,
    });
    const body = await response.json();

    expect(response.status(), 'Should return 400 for negative amount').toBe(400);
    expect(body.code, 'Should return ValidationError code').toBe(ERROR_CODES.VALIDATION_ERROR);
    expect(body.message, 'Error message should mention amount').toMatch(/amount/i);
  });

  test('@regression - Missing fromChainId returns 400', async ({ request }) => {
    const requestBody = {
      fromAmount: '1000000',
      fromTokenAddress: TOKENS[CHAINS.ETHEREUM].USDC.address,
      toChainId: CHAINS.POLYGON,
      toTokenAddress: TOKENS[CHAINS.POLYGON].USDC.address,
    };

    const response = await request.post('advanced/routes', {
      data: requestBody,
    });
    const body = await response.json();

    expect(response.status(), 'Should return 400 for missing fromChainId').toBe(400);
    expect(body.code, 'Should return ValidationError code').toBe(ERROR_CODES.VALIDATION_ERROR);
    expect(typeof body.message, 'Error message should be a string').toBe('string');
    expect(body.message.length, 'Error message should not be empty').toBeGreaterThan(0);
    expect(body.message, 'Error message should mention fromChainId').toMatch(/fromChainId/i);
  });

  test('@regression - Missing fromAmount returns 400', async ({ request }) => {
    const requestBody = {
      fromChainId: CHAINS.ETHEREUM,
      fromTokenAddress: TOKENS[CHAINS.ETHEREUM].USDC.address,
      toChainId: CHAINS.POLYGON,
      toTokenAddress: TOKENS[CHAINS.POLYGON].USDC.address,
    };

    const response = await request.post('advanced/routes', {
      data: requestBody,
    });
    const body = await response.json();

    expect(response.status(), 'Should return 400 for missing fromAmount').toBe(400);
    expect(body.code, 'Should return ValidationError code').toBe(ERROR_CODES.VALIDATION_ERROR);
    expect(body.message, 'Error message should mention fromAmount').toMatch(/fromAmount/i);
  });

  test('@regression - Invalid token address returns error', async ({ request }) => {
    const requestBody = {
      fromChainId: CHAINS.ETHEREUM,
      fromAmount: '1000000',
      fromTokenAddress: TEST_ADDRESSES.INVALID.NOT_HEX,
      toChainId: CHAINS.POLYGON,
      toTokenAddress: TOKENS[CHAINS.POLYGON].USDC.address,
      fromAddress: TEST_ADDRESSES.EVM_DEFAULT,
    };

    const response = await request.post('advanced/routes', {
      data: requestBody,
    });
    const body = await response.json();

    expect([400, 404]).toContain(response.status());
    expect(
      [ERROR_CODES.VALIDATION_ERROR, ERROR_CODES.NOT_FOUND_ERROR].includes(body.code),
      'Should return ValidationError or NotFoundError code'
    ).toBe(true);
    expect(typeof body.message, 'Error message should be a string').toBe('string');
    expect(body.message.length, 'Error message should not be empty').toBeGreaterThan(0);
    expect(body.message, 'Error message should mention token or address').toMatch(/token|address/i);
  });

  test('@regression - Invalid chain ID returns error', async ({ request }) => {
    const requestBody = {
      fromChainId: 999999,
      fromAmount: '1000000',
      fromTokenAddress: TOKENS[CHAINS.ETHEREUM].USDC.address,
      toChainId: CHAINS.POLYGON,
      toTokenAddress: TOKENS[CHAINS.POLYGON].USDC.address,
      fromAddress: TEST_ADDRESSES.EVM_DEFAULT,
    };

    const response = await request.post('advanced/routes', {
      data: requestBody,
    });
    const body = await response.json();

    expect([400, 404]).toContain(response.status());
    expect(
      [ERROR_CODES.VALIDATION_ERROR, ERROR_CODES.NOT_FOUND_ERROR].includes(body.code),
      'Should return ValidationError or NotFoundError code'
    ).toBe(true);
    expect(body.message, 'Error message should mention chain').toMatch(/chain/i);
  });

  test('@regression - Empty request body returns 400', async ({ request }) => {
    const requestBody = {};

    const response = await request.post('advanced/routes', {
      data: requestBody,
    });
    const body = await response.json();

    expect(response.status(), 'Should return 400 for empty body').toBe(400);
    expect(body.code, 'Should return ValidationError code').toBe(ERROR_CODES.VALIDATION_ERROR);
    expect(typeof body.message, 'Error message should be a string').toBe('string');
    expect(body.message.length, 'Error message should not be empty').toBeGreaterThan(0);

    const schemaResult = validateSchema(body, errorResponseSchema);
    expect(schemaResult.valid, `Error schema validation: ${schemaResult.errors}`).toBe(true);
  });

  test('@regression - Non-existent token returns 400', async ({ request }) => {
    const requestBody = {
      fromChainId: CHAINS.ETHEREUM,
      fromAmount: '1000000',
      fromTokenAddress: '0x0000000000000000000000000000000000000001', // Non-existent token
      toChainId: CHAINS.POLYGON,
      toTokenAddress: TOKENS[CHAINS.POLYGON].USDC.address,
      fromAddress: TEST_ADDRESSES.EVM_DEFAULT,
    };

    const response = await request.post('advanced/routes', {
      data: requestBody,
    });
    const body = await response.json();

    expect(response.status(), 'Should return 400 for non-existent token').toBe(400);
    expect(body.code, 'Should return ValidationError code').toBe(ERROR_CODES.VALIDATION_ERROR);
    expect(body.message, 'Error message should mention invalid token').toMatch(/invalid|deny list/i);
  });
});
