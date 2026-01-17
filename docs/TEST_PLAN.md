# LI.FI API Test Plan

## 1. Overview

### 1.1 Purpose
This document outlines the test strategy for validating the LI.FI bridge/DEX aggregator API endpoints. The testing focuses on functional correctness, error handling, and performance characteristics.

### 1.2 Scope

**In Scope:**
- `GET /v1/quote` - Token transfer quote requests
- `POST /v1/advanced/routes` - Multiple route options
- `GET /v1/tools` - Available bridges and exchanges

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

| Level | Description | Frequency | Duration |
|-------|-------------|-----------|----------|
| Smoke | Critical path validation | Every PR, push | ~2 min |
| Regression | Full feature coverage | Nightly | ~10 min |
| Performance | Load/stress testing | Weekly | ~30 min |

### 2.2 Test Types

| Type | Description | Tools |
|------|-------------|-------|
| Functional | Happy path scenarios | Playwright |
| Negative | Error handling | Playwright |
| Schema Validation | Response structure | Ajv |
| Performance | Load testing | k6 |

### 2.3 Test Data Strategy

**Token Pairs Selection Rationale:**
1. **USDC ETH→POL Bridge** - Most popular L1→L2 bridge route
2. **USDC POL→ARB Bridge** - L2→L2 cross-chain transfer
3. **USDT BSC→ETH Bridge** - Different token decimals handling
4. **ETH→USDC Swap** - Native token to stablecoin
5. **USDC→USDT Swap** - Stablecoin to stablecoin
6. **MATIC→USDC Swap** - Native L2 token swap

---

## 3. Test Cases

### 3.1 GET /v1/quote

#### Happy Path Tests

| ID | Test Case | Priority | Tags |
|----|-----------|----------|------|
| Q-HP-001 | USDC Ethereum to Polygon bridge | P0 | @smoke @bridge |
| Q-HP-002 | USDC Polygon to Arbitrum bridge | P1 | @regression @bridge |
| Q-HP-003 | USDT BSC to Ethereum bridge | P1 | @regression @bridge |
| Q-HP-004 | ETH to USDC swap on Ethereum | P0 | @smoke @swap |
| Q-HP-005 | USDC to USDT swap on Ethereum | P1 | @regression @swap |
| Q-HP-006 | MATIC to USDC swap on Polygon | P1 | @regression @swap |
| Q-HP-007 | Response contains transactionRequest | P1 | @regression |
| Q-HP-008 | Response includes gas cost estimates | P1 | @regression |
| Q-HP-009 | Response includes execution duration | P2 | @regression |

#### Negative Tests

| ID | Test Case | Expected Result | Priority |
|----|-----------|-----------------|----------|
| Q-NEG-001 | Invalid token symbol | 404, code 1003 | P0 |
| Q-NEG-002 | Zero amount | 400, code 1011 | P0 |
| Q-NEG-003 | Negative amount | 400 | P0 |
| Q-NEG-004 | Missing fromAmount | 400, mentions fromAmount | P0 |
| Q-NEG-005 | Missing fromChain | 400 | P1 |
| Q-NEG-006 | Missing toToken | 400 | P1 |
| Q-NEG-007 | Invalid chain ID | 400 or 404 | P1 |
| Q-NEG-008 | Invalid fromAddress format | 400 | P1 |
| Q-NEG-009 | Short address format | 400 | P2 |
| Q-NEG-010 | Same token same chain | 200 or 400 | P2 |

### 3.2 POST /v1/advanced/routes

#### Happy Path Tests

| ID | Test Case | Priority | Tags |
|----|-----------|----------|------|
| R-HP-001 | USDC Ethereum to Polygon routes | P0 | @smoke |
| R-HP-002 | Returns multiple route options | P1 | @regression |
| R-HP-003 | Routes include gas cost estimates | P1 | @regression |
| R-HP-004 | Route steps have complete data | P1 | @regression |
| R-HP-005 | Order parameter affects sorting | P2 | @regression |

#### Negative Tests

