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
import { CHAINS } from '../../../data/chains';
import { routesResponseSchema } from '../../schemas/routes.schema';
import { validateSchema } from '../../../utils/schema-validator';

test.describe('POST /v1/advanced/routes - Happy Path @routes @happy-path', () => {
  for (const pair of HAPPY_PATH_PAIRS) {
    const tags = pair.tags.map((t) => `@${t}`).join(' ');

    test(`${tags} - ${pair.name}`, async ({ request }) => {
      const requestBody = {
        fromChainId: pair.fromChain,
        fromAmount: pair.fromAmount,
        fromTokenAddress: pair.fromTokenAddress,
        toChainId: pair.toChain,
        toTokenAddress: pair.toTokenAddress,
        fromAddress: TEST_ADDRESSES.EVM_DEFAULT,
        options: {
          slippage: 0.03, // 3% slippage
        },
      };

      const response = await request.post('advanced/routes', {
        data: requestBody,
      });
      const body = await response.json();

      expect(response.status(), `Expected 200 OK for ${pair.name}`).toBe(200);

      const schemaResult = validateSchema(body, routesResponseSchema);
      expect(schemaResult.valid, `Schema validation failed: ${schemaResult.errors}`).toBe(true);

      expect(Array.isArray(body.routes), 'routes should be an array').toBe(true);
      expect(body.routes.length, 'routes should have at least one route').toBeGreaterThan(0);

      const firstRoute = body.routes[0];
      expect(typeof firstRoute.id, 'route.id should be a string').toBe('string');
      expect(firstRoute.id.length, 'route.id should not be empty').toBeGreaterThan(0);
      expect(firstRoute.fromChainId, 'route.fromChainId should match request').toBe(pair.fromChain);
      expect(firstRoute.toChainId, 'route.toChainId should match request').toBe(pair.toChain);
      expect(typeof firstRoute.fromAmount, 'route.fromAmount should be a string').toBe('string');
      expect(firstRoute.fromAmount.length, 'route.fromAmount should not be empty').toBeGreaterThan(
        0
      );
      expect(typeof firstRoute.toAmount, 'route.toAmount should be a string').toBe('string');
      expect(firstRoute.toAmount.length, 'route.toAmount should not be empty').toBeGreaterThan(0);

      expect(Array.isArray(firstRoute.steps), 'route.steps should be an array').toBe(true);
      expect(firstRoute.steps.length, 'route should have at least one step').toBeGreaterThan(0);
    });
  }

  test('@smoke @regression - Returns at least one route with tool info', async ({ request }) => {
    const requestBody = {
      fromChainId: CHAINS.ETHEREUM,
      fromAmount: '10000000', // 10 USDC (6 decimals)
      fromTokenAddress: TOKENS[CHAINS.ETHEREUM].USDC.address,
      toChainId: CHAINS.POLYGON,
      toTokenAddress: TOKENS[CHAINS.POLYGON].USDC.address,
      fromAddress: TEST_ADDRESSES.EVM_DEFAULT,
    };

    const response = await request.post('advanced/routes', {
      data: requestBody,
    });
    const body = await response.json();

    expect(response.status()).toBe(200);
    expect(body.routes.length, 'Should return multiple route options').toBeGreaterThanOrEqual(1);

    const tools = body.routes.map((r: { steps: Array<{ tool: string }> }) => r.steps[0]?.tool);
    const uniqueTools = [...new Set(tools)];
    expect(uniqueTools.length, 'Should have at least one tool').toBeGreaterThanOrEqual(1);
  });

  test('@regression - Routes include gas cost estimates', async ({ request }) => {
    const requestBody = {
      fromChainId: CHAINS.ETHEREUM,
      fromAmount: '5000000', // 5 USDC (6 decimals)
      fromTokenAddress: TOKENS[CHAINS.ETHEREUM].USDC.address,
      toChainId: CHAINS.ARBITRUM,
      toTokenAddress: TOKENS[CHAINS.ARBITRUM].USDC.address,
      fromAddress: TEST_ADDRESSES.EVM_DEFAULT,
    };

    const response = await request.post('advanced/routes', {
      data: requestBody,
    });
    const body = await response.json();

    expect(response.status()).toBe(200);
    expect(body.routes.length).toBeGreaterThan(0);

    const firstRoute = body.routes[0];
    expect(typeof firstRoute.gasCostUSD, 'gasCostUSD should be a string').toBe('string');
    expect(firstRoute.gasCostUSD.length, 'gasCostUSD should not be empty').toBeGreaterThan(0);
  });

  test('@regression - Route steps have complete action and estimate', async ({ request }) => {
    const requestBody = {
      fromChainId: CHAINS.ETHEREUM,
      fromAmount: '1000000000000000000', // 1 ETH (18 decimals)
      fromTokenAddress: TEST_ADDRESSES.ZERO,
      toChainId: CHAINS.ETHEREUM,
      toTokenAddress: TOKENS[CHAINS.ETHEREUM].USDC.address,
      fromAddress: TEST_ADDRESSES.EVM_DEFAULT,
    };

    const response = await request.post('advanced/routes', {
      data: requestBody,
    });
    const body = await response.json();

    expect(response.status()).toBe(200);

    const firstRoute = body.routes[0];
    const firstStep = firstRoute.steps[0];

    expect(typeof firstStep.id, 'step.id should be a string').toBe('string');
    expect(firstStep.id.length, 'step.id should not be empty').toBeGreaterThan(0);
    expect(typeof firstStep.type, 'step.type should be a string').toBe('string');
    expect(firstStep.type.length, 'step.type should not be empty').toBeGreaterThan(0);
    expect(typeof firstStep.tool, 'step.tool should be a string').toBe('string');
    expect(firstStep.tool.length, 'step.tool should not be empty').toBeGreaterThan(0);
    expect(typeof firstStep.action, 'step.action should be an object').toBe('object');
    expect(typeof firstStep.estimate, 'step.estimate should be an object').toBe('object');

    expect(typeof firstStep.estimate.toAmount, 'estimate.toAmount should be a string').toBe(
      'string'
    );
    expect(
      firstStep.estimate.toAmount.length,
      'estimate.toAmount should not be empty'
    ).toBeGreaterThan(0);
  });

  test('@regression - Order parameter affects route sorting', async ({ request }) => {
    const requestBody = {
      fromChainId: CHAINS.ETHEREUM,
      fromAmount: '100000000', // 100 USDC (6 decimals)
      fromTokenAddress: TOKENS[CHAINS.ETHEREUM].USDC.address,
      toChainId: CHAINS.POLYGON,
      toTokenAddress: TOKENS[CHAINS.POLYGON].USDC.address,
      fromAddress: TEST_ADDRESSES.EVM_DEFAULT,
      options: {
        order: 'CHEAPEST',
      },
    };

    const response = await request.post('advanced/routes', {
      data: requestBody,
    });
    const body = await response.json();

    expect(response.status()).toBe(200);
    expect(body.routes.length).toBeGreaterThan(0);

    // For CHEAPEST order, first route should give same or more tokens than subsequent routes
    if (body.routes.length > 1) {
      const firstRouteAmount = BigInt(body.routes[0].toAmount);
      const secondRouteAmount = BigInt(body.routes[1].toAmount);
      expect(firstRouteAmount).toBeGreaterThanOrEqual(secondRouteAmount);
    }
  });
});
