# LI.FI API Test Suite

Automated API test suite for the [LI.FI](https://li.fi/) bridge/DEX aggregator API using Playwright, with Allure reporting and k6 performance testing.

## Overview

This test suite validates the LI.FI API endpoints that power cross-chain token transfers and swaps:

- **GET /v1/quote** - Request quotes for token transfers
- **POST /v1/advanced/routes** - Get multiple route options
- **GET /v1/tools** - List available bridges and exchanges
- **GET /v1/tokens** - Search and list tokens by chain
- **GET /v1/token** - Get token details and price

## Prerequisites

- **Node.js** 20.x or higher
- **npm** 10.x or higher
- **k6** (optional, for performance tests) - [Installation guide](https://k6.io/docs/get-started/installation/)

## Installation

```bash
# Clone the repository
git clone <repository-url>
cd lifi-api-tests

# Install dependencies
npm install

# Install Playwright (optional - not needed for API-only tests)
npx playwright install
```

## Running Tests

### All Tests
```bash
npm test
```

### By Endpoint
```bash
npm run test:quote    # Quote endpoint tests
npm run test:routes   # Routes endpoint tests
npm run test:tools    # Tools endpoint tests
npm run test:tokens   # Token search/price tests
```

### By Test Type
```bash
npm run test:smoke      # Quick validation tests
npm run test:regression # Full regression suite
npm run test:happy      # Happy path tests only
npm run test:negative   # Negative tests only
```

### By Tag
```bash
npx playwright test --grep "@smoke"
npx playwright test --grep "@bridge"
npx playwright test --grep "@swap"
```

## Test Reports

### Generate Allure Report
```bash
# Generate and open report
npm run report

# Generate only (no browser)
npm run report:generate
```

### View Playwright Report
```bash
npx playwright show-report
```

## Performance Testing

### Run k6 Load Tests
```bash
# Individual endpoints
npm run perf:quote
npm run perf:routes
npm run perf:tools

# All endpoints
npm run perf:all
```

### k6 Scenarios
- **smoke** - 1 VU, 30s - Basic functionality check
- **load** - 5-10 VUs, 9 min - Typical load
- **stress** - 20-50 VUs, 16 min - Find breaking points

```bash
K6_SCENARIO=stress npm run perf:quote
```

## Project Structure

```
├── automation/
│   ├── tests/
│   │   ├── api/
│   │   │   ├── quote/           # Quote endpoint tests
│   │   │   ├── advanced-routes/ # Routes endpoint tests
│   │   │   ├── tokens/          # Token endpoint tests
│   │   │   └── tools/           # Tools endpoint tests
│   │   └── schemas/             # JSON schemas for validation
│   ├── data/                    # Test data (chains, tokens, pairs)
│   ├── utils/                   # Utilities (API client, validators)
│   ├── fixtures/                # Playwright fixtures
│   └── performance/             # k6 load test scripts
├── docs/
│   └── TEST_PLAN.md             # Comprehensive test plan
├── .github/workflows/           # CI/CD workflows
├── playwright.config.ts         # Playwright configuration
└── package.json
```

## Test Coverage

### Endpoints Tested

| Endpoint | Happy Path | Negative | Performance |
|----------|------------|----------|-------------|
| GET /v1/quote | 18 tests | 17 tests | Yes |
| POST /v1/advanced/routes | 16 tests | 8 tests | Yes |
| GET /v1/tools | 10 tests | 7 tests | Yes |
| GET /v1/tokens | 5 tests | 3 tests | No |
| GET /v1/token | 6 tests | 7 tests | No |

### Chains Covered

| Chain | Type | Chain ID |
|-------|------|----------|
| Ethereum | EVM | 1 |
| Polygon | EVM | 137 |
| Arbitrum | EVM | 42161 |
| BSC | EVM | 56 |
| Optimism | EVM | 10 |
| Base | EVM | 8453 |
| Avalanche | EVM | 43114 |
| Solana | SVM | 1151111081099710 |
| Bitcoin | UTXO | 20000000000001 |
| SUI | MVM | 9270000000000000 |

## CI/CD

Tests run automatically via GitHub Actions:

- **On Push/PR** - Full test suite runs
- **On Main** - Allure report deployed to GitHub Pages
- **Scheduled** - Performance tests run weekly

### Manual Trigger
You can manually trigger workflows from GitHub Actions with different test types:
- all, smoke, regression, quote, routes, tools, tokens

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `API_BASE_URL` | LI.FI API base URL | https://li.quest/v1/ |
| `TEST_ENV` | Environment name | production |

### Playwright Config

Key settings in `playwright.config.ts`:
- **Parallel execution** enabled
- **2 retries** in CI
- **60s timeout** per test
- **Allure reporter** configured

## Test Data

Test pairs are defined in `automation/data/test-pairs.ts` (12 pairs total):

**Bridge scenarios (6):**
- USDC: Ethereum → Polygon
- USDC: Polygon → Arbitrum
- USDT: BSC → Ethereum
- USDC: Ethereum → Optimism
- USDC: Ethereum → Base
- USDC: Ethereum → Avalanche

**Swap scenarios (6):**
- ETH → USDC on Ethereum
- USDC → USDT on Ethereum
- POL → USDC on Polygon
- ETH → USDC on Optimism
- ETH → USDC on Base
- AVAX → USDC on Avalanche

## Extending Tests

### Adding New Test Pairs

Edit `automation/data/test-pairs.ts`:

```typescript
export const HAPPY_PATH_PAIRS: TestPair[] = [
  {
    name: 'Your test name',
    fromChain: CHAINS.ETHEREUM,
    toChain: CHAINS.POLYGON,
    fromToken: 'USDC',
    toToken: 'USDC',
    fromAmount: '1000000',
    type: 'bridge',
    tags: ['regression', 'bridge'],
  },
  // ...
];
```

### Adding New Chains

Edit `automation/data/chains.ts`:

```typescript
export const CHAINS = {
  // ...existing chains
  NEW_CHAIN: 12345,
} as const;
```

## Troubleshooting

### Tests Timing Out
- Increase timeout in `playwright.config.ts`
- Check network connectivity to `li.quest`

### Schema Validation Failures
- API may have added new fields (ok if `additionalProperties: true`)
- Check for breaking schema changes in API docs

### Performance Tests Failing
- Ensure k6 is installed: `k6 version`
- Check rate limits aren't being hit

## Author

Emil Yordanov - LI.FI QA Engineer Interview Assessment
