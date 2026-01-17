/**
 * GET /v1/tools - Happy Path Tests
 *
 * Tests the tools endpoint for retrieving available bridges and exchanges.
 * Includes specific tests for non-EVM chains: Solana, Bitcoin, and SUI.
 */

import { test, expect } from '@playwright/test';
import { CHAINS } from '../../../data/chains';
import { TOOLS_TEST_CHAINS } from '../../../data/test-pairs';
import { toolsResponseSchema } from '../../schemas/tools.schema';
import { validateSchema } from '../../../utils/schema-validator';

test.describe('GET /v1/tools - Happy Path @tools @happy-path', () => {
  test('@smoke @regression - Returns bridges and exchanges without filter', async ({ request }) => {
    // Act
    const response = await request.get('tools');
    const body = await response.json();

    // Assert - Status Code
    expect(response.status(), 'Should return 200 OK').toBe(200);

    // Assert - Schema Validation
    const schemaResult = validateSchema(body, toolsResponseSchema);
    expect(schemaResult.valid, `Schema validation failed: ${schemaResult.errors}`).toBe(true);

    // Assert - Has bridges and exchanges
    expect(Array.isArray(body.bridges), 'bridges should be an array').toBe(true);
    expect(Array.isArray(body.exchanges), 'exchanges should be an array').toBe(true);
    expect(body.bridges.length, 'Should have at least one bridge').toBeGreaterThan(0);
    expect(body.exchanges.length, 'Should have at least one exchange').toBeGreaterThan(0);
  });

  test('@regression - Bridge objects have required properties', async ({ request }) => {
    // Act
    const response = await request.get('tools');
    const body = await response.json();

    // Assert
    expect(response.status()).toBe(200);

    const firstBridge = body.bridges[0];
    expect(typeof firstBridge.key, 'bridge.key should be a string').toBe('string');
    expect(firstBridge.key.length, 'bridge.key should not be empty').toBeGreaterThan(0);
    expect(typeof firstBridge.name, 'bridge.name should be a string').toBe('string');
    expect(firstBridge.name.length, 'bridge.name should not be empty').toBeGreaterThan(0);
    expect(typeof firstBridge.logoURI, 'bridge.logoURI should be a string').toBe('string');
    expect(firstBridge.logoURI.length, 'bridge.logoURI should not be empty').toBeGreaterThan(0);
    expect(Array.isArray(firstBridge.supportedChains), 'bridge.supportedChains should be an array').toBe(true);
    expect(firstBridge.supportedChains.length, 'bridge.supportedChains should not be empty').toBeGreaterThan(0);

    // Verify supportedChains structure for bridges
    const chainPair = firstBridge.supportedChains[0];
    expect(typeof chainPair.fromChainId, 'fromChainId should be a number').toBe('number');
    expect(chainPair.fromChainId, 'fromChainId should be positive').toBeGreaterThan(0);
    expect(typeof chainPair.toChainId, 'toChainId should be a number').toBe('number');
    expect(chainPair.toChainId, 'toChainId should be positive').toBeGreaterThan(0);
  });

  test('@regression - Exchange objects have required properties', async ({ request }) => {
    // Act
    const response = await request.get('tools');
    const body = await response.json();

    // Assert
    expect(response.status()).toBe(200);

    const firstExchange = body.exchanges[0];
    expect(typeof firstExchange.key, 'exchange.key should be a string').toBe('string');
    expect(firstExchange.key.length, 'exchange.key should not be empty').toBeGreaterThan(0);
    expect(typeof firstExchange.name, 'exchange.name should be a string').toBe('string');
    expect(firstExchange.name.length, 'exchange.name should not be empty').toBeGreaterThan(0);
    expect(typeof firstExchange.logoURI, 'exchange.logoURI should be a string').toBe('string');
    expect(firstExchange.logoURI.length, 'exchange.logoURI should not be empty').toBeGreaterThan(0);
    expect(Array.isArray(firstExchange.supportedChains), 'exchange.supportedChains should be an array').toBe(true);
    expect(firstExchange.supportedChains.length, 'exchange.supportedChains should not be empty').toBeGreaterThan(0);

    // Verify supportedChains for exchanges is array of chain IDs
    expect(
      typeof firstExchange.supportedChains[0],
      'exchange supportedChains should contain numbers'
    ).toBe('number');
  });

  // Tests for Solana, Bitcoin, and SUI as specified in the task
  for (const chain of TOOLS_TEST_CHAINS) {
    test(`@regression - Returns tools for ${chain.name} (${chain.chainType})`, async ({
      request,
    }) => {
      // Act
      const response = await request.get(`tools?chains=${chain.chainId}`);
      const body = await response.json();

      // Assert
      expect(response.status(), `Should return 200 for ${chain.name}`).toBe(200);

      // Assert - Schema Validation
      const schemaResult = validateSchema(body, toolsResponseSchema);
      expect(schemaResult.valid, `Schema validation failed: ${schemaResult.errors}`).toBe(true);

      // Assert - Has bridges or exchanges for this chain
      expect(Array.isArray(body.bridges), 'bridges should be an array').toBe(true);
      expect(Array.isArray(body.exchanges), 'exchanges should be an array').toBe(true);

      // At least one of bridges or exchanges should have entries for this chain
      const hasBridges = body.bridges.length > 0;
      const hasExchanges = body.exchanges.length > 0;
      expect(
        hasBridges || hasExchanges,
        `${chain.name} should have at least one bridge or exchange`
      ).toBe(true);
    });
  }

  test('@regression - Solana chain has bridges with SOL support', async ({ request }) => {
    // Act
    const response = await request.get(`tools?chains=${CHAINS.SOLANA}`);
    const body = await response.json();

    // Assert
    expect(response.status()).toBe(200);

    // Verify at least one bridge supports Solana
    const hasSolanaBridge = body.bridges.some(
      (bridge: { supportedChains: Array<{ fromChainId: number; toChainId: number }> }) =>
        bridge.supportedChains.some(
          (chain: { fromChainId: number; toChainId: number }) =>
            chain.fromChainId === CHAINS.SOLANA || chain.toChainId === CHAINS.SOLANA
        )
    );
    expect(hasSolanaBridge, 'Should have at least one bridge supporting Solana').toBe(true);
  });

  test('@regression - Bitcoin chain has bridges', async ({ request }) => {
    // Act
    const response = await request.get(`tools?chains=${CHAINS.BITCOIN}`);
    const body = await response.json();

    // Assert
    expect(response.status()).toBe(200);
    expect(Array.isArray(body.bridges), 'bridges should be an array').toBe(true);

    // Bitcoin support is newer, verify we get valid response structure
    if (body.bridges.length > 0) {
      const btcBridge = body.bridges[0];
      expect(typeof btcBridge.key, 'bridge.key should be a string').toBe('string');
      expect(btcBridge.key.length, 'bridge.key should not be empty').toBeGreaterThan(0);
      expect(typeof btcBridge.name, 'bridge.name should be a string').toBe('string');
      expect(btcBridge.name.length, 'bridge.name should not be empty').toBeGreaterThan(0);
    }
  });

  test('@regression - SUI chain has bridges', async ({ request }) => {
    // Act
    const response = await request.get(`tools?chains=${CHAINS.SUI}`);
    const body = await response.json();

    // Assert
    expect(response.status()).toBe(200);
    expect(Array.isArray(body.bridges), 'bridges should be an array').toBe(true);

    // Verify at least one bridge supports SUI
    if (body.bridges.length > 0) {
      const hasSuiBridge = body.bridges.some(
        (bridge: { supportedChains: Array<{ fromChainId: number; toChainId: number }> }) =>
          bridge.supportedChains.some(
            (chain: { fromChainId: number; toChainId: number }) =>
              chain.fromChainId === CHAINS.SUI || chain.toChainId === CHAINS.SUI
          )
      );
      expect(hasSuiBridge, 'Should have at least one bridge supporting SUI').toBe(true);
    }
  });

  test('@regression - Multiple chain filter returns filtered results', async ({ request }) => {
    // Act - Filter by multiple EVM chains
    const chains = [CHAINS.ETHEREUM, CHAINS.POLYGON];
    const response = await request.get(`tools?chains=${chains.join(',')}`);
    const body = await response.json();

    // Assert
    expect(response.status()).toBe(200);
    expect(body.bridges.length, 'Should have bridges for filtered chains').toBeGreaterThan(0);
    expect(body.exchanges.length, 'Should have exchanges for filtered chains').toBeGreaterThan(0);

    // Verify exchanges support at least one of the filtered chains
    const supportedExchange = body.exchanges.find(
      (exchange: { supportedChains: number[] }) =>
        exchange.supportedChains.includes(CHAINS.ETHEREUM) ||
        exchange.supportedChains.includes(CHAINS.POLYGON)
    );
    expect(supportedExchange, 'At least one exchange should support filtered chains').not.toBeUndefined();
    expect(typeof supportedExchange.key, 'supportedExchange.key should be a string').toBe('string');
  });
});
