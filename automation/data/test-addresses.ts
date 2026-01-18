/**
 * Test wallet addresses for API testing
 * Note: These are test addresses only - do not use for real transactions
 */

export const TEST_ADDRESSES = {
  // Generic test address for EVM API calls
  EVM_DEFAULT: '0x552008c0f6870c2f77e5cC1d2eb9bdff03e30Ea0',

  // Zero address (native token representation)
  ZERO: '0x0000000000000000000000000000000000000000',

  // Invalid addresses for negative testing
  INVALID: {
    NOT_HEX: 'not-an-address',
    TOO_SHORT: '0x123',
  },
} as const;
