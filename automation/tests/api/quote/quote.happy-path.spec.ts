/**
 * GET /v1/quote - Happy Path Tests
 *
 * Tests valid quote requests for various token pairs including:
 * - Cross-chain bridges (ETH→POL, POL→ARB, BSC→ETH)
 * - Same-chain swaps (ETH→USDC, USDC→USDT, MATIC→USDC)
 */

import { test, expect } from '@playwright/test';
import { HAPPY_PATH_PAIRS } from '../../../data/test-pairs';
import { TEST_ADDRESSES } from '../../../data/test-addresses';
import { quoteResponseSchema } from '../../schemas/quote.schema';
import { validateSchema } from '../../../utils/schema-validator';

test.describe('GET /v1/quote - Happy Path @quote @happy-path', () => {
  // Generate tests for each token pair
  for (const pair of HAPPY_PATH_PAIRS) {
    const tags = pair.tags.map((t) => `@${t}`).join(' ');

    test(`${tags} - ${pair.name}`, async ({ request }) => {
      // Arrange - Build query parameters
      const params = new URLSearchParams({
        fromChain: pair.fromChain.toString(),
        toChain: pair.toChain.toString(),
        fromToken: pair.fromToken,
        toToken: pair.toToken,
        fromAmount: pair.fromAmount,
        fromAddress: TEST_ADDRESSES.EVM_DEFAULT,
      });

      // Act - Make API request
      const response = await request.get(`quote?${params}`);
      const body = await response.json();

      // Assert - Status Code
      expect(response.status(), `Expected 200 OK for ${pair.name}`).toBe(200);

      // Assert - Schema Validation
      const schemaResult = validateSchema(body, quoteResponseSchema);
      expect(schemaResult.valid, `Schema validation failed: ${schemaResult.errors}`).toBe(true);

      // Assert - Business Logic: Chain IDs match request
      expect(body.action.fromChainId, 'fromChainId should match request').toBe(pair.fromChain);
      expect(body.action.toChainId, 'toChainId should match request').toBe(pair.toChain);

      // Assert - Business Logic: Valid amounts returned
      expect(typeof body.estimate.toAmount, 'toAmount should be a string').toBe('string');
      expect(body.estimate.toAmount.length, 'toAmount should not be empty').toBeGreaterThan(0);
      expect(BigInt(body.estimate.toAmount), 'toAmount should be positive').toBeGreaterThan(0n);

      // Assert - Business Logic: toAmountMin <= toAmount (slippage applied)
      expect(
        BigInt(body.estimate.toAmountMin),
        'toAmountMin should be less than or equal to toAmount'
      ).toBeLessThanOrEqual(BigInt(body.estimate.toAmount));

      // Assert - Tool information present
      expect(typeof body.tool, 'tool should be a string').toBe('string');
      expect(body.tool.length, 'tool should not be empty').toBeGreaterThan(0);
      expect(typeof body.toolDetails, 'toolDetails should be an object').toBe('object');
      expect(typeof body.toolDetails.key, 'toolDetails.key should be a string').toBe('string');
      expect(body.toolDetails.key.length, 'toolDetails.key should not be empty').toBeGreaterThan(0);
      expect(typeof body.toolDetails.name, 'toolDetails.name should be a string').toBe('string');
      expect(body.toolDetails.name.length, 'toolDetails.name should not be empty').toBeGreaterThan(0);
    });
  }

  test('@smoke @regression - Response contains transactionRequest for EVM chains', async ({
    request,
  }) => {
    // Arrange - Use a simple same-chain swap
    const params = new URLSearchParams({
      fromChain: '1', // Ethereum
      toChain: '1',
      fromToken: 'USDC',
      toToken: 'USDT',
      fromAmount: '1000000', // 1 USDC
      fromAddress: TEST_ADDRESSES.EVM_DEFAULT,
    });

    // Act
    const response = await request.get(`quote?${params}`);
    const body = await response.json();

    // Assert
    expect(response.status()).toBe(200);
    expect(typeof body.transactionRequest, 'transactionRequest should be an object').toBe('object');
    expect(typeof body.transactionRequest.to, 'transactionRequest.to should be a string').toBe('string');
    expect(body.transactionRequest.to.startsWith('0x'), 'transactionRequest.to should be a hex address').toBe(true);
    expect(typeof body.transactionRequest.data, 'transactionRequest.data should be a string').toBe('string');
    expect(body.transactionRequest.data.startsWith('0x'), 'transactionRequest.data should be hex data').toBe(true);
  });

  test('@regression - Response includes gas cost estimates', async ({ request }) => {
    // Arrange
    const params = new URLSearchParams({
      fromChain: '1',
      toChain: '137',
      fromToken: 'USDC',
      toToken: 'USDC',
      fromAmount: '10000000', // 10 USDC
      fromAddress: TEST_ADDRESSES.EVM_DEFAULT,
    });

    // Act
    const response = await request.get(`quote?${params}`);
    const body = await response.json();

    // Assert
    expect(response.status()).toBe(200);
    expect(Array.isArray(body.estimate.gasCosts), 'gasCosts should be an array').toBe(true);
    expect(body.estimate.gasCosts.length, 'gasCosts should not be empty').toBeGreaterThan(0);

    const gasCost = body.estimate.gasCosts[0];
    expect(typeof gasCost.type, 'gasCost.type should be a string').toBe('string');
    expect(gasCost.type.length, 'gasCost.type should not be empty').toBeGreaterThan(0);
    expect(typeof gasCost.estimate, 'gasCost.estimate should be a string').toBe('string');
    expect(typeof gasCost.token, 'gasCost.token should be an object').toBe('object');
    expect(typeof gasCost.token.symbol, 'gasCost.token.symbol should be a string').toBe('string');
  });

  test('@regression - Response includes execution duration estimate', async ({ request }) => {
    // Arrange
    const params = new URLSearchParams({
      fromChain: '1',
      toChain: '42161', // Arbitrum
      fromToken: 'USDC',
      toToken: 'USDC',
      fromAmount: '5000000', // 5 USDC
      fromAddress: TEST_ADDRESSES.EVM_DEFAULT,
    });

    // Act
    const response = await request.get(`quote?${params}`);
    const body = await response.json();

    // Assert
    expect(response.status()).toBe(200);
    expect(typeof body.estimate.executionDuration, 'executionDuration should be a number').toBe('number');
    expect(body.estimate.executionDuration, 'executionDuration should be positive').toBeGreaterThan(0);
  });
});