| ID | Test Case | Expected Result | Priority |
|----|-----------|-----------------|----------|
| R-NEG-001 | Zero amount | 400 | P0 |
| R-NEG-002 | Negative amount | 400 | P0 |
| R-NEG-003 | Missing fromChainId | 400 | P1 |
| R-NEG-004 | Missing fromAmount | 400 | P1 |
| R-NEG-005 | Invalid token address | 400 or 404 | P1 |
| R-NEG-006 | Invalid chain ID | 400 or 404 | P1 |
| R-NEG-007 | Empty request body | 400 | P1 |
| R-NEG-008 | Non-existent token pair | Empty routes or error | P2 |

### 3.3 GET /v1/tools

#### Happy Path Tests

| ID | Test Case | Priority | Tags |
|----|-----------|----------|------|
| T-HP-001 | Returns all bridges and exchanges | P0 | @smoke |
| T-HP-002 | Bridge objects have required properties | P1 | @regression |
| T-HP-003 | Exchange objects have required properties | P1 | @regression |
| T-HP-004 | Returns tools for Solana | P0 | @regression |
| T-HP-005 | Returns tools for Bitcoin | P0 | @regression |
| T-HP-006 | Returns tools for SUI | P0 | @regression |
| T-HP-007 | Solana has bridges with SOL support | P1 | @regression |
| T-HP-008 | Multiple chain filter works | P2 | @regression |

#### Negative Tests

| ID | Test Case | Expected Result | Priority |
|----|-----------|-----------------|----------|
| T-NEG-001 | Invalid chain ID | Empty results or error | P1 |
| T-NEG-002 | Invalid chain format | Handles gracefully | P2 |
| T-NEG-003 | Empty chains parameter | Returns all tools | P2 |
| T-NEG-004 | Very large chain ID | Handles gracefully | P2 |
| T-NEG-005 | Negative chain ID | Error or empty | P2 |
| T-NEG-006 | Mixed valid/invalid chains | Handles gracefully | P2 |
| T-NEG-007 | Duplicate chain IDs | Deduplicates | P2 |

---

## 4. Performance Criteria

### 4.1 Response Time Thresholds

| Endpoint | P95 | P99 |
|----------|-----|-----|
| /quote | < 3s | < 5s |
| /advanced/routes | < 5s | < 8s |
| /tools | < 2s | < 3s |

### 4.2 Load Test Scenarios

| Scenario | VUs | Duration | Purpose |
|----------|-----|----------|---------|
| Smoke | 1 | 30s | Verify basic functionality |
| Load | 5-10 | 9 min | Typical expected load |
| Stress | 20-50 | 16 min | Find breaking points |

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

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| API rate limiting | Medium | Medium | Add delays between requests, use test-appropriate amounts |
| Token/route unavailability | Low | Medium | Use multiple token pairs, handle empty responses |
| Schema changes | Medium | Low | Flexible schema validation with additionalProperties |
| Network latency | Low | Medium | Appropriate timeouts, retry logic |

---

## 7. Test Environment

### 7.1 Configuration

| Parameter | Value |
|-----------|-------|
| Base URL | https://li.quest/v1 |
| Auth | Not required for basic testing |
| Rate Limits | Standard API limits |

### 7.2 Test Chains

| Chain | ID | Type |
|-------|-----|------|
| Ethereum | 1 | EVM |
| Polygon | 137 | EVM |
| Arbitrum | 42161 | EVM |
| BSC | 56 | EVM |
| Solana | 1151111081099710 | SVM |
| Bitcoin | 20000000000001 | UTXO |
| SUI | 9270000000000000 | MVM |

---

## 8. Deliverables

1. **Test Suite** - Playwright test files
2. **Test Reports** - Allure HTML reports
3. **Performance Reports** - k6 results
4. **Bug Reports** - If defects found
5. **Documentation** - This test plan, README

---

## 9. Schedule

| Phase | Activities |
|-------|------------|
| Setup | Project structure, dependencies, configuration |
| Implementation | Test case development, schema validation |
| Execution | Run tests, generate reports |
| Documentation | Test plan, README, bug reports |
| Performance | k6 load tests, CI integration |
