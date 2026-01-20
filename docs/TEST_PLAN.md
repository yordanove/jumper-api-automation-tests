# LI.FI API Test Plan

## 1. Overview

### 1.1 Purpose

This document outlines the test strategy for validating the LI.FI bridge/DEX aggregator API endpoints. The testing focuses on functional correctness, error handling, and performance characteristics.

### 1.2 Scope

**In Scope:**

- `GET /v1/quote` - Token transfer quote requests
- `POST /v1/advanced/routes` - Multiple route options
- `GET /v1/tools` - Available bridges and exchanges
- `GET /v1/tokens` - Token search and listing
- `GET /v1/token` - Token details and price retrieval

**Out of Scope:**

- Transaction execution endpoints
- Wallet integration testing
- SDK/widget testing
- Authentication stress testing

### 1.3 References

- [LI.FI API Documentation](https://docs.li.fi/api-reference/introduction)
- [LI.FI API Base URL](https://li.quest/v1)

---

## 2. Test Strategy

### 2.1 Test Levels

| Level       | Description              | Frequency      | Duration |
| ----------- | ------------------------ | -------------- | -------- |
| Smoke       | Critical path validation | Every PR, push | ~2 min   |
| Regression  | Full feature coverage    | Every PR, push | ~10 min  |
| Performance | Load/stress testing      | Manual         | ~30 min  |

**Tag Taxonomy:** `@smoke` = critical subset (~10 tests); `@regression` = full suite (97 tests). All tests are tagged `@regression` by design for explicit suite naming.

### 2.2 Test Types

| Type              | Description          | Tools      |
| ----------------- | -------------------- | ---------- |
| Functional        | Happy path scenarios | Playwright |
| Negative          | Error handling       | Playwright |
| Schema Validation | Response structure   | Ajv        |
| Performance       | Load testing         | k6         |

### 2.3 Test Data Strategy

**Token Pairs Selection Rationale:**

_Bridge Scenarios (6 pairs):_

1. **USDC ETH→POL Bridge** - Most popular L1→L2 bridge route
2. **USDC POL→ARB Bridge** - L2→L2 cross-chain transfer
3. **USDT BSC→ETH Bridge** - Different token decimals handling
4. **USDC ETH→OPT Bridge** - Optimism L2 coverage
5. **USDC ETH→BASE Bridge** - Base L2 coverage
6. **USDC ETH→AVAX Bridge** - Avalanche coverage

_Swap Scenarios (6 pairs):_ 7. **ETH→USDC Swap (Ethereum)** - Native token to stablecoin 8. **USDC→USDT Swap (Ethereum)** - Stablecoin to stablecoin 9. **POL→USDC Swap (Polygon)** - Native L2 token swap 10. **ETH→USDC Swap (Optimism)** - L2 swap coverage 11. **ETH→USDC Swap (Base)** - L2 swap coverage 12. **AVAX→USDC Swap (Avalanche)** - Alt-L1 swap coverage

---

## 3. Test Cases

### 3.1 GET /v1/quote

#### Happy Path Tests

_Data-driven tests use 12 token pairs (6 bridge + 6 swap) from Section 2.3._

| ID       | Test Case                            | Priority | Tags                |
| -------- | ------------------------------------ | -------- | ------------------- |
| Q-HP-001 | 12 token pair quotes (data-driven)   | P0/P1    | @smoke/@regression  |
| Q-HP-002 | USDC Polygon to Arbitrum bridge      | P1       | @regression @bridge |
| Q-HP-003 | USDT BSC to Ethereum bridge          | P1       | @regression @bridge |
| Q-HP-004 | ETH to USDC swap on Ethereum         | P0       | @smoke @swap        |
| Q-HP-005 | USDC to USDT swap on Ethereum        | P1       | @regression @swap   |
| Q-HP-006 | POL to USDC swap on Polygon          | P1       | @regression @swap   |
| Q-HP-007 | Response contains transactionRequest | P1       | @regression         |
| Q-HP-008 | Response includes gas cost estimates | P1       | @regression         |
| Q-HP-009 | Response includes execution duration | P2       | @regression         |
| Q-HP-010 | Custom slippage parameter            | P2       | @regression         |
| Q-HP-011 | FASTEST order preference             | P2       | @regression         |
| Q-HP-012 | Custom recipient address (toAddress) | P2       | @regression         |

#### Negative Tests

| ID        | Test Case                  | Expected Result          | Priority |
| --------- | -------------------------- | ------------------------ | -------- |
| Q-NEG-001 | Invalid token symbol       | 400, code 1011           | P0       |
| Q-NEG-002 | Zero amount                | 400, code 1011           | P0       |
| Q-NEG-003 | Negative amount            | 400                      | P0       |
| Q-NEG-004 | Missing fromAmount         | 400, mentions fromAmount | P0       |
| Q-NEG-005 | Missing fromChain          | 400                      | P1       |
| Q-NEG-006 | Missing toToken            | 400                      | P1       |
| Q-NEG-007 | Invalid chain ID           | 400, code 1011           | P1       |
| Q-NEG-008 | Invalid fromAddress format | 400, code 1011           | P1       |
| Q-NEG-009 | Short address format       | 400, code 1011           | P2       |
| Q-NEG-010 | Same token same chain      | 400, code 1011           | P2       |

### 3.2 POST /v1/advanced/routes

#### Happy Path Tests

_Data-driven tests use 12 token pairs (6 bridge + 6 swap) from Section 2.3._

| ID       | Test Case                         | Priority | Tags        |
| -------- | --------------------------------- | -------- | ----------- |
| R-HP-001 | 12 token pair routes (data-driven)| P0/P1    | @smoke/@regression |
| R-HP-002 | Returns at least one route        | P1       | @regression |
| R-HP-003 | Routes include gas cost estimates | P1       | @regression |
| R-HP-004 | Route steps have complete data    | P1       | @regression |
| R-HP-005 | Order parameter affects sorting   | P2       | @regression |

#### Negative Tests

| ID        | Test Case               | Expected Result       | Priority |
| --------- | ----------------------- | --------------------- | -------- |
| R-NEG-001 | Zero amount             | 400                   | P0       |
| R-NEG-002 | Negative amount         | 400                   | P0       |
| R-NEG-003 | Missing fromChainId     | 400                   | P1       |
| R-NEG-004 | Missing fromAmount      | 400                   | P1       |
| R-NEG-005 | Invalid token address   | 400 or 404            | P1       |
| R-NEG-006 | Invalid chain ID        | 400 or 404            | P1       |
| R-NEG-007 | Empty request body      | 400                   | P1       |
| R-NEG-008 | Non-existent token pair | 400, code 1011        | P2       |

### 3.3 GET /v1/tools

#### Happy Path Tests

| ID       | Test Case                                 | Priority | Tags        |
| -------- | ----------------------------------------- | -------- | ----------- |
| T-HP-001 | Returns all bridges and exchanges         | P0       | @smoke      |
| T-HP-002 | Bridge objects have required properties   | P1       | @regression |
| T-HP-003 | Exchange objects have required properties | P1       | @regression |
| T-HP-004 | Returns tools for Solana                  | P0       | @regression |
| T-HP-005 | Returns tools for Bitcoin                 | P0       | @regression |
| T-HP-006 | Returns tools for SUI                     | P0       | @regression |
| T-HP-007 | Solana has bridges with SOL support       | P1       | @regression |
| T-HP-008 | Bitcoin chain has bridges                 | P1       | @regression |
| T-HP-009 | SUI chain has bridges                     | P1       | @regression |
| T-HP-010 | Multiple chain filter works               | P2       | @regression |

#### Negative Tests

| ID        | Test Case                  | Expected Result        | Priority |
| --------- | -------------------------- | ---------------------- | -------- |
| T-NEG-001 | Invalid chain ID           | 400, code 1011         | P1       |
| T-NEG-002 | Invalid chain format       | 400, code 1011         | P2       |
| T-NEG-003 | Empty chains parameter     | 400, code 1011         | P2       |
| T-NEG-004 | Very large chain ID        | 400, code 1011         | P2       |
| T-NEG-005 | Negative chain ID          | 400, code 1011         | P2       |
| T-NEG-006 | Mixed valid/invalid chains | 400, code 1011         | P2       |
| T-NEG-007 | Duplicate chain IDs        | 200, returns tools     | P2       |

### 3.4 GET /v1/tokens (Token Search)

#### Happy Path Tests

| ID         | Test Case                              | Priority | Tags        |
| ---------- | -------------------------------------- | -------- | ----------- |
| TKS-HP-001 | Returns tokens for Ethereum            | P0       | @smoke      |
| TKS-HP-002 | Returns tokens for multiple chains     | P1       | @regression |
| TKS-HP-003 | Token objects have required properties | P1       | @regression |
| TKS-HP-004 | Returns tokens with price information  | P1       | @regression |
| TKS-HP-005 | Returns tokens for Solana              | P1       | @regression |

#### Negative Tests

| ID          | Test Case            | Expected Result        | Priority |
| ----------- | -------------------- | ---------------------- | -------- |
| TKS-NEG-001 | Invalid chain ID     | Empty results or error | P1       |
| TKS-NEG-002 | Non-numeric chain ID | 400 or 404             | P1       |
| TKS-NEG-003 | Negative chain ID    | Error or empty         | P2       |

### 3.5 GET /v1/token (Token Details & Price)

#### Happy Path Tests

| ID         | Test Case                      | Priority | Tags        |
| ---------- | ------------------------------ | -------- | ----------- |
| TKD-HP-001 | Get token details by symbol    | P0       | @smoke      |
| TKD-HP-002 | Token includes accurate price  | P0       | @smoke      |
| TKD-HP-003 | Get token details by address   | P1       | @regression |
| TKD-HP-004 | Token includes market data     | P1       | @regression |
| TKD-HP-005 | Get native token (ETH) details | P1       | @regression |
| TKD-HP-006 | Get token on Polygon           | P1       | @regression |

#### Negative Tests

| ID          | Test Case                    | Expected Result | Priority |
| ----------- | ---------------------------- | --------------- | -------- |
| TKD-NEG-001 | Invalid token symbol         | 400, code 1011  | P0       |
| TKD-NEG-002 | Missing token parameter      | 400, code 1011  | P0       |
| TKD-NEG-003 | Missing chain parameter      | 400, code 1011  | P0       |
| TKD-NEG-004 | Invalid chain ID             | 400, code 1011  | P1       |
| TKD-NEG-005 | Non-numeric chain ID         | 400, code 1011  | P1       |
| TKD-NEG-006 | Invalid token address format | 400, code 1011  | P1       |
| TKD-NEG-007 | Non-existent token address   | 400, code 1011  | P2       |

---

## 4. Performance Criteria

### 4.1 Response Time Thresholds

| Endpoint         | P95  | P99  |
| ---------------- | ---- | ---- |
| /quote           | < 3s | < 5s |
| /advanced/routes | < 5s | < 8s |
| /tools           | < 2s | < 3s |

### 4.2 Load Test Scenarios

| Scenario | VUs   | Duration | Purpose                    |
| -------- | ----- | -------- | -------------------------- |
| Smoke    | 1     | 30s      | Verify basic functionality |
| Load     | 5-10  | 9 min    | Typical expected load      |
| Stress   | 20-50 | 16 min   | Find breaking points       |

### 4.3 Success Criteria

- Error rate < 5%
- Throughput > 5 requests/second
- No service degradation under load

---

## 5. Entry/Exit Criteria

### 5.1 Entry Criteria

- [ ] API endpoints accessible at https://li.quest/v1
- [ ] Test environment configured
- [ ] Dependencies installed
- [ ] Test data files validated

### 5.2 Exit Criteria

- [ ] All smoke tests pass (100%)
- [ ] Regression tests pass (> 95%)
- [ ] No critical/blocker defects open
- [ ] Test reports generated

---

## 6. Risk Assessment

| Risk                       | Impact | Probability | Mitigation                                                |
| -------------------------- | ------ | ----------- | --------------------------------------------------------- |
| API rate limiting          | Medium | Medium      | Add delays between requests, use test-appropriate amounts |
| Token/route unavailability | Low    | Medium      | Use multiple token pairs, handle empty responses          |
| Schema changes             | Medium | Low         | Flexible schema validation with additionalProperties      |
| Network latency            | Low    | Medium      | Appropriate timeouts, retry logic                         |

---

## 7. Test Environment

### 7.1 Configuration

| Parameter   | Value                          |
| ----------- | ------------------------------ |
| Base URL    | https://li.quest/v1            |
| Auth        | Not required for basic testing |
| Rate Limits | Standard API limits            |

### 7.2 Test Chains

| Chain     | ID               | Type |
| --------- | ---------------- | ---- |
| Ethereum  | 1                | EVM  |
| Polygon   | 137              | EVM  |
| Arbitrum  | 42161            | EVM  |
| BSC       | 56               | EVM  |
| Optimism  | 10               | EVM  |
| Base      | 8453             | EVM  |
| Avalanche | 43114            | EVM  |
| Solana    | 1151111081099710 | SVM  |
| Bitcoin   | 20000000000001   | UTXO |
| SUI       | 9270000000000000 | MVM  |

---

## 8. Deliverables

1. **Test Suite** - Playwright test files
2. **Test Reports** - Allure HTML reports
3. **Performance Reports** - k6 results
4. **Bug Reports** - If defects found
5. **Documentation** - This test plan, README

---

## 9. Schedule

| Phase          | Activities                                     |
| -------------- | ---------------------------------------------- |
| Setup          | Project structure, dependencies, configuration |
| Implementation | Test case development, schema validation       |
| Execution      | Run tests, generate reports                    |
| Documentation  | Test plan, README, bug reports                 |
| Performance    | k6 load tests, CI integration                  |

---

## 10. Test Findings & Observations

### 10.1 API Stability

- All tests pass consistently across multiple runs
- No flaky tests or intermittent failures observed
- API responses are deterministic for given inputs

### 10.2 Rate Limiting

- Unauthenticated limit: ~200 requests per 2-hour window
- Returns HTTP 429 when exceeded
- Mitigation: Serial test execution in CI (`workers: 1`)

### 10.3 Error Handling Patterns

| Error Code | Meaning          | When Triggered                   |
| ---------- | ---------------- | -------------------------------- |
| 1011       | VALIDATION_ERROR | Invalid params, missing fields   |
| 1003       | NOT_FOUND_ERROR  | Invalid chain/token combinations |
| 1002       | NO_QUOTE_ERROR   | No route available               |

### 10.4 API Behavior Notes

- Empty `chains=` parameter returns 400 (not all tools)
- Non-existent tokens may return 400 or 404 depending on endpoint
- Native tokens use zero address (0x000...000)
- Slippage values >1 (100%) are rejected

### 10.5 No Bugs Found

- API behaves according to documentation
- Error messages are clear and actionable
- Schema responses match documented structure

### 10.6 Bug Report Template

If defects were found, they would be reported using this format:

| Field                  | Description                            |
| ---------------------- | -------------------------------------- |
| **ID**                 | BUG-XXX                                |
| **Title**              | Brief description of the issue         |
| **Severity**           | Critical / High / Medium / Low         |
| **Endpoint**           | Affected API endpoint                  |
| **Environment**        | Production (li.quest/v1)               |
| **Steps to Reproduce** | Numbered steps to trigger the issue    |
| **Expected Result**    | What should happen                     |
| **Actual Result**      | What actually happens                  |
| **Evidence**           | Request/response payloads, screenshots |
| **Notes**              | Additional context or workarounds      |

_Evidence would include Playwright trace files, Allure report screenshots, and full request/response payloads from test execution._
