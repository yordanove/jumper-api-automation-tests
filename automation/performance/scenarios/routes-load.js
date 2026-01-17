/**
 * k6 Performance Test - Routes Endpoint
 *
 * Load tests for POST /v1/advanced/routes
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
    'http_req_duration{endpoint:routes}': ['p(95)<5000'], // Routes can be slower
  },
};

// Test parameters
const TEST_PARAMS = [
  {
    // USDC Ethereum to Polygon
    fromChainId: 1,
    fromAmount: '10000000', // 10 USDC
    fromTokenAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    toChainId: 137,
    toTokenAddress: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359',
  },
  {
    // ETH to USDC on Ethereum
    fromChainId: 1,
    fromAmount: '100000000000000000', // 0.1 ETH
    fromTokenAddress: '0x0000000000000000000000000000000000000000',
    toChainId: 1,
    toTokenAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  },
  {
    // USDC Ethereum to Arbitrum
    fromChainId: 1,
    fromAmount: '50000000', // 50 USDC
    fromTokenAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    toChainId: 42161,
    toTokenAddress: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
  },
];

const FROM_ADDRESS = '0x552008c0f6870c2f77e5cC1d2eb9bdff03e30Ea0';

export default function () {
  // Select random test parameters
  const params = TEST_PARAMS[Math.floor(Math.random() * TEST_PARAMS.length)];

  // Build request body
  const payload = JSON.stringify({
    ...params,
    fromAddress: FROM_ADDRESS,
    options: {
      slippage: 0.03,
    },
  });

  // Make request
  const response = http.post(`${BASE_URL}/advanced/routes`, payload, {
    headers: {
      'Content-Type': 'application/json',
    },
    tags: { endpoint: 'routes' },
  });

  // Verify response
  check(response, {
    'status is 200': (r) => r.status === 200,
    'response has routes': (r) => {
      try {
        const body = JSON.parse(r.body);
        return Array.isArray(body.routes);
      } catch {
        return false;
      }
    },
    'response time < 5s': (r) => r.timings.duration < 5000,
  });

  // Think time
  sleep(1.5);
}

export function handleSummary(data) {
  return {
    stdout: JSON.stringify(
      {
        endpoint: 'routes',
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
