/**
 * JSON Schema for error response validation
 */

export const errorResponseSchema = {
  type: 'object',
  required: ['message'],
  properties: {
    message: { type: 'string', minLength: 1 },
    code: { type: 'number' },
    errors: { type: 'object' },
  },
  additionalProperties: true,
};

/**
 * LI.FI API error codes
 * @see https://docs.li.fi/api-reference/error-codes
 */
export const ERROR_CODES = {
  DEFAULT_ERROR: 1000,
  FAILED_TO_BUILD_TRANSACTION: 1001,
  NO_QUOTE_ERROR: 1002,
  NOT_FOUND_ERROR: 1003,
  NOT_PROCESSABLE_ERROR: 1004,
  RATE_LIMIT_ERROR: 1005,
  SERVER_ERROR: 1006,
  SLIPPAGE_ERROR: 1007,
  THIRD_PARTY_ERROR: 1008,
  TIMEOUT_ERROR: 1009,
  UNAUTHORIZED_ERROR: 1010,
  VALIDATION_ERROR: 1011,
  RPC_FAILURE: 1012,
  MALFORMED_SCHEMA: 1013,
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];
