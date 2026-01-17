/**
 * Token addresses and metadata for testing
 * Note: Native tokens use zero address (0x0...0)
 */

import { CHAINS } from './chains';

export interface TokenInfo {
  symbol: string;
  address: string;
  decimals: number;
}

export const TOKENS: Record<number, Record<string, TokenInfo>> = {
  [CHAINS.ETHEREUM]: {
    ETH: {
      symbol: 'ETH',
      address: '0x0000000000000000000000000000000000000000',
      decimals: 18,
    },
    USDC: {
      symbol: 'USDC',
      address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      decimals: 6,
    },
    USDT: {
      symbol: 'USDT',
      address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      decimals: 6,
    },
    WETH: {
      symbol: 'WETH',
      address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
      decimals: 18,
    },
    DAI: {
      symbol: 'DAI',
      address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
      decimals: 18,
    },
  },
  [CHAINS.POLYGON]: {
    MATIC: {
      symbol: 'MATIC',
      address: '0x0000000000000000000000000000000000000000',
      decimals: 18,
    },
    USDC: {
      symbol: 'USDC',
      address: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359',
      decimals: 6,
    },
    'USDC.e': {
      symbol: 'USDC.e',
      address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
      decimals: 6,
    },
    USDT: {
      symbol: 'USDT',
      address: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
      decimals: 6,
    },
  },
  [CHAINS.ARBITRUM]: {
    ETH: {
      symbol: 'ETH',
      address: '0x0000000000000000000000000000000000000000',
      decimals: 18,
    },
    USDC: {
      symbol: 'USDC',
      address: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
      decimals: 6,
    },
    'USDC.e': {
      symbol: 'USDC.e',
      address: '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8',
      decimals: 6,
    },
    USDT: {
      symbol: 'USDT',
      address: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
      decimals: 6,
    },
  },
  [CHAINS.BSC]: {
    BNB: {
      symbol: 'BNB',
      address: '0x0000000000000000000000000000000000000000',
      decimals: 18,
    },
    USDT: {
      symbol: 'USDT',
      address: '0x55d398326f99059fF775485246999027B3197955',
      decimals: 18,
    },
    USDC: {
      symbol: 'USDC',
      address: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
      decimals: 18,
    },
    BUSD: {
      symbol: 'BUSD',
      address: '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56',
      decimals: 18,
    },
  },
};

/**
 * Helper to get token info by symbol and chain
 */
export function getToken(chainId: number, symbol: string): TokenInfo | undefined {
  return TOKENS[chainId]?.[symbol];
}

/**
 * Helper to format amount with decimals
 */
export function toTokenAmount(amount: number, decimals: number): string {
  return (amount * 10 ** decimals).toString();
}
