/**
 * Test data for token pairs and test scenarios
 */

import { CHAINS } from './chains';
import { TOKENS } from './tokens';
import { TEST_ADDRESSES } from './test-addresses';

/**
 * Resolve token address from TOKENS registry.
 * Falls back to the symbol if not found (for direct address usage).
 */
function getTokenAddress(chainId: number, symbol: string): string {
  const tokenInfo = TOKENS[chainId]?.[symbol];
  return tokenInfo?.address ?? symbol;
}

export interface TestPair {
  name: string;
  fromChain: number;
  toChain: number;
  fromToken: string;
  fromTokenAddress: string;
  toToken: string;
  toTokenAddress: string;
  fromAmount: string;
  type: 'swap' | 'bridge';
  tags: string[];
}

/**
 * Happy path test pairs (12 pairs covering swap and bridge scenarios)
 * Selection rationale:
 * - Mix of same-chain swaps and cross-chain bridges
 * - Popular token pairs (USDC, ETH, stablecoins)
 * - Coverage of major chains (Ethereum, Polygon, Arbitrum, BSC, Optimism, Base, Avalanche)
 */
export const HAPPY_PATH_PAIRS: TestPair[] = [
  // Cross-chain bridges
  {
    name: 'USDC Ethereum to Polygon bridge',
    fromChain: CHAINS.ETHEREUM,
    toChain: CHAINS.POLYGON,
    fromToken: 'USDC',
    fromTokenAddress: getTokenAddress(CHAINS.ETHEREUM, 'USDC'),
    toToken: 'USDC',
    toTokenAddress: getTokenAddress(CHAINS.POLYGON, 'USDC'),
    fromAmount: '1000000', // 1 USDC (6 decimals)
    type: 'bridge',
    tags: ['smoke', 'regression', 'bridge'],
  },
  {
    name: 'USDC Polygon to Arbitrum bridge',
    fromChain: CHAINS.POLYGON,
    toChain: CHAINS.ARBITRUM,
    fromToken: 'USDC',
    fromTokenAddress: getTokenAddress(CHAINS.POLYGON, 'USDC'),
    toToken: 'USDC',
    toTokenAddress: getTokenAddress(CHAINS.ARBITRUM, 'USDC'),
    fromAmount: '1000000', // 1 USDC
    type: 'bridge',
    tags: ['regression', 'bridge'],
  },
  {
    name: 'USDT BSC to Ethereum bridge',
    fromChain: CHAINS.BSC,
    toChain: CHAINS.ETHEREUM,
    fromToken: 'USDT',
    fromTokenAddress: getTokenAddress(CHAINS.BSC, 'USDT'),
    toToken: 'USDT',
    toTokenAddress: getTokenAddress(CHAINS.ETHEREUM, 'USDT'),
    fromAmount: '1000000000000000000', // 1 USDT (18 decimals on BSC)
    type: 'bridge',
    tags: ['regression', 'bridge'],
  },
  {
    name: 'USDC Ethereum to Optimism bridge',
    fromChain: CHAINS.ETHEREUM,
    toChain: CHAINS.OPTIMISM,
    fromToken: 'USDC',
    fromTokenAddress: getTokenAddress(CHAINS.ETHEREUM, 'USDC'),
    toToken: 'USDC',
    toTokenAddress: getTokenAddress(CHAINS.OPTIMISM, 'USDC'),
    fromAmount: '1000000', // 1 USDC
    type: 'bridge',
    tags: ['regression', 'bridge'],
  },
  {
    name: 'USDC Ethereum to Base bridge',
    fromChain: CHAINS.ETHEREUM,
    toChain: CHAINS.BASE,
    fromToken: 'USDC',
    fromTokenAddress: getTokenAddress(CHAINS.ETHEREUM, 'USDC'),
    toToken: 'USDC',
    toTokenAddress: getTokenAddress(CHAINS.BASE, 'USDC'),
    fromAmount: '1000000', // 1 USDC
    type: 'bridge',
    tags: ['regression', 'bridge'],
  },
  {
    name: 'USDC Ethereum to Avalanche bridge',
    fromChain: CHAINS.ETHEREUM,
    toChain: CHAINS.AVALANCHE,
    fromToken: 'USDC',
    fromTokenAddress: getTokenAddress(CHAINS.ETHEREUM, 'USDC'),
    toToken: 'USDC',
    toTokenAddress: getTokenAddress(CHAINS.AVALANCHE, 'USDC'),
    fromAmount: '1000000', // 1 USDC
    type: 'bridge',
    tags: ['regression', 'bridge'],
  },

  // Same-chain swaps
  {
    name: 'ETH to USDC swap on Ethereum',
    fromChain: CHAINS.ETHEREUM,
    toChain: CHAINS.ETHEREUM,
    fromToken: 'ETH',
    fromTokenAddress: getTokenAddress(CHAINS.ETHEREUM, 'ETH'),
    toToken: 'USDC',
    toTokenAddress: getTokenAddress(CHAINS.ETHEREUM, 'USDC'),
    fromAmount: '100000000000000000', // 0.1 ETH
    type: 'swap',
    tags: ['smoke', 'regression', 'swap'],
  },
  {
    name: 'USDC to USDT swap on Ethereum',
    fromChain: CHAINS.ETHEREUM,
    toChain: CHAINS.ETHEREUM,
    fromToken: 'USDC',
    fromTokenAddress: getTokenAddress(CHAINS.ETHEREUM, 'USDC'),
    toToken: 'USDT',
    toTokenAddress: getTokenAddress(CHAINS.ETHEREUM, 'USDT'),
    fromAmount: '10000000', // 10 USDC
    type: 'swap',
    tags: ['regression', 'swap'],
  },
  {
    name: 'POL to USDC swap on Polygon',
    fromChain: CHAINS.POLYGON,
    toChain: CHAINS.POLYGON,
    fromToken: 'MATIC',
    fromTokenAddress: getTokenAddress(CHAINS.POLYGON, 'MATIC'),
    toToken: 'USDC',
    toTokenAddress: getTokenAddress(CHAINS.POLYGON, 'USDC'),
    fromAmount: '1000000000000000000', // 1 POL
    type: 'swap',
    tags: ['regression', 'swap'],
  },
  {
    name: 'ETH to USDC swap on Optimism',
    fromChain: CHAINS.OPTIMISM,
    toChain: CHAINS.OPTIMISM,
    fromToken: 'ETH',
    fromTokenAddress: getTokenAddress(CHAINS.OPTIMISM, 'ETH'),
    toToken: 'USDC',
    toTokenAddress: getTokenAddress(CHAINS.OPTIMISM, 'USDC'),
    fromAmount: '100000000000000000', // 0.1 ETH
    type: 'swap',
    tags: ['regression', 'swap'],
  },
  {
    name: 'ETH to USDC swap on Base',
    fromChain: CHAINS.BASE,
    toChain: CHAINS.BASE,
    fromToken: 'ETH',
    fromTokenAddress: getTokenAddress(CHAINS.BASE, 'ETH'),
    toToken: 'USDC',
    toTokenAddress: getTokenAddress(CHAINS.BASE, 'USDC'),
    fromAmount: '100000000000000000', // 0.1 ETH
    type: 'swap',
    tags: ['regression', 'swap'],
  },
  {
    name: 'AVAX to USDC swap on Avalanche',
    fromChain: CHAINS.AVALANCHE,
    toChain: CHAINS.AVALANCHE,
    fromToken: 'AVAX',
    fromTokenAddress: getTokenAddress(CHAINS.AVALANCHE, 'AVAX'),
    toToken: 'USDC',
    toTokenAddress: getTokenAddress(CHAINS.AVALANCHE, 'USDC'),
    fromAmount: '1000000000000000000', // 1 AVAX
    type: 'swap',
    tags: ['regression', 'swap'],
  },
];

