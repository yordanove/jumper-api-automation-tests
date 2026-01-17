/**
 * k6 Performance Test - Quote Endpoint
 *
 * Load tests for GET /v1/quote
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { scenarios, thresholds, BASE_URL } from '../k6.config.js';

// Get scenario from environment or default to 'load'
const scenario = __ENV.K6_SCENARIO || 'load';

export const options = {
  scenarios: {
    [scenario]: scenarios[scenario],
  },
  thresholds: {
    ...thresholds,
    'http_req_duration{endpoint:quote}': ['p(95)<3000'], // Quote-specific threshold
  },
};

// Test parameters - variety of swap/bridge scenarios
const TEST_PARAMS = [
  {
    // USDC Ethereum to Polygon bridge
    fromChain: 1,
    toChain: 137,
    fromToken: 'USDC',
    toToken: 'USDC',
    fromAmount: '1000000',
  },
  {
    // ETH to USDC swap on Ethereum
    fromChain: 1,
    toChain: 1,
    fromToken: 'ETH',
    toToken: 'USDC',
    fromAmount: '100000000000000000', // 0.1 ETH
  },
  {
    // USDC Polygon to Arbitrum
    fromChain: 137,
    toChain: 42161,
    fromToken: 'USDC',
    toToken: 'USDC',
    fromAmount: '5000000', // 5 USDC
  },
  {
    // MATIC to USDC on Polygon
    fromChain: 137,
    toChain: 137,
    fromToken: 'MATIC',
    toToken: 'USDC',
    fromAmount: '1000000000000000000', // 1 MATIC
  },
];

// Test wallet address
const FROM_ADDRESS = '0x552008c0f6870c2f77e5cC1d2eb9bdff03e30Ea0';

export default function () {
  // Select random test parameters
  const params = TEST_PARAMS[Math.floor(Math.random() * TEST_PARAMS.length)];

  // Build URL
  const url =
    `${BASE_URL}/quote?` +
    `fromChain=${params.fromChain}&` +
    `toChain=${params.toChain}&` +
    `fromToken=${params.fromToken}&` +
    `toToken=${params.toToken}&` +
    `fromAmount=${params.fromAmount}&` +
    `fromAddress=${FROM_ADDRESS}`;

  // Make request
  const response = http.get(url, {
    tags: { endpoint: 'quote' },
  });

  // Verify response
  check(response, {
    'status is 200': (r) => r.status === 200,
    'response has estimate': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.estimate !== undefined;
      } catch {
        return false;
      }
    },
    'response time < 3s': (r) => r.timings.duration < 3000,
  });

  // Think time between requests
  sleep(1);
}

export function handleSummary(data) {
  return {
    stdout: JSON.stringify(
      {
        endpoint: 'quote',
        scenario: scenario,
        metrics: {
          requests: data.metrics.http_reqs?.values?.count || 0,
          failures: data.metrics.http_req_failed?.values?.rate || 0,
          duration_p95: data.metrics.http_req_duration?.values['p(95)'] || 0,
          duration_p99: data.metrics.http_req_duration?.values['p(99)'] || 0,
        },
      },
      null,
      2
    ),
  };
}
