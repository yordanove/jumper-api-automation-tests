/**
 * POST /v1/advanced/routes - Negative Tests
 *
 * Tests error handling for invalid route requests.
 */

import { test, expect } from '@playwright/test';
import { TEST_ADDRESSES } from '../../../data/test-addresses';
import { CHAINS } from '../../../data/chains';
import { errorResponseSchema, ERROR_CODES } from '../../schemas/error.schema';
import { validateSchema } from '../../../utils/schema-validator';

test.describe('POST /v1/advanced/routes - Negative Tests @routes @negative', () => {
  test('@regression - Zero amount returns 400', async ({ request }) => {
    // Arrange
    const requestBody = {
      fromChainId: CHAINS.ETHEREUM,
      fromAmount: '0',
      fromTokenAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      toChainId: CHAINS.POLYGON,
      toTokenAddress: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359',
      fromAddress: TEST_ADDRESSES.EVM_DEFAULT,
    };

    // Act
    const response = await request.post('advanced/routes', {
      data: requestBody,
    });
    const body = await response.json();

    // Assert
    expect(response.status(), 'Should return 400 for zero amount').toBe(400);
    expect(body.code, 'Should return ValidationError code').toBe(ERROR_CODES.VALIDATION_ERROR);
    expect(typeof body.message, 'Error message should be a string').toBe('string');
    expect(body.message.length, 'Error message should not be empty').toBeGreaterThan(0);
  });

  test('@regression - Negative amount returns 400', async ({ request }) => {
    // Arrange
    const requestBody = {
      fromChainId: CHAINS.ETHEREUM,
      fromAmount: '-1000000',
      fromTokenAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      toChainId: CHAINS.POLYGON,
      toTokenAddress: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359',
      fromAddress: TEST_ADDRESSES.EVM_DEFAULT,
    };

    // Act
    const response = await request.post('advanced/routes', {
      data: requestBody,
    });
    const body = await response.json();

    // Assert
    expect(response.status(), 'Should return 400 for negative amount').toBe(400);
    expect(body.code, 'Should return ValidationError code').toBe(ERROR_CODES.VALIDATION_ERROR);
  });

  test('@regression - Missing fromChainId returns 400', async ({ request }) => {
    // Arrange - Omit fromChainId
    const requestBody = {
      fromAmount: '1000000',
      fromTokenAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      toChainId: CHAINS.POLYGON,
      toTokenAddress: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359',
    };

    // Act
    const response = await request.post('advanced/routes', {
      data: requestBody,
    });
    const body = await response.json();

    // Assert
    expect(response.status(), 'Should return 400 for missing fromChainId').toBe(400);
    expect(body.code, 'Should return ValidationError code').toBe(ERROR_CODES.VALIDATION_ERROR);
    expect(typeof body.message, 'Error message should be a string').toBe('string');
    expect(body.message.length, 'Error message should not be empty').toBeGreaterThan(0);
  });

  test('@regression - Missing fromAmount returns 400', async ({ request }) => {
    // Arrange - Omit fromAmount
    const requestBody = {
      fromChainId: CHAINS.ETHEREUM,
      fromTokenAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      toChainId: CHAINS.POLYGON,
      toTokenAddress: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359',
    };

    // Act
    const response = await request.post('advanced/routes', {
      data: requestBody,
    });
    const body = await response.json();

    // Assert
    expect(response.status(), 'Should return 400 for missing fromAmount').toBe(400);
    expect(body.code, 'Should return ValidationError code').toBe(ERROR_CODES.VALIDATION_ERROR);
  });

  test('@regression - Invalid token address returns error', async ({ request }) => {
    // Arrange
    const requestBody = {
      fromChainId: CHAINS.ETHEREUM,
      fromAmount: '1000000',
      fromTokenAddress: 'invalid-token-address',
      toChainId: CHAINS.POLYGON,
      toTokenAddress: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359',
      fromAddress: TEST_ADDRESSES.EVM_DEFAULT,
    };

    // Act
    const response = await request.post('advanced/routes', {
      data: requestBody,
    });
    const body = await response.json();

    // Assert
    expect([400, 404]).toContain(response.status());
    expect(
      [ERROR_CODES.VALIDATION_ERROR, ERROR_CODES.NOT_FOUND_ERROR].includes(body.code),
      'Should return ValidationError or NotFoundError code'
    ).toBe(true);
    expect(typeof body.message, 'Error message should be a string').toBe('string');
    expect(body.message.length, 'Error message should not be empty').toBeGreaterThan(0);
  });

  test('@regression - Invalid chain ID returns error', async ({ request }) => {
    // Arrange
    const requestBody = {
      fromChainId: 999999,
      fromAmount: '1000000',
      fromTokenAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      toChainId: CHAINS.POLYGON,
      toTokenAddress: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359',
      fromAddress: TEST_ADDRESSES.EVM_DEFAULT,
    };

    // Act
    const response = await request.post('advanced/routes', {
      data: requestBody,
    });
    const body = await response.json();

    // Assert
    expect([400, 404]).toContain(response.status());
    expect(
      [ERROR_CODES.VALIDATION_ERROR, ERROR_CODES.NOT_FOUND_ERROR].includes(body.code),
      'Should return ValidationError or NotFoundError code'
    ).toBe(true);
  });

  test('@regression - Empty request body returns 400', async ({ request }) => {
    // Arrange - Send empty body
    const requestBody = {};

    // Act
    const response = await request.post('advanced/routes', {
      data: requestBody,
    });
    const body = await response.json();

    // Assert
    expect(response.status(), 'Should return 400 for empty body').toBe(400);
    expect(body.code, 'Should return ValidationError code').toBe(ERROR_CODES.VALIDATION_ERROR);
    expect(typeof body.message, 'Error message should be a string').toBe('string');
    expect(body.message.length, 'Error message should not be empty').toBeGreaterThan(0);

    // Validate error schema
    const schemaResult = validateSchema(body, errorResponseSchema);
    expect(schemaResult.valid, `Error schema validation: ${schemaResult.errors}`).toBe(true);
  });

  test('@regression - Non-existent token returns 400', async ({ request }) => {
    // Arrange - Use a non-standard address that doesn't exist as a token
    const requestBody = {
      fromChainId: CHAINS.ETHEREUM,
      fromAmount: '1000000',
      fromTokenAddress: '0x0000000000000000000000000000000000000001',
      toChainId: CHAINS.POLYGON,
      toTokenAddress: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359',
      fromAddress: TEST_ADDRESSES.EVM_DEFAULT,
    };

    // Act
    const response = await request.post('advanced/routes', {
      data: requestBody,
    });
    const body = await response.json();

    // Assert - API rejects invalid tokens
    expect(response.status(), 'Should return 400 for non-existent token').toBe(400);
    expect(body.code, 'Should return ValidationError code').toBe(ERROR_CODES.VALIDATION_ERROR);
    expect(body.message, 'Error message should mention invalid token').toMatch(/invalid|deny list/i);
  });

});
