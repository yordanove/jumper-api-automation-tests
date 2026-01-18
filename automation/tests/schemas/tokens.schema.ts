/**
 * JSON Schemas for token endpoint response validation
 */

/**
 * Schema for a single token object
 */
export const tokenSchema = {
  type: 'object',
  required: ['address', 'chainId', 'symbol', 'decimals', 'name'],
  properties: {
    address: { type: 'string', minLength: 1 },
    chainId: { type: 'number' },
    symbol: { type: 'string', minLength: 1 },
    decimals: { type: 'number', minimum: 0 },
    name: { type: 'string', minLength: 1 },
    coinKey: { type: 'string' },
    logoURI: { type: 'string' },
    priceUSD: { type: 'string' },
  },
  additionalProperties: true,
};

/**
 * Schema for GET /v1/tokens response
 * Returns tokens grouped by chain ID
 */
export const tokensResponseSchema = {
  type: 'object',
  required: ['tokens'],
  properties: {
    tokens: {
      type: 'object',
      additionalProperties: {
        type: 'array',
        items: tokenSchema,
      },
    },
  },
  additionalProperties: true,
};

/**
 * Schema for GET /v1/token response (single token with price details)
 */
export const tokenDetailsSchema = {
  type: 'object',
  required: ['address', 'chainId', 'symbol', 'decimals', 'name', 'priceUSD'],
  properties: {
    address: { type: 'string', minLength: 1 },
    chainId: { type: 'number' },
    symbol: { type: 'string', minLength: 1 },
    decimals: { type: 'number', minimum: 0 },
    name: { type: 'string', minLength: 1 },
    coinKey: { type: 'string' },
    logoURI: { type: 'string' },
    priceUSD: { type: 'string' },
    marketCapUSD: { type: 'number' },
    volumeUSD24H: { type: 'number' },
    tags: {
      type: 'array',
      items: { type: 'string' },
    },
  },
  additionalProperties: true,
};
