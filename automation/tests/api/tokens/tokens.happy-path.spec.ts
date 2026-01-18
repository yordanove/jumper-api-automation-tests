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
import { TEST_ADDRESSES } from '../../../data/test-addresses';
import { TOKENS } from '../../../data/tokens';
import { tokensResponseSchema, tokenDetailsSchema } from '../../schemas/tokens.schema';
import { validateSchema } from '../../../utils/schema-validator';

test.describe('GET /v1/tokens - Token Search @tokens @happy-path', () => {
  test('@smoke @regression - Returns tokens for Ethereum', async ({ request }) => {
    const params = new URLSearchParams({
      chains: CHAINS.ETHEREUM.toString(),
    });

    const response = await request.get(`tokens?${params}`);
    const body = await response.json();

    expect(response.status(), 'Should return 200 OK').toBe(200);

    const schemaResult = validateSchema(body, tokensResponseSchema);
    expect(schemaResult.valid, `Schema validation failed: ${schemaResult.errors}`).toBe(true);

    expect(typeof body.tokens, 'tokens should be an object').toBe('object');
    expect(Array.isArray(body.tokens[CHAINS.ETHEREUM.toString()]), 'Should have tokens array for Ethereum').toBe(true);
    expect(
      body.tokens[CHAINS.ETHEREUM.toString()].length,
      'Should have at least one token'
    ).toBeGreaterThan(0);
  });

  test('@regression - Returns tokens for multiple chains', async ({ request }) => {
    const params = new URLSearchParams({
      chains: `${CHAINS.ETHEREUM},${CHAINS.POLYGON}`,
    });

    const response = await request.get(`tokens?${params}`);
    const body = await response.json();

    expect(response.status()).toBe(200);
    expect(Array.isArray(body.tokens[CHAINS.ETHEREUM.toString()]), 'Should have Ethereum tokens array').toBe(true);
    expect(body.tokens[CHAINS.ETHEREUM.toString()].length, 'Ethereum tokens should not be empty').toBeGreaterThan(0);
    expect(Array.isArray(body.tokens[CHAINS.POLYGON.toString()]), 'Should have Polygon tokens array').toBe(true);
    expect(body.tokens[CHAINS.POLYGON.toString()].length, 'Polygon tokens should not be empty').toBeGreaterThan(0);
  });

  test('@regression - Token objects have required properties', async ({ request }) => {
    const params = new URLSearchParams({
      chains: CHAINS.ETHEREUM.toString(),
    });

    const response = await request.get(`tokens?${params}`);
    const body = await response.json();

    expect(response.status()).toBe(200);

    const tokens = body.tokens[CHAINS.ETHEREUM.toString()];
    expect(tokens.length).toBeGreaterThan(0);

    const token = tokens[0];
    expect(typeof token.address, 'address should be a string').toBe('string');
    expect(typeof token.chainId, 'chainId should be a number').toBe('number');
    expect(typeof token.symbol, 'symbol should be a string').toBe('string');
    expect(typeof token.decimals, 'decimals should be a number').toBe('number');
    expect(typeof token.name, 'name should be a string').toBe('string');
  });

  test('@regression - Returns tokens with price information', async ({ request }) => {
    const params = new URLSearchParams({
      chains: CHAINS.ETHEREUM.toString(),
    });

    const response = await request.get(`tokens?${params}`);
    const body = await response.json();

    expect(response.status()).toBe(200);

    const tokens = body.tokens[CHAINS.ETHEREUM.toString()];
    const ethToken = tokens.find(
      (t: { address: string }) => t.address === TEST_ADDRESSES.ZERO
    );
    expect(ethToken, 'Should find ETH token').toBeDefined();
    expect(ethToken.priceUSD, 'ETH should have priceUSD').toBeDefined();
    expect(typeof ethToken.priceUSD, 'priceUSD should be a string').toBe('string');
    expect(parseFloat(ethToken.priceUSD), 'ETH price should be a positive number').toBeGreaterThan(
      0
    );
  });

  test('@regression - Returns tokens for Solana', async ({ request }) => {
    const params = new URLSearchParams({
      chains: CHAINS.SOLANA.toString(),
    });

    const response = await request.get(`tokens?${params}`);
    const body = await response.json();

    expect(response.status()).toBe(200);
    expect(Array.isArray(body.tokens[CHAINS.SOLANA.toString()]), 'Should have Solana tokens array').toBe(true);
    expect(
      body.tokens[CHAINS.SOLANA.toString()].length,
      'Should have at least one Solana token'
    ).toBeGreaterThan(0);
  });
});

