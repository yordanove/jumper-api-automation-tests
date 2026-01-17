/**
 * JSON Schema for POST /v1/advanced/routes response validation
 */

import { tokenSchema } from './common.schema';

export const routeStepSchema = {
  type: 'object',
  required: ['type', 'id', 'tool', 'action', 'estimate'],
  properties: {
    type: { type: 'string' },
    id: { type: 'string' },
    tool: { type: 'string' },
    toolDetails: {
      type: 'object',
      properties: {
        key: { type: 'string' },
        name: { type: 'string' },
        logoURI: { type: 'string' },
      },
    },
    action: { type: 'object' },
    estimate: { type: 'object' },
  },
  additionalProperties: true,
};

export const routeSchema = {
  type: 'object',
  required: ['id', 'fromChainId', 'fromAmount', 'fromToken', 'toChainId', 'toAmount', 'toToken', 'steps'],
  properties: {
    id: { type: 'string' },
    fromChainId: { type: 'number' },
    fromAmountUSD: { type: 'string' },
    fromAmount: { type: 'string' },
    fromToken: tokenSchema,
    toChainId: { type: 'number' },
    toAmountUSD: { type: 'string' },
    toAmount: { type: 'string' },
    toAmountMin: { type: 'string' },
    toToken: tokenSchema,
    gasCostUSD: { type: 'string' },
    containsSwitchChain: { type: 'boolean' },
    steps: {
      type: 'array',
      minItems: 1,
      items: routeStepSchema,
    },
  },
  additionalProperties: true,
};

export const routesResponseSchema = {
  type: 'object',
  required: ['routes'],
  properties: {
    routes: {
      type: 'array',
      items: routeSchema,
    },
    unavailableRoutes: {
      type: 'object',
      properties: {
        filteredOut: { type: 'array' },
        failed: { type: 'array' },
      },
    },
  },
  additionalProperties: true,
};
