/**
 * JSON Schema for GET /v1/quote response validation
 */

import { tokenSchema, feeCostSchema, gasCostSchema, toolDetailsSchema } from './common.schema';

export const quoteResponseSchema = {
  type: 'object',
  required: ['type', 'id', 'tool', 'toolDetails', 'action', 'estimate'],
  properties: {
    type: { type: 'string', enum: ['lifi', 'swap', 'cross'] },
    id: { type: 'string', minLength: 1 },
    tool: { type: 'string', minLength: 1 },
    toolDetails: toolDetailsSchema,
    action: {
      type: 'object',
      required: ['fromToken', 'fromAmount', 'toToken', 'fromChainId', 'toChainId'],
      properties: {
        fromToken: tokenSchema,
        fromAmount: { type: 'string' },
        toToken: tokenSchema,
        fromChainId: { type: 'number' },
        toChainId: { type: 'number' },
        slippage: { type: 'number' },
        fromAddress: { type: 'string' },
        toAddress: { type: 'string' },
      },
      additionalProperties: true,
    },
    estimate: {
      type: 'object',
      required: ['toAmount', 'toAmountMin'],
      properties: {
        tool: { type: 'string' },
        approvalAddress: { type: 'string' },
        toAmountMin: { type: 'string' },
        toAmount: { type: 'string' },
        fromAmount: { type: 'string' },
        feeCosts: { type: 'array', items: feeCostSchema },
        gasCosts: { type: 'array', items: gasCostSchema },
        executionDuration: { type: 'number' },
      },
      additionalProperties: true,
    },
    transactionRequest: {
      type: 'object',
      properties: {
        to: { type: 'string' },
        from: { type: 'string' },
        data: { type: 'string' },
        value: { type: 'string' },
        gasLimit: { type: 'string' },
        gasPrice: { type: 'string' },
      },
      additionalProperties: true,
    },
    includedSteps: {
      type: 'array',
      items: { type: 'object' },
    },
  },
  additionalProperties: true,
};
