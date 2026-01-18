/**
 * GET /v1/tokens & GET /v1/token - Happy Path Tests
 *
 * Tests token search and retrieval functionality:
 * - Token listing by chain
 * - Token search by symbol
 * - Token price retrieval
 */

import { test, expect } from '@playwright/test';
import { CHAINS } from '../../../data/chains';
import { tokensResponseSchema, tokenDetailsSchema } from '../../schemas/tokens.schema';
import { validateSchema } from '../../../utils/schema-validator';

test.describe('GET /v1/tokens - Token Search @tokens @happy-path', () => {
  test('@smoke @regression - Returns tokens for Ethereum', async ({ request }) => {
    // Arrange
    const params = new URLSearchParams({
      chains: CHAINS.ETHEREUM.toString(),
    });

    // Act
    const response = await request.get(`tokens?${params}`);
    const body = await response.json();

    // Assert - Status
    expect(response.status(), 'Should return 200 OK').toBe(200);

    // Assert - Schema
    const schemaResult = validateSchema(body, tokensResponseSchema);
    expect(schemaResult.valid, `Schema validation failed: ${schemaResult.errors}`).toBe(true);

    // Assert - Contains tokens for requested chain
    expect(body.tokens, 'Should have tokens object').toBeDefined();
    expect(body.tokens[CHAINS.ETHEREUM.toString()], 'Should have tokens for Ethereum').toBeDefined();
    expect(
      body.tokens[CHAINS.ETHEREUM.toString()].length,
      'Should have at least one token'
    ).toBeGreaterThan(0);
  });

  test('@regression - Returns tokens for multiple chains', async ({ request }) => {
    // Arrange - Request tokens for Ethereum and Polygon
    const params = new URLSearchParams({
      chains: `${CHAINS.ETHEREUM},${CHAINS.POLYGON}`,
    });

    // Act
    const response = await request.get(`tokens?${params}`);
    const body = await response.json();

    // Assert
    expect(response.status()).toBe(200);
    expect(body.tokens[CHAINS.ETHEREUM.toString()], 'Should have Ethereum tokens').toBeDefined();
    expect(body.tokens[CHAINS.POLYGON.toString()], 'Should have Polygon tokens').toBeDefined();
  });

  test('@regression - Token objects have required properties', async ({ request }) => {
    // Arrange
    const params = new URLSearchParams({
      chains: CHAINS.ETHEREUM.toString(),
    });

    // Act
    const response = await request.get(`tokens?${params}`);
    const body = await response.json();

    // Assert
    expect(response.status()).toBe(200);

    const tokens = body.tokens[CHAINS.ETHEREUM.toString()];
    expect(tokens.length).toBeGreaterThan(0);

    // Check first token has required fields
    const token = tokens[0];
    expect(typeof token.address, 'address should be a string').toBe('string');
    expect(typeof token.chainId, 'chainId should be a number').toBe('number');
    expect(typeof token.symbol, 'symbol should be a string').toBe('string');
    expect(typeof token.decimals, 'decimals should be a number').toBe('number');
    expect(typeof token.name, 'name should be a string').toBe('string');
  });

  test('@regression - Returns tokens with price information', async ({ request }) => {
    // Arrange
    const params = new URLSearchParams({
      chains: CHAINS.ETHEREUM.toString(),
    });

    // Act
    const response = await request.get(`tokens?${params}`);
    const body = await response.json();

    // Assert
    expect(response.status()).toBe(200);

    const tokens = body.tokens[CHAINS.ETHEREUM.toString()];
    // Find ETH token which should always have price
    const ethToken = tokens.find(
      (t: { address: string }) => t.address === '0x0000000000000000000000000000000000000000'
    );
    expect(ethToken, 'Should find ETH token').toBeDefined();
    expect(ethToken.priceUSD, 'ETH should have priceUSD').toBeDefined();
    expect(typeof ethToken.priceUSD, 'priceUSD should be a string').toBe('string');
    expect(parseFloat(ethToken.priceUSD), 'ETH price should be a positive number').toBeGreaterThan(
      0
    );
  });

  test('@regression - Returns tokens for Solana', async ({ request }) => {
    // Arrange
    const params = new URLSearchParams({
      chains: CHAINS.SOLANA.toString(),
    });

    // Act
    const response = await request.get(`tokens?${params}`);
    const body = await response.json();

    // Assert
    expect(response.status()).toBe(200);
    expect(body.tokens[CHAINS.SOLANA.toString()], 'Should have Solana tokens').toBeDefined();
    expect(
      body.tokens[CHAINS.SOLANA.toString()].length,
      'Should have at least one Solana token'
    ).toBeGreaterThan(0);
  });
});