/**
 * Negative test cases for validation testing
 */
export const NEGATIVE_TEST_CASES = {
  INVALID_TOKEN: {
    name: 'Invalid token symbol',
    fromChain: CHAINS.ETHEREUM,
    toChain: CHAINS.POLYGON,
    fromToken: 'INVALID_TOKEN_XYZ',
    toToken: 'USDC',
    fromAmount: '1000000',
    expectedStatus: 400,
    expectedCode: 1011,
  },
  ZERO_AMOUNT: {
    name: 'Zero amount',
    fromChain: CHAINS.ETHEREUM,
    toChain: CHAINS.POLYGON,
    fromToken: 'USDC',
    toToken: 'USDC',
    fromAmount: '0',
    expectedStatus: 400,
    expectedCode: 1011,
  },
  NEGATIVE_AMOUNT: {
    name: 'Negative amount',
    fromChain: CHAINS.ETHEREUM,
    toChain: CHAINS.POLYGON,
    fromToken: 'USDC',
    toToken: 'USDC',
    fromAmount: '-1000000',
    expectedStatus: 400,
    expectedCode: 1011,
  },
  INVALID_CHAIN: {
    name: 'Invalid chain ID',
    fromChain: 999999,
    toChain: CHAINS.POLYGON,
    fromToken: 'USDC',
    toToken: 'USDC',
    fromAmount: '1000000',
    expectedStatus: 400,
    expectedCode: 1011,
  },
  INVALID_ADDRESS: {
    name: 'Invalid wallet address format',
    fromChain: CHAINS.ETHEREUM,
    toChain: CHAINS.POLYGON,
    fromToken: 'USDC',
    toToken: 'USDC',
    fromAmount: '1000000',
    fromAddress: TEST_ADDRESSES.INVALID.NOT_HEX,
    expectedStatus: 400,
    expectedCode: 1011,
  },
} as const;

/**
 * Tools endpoint test data for non-EVM chains
 */
export const TOOLS_TEST_CHAINS = [
  {
    chainId: CHAINS.SOLANA,
    name: 'Solana',
    chainType: 'SVM',
  },
  {
    chainId: CHAINS.BITCOIN,
    name: 'Bitcoin',
    chainType: 'UTXO',
  },
  {
    chainId: CHAINS.SUI,
    name: 'SUI',
    chainType: 'MVM',
  },
];
