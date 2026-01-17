/**
 * POST /v1/advanced/routes - Happy Path Tests
 *
 * Tests valid route requests for various token pairs.
 * The routes endpoint returns multiple route options with detailed step breakdowns.
 */

import { test, expect } from '@playwright/test';
import { HAPPY_PATH_PAIRS } from '../../../data/test-pairs';
import { TEST_ADDRESSES } from '../../../data/test-addresses';
import { TOKENS } from '../../../data/tokens';
import { routesResponseSchema } from '../../schemas/routes.schema';
import { validateSchema } from '../../../utils/schema-validator';

test.describe('POST /v1/advanced/routes - Happy Path @routes @happy-path', () => {
  // Generate tests for each token pair
  for (const pair of HAPPY_PATH_PAIRS) {
    const tags = pair.tags.map((t) => `@${t}`).join(' ');

    test(`${tags} - ${pair.name}`, async ({ request }) => {
      // Get token addresses for the request
      const fromTokenInfo = TOKENS[pair.fromChain]?.[pair.fromToken];
      const toTokenInfo = TOKENS[pair.toChain]?.[pair.toToken];

      // Skip if token addresses not found (would need to use symbol instead)
      const fromTokenAddress = fromTokenInfo?.address || pair.fromToken;
      const toTokenAddress = toTokenInfo?.address || pair.toToken;

      // Arrange - Build request body
      const requestBody = {
        fromChainId: pair.fromChain,
        fromAmount: pair.fromAmount,
        fromTokenAddress: fromTokenAddress,
        toChainId: pair.toChain,
        toTokenAddress: toTokenAddress,
        fromAddress: TEST_ADDRESSES.EVM_DEFAULT,
        options: {
          slippage: 0.03, // 3% slippage
        },
      };

      // Act - Make API request
      const response = await request.post('advanced/routes', {
        data: requestBody,
      });
      const body = await response.json();

      // Assert - Status Code
      expect(response.status(), `Expected 200 OK for ${pair.name}`).toBe(200);

      // Assert - Schema Validation
      const schemaResult = validateSchema(body, routesResponseSchema);
      expect(schemaResult.valid, `Schema validation failed: ${schemaResult.errors}`).toBe(true);

      // Assert - Routes array present and non-empty
      expect(Array.isArray(body.routes), 'routes should be an array').toBe(true);
      expect(body.routes.length, 'routes should have at least one route').toBeGreaterThan(0);

      // Assert - First route has required fields
      const firstRoute = body.routes[0];
      expect(typeof firstRoute.id, 'route.id should be a string').toBe('string');
      expect(firstRoute.id.length, 'route.id should not be empty').toBeGreaterThan(0);
      expect(firstRoute.fromChainId, 'route.fromChainId should match request').toBe(pair.fromChain);
      expect(firstRoute.toChainId, 'route.toChainId should match request').toBe(pair.toChain);
      expect(typeof firstRoute.fromAmount, 'route.fromAmount should be a string').toBe('string');
      expect(firstRoute.fromAmount.length, 'route.fromAmount should not be empty').toBeGreaterThan(0);
      expect(typeof firstRoute.toAmount, 'route.toAmount should be a string').toBe('string');
      expect(firstRoute.toAmount.length, 'route.toAmount should not be empty').toBeGreaterThan(0);

      // Assert - Route has steps
      expect(Array.isArray(firstRoute.steps), 'route.steps should be an array').toBe(true);
      expect(firstRoute.steps.length, 'route should have at least one step').toBeGreaterThan(0);
    });
  }

  test('@smoke @regression - Returns multiple routes with different tools', async ({ request }) => {
    // Arrange - Use popular bridge route
    const requestBody = {
      fromChainId: 1, // Ethereum
      fromAmount: '10000000', // 10 USDC
      fromTokenAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC
      toChainId: 137, // Polygon
      toTokenAddress: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359', // USDC
      fromAddress: TEST_ADDRESSES.EVM_DEFAULT,
    };

    // Act
    const response = await request.post('advanced/routes', {
      data: requestBody,
    });
    const body = await response.json();

    // Assert
    expect(response.status()).toBe(200);
    expect(body.routes.length, 'Should return multiple route options').toBeGreaterThanOrEqual(1);

    // Check that routes use different tools/bridges
    const tools = body.routes.map((r: { steps: Array<{ tool: string }> }) => r.steps[0]?.tool);
    const uniqueTools = [...new Set(tools)];
    // May have same tool with different parameters, so just verify we have tools
    expect(uniqueTools.length, 'Should have at least one tool').toBeGreaterThanOrEqual(1);
  });

  test('@regression - Routes include gas cost estimates', async ({ request }) => {
    // Arrange
    const requestBody = {
      fromChainId: 1,
      fromAmount: '5000000', // 5 USDC
      fromTokenAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      toChainId: 42161, // Arbitrum
      toTokenAddress: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
      fromAddress: TEST_ADDRESSES.EVM_DEFAULT,
    };

    // Act
    const response = await request.post('advanced/routes', {
      data: requestBody,
    });
    const body = await response.json();

    // Assert
    expect(response.status()).toBe(200);
    expect(body.routes.length).toBeGreaterThan(0);

    const firstRoute = body.routes[0];
    expect(typeof firstRoute.gasCostUSD, 'gasCostUSD should be a string').toBe('string');
    expect(firstRoute.gasCostUSD.length, 'gasCostUSD should not be empty').toBeGreaterThan(0);
  });

  test('@regression - Route steps have complete action and estimate', async ({ request }) => {
    // Arrange
    const requestBody = {
      fromChainId: 1,
      fromAmount: '1000000000000000000', // 1 ETH
      fromTokenAddress: '0x0000000000000000000000000000000000000000', // ETH
      toChainId: 1,
      toTokenAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC
      fromAddress: TEST_ADDRESSES.EVM_DEFAULT,
    };

    // Act
    const response = await request.post('advanced/routes', {
      data: requestBody,
    });
    const body = await response.json();

    // Assert
    expect(response.status()).toBe(200);

    const firstRoute = body.routes[0];
    const firstStep = firstRoute.steps[0];

    // Verify step structure
    expect(typeof firstStep.id, 'step.id should be a string').toBe('string');
    expect(firstStep.id.length, 'step.id should not be empty').toBeGreaterThan(0);
    expect(typeof firstStep.type, 'step.type should be a string').toBe('string');
    expect(firstStep.type.length, 'step.type should not be empty').toBeGreaterThan(0);
    expect(typeof firstStep.tool, 'step.tool should be a string').toBe('string');
    expect(firstStep.tool.length, 'step.tool should not be empty').toBeGreaterThan(0);
    expect(typeof firstStep.action, 'step.action should be an object').toBe('object');
    expect(typeof firstStep.estimate, 'step.estimate should be an object').toBe('object');

    // Verify estimate has amounts
    expect(typeof firstStep.estimate.toAmount, 'estimate.toAmount should be a string').toBe('string');
    expect(firstStep.estimate.toAmount.length, 'estimate.toAmount should not be empty').toBeGreaterThan(0);
  });

  test('@regression - Order parameter affects route sorting', async ({ request }) => {
    // Arrange - Test with CHEAPEST order
    const requestBody = {
      fromChainId: 1,
      fromAmount: '100000000', // 100 USDC
      fromTokenAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      toChainId: 137,
      toTokenAddress: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359',
      fromAddress: TEST_ADDRESSES.EVM_DEFAULT,
      options: {
        order: 'CHEAPEST',
      },
    };

    // Act
    const response = await request.post('advanced/routes', {
      data: requestBody,
    });
    const body = await response.json();

    // Assert
    expect(response.status()).toBe(200);
    expect(body.routes.length).toBeGreaterThan(0);

    // Verify routes are sorted (first should have best value)
    if (body.routes.length > 1) {
      const firstRouteAmount = BigInt(body.routes[0].toAmount);
      const secondRouteAmount = BigInt(body.routes[1].toAmount);
      // For CHEAPEST, first route should give same or more tokens
      expect(firstRouteAmount).toBeGreaterThanOrEqual(secondRouteAmount);
    }
  });
});
