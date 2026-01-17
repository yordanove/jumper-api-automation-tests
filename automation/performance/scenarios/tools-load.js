/**
 * k6 Performance Test - Tools Endpoint
 *
 * Load tests for GET /v1/tools
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
    'http_req_duration{endpoint:tools}': ['p(95)<2000'], // Tools should be fast
  },
};

// Chain filters to test
const CHAIN_FILTERS = [
  '', // No filter - all tools
  '1', // Ethereum only
  '137', // Polygon only
  '1,137', // Ethereum and Polygon
  '1,137,42161', // Ethereum, Polygon, Arbitrum
  '1151111081099710', // Solana
  '20000000000001', // Bitcoin
  '9270000000000000', // SUI
];

export default function () {
  // Select random chain filter
  const chains = CHAIN_FILTERS[Math.floor(Math.random() * CHAIN_FILTERS.length)];
  const url = chains ? `${BASE_URL}/tools?chains=${chains}` : `${BASE_URL}/tools`;

  // Make request
  const response = http.get(url, {
    tags: { endpoint: 'tools' },
  });

  // Verify response
  check(response, {
    'status is 200': (r) => r.status === 200,
    'response has bridges': (r) => {
      try {
        const body = JSON.parse(r.body);
        return Array.isArray(body.bridges);
      } catch {
        return false;
      }
    },
    'response has exchanges': (r) => {
      try {
        const body = JSON.parse(r.body);
        return Array.isArray(body.exchanges);
      } catch {
        return false;
      }
    },
    'response time < 2s': (r) => r.timings.duration < 2000,
  });

  // Think time
  sleep(0.5);
}

export function handleSummary(data) {
  return {
    stdout: JSON.stringify(
      {
        endpoint: 'tools',
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