test.describe('GET /v1/token - Token Details & Price @tokens @happy-path', () => {
  test('@smoke @regression - Get token details by symbol', async ({ request }) => {
    const params = new URLSearchParams({
      chain: CHAINS.ETHEREUM.toString(),
      token: 'USDC',
    });

    const response = await request.get(`token?${params}`);
    const body = await response.json();

    expect(response.status(), 'Should return 200 OK').toBe(200);

    const schemaResult = validateSchema(body, tokenDetailsSchema);
    expect(schemaResult.valid, `Schema validation failed: ${schemaResult.errors}`).toBe(true);

    expect(body.symbol.toUpperCase(), 'Should return USDC').toBe('USDC');
    expect(body.chainId, 'Should be on Ethereum').toBe(CHAINS.ETHEREUM);
  });

  test('@smoke @regression - Token includes accurate price', async ({ request }) => {
    const params = new URLSearchParams({
      chain: CHAINS.ETHEREUM.toString(),
      token: 'USDC',
    });

    const response = await request.get(`token?${params}`);
    const body = await response.json();

    expect(response.status()).toBe(200);
    expect(typeof body.priceUSD, 'priceUSD should be a string').toBe('string');

    const price = parseFloat(body.priceUSD);
    expect(price, 'USDC price should be a positive number').toBeGreaterThan(0);
    // USDC is a stablecoin, price should be close to $1 (within 5%)
    expect(price, 'USDC price should be close to $1').toBeGreaterThan(0.95);
    expect(price, 'USDC price should be close to $1').toBeLessThan(1.05);
  });

  test('@regression - Get token details by address', async ({ request }) => {
    const params = new URLSearchParams({
      chain: CHAINS.ETHEREUM.toString(),
      token: TOKENS[CHAINS.ETHEREUM].USDC.address,
    });

    const response = await request.get(`token?${params}`);
    const body = await response.json();

    expect(response.status()).toBe(200);
    expect(body.symbol.toUpperCase()).toBe('USDC');
    expect(body.address.toLowerCase()).toBe(TOKENS[CHAINS.ETHEREUM].USDC.address.toLowerCase());
  });

  test('@regression - Token includes market data', async ({ request }) => {
    const params = new URLSearchParams({
      chain: CHAINS.ETHEREUM.toString(),
      token: 'USDC',
    });

    const response = await request.get(`token?${params}`);
    const body = await response.json();

    expect(response.status()).toBe(200);
    expect(typeof body.priceUSD, 'priceUSD should be a string').toBe('string');

    // Market cap and volume may not always be present
    if (body.marketCapUSD !== undefined) {
      expect(typeof body.marketCapUSD, 'marketCapUSD should be a number').toBe('number');
      expect(body.marketCapUSD, 'marketCapUSD should be positive').toBeGreaterThan(0);
    }
    if (body.volumeUSD24H !== undefined) {
      expect(typeof body.volumeUSD24H, 'volumeUSD24H should be a number').toBe('number');
    }
  });

  test('@regression - Get native token (ETH) details', async ({ request }) => {
    const params = new URLSearchParams({
      chain: CHAINS.ETHEREUM.toString(),
      token: TEST_ADDRESSES.ZERO, // Native token uses zero address
    });

    const response = await request.get(`token?${params}`);
    const body = await response.json();

    expect(response.status()).toBe(200);
    expect(body.symbol.toUpperCase()).toBe('ETH');
    expect(body.decimals).toBe(18);
    expect(typeof body.priceUSD, 'priceUSD should be a string').toBe('string');
    expect(parseFloat(body.priceUSD), 'ETH price should be significant').toBeGreaterThan(100);
  });

  test('@regression - Get token on Polygon', async ({ request }) => {
    const params = new URLSearchParams({
      chain: CHAINS.POLYGON.toString(),
      token: 'USDC',
    });

    const response = await request.get(`token?${params}`);
    const body = await response.json();

    expect(response.status()).toBe(200);
    expect(body.symbol.toUpperCase()).toBe('USDC');
    expect(body.chainId).toBe(CHAINS.POLYGON);
    expect(typeof body.priceUSD, 'priceUSD should be a string').toBe('string');
    expect(parseFloat(body.priceUSD), 'USDC price should be positive').toBeGreaterThan(0);
  });
});
