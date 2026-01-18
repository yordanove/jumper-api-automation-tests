/**
 * Chain ID constants for LI.FI API
 * Reference: https://docs.li.fi
 */

export const CHAINS = {
  // EVM Chains
  ETHEREUM: 1,
  POLYGON: 137,
  ARBITRUM: 42161,
  BSC: 56,
  OPTIMISM: 10,
  BASE: 8453,
  AVALANCHE: 43114,

  // Non-EVM Chains
  SOLANA: 1151111081099710,
  BITCOIN: 20000000000001,
  SUI: 9270000000000000,
} as const;

export type ChainId = (typeof CHAINS)[keyof typeof CHAINS];
