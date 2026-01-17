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

export const CHAIN_NAMES: Record<number, string> = {
  [CHAINS.ETHEREUM]: 'Ethereum',
  [CHAINS.POLYGON]: 'Polygon',
  [CHAINS.ARBITRUM]: 'Arbitrum',
  [CHAINS.BSC]: 'BSC',
  [CHAINS.OPTIMISM]: 'Optimism',
  [CHAINS.BASE]: 'Base',
  [CHAINS.AVALANCHE]: 'Avalanche',
  [CHAINS.SOLANA]: 'Solana',
  [CHAINS.BITCOIN]: 'Bitcoin',
  [CHAINS.SUI]: 'SUI',
};

export const CHAIN_TYPES = {
  EVM: 'EVM',
  SVM: 'SVM',
  UTXO: 'UTXO',
  MVM: 'MVM',
} as const;

export const CHAIN_TYPE_MAP: Record<number, string> = {
  [CHAINS.ETHEREUM]: CHAIN_TYPES.EVM,
  [CHAINS.POLYGON]: CHAIN_TYPES.EVM,
  [CHAINS.ARBITRUM]: CHAIN_TYPES.EVM,
  [CHAINS.BSC]: CHAIN_TYPES.EVM,
  [CHAINS.OPTIMISM]: CHAIN_TYPES.EVM,
  [CHAINS.BASE]: CHAIN_TYPES.EVM,
  [CHAINS.AVALANCHE]: CHAIN_TYPES.EVM,
  [CHAINS.SOLANA]: CHAIN_TYPES.SVM,
  [CHAINS.BITCOIN]: CHAIN_TYPES.UTXO,
  [CHAINS.SUI]: CHAIN_TYPES.MVM,
};