test.describe('GET /v1/token - Token Details & Price @tokens @happy-path', () => {
  test('@smoke @regression - Get token details by symbol', async ({ request }) => {
    // Arrange - Get USDC on Ethereum by symbol
    const params = new URLSearchParams({
      chain: CHAINS.ETHEREUM.toString(),
      token: 'USDC',
    });

    // Act
    const response = await request.get(`token?${params}`);
    const body = await response.json();

    // Assert - Status
    expect(response.status(), 'Should return 200 OK').toBe(200);

    // Assert - Schema
    const schemaResult = validateSchema(body, tokenDetailsSchema);
    expect(schemaResult.valid, `Schema validation failed: ${schemaResult.errors}`).toBe(true);

    // Assert - Correct token returned
    expect(body.symbol.toUpperCase(), 'Should return USDC').toBe('USDC');
    expect(body.chainId, 'Should be on Ethereum').toBe(CHAINS.ETHEREUM);
  });

  test('@smoke @regression - Token includes accurate price', async ({ request }) => {
    // Arrange - Get USDC which should be ~$1
    const params = new URLSearchParams({
      chain: CHAINS.ETHEREUM.toString(),
      token: 'USDC',
    });

    // Act
    const response = await request.get(`token?${params}`);
    const body = await response.json();

    // Assert
    expect(response.status()).toBe(200);
    expect(body.priceUSD, 'Should have priceUSD').toBeDefined();

    const price = parseFloat(body.priceUSD);
    expect(price, 'USDC price should be a positive number').toBeGreaterThan(0);
    // USDC is a stablecoin, price should be close to $1 (within 5%)
    expect(price, 'USDC price should be close to $1').toBeGreaterThan(0.95);
    expect(price, 'USDC price should be close to $1').toBeLessThan(1.05);
  });

  test('@regression - Get token details by address', async ({ request }) => {
    // Arrange - Get USDC by contract address
    const params = new URLSearchParams({
      chain: CHAINS.ETHEREUM.toString(),
      token: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC address
    });

    // Act
    const response = await request.get(`token?${params}`);
    const body = await response.json();

    // Assert
    expect(response.status()).toBe(200);
    expect(body.symbol.toUpperCase()).toBe('USDC');
    expect(body.address.toLowerCase()).toBe('0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48');
  });

  test('@regression - Token includes market data', async ({ request }) => {
    // Arrange - Get a major token that should have market data
    const params = new URLSearchParams({
      chain: CHAINS.ETHEREUM.toString(),
      token: 'USDC',
    });

    // Act
    const response = await request.get(`token?${params}`);
    const body = await response.json();

    // Assert
    expect(response.status()).toBe(200);

    // Market cap and volume may not always be present, but priceUSD should be
    expect(body.priceUSD, 'Should have priceUSD').toBeDefined();

    // If market data is present, validate it
    if (body.marketCapUSD !== undefined) {
      expect(typeof body.marketCapUSD, 'marketCapUSD should be a number').toBe('number');
      expect(body.marketCapUSD, 'marketCapUSD should be positive').toBeGreaterThan(0);
    }
    if (body.volumeUSD24H !== undefined) {
      expect(typeof body.volumeUSD24H, 'volumeUSD24H should be a number').toBe('number');
    }
  });

  test('@regression - Get native token (ETH) details', async ({ request }) => {
    // Arrange - Get ETH using native token address
    const params = new URLSearchParams({
      chain: CHAINS.ETHEREUM.toString(),
      token: '0x0000000000000000000000000000000000000000',
    });

    // Act
    const response = await request.get(`token?${params}`);
    const body = await response.json();

    // Assert
    expect(response.status()).toBe(200);
    expect(body.symbol.toUpperCase()).toBe('ETH');
    expect(body.decimals).toBe(18);
    expect(body.priceUSD, 'ETH should have price').toBeDefined();
    expect(parseFloat(body.priceUSD), 'ETH price should be significant').toBeGreaterThan(100);
  });

  test('@regression - Get token on Polygon', async ({ request }) => {
    // Arrange - Get USDC on Polygon
    const params = new URLSearchParams({
      chain: CHAINS.POLYGON.toString(),
      token: 'USDC',
    });

    // Act
    const response = await request.get(`token?${params}`);
    const body = await response.json();

    // Assert
    expect(response.status()).toBe(200);
    expect(body.symbol.toUpperCase()).toBe('USDC');
    expect(body.chainId).toBe(CHAINS.POLYGON);
    expect(body.priceUSD, 'Should have priceUSD').toBeDefined();
  });
});
