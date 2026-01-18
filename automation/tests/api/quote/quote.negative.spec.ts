/**
 * GET /v1/quote - Negative Tests
 *
 * Tests error handling for invalid inputs including:
 * - Invalid token addresses/symbols
 * - Zero and negative amounts
 * - Missing required fields
 * - Invalid chain IDs
 * - Invalid wallet addresses
 */

import { test, expect } from '@playwright/test';
import { NEGATIVE_TEST_CASES } from '../../../data/test-pairs';
import { TEST_ADDRESSES } from '../../../data/test-addresses';
import { CHAINS } from '../../../data/chains';
import { errorResponseSchema, ERROR_CODES } from '../../schemas/error.schema';
import { validateSchema } from '../../../utils/schema-validator';

test.describe('GET /v1/quote - Negative Tests @quote @negative', () => {
  test('@regression - Invalid token returns error', async ({ request }) => {
    const testCase = NEGATIVE_TEST_CASES.INVALID_TOKEN;

    // Arrange
    const params = new URLSearchParams({
      fromChain: testCase.fromChain.toString(),
      toChain: testCase.toChain.toString(),
      fromToken: testCase.fromToken,
      toToken: testCase.toToken,
      fromAmount: testCase.fromAmount,
      fromAddress: TEST_ADDRESSES.EVM_DEFAULT,
    });

    // Act
    const response = await request.get(`quote?${params}`);
    const body = await response.json();

    // Assert - API returns 400 for validation errors including invalid tokens
    expect(response.status(), 'Should return 400 for invalid token').toBe(400);
    expect(body.code, 'Should return ValidationError code').toBe(ERROR_CODES.VALIDATION_ERROR);
    expect(typeof body.message, 'Error message should be a string').toBe('string');
    expect(body.message.length, 'Error message should not be empty').toBeGreaterThan(0);

    // Validate error response structure
    const schemaResult = validateSchema(body, errorResponseSchema);
    expect(schemaResult.valid, `Error schema validation failed: ${schemaResult.errors}`).toBe(true);
  });

  test('@regression - Zero amount returns 400 with validation error', async ({ request }) => {
    const testCase = NEGATIVE_TEST_CASES.ZERO_AMOUNT;

    // Arrange
    const params = new URLSearchParams({
      fromChain: testCase.fromChain.toString(),
      toChain: testCase.toChain.toString(),
      fromToken: testCase.fromToken,
      toToken: testCase.toToken,
      fromAmount: testCase.fromAmount,
      fromAddress: TEST_ADDRESSES.EVM_DEFAULT,
    });

    // Act
    const response = await request.get(`quote?${params}`);
    const body = await response.json();

    // Assert
    expect(response.status(), 'Should return 400 for zero amount').toBe(400);
    expect(typeof body.message, 'Error message should be a string').toBe('string');
    expect(body.message.length, 'Error message should not be empty').toBeGreaterThan(0);
    expect(body.code, 'Error code should be validation error').toBe(ERROR_CODES.VALIDATION_ERROR);
  });

  test('@regression - Negative amount returns 400', async ({ request }) => {
    const testCase = NEGATIVE_TEST_CASES.NEGATIVE_AMOUNT;

    // Arrange
    const params = new URLSearchParams({
      fromChain: testCase.fromChain.toString(),
      toChain: testCase.toChain.toString(),
      fromToken: testCase.fromToken,
      toToken: testCase.toToken,
      fromAmount: testCase.fromAmount,
      fromAddress: TEST_ADDRESSES.EVM_DEFAULT,
    });

    // Act
    const response = await request.get(`quote?${params}`);
    const body = await response.json();

    // Assert
    expect(response.status(), 'Should return 400 for negative amount').toBe(400);
    expect(body.code, 'Should return ValidationError code').toBe(ERROR_CODES.VALIDATION_ERROR);
    expect(typeof body.message, 'Error message should be a string').toBe('string');
    expect(body.message.length, 'Error message should not be empty').toBeGreaterThan(0);
  });

  test('@regression - Missing fromAmount returns 400', async ({ request }) => {
    // Arrange - Omit fromAmount parameter
    const params = new URLSearchParams({
      fromChain: CHAINS.ETHEREUM.toString(),
      toChain: CHAINS.POLYGON.toString(),
      fromToken: 'USDC',
      toToken: 'USDC',
      fromAddress: TEST_ADDRESSES.EVM_DEFAULT,
    });

    // Act
    const response = await request.get(`quote?${params}`);
    const body = await response.json();

    // Assert
    expect(response.status(), 'Should return 400 for missing fromAmount').toBe(400);
    expect(body.code, 'Should return ValidationError code').toBe(ERROR_CODES.VALIDATION_ERROR);
    expect(body.message, 'Error message should mention fromAmount').toContain('fromAmount');
  });

  test('@regression - Missing fromChain returns 400', async ({ request }) => {
    // Arrange - Omit fromChain parameter
    const params = new URLSearchParams({
      toChain: CHAINS.POLYGON.toString(),
      fromToken: 'USDC',
      toToken: 'USDC',
      fromAmount: '1000000',
      fromAddress: TEST_ADDRESSES.EVM_DEFAULT,
    });

    // Act
    const response = await request.get(`quote?${params}`);
    const body = await response.json();

    // Assert
    expect(response.status(), 'Should return 400 for missing fromChain').toBe(400);
    expect(body.code, 'Should return ValidationError code').toBe(ERROR_CODES.VALIDATION_ERROR);
    expect(typeof body.message, 'Error message should be a string').toBe('string');
    expect(body.message.length, 'Error message should not be empty').toBeGreaterThan(0);
  });

  test('@regression - Missing toChain returns 400', async ({ request }) => {
    // Arrange - Omit toChain parameter
    const params = new URLSearchParams({
      fromChain: CHAINS.ETHEREUM.toString(),
      fromToken: 'USDC',
      toToken: 'USDC',
      fromAmount: '1000000',
      fromAddress: TEST_ADDRESSES.EVM_DEFAULT,
    });

    // Act
    const response = await request.get(`quote?${params}`);
    const body = await response.json();

    // Assert
    expect(response.status(), 'Should return 400 for missing toChain').toBe(400);
    expect(body.code, 'Should return ValidationError code').toBe(ERROR_CODES.VALIDATION_ERROR);
    expect(typeof body.message, 'Error message should be a string').toBe('string');
    expect(body.message.length, 'Error message should not be empty').toBeGreaterThan(0);
  });

  test('@regression - Missing toToken returns 400', async ({ request }) => {
    // Arrange - Omit toToken parameter
    const params = new URLSearchParams({
      fromChain: CHAINS.ETHEREUM.toString(),
      toChain: CHAINS.POLYGON.toString(),
      fromToken: 'USDC',
      fromAmount: '1000000',
      fromAddress: TEST_ADDRESSES.EVM_DEFAULT,
    });

    // Act
    const response = await request.get(`quote?${params}`);
    const body = await response.json();

    // Assert
    expect(response.status(), 'Should return 400 for missing toToken').toBe(400);
    expect(body.code, 'Should return ValidationError code').toBe(ERROR_CODES.VALIDATION_ERROR);
    expect(typeof body.message, 'Error message should be a string').toBe('string');
    expect(body.message.length, 'Error message should not be empty').toBeGreaterThan(0);
  });

  test('@regression - Invalid chain ID returns 400', async ({ request }) => {
    const testCase = NEGATIVE_TEST_CASES.INVALID_CHAIN;

    // Arrange
    const params = new URLSearchParams({
      fromChain: testCase.fromChain.toString(),
      toChain: testCase.toChain.toString(),
      fromToken: testCase.fromToken,
      toToken: testCase.toToken,
      fromAmount: testCase.fromAmount,
      fromAddress: TEST_ADDRESSES.EVM_DEFAULT,
    });

    // Act
    const response = await request.get(`quote?${params}`);
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

  test('@regression - Invalid fromAddress format returns error', async ({ request }) => {
    // Arrange
    const params = new URLSearchParams({
      fromChain: CHAINS.ETHEREUM.toString(),
      toChain: CHAINS.POLYGON.toString(),
      fromToken: 'USDC',
      toToken: 'USDC',
      fromAmount: '1000000',
      fromAddress: TEST_ADDRESSES.INVALID.NOT_HEX,
    });

    // Act
    const response = await request.get(`quote?${params}`);
    const body = await response.json();

    // Assert
    expect(response.status(), 'Should return 400 for invalid address').toBe(400);
    expect(body.code, 'Should return ValidationError code').toBe(ERROR_CODES.VALIDATION_ERROR);
    expect(typeof body.message, 'Error message should be a string').toBe('string');
    expect(body.message.length, 'Error message should not be empty').toBeGreaterThan(0);
  });

  test('@regression - Short address format returns error', async ({ request }) => {
    // Arrange
    const params = new URLSearchParams({
      fromChain: CHAINS.ETHEREUM.toString(),
      toChain: CHAINS.POLYGON.toString(),
      fromToken: 'USDC',
      toToken: 'USDC',
      fromAmount: '1000000',
      fromAddress: TEST_ADDRESSES.INVALID.TOO_SHORT,
    });

    // Act
    const response = await request.get(`quote?${params}`);
    const body = await response.json();

    // Assert
    expect(response.status(), 'Should return 400 for short address').toBe(400);
    expect(body.code, 'Should return ValidationError code').toBe(ERROR_CODES.VALIDATION_ERROR);
  });

  test('@regression - Same token on same chain returns 400', async ({ request }) => {
    // Arrange - fromToken equals toToken on same chain
    const params = new URLSearchParams({
      fromChain: CHAINS.ETHEREUM.toString(),
      toChain: CHAINS.ETHEREUM.toString(),
      fromToken: 'USDC',
      toToken: 'USDC',
      fromAmount: '1000000',
      fromAddress: TEST_ADDRESSES.EVM_DEFAULT,
    });

    // Act
    const response = await request.get(`quote?${params}`);
    const body = await response.json();

    // Assert - API rejects same token swaps
    expect(response.status(), 'Should return 400 for same token swap').toBe(400);
    expect(body.code, 'Should return ValidationError code').toBe(ERROR_CODES.VALIDATION_ERROR);
    expect(body.message, 'Error message should mention same token').toContain('same token');
  });

  // Slippage parameter tests
  test('@regression @slippage - Negative slippage returns 400', async ({ request }) => {
    // Arrange
    const params = new URLSearchParams({
      fromChain: CHAINS.ETHEREUM.toString(),
      toChain: CHAINS.POLYGON.toString(),
      fromToken: 'USDC',
      toToken: 'USDC',
      fromAmount: '1000000',
      fromAddress: TEST_ADDRESSES.EVM_DEFAULT,
      slippage: '-0.05',
    });

    // Act
    const response = await request.get(`quote?${params}`);
    const body = await response.json();

    // Assert
    expect(response.status(), 'Should return 400 for negative slippage').toBe(400);
    expect(body.code, 'Should return ValidationError code').toBe(ERROR_CODES.VALIDATION_ERROR);
    expect(typeof body.message, 'Error message should be a string').toBe('string');
    expect(body.message.length, 'Error message should not be empty').toBeGreaterThan(0);
  });

  test('@regression @slippage - Slippage exceeding 100% returns 400', async ({ request }) => {
    // Arrange - Slippage of 1.5 = 150%
    const params = new URLSearchParams({
      fromChain: CHAINS.ETHEREUM.toString(),
      toChain: CHAINS.POLYGON.toString(),
      fromToken: 'USDC',
      toToken: 'USDC',
      fromAmount: '1000000',
      fromAddress: TEST_ADDRESSES.EVM_DEFAULT,
      slippage: '1.5',
    });

    // Act
    const response = await request.get(`quote?${params}`);
    const body = await response.json();

    // Assert
    expect(response.status(), 'Should return 400 for slippage > 100%').toBe(400);
    expect(body.code, 'Should return ValidationError code').toBe(ERROR_CODES.VALIDATION_ERROR);
    expect(typeof body.message, 'Error message should be a string').toBe('string');
    expect(body.message.length, 'Error message should not be empty').toBeGreaterThan(0);
  });

  test('@regression @slippage - Invalid slippage format returns 400', async ({ request }) => {
    // Arrange - Non-numeric slippage
    const params = new URLSearchParams({
      fromChain: CHAINS.ETHEREUM.toString(),
      toChain: CHAINS.POLYGON.toString(),
      fromToken: 'USDC',
      toToken: 'USDC',
      fromAmount: '1000000',
      fromAddress: TEST_ADDRESSES.EVM_DEFAULT,
      slippage: 'invalid',
    });

    // Act
    const response = await request.get(`quote?${params}`);
    const body = await response.json();

    // Assert
    expect(response.status(), 'Should return 400 for invalid slippage format').toBe(400);
    expect(body.code, 'Should return ValidationError code').toBe(ERROR_CODES.VALIDATION_ERROR);
    expect(typeof body.message, 'Error message should be a string').toBe('string');
    expect(body.message.length, 'Error message should not be empty').toBeGreaterThan(0);
  });

  // toAddress parameter tests
  test('@regression @toAddress - Invalid toAddress format returns 400', async ({ request }) => {
    // Arrange - Invalid recipient address format
    const params = new URLSearchParams({
      fromChain: CHAINS.ETHEREUM.toString(),
      toChain: CHAINS.POLYGON.toString(),
      fromToken: 'USDC',
      toToken: 'USDC',
      fromAmount: '1000000',
      fromAddress: TEST_ADDRESSES.EVM_DEFAULT,
      toAddress: 'invalid-address',
    });

    // Act
    const response = await request.get(`quote?${params}`);
    const body = await response.json();

    // Assert
    expect(response.status(), 'Should return 400 for invalid toAddress').toBe(400);
    expect(body.code, 'Should return ValidationError code').toBe(ERROR_CODES.VALIDATION_ERROR);
    expect(body.message, 'Error message should mention toAddress').toMatch(/toAddress/i);
  });

  test('@regression @toAddress - Short toAddress returns 400', async ({ request }) => {
    // Arrange - Too short recipient address
    const params = new URLSearchParams({
      fromChain: CHAINS.ETHEREUM.toString(),
      toChain: CHAINS.POLYGON.toString(),
      fromToken: 'USDC',
      toToken: 'USDC',
      fromAmount: '1000000',
      fromAddress: TEST_ADDRESSES.EVM_DEFAULT,
      toAddress: '0x1234',
    });

    // Act
    const response = await request.get(`quote?${params}`);
    const body = await response.json();

    // Assert
    expect(response.status(), 'Should return 400 for short toAddress').toBe(400);
    expect(body.code, 'Should return ValidationError code').toBe(ERROR_CODES.VALIDATION_ERROR);
  });

  // Order parameter tests
  test('@regression @order - Invalid order value returns 400', async ({ request }) => {
    // Arrange - Invalid order value (not FASTEST or CHEAPEST)
    const params = new URLSearchParams({
      fromChain: CHAINS.ETHEREUM.toString(),
      toChain: CHAINS.POLYGON.toString(),
      fromToken: 'USDC',
      toToken: 'USDC',
      fromAmount: '1000000',
      fromAddress: TEST_ADDRESSES.EVM_DEFAULT,
      order: 'INVALID_ORDER',
    });

    // Act
    const response = await request.get(`quote?${params}`);
    const body = await response.json();

    // Assert
    expect(response.status(), 'Should return 400 for invalid order').toBe(400);
    expect(body.code, 'Should return ValidationError code').toBe(ERROR_CODES.VALIDATION_ERROR);
  });

});
