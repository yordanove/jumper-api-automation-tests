/**
 * k6 Performance Test Configuration
 *
 * Defines scenarios and thresholds for load testing the LI.FI API.
 */

export const scenarios = {
  // Smoke test - verify system works under minimal load
  smoke: {
    executor: 'constant-vus',
    vus: 1,
    duration: '30s',
    tags: { test_type: 'smoke' },
  },

  // Load test - typical expected load
  load: {
    executor: 'ramping-vus',
    startVUs: 0,
    stages: [
      { duration: '1m', target: 5 }, // Ramp up to 5 users
      { duration: '3m', target: 5 }, // Stay at 5 users
      { duration: '1m', target: 10 }, // Ramp up to 10 users
      { duration: '3m', target: 10 }, // Stay at 10 users
      { duration: '1m', target: 0 }, // Ramp down
    ],
    tags: { test_type: 'load' },
  },

  // Stress test - find breaking points
  stress: {
    executor: 'ramping-vus',
    startVUs: 0,
    stages: [
      { duration: '2m', target: 20 }, // Ramp up
      { duration: '5m', target: 20 }, // Stay
      { duration: '2m', target: 50 }, // Push harder
      { duration: '5m', target: 50 }, // Stay
      { duration: '2m', target: 0 }, // Ramp down
    ],
    tags: { test_type: 'stress' },
  },
};

export const thresholds = {
  // Error rate threshold (applies to all endpoints)
  http_req_failed: ['rate<0.05'], // Less than 5% errors
  // Note: Response time thresholds are endpoint-specific (defined in each scenario file)
};

export const BASE_URL = 'https://li.quest/v1';
