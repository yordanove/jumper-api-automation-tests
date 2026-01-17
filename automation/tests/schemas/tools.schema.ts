/**
 * JSON Schema for GET /v1/tools response validation
 */

export const bridgeSchema = {
  type: 'object',
  required: ['key', 'name', 'logoURI', 'supportedChains'],
  properties: {
    key: { type: 'string', minLength: 1 },
    name: { type: 'string', minLength: 1 },
    logoURI: { type: 'string' },
    supportedChains: {
      type: 'array',
      items: {
        type: 'object',
        required: ['fromChainId', 'toChainId'],
        properties: {
          fromChainId: { type: 'number' },
          toChainId: { type: 'number' },
        },
      },
    },
  },
  additionalProperties: true,
};

export const exchangeSchema = {
  type: 'object',
  required: ['key', 'name', 'logoURI', 'supportedChains'],
  properties: {
    key: { type: 'string', minLength: 1 },
    name: { type: 'string', minLength: 1 },
    logoURI: { type: 'string' },
    supportedChains: {
      type: 'array',
      items: { type: 'number' },
    },
  },
  additionalProperties: true,
};

export const toolsResponseSchema = {
  type: 'object',
  required: ['bridges', 'exchanges'],
  properties: {
    bridges: {
      type: 'array',
      items: bridgeSchema,
    },
    exchanges: {
      type: 'array',
      items: exchangeSchema,
    },
  },
  additionalProperties: true,
};
