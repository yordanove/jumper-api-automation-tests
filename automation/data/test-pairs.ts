/**
 * Test data for token pairs and test scenarios
 */

import { CHAINS } from './chains';
import { TEST_ADDRESSES } from './test-addresses';

export interface TestPair {
  name: string;
  fromChain: number;
  toChain: number;
  fromToken: string;
  toToken: string;
  fromAmount: string;
  type: 'swap' | 'bridge';
  tags: string[];
}

/**
 * Happy path test pairs (6 pairs covering swap and bridge scenarios)
 * Selection rationale:
 * - Mix of same-chain swaps and cross-chain bridges
 * - Popular token pairs (USDC, ETH, stablecoins)
 * - Coverage of major chains (Ethereum, Polygon, Arbitrum, BSC)
 */
export const HAPPY_PATH_PAIRS: TestPair[] = [
  // Cross-chain bridges
  {
    name: 'USDC Ethereum to Polygon bridge',
    fromChain: CHAINS.ETHEREUM,
    toChain: CHAINS.POLYGON,
    fromToken: 'USDC',
    toToken: 'USDC',
    fromAmount: '1000000', // 1 USDC (6 decimals)
    type: 'bridge',
    tags: ['smoke', 'regression', 'bridge'],
  },
  {
    name: 'USDC Polygon to Arbitrum bridge',
    fromChain: CHAINS.POLYGON,
    toChain: CHAINS.ARBITRUM,
    fromToken: 'USDC',
    toToken: 'USDC',
    fromAmount: '1000000', // 1 USDC
    type: 'bridge',
    tags: ['regression', 'bridge'],
  },
  {
    name: 'USDT BSC to Ethereum bridge',
    fromChain: CHAINS.BSC,
    toChain: CHAINS.ETHEREUM,
    fromToken: 'USDT',
    toToken: 'USDT',
    fromAmount: '1000000000000000000', // 1 USDT (18 decimals on BSC)
    type: 'bridge',
    tags: ['regression', 'bridge'],
  },

  // Same-chain swaps
  {
    name: 'ETH to USDC swap on Ethereum',
    fromChain: CHAINS.ETHEREUM,
    toChain: CHAINS.ETHEREUM,
    fromToken: 'ETH',
    toToken: 'USDC',
    fromAmount: '100000000000000000', // 0.1 ETH
    type: 'swap',
    tags: ['smoke', 'regression', 'swap'],
  },
  {
    name: 'USDC to USDT swap on Ethereum',
    fromChain: CHAINS.ETHEREUM,
    toChain: CHAINS.ETHEREUM,
    fromToken: 'USDC',
    toToken: 'USDT',
    fromAmount: '10000000', // 10 USDC
    type: 'swap',
    tags: ['regression', 'swap'],
  },
  {
    name: 'POL to USDC swap on Polygon',
    fromChain: CHAINS.POLYGON,
    toChain: CHAINS.POLYGON,
    fromToken: '0x0000000000000000000000000000000000000000', // Native token (POL/MATIC)
    toToken: 'USDC',
    fromAmount: '1000000000000000000', // 1 POL
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
