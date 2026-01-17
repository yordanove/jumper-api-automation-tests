/**
 * Common JSON schemas shared across endpoints
 */

export const tokenSchema = {
  type: 'object',
  required: ['address', 'chainId', 'symbol', 'decimals', 'name'],
  properties: {
    address: { type: 'string' },
    chainId: { type: 'number' },
    symbol: { type: 'string', minLength: 1 },
    decimals: { type: 'number', minimum: 0, maximum: 18 },
    name: { type: 'string' },
    coinKey: { type: 'string' },
    logoURI: { type: 'string' },
    priceUSD: { type: 'string' },
  },
  additionalProperties: true,
};

export const feeCostSchema = {
  type: 'object',
  required: ['name', 'token', 'amount'],
  properties: {
    name: { type: 'string' },
    description: { type: 'string' },
    token: tokenSchema,
    amount: { type: 'string' },
    amountUSD: { type: 'string' },
    percentage: { type: 'string' },
    included: { type: 'boolean' },
  },
  additionalProperties: true,
};

export const gasCostSchema = {
  type: 'object',
  required: ['type', 'estimate', 'token'],
  properties: {
    type: { type: 'string' },
    estimate: { type: 'string' },
    limit: { type: 'string' },
    amount: { type: 'string' },
    amountUSD: { type: 'string' },
    price: { type: 'string' },
    token: tokenSchema,
  },
  additionalProperties: true,
};

export const toolDetailsSchema = {
  type: 'object',
  required: ['key', 'name', 'logoURI'],
  properties: {
    key: { type: 'string' },
    name: { type: 'string' },
    logoURI: { type: 'string' },
  },
  additionalProperties: true,
};
