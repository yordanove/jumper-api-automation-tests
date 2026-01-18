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

    const params = new URLSearchParams({
      fromChain: testCase.fromChain.toString(),
      toChain: testCase.toChain.toString(),
      fromToken: testCase.fromToken,
      toToken: testCase.toToken,
      fromAmount: testCase.fromAmount,
      fromAddress: TEST_ADDRESSES.EVM_DEFAULT,
    });

    const response = await request.get(`quote?${params}`);
    const body = await response.json();

    expect(response.status(), `Should return ${testCase.expectedStatus} for invalid token`).toBe(
      testCase.expectedStatus
    );
    expect(body.code, `Should return error code ${testCase.expectedCode}`).toBe(
      testCase.expectedCode
    );
    expect(typeof body.message, 'Error message should be a string').toBe('string');
    expect(body.message.length, 'Error message should not be empty').toBeGreaterThan(0);

    const schemaResult = validateSchema(body, errorResponseSchema);
    expect(schemaResult.valid, `Error schema validation failed: ${schemaResult.errors}`).toBe(true);
  });

  test('@regression - Zero amount returns 400 with validation error', async ({ request }) => {
    const testCase = NEGATIVE_TEST_CASES.ZERO_AMOUNT;

    const params = new URLSearchParams({
      fromChain: testCase.fromChain.toString(),
      toChain: testCase.toChain.toString(),
      fromToken: testCase.fromToken,
      toToken: testCase.toToken,
      fromAmount: testCase.fromAmount,
      fromAddress: TEST_ADDRESSES.EVM_DEFAULT,
    });

    const response = await request.get(`quote?${params}`);
    const body = await response.json();

    expect(response.status(), `Should return ${testCase.expectedStatus} for zero amount`).toBe(
      testCase.expectedStatus
    );
    expect(body.code, `Should return error code ${testCase.expectedCode}`).toBe(
      testCase.expectedCode
    );
    expect(typeof body.message, 'Error message should be a string').toBe('string');
    expect(body.message.length, 'Error message should not be empty').toBeGreaterThan(0);
  });

  test('@regression - Negative amount returns 400', async ({ request }) => {
    const testCase = NEGATIVE_TEST_CASES.NEGATIVE_AMOUNT;

    const params = new URLSearchParams({
      fromChain: testCase.fromChain.toString(),
      toChain: testCase.toChain.toString(),
      fromToken: testCase.fromToken,
      toToken: testCase.toToken,
      fromAmount: testCase.fromAmount,
      fromAddress: TEST_ADDRESSES.EVM_DEFAULT,
    });

    const response = await request.get(`quote?${params}`);
    const body = await response.json();

    expect(response.status(), `Should return ${testCase.expectedStatus} for negative amount`).toBe(
      testCase.expectedStatus
    );
    expect(body.code, `Should return error code ${testCase.expectedCode}`).toBe(
      testCase.expectedCode
    );
    expect(typeof body.message, 'Error message should be a string').toBe('string');
    expect(body.message.length, 'Error message should not be empty').toBeGreaterThan(0);
  });

  test('@regression - Missing fromAmount returns 400', async ({ request }) => {
    const params = new URLSearchParams({
      fromChain: CHAINS.ETHEREUM.toString(),
      toChain: CHAINS.POLYGON.toString(),
      fromToken: 'USDC',
      toToken: 'USDC',
      fromAddress: TEST_ADDRESSES.EVM_DEFAULT,
    });

    const response = await request.get(`quote?${params}`);
    const body = await response.json();

    expect(response.status(), 'Should return 400 for missing fromAmount').toBe(400);
    expect(body.code, 'Should return ValidationError code').toBe(ERROR_CODES.VALIDATION_ERROR);
    expect(body.message, 'Error message should mention fromAmount').toContain('fromAmount');
  });

  test('@regression - Missing fromChain returns 400', async ({ request }) => {
    const params = new URLSearchParams({
      toChain: CHAINS.POLYGON.toString(),
      fromToken: 'USDC',
      toToken: 'USDC',
      fromAmount: '1000000',
      fromAddress: TEST_ADDRESSES.EVM_DEFAULT,
    });

    const response = await request.get(`quote?${params}`);
    const body = await response.json();

    expect(response.status(), 'Should return 400 for missing fromChain').toBe(400);
    expect(body.code, 'Should return ValidationError code').toBe(ERROR_CODES.VALIDATION_ERROR);
    expect(typeof body.message, 'Error message should be a string').toBe('string');
    expect(body.message.length, 'Error message should not be empty').toBeGreaterThan(0);
    expect(body.message, 'Error message should mention fromChain').toMatch(/fromChain/i);
  });

  test('@regression - Missing toChain returns 400', async ({ request }) => {
    const params = new URLSearchParams({
      fromChain: CHAINS.ETHEREUM.toString(),
      fromToken: 'USDC',
      toToken: 'USDC',
      fromAmount: '1000000',
      fromAddress: TEST_ADDRESSES.EVM_DEFAULT,
    });

    const response = await request.get(`quote?${params}`);
    const body = await response.json();

    expect(response.status(), 'Should return 400 for missing toChain').toBe(400);
    expect(body.code, 'Should return ValidationError code').toBe(ERROR_CODES.VALIDATION_ERROR);
    expect(typeof body.message, 'Error message should be a string').toBe('string');
    expect(body.message.length, 'Error message should not be empty').toBeGreaterThan(0);
    expect(body.message, 'Error message should mention toChain').toMatch(/toChain/i);
  });

  test('@regression - Missing toToken returns 400', async ({ request }) => {
    const params = new URLSearchParams({
      fromChain: CHAINS.ETHEREUM.toString(),
      toChain: CHAINS.POLYGON.toString(),
      fromToken: 'USDC',
      fromAmount: '1000000',
      fromAddress: TEST_ADDRESSES.EVM_DEFAULT,
    });

    const response = await request.get(`quote?${params}`);
    const body = await response.json();

    expect(response.status(), 'Should return 400 for missing toToken').toBe(400);
    expect(body.code, 'Should return ValidationError code').toBe(ERROR_CODES.VALIDATION_ERROR);
    expect(typeof body.message, 'Error message should be a string').toBe('string');
    expect(body.message.length, 'Error message should not be empty').toBeGreaterThan(0);
    expect(body.message, 'Error message should mention toToken').toMatch(/toToken/i);
  });

  test('@regression - Invalid chain ID returns 400', async ({ request }) => {
    const testCase = NEGATIVE_TEST_CASES.INVALID_CHAIN;

    const params = new URLSearchParams({
      fromChain: testCase.fromChain.toString(),
      toChain: testCase.toChain.toString(),
      fromToken: testCase.fromToken,
      toToken: testCase.toToken,
      fromAmount: testCase.fromAmount,
      fromAddress: TEST_ADDRESSES.EVM_DEFAULT,
    });

    const response = await request.get(`quote?${params}`);
    const body = await response.json();

    expect(response.status(), `Should return ${testCase.expectedStatus} for invalid chain`).toBe(
      testCase.expectedStatus
    );
    expect(body.code, `Should return error code ${testCase.expectedCode}`).toBe(
      testCase.expectedCode
    );
    expect(typeof body.message, 'Error message should be a string').toBe('string');
    expect(body.message.length, 'Error message should not be empty').toBeGreaterThan(0);
    expect(body.message, 'Error message should mention chain').toMatch(/chain/i);
  });

  test('@regression - Invalid fromAddress format returns error', async ({ request }) => {
    const testCase = NEGATIVE_TEST_CASES.INVALID_ADDRESS;

    const params = new URLSearchParams({
      fromChain: testCase.fromChain.toString(),
      toChain: testCase.toChain.toString(),
      fromToken: testCase.fromToken,
      toToken: testCase.toToken,
      fromAmount: testCase.fromAmount,
      fromAddress: testCase.fromAddress,
    });

    const response = await request.get(`quote?${params}`);
    const body = await response.json();

    expect(response.status(), `Should return ${testCase.expectedStatus} for invalid address`).toBe(
      testCase.expectedStatus
    );
    expect(body.code, `Should return error code ${testCase.expectedCode}`).toBe(
      testCase.expectedCode
    );
    expect(typeof body.message, 'Error message should be a string').toBe('string');
    expect(body.message.length, 'Error message should not be empty').toBeGreaterThan(0);
    expect(body.message, 'Error message should mention address').toMatch(/address/i);
  });

  test('@regression - Short address format returns error', async ({ request }) => {
    const params = new URLSearchParams({
      fromChain: CHAINS.ETHEREUM.toString(),
      toChain: CHAINS.POLYGON.toString(),
      fromToken: 'USDC',
      toToken: 'USDC',
      fromAmount: '1000000',
      fromAddress: TEST_ADDRESSES.INVALID.TOO_SHORT,
    });

    const response = await request.get(`quote?${params}`);
    const body = await response.json();

    expect(response.status(), 'Should return 400 for short address').toBe(400);
    expect(body.code, 'Should return ValidationError code').toBe(ERROR_CODES.VALIDATION_ERROR);
    expect(body.message, 'Error message should mention address').toMatch(/address/i);
  });

  test('@regression - Same token on same chain returns 400', async ({ request }) => {
    const params = new URLSearchParams({
      fromChain: CHAINS.ETHEREUM.toString(),
      toChain: CHAINS.ETHEREUM.toString(),
      fromToken: 'USDC',
      toToken: 'USDC',
      fromAmount: '1000000',
      fromAddress: TEST_ADDRESSES.EVM_DEFAULT,
    });

    const response = await request.get(`quote?${params}`);
    const body = await response.json();

    expect(response.status(), 'Should return 400 for same token swap').toBe(400);
    expect(body.code, 'Should return ValidationError code').toBe(ERROR_CODES.VALIDATION_ERROR);
    expect(body.message, 'Error message should mention same token').toContain('same token');
  });

  test('@regression @slippage - Negative slippage returns 400', async ({ request }) => {
    const params = new URLSearchParams({
      fromChain: CHAINS.ETHEREUM.toString(),
      toChain: CHAINS.POLYGON.toString(),
      fromToken: 'USDC',
      toToken: 'USDC',
      fromAmount: '1000000',
      fromAddress: TEST_ADDRESSES.EVM_DEFAULT,
      slippage: '-0.05',
    });

    const response = await request.get(`quote?${params}`);
    const body = await response.json();

    expect(response.status(), 'Should return 400 for negative slippage').toBe(400);
    expect(body.code, 'Should return ValidationError code').toBe(ERROR_CODES.VALIDATION_ERROR);
    expect(typeof body.message, 'Error message should be a string').toBe('string');
    expect(body.message.length, 'Error message should not be empty').toBeGreaterThan(0);
    expect(body.message, 'Error message should mention slippage').toMatch(/slippage/i);
  });

  test('@regression @slippage - Slippage exceeding 100% returns 400', async ({ request }) => {
    const params = new URLSearchParams({
      fromChain: CHAINS.ETHEREUM.toString(),
      toChain: CHAINS.POLYGON.toString(),
      fromToken: 'USDC',
      toToken: 'USDC',
      fromAmount: '1000000',
      fromAddress: TEST_ADDRESSES.EVM_DEFAULT,
      slippage: '1.5', // 150% slippage
    });

    const response = await request.get(`quote?${params}`);
    const body = await response.json();

    expect(response.status(), 'Should return 400 for slippage > 100%').toBe(400);
    expect(body.code, 'Should return ValidationError code').toBe(ERROR_CODES.VALIDATION_ERROR);
    expect(typeof body.message, 'Error message should be a string').toBe('string');
    expect(body.message.length, 'Error message should not be empty').toBeGreaterThan(0);
    expect(body.message, 'Error message should mention slippage').toMatch(/slippage/i);
  });

  test('@regression @slippage - Invalid slippage format returns 400', async ({ request }) => {
    const params = new URLSearchParams({
      fromChain: CHAINS.ETHEREUM.toString(),
      toChain: CHAINS.POLYGON.toString(),
      fromToken: 'USDC',
      toToken: 'USDC',
      fromAmount: '1000000',
      fromAddress: TEST_ADDRESSES.EVM_DEFAULT,
      slippage: 'invalid',
    });

    const response = await request.get(`quote?${params}`);
    const body = await response.json();

    expect(response.status(), 'Should return 400 for invalid slippage format').toBe(400);
    expect(body.code, 'Should return ValidationError code').toBe(ERROR_CODES.VALIDATION_ERROR);
    expect(typeof body.message, 'Error message should be a string').toBe('string');
    expect(body.message.length, 'Error message should not be empty').toBeGreaterThan(0);
    expect(body.message, 'Error message should mention slippage').toMatch(/slippage/i);
  });

  test('@regression @toAddress - Invalid toAddress format returns 400', async ({ request }) => {
    const params = new URLSearchParams({
      fromChain: CHAINS.ETHEREUM.toString(),
      toChain: CHAINS.POLYGON.toString(),
      fromToken: 'USDC',
      toToken: 'USDC',
      fromAmount: '1000000',
      fromAddress: TEST_ADDRESSES.EVM_DEFAULT,
      toAddress: 'invalid-address',
    });

    const response = await request.get(`quote?${params}`);
    const body = await response.json();

    expect(response.status(), 'Should return 400 for invalid toAddress').toBe(400);
    expect(body.code, 'Should return ValidationError code').toBe(ERROR_CODES.VALIDATION_ERROR);
    expect(body.message, 'Error message should mention toAddress').toMatch(/toAddress/i);
  });

  test('@regression @toAddress - Short toAddress returns 400', async ({ request }) => {
    const params = new URLSearchParams({
      fromChain: CHAINS.ETHEREUM.toString(),
      toChain: CHAINS.POLYGON.toString(),
      fromToken: 'USDC',
      toToken: 'USDC',
      fromAmount: '1000000',
      fromAddress: TEST_ADDRESSES.EVM_DEFAULT,
      toAddress: '0x1234',
    });

    const response = await request.get(`quote?${params}`);
    const body = await response.json();

    expect(response.status(), 'Should return 400 for short toAddress').toBe(400);
    expect(body.code, 'Should return ValidationError code').toBe(ERROR_CODES.VALIDATION_ERROR);
    expect(body.message, 'Error message should mention toAddress').toMatch(/toAddress/i);
  });

  test('@regression @order - Invalid order value returns 400', async ({ request }) => {
    const params = new URLSearchParams({
      fromChain: CHAINS.ETHEREUM.toString(),
      toChain: CHAINS.POLYGON.toString(),
      fromToken: 'USDC',
      toToken: 'USDC',
      fromAmount: '1000000',
      fromAddress: TEST_ADDRESSES.EVM_DEFAULT,
      order: 'INVALID_ORDER',
    });

    const response = await request.get(`quote?${params}`);
    const body = await response.json();

    expect(response.status(), 'Should return 400 for invalid order').toBe(400);
    expect(body.code, 'Should return ValidationError code').toBe(ERROR_CODES.VALIDATION_ERROR);
  });
});
