## Section 4: Testing & Validation

### 4.1 Test Strategy

#### 4.1.1 Testing Philosophy

AISearchArena is a solopreneur project with a single developer targeting a March 2026 launch. The testing strategy must be pragmatic: invest heavily in automated tests for business-critical logic that protects benchmark credibility, and accept manual verification for visual and presentational concerns. A benchmark platform lives or dies by its accuracy and integrity -- a score calculation error or premature data leak would be far more damaging than a misaligned CSS element.

**Risk-based prioritization** governs testing investment:

| Risk Tier | Description | Testing Approach | Examples |
|-----------|-------------|------------------|----------|
| **Tier 1 -- Credibility-Critical** | Errors that would destroy benchmark trust and require public retraction | 100% automated, regression suite | Score synthesis, composite calculation, state machine transitions, audit immutability, data isolation |
| **Tier 2 -- Operational** | Errors that would block or corrupt the monthly publication workflow | Automated integration tests | API retry logic, evaluation pipeline, enrollment constraints, methodology lock |
| **Tier 3 -- User Experience** | Errors that degrade the practitioner or admin experience | Hybrid (automated for data correctness, manual for visual) | Leaderboard rendering, tool detail pages, filtering, sorting |
| **Tier 4 -- Cosmetic** | Visual or presentational issues | Manual verification before each publication | Static pages, badge display, print layouts, mobile responsiveness |

#### 4.1.2 Testing Levels

| Level | Scope | Suggested Tools | Coverage Target |
|-------|-------|-----------------|-----------------|
| **Unit** | Individual functions: score calculations, confidence derivation, weight normalization, tie-breaking, state transition validation | Vitest or Jest | All business rules (BR-S01 through BR-S15, BR-V01 through BR-V05, BR-T01 through BR-T03, BR-SYN01, BR-SYN02, BR-AUD01, BR-AUD02) |
| **Integration** | Multi-entity workflows: synthesis pipeline end-to-end, cycle state machine transitions with precondition checks, API provider interactions, database constraint enforcement | Vitest/Jest with test database, MSW (Mock Service Worker) for API mocking | All state transitions, all cross-entity business rules |
| **End-to-End (E2E)** | Full user journeys: admin creates cycle through publication, public visitor browses leaderboard and tool details | Playwright | Critical admin workflows (cycle lifecycle), critical public pages (leaderboard, tool detail) |
| **Performance** | Response times under realistic data volumes (27+ tools, 8+ dimensions, 6 models) | Playwright (timing assertions), k6 or autocannon for API load | Public pages < 2s TTFB, admin pages < 3s, synthesis pipeline within acceptable batch time |
| **Security** | Auth bypass prevention, admin route protection, data isolation between vendor views, injection prevention | Manual penetration testing, OWASP ZAP (automated scan), Playwright (auth boundary tests) | All admin routes protected, no data leakage between vendor contexts |
| **Accessibility** | WCAG 2.1 AA compliance for public pages | axe-core (automated), manual screen reader testing | Public pages (homepage, leaderboard, tool detail, methodology) |

#### 4.1.3 Test Environments

| Environment | Purpose | Data | Infrastructure |
|-------------|---------|------|----------------|
| **Development** | Local development with fast feedback loops; unit and integration tests run here continuously | Seeded test database with synthetic vendors, tools, and scores; deterministic fixtures | Local machine; SQLite or PostgreSQL; mocked external APIs |
| **Staging** | Pre-publication validation; E2E tests, performance checks, and manual QA | Copy of production schema with anonymized or synthetic data reflecting realistic volumes (27+ tools, 6 models, 2 tracks) | Cloud-hosted; identical stack to production; real API keys with test/sandbox accounts where available |
| **Production** | Live environment; smoke tests after deployment only | Real data | Cloud-hosted; monitoring and alerting active |

#### 4.1.4 Solopreneur Testing Workflow

Given the solo developer context, the testing workflow is structured around the monthly cycle cadence:

1. **During Development**: Unit and integration tests run on every commit (pre-commit hook or CI). All Tier 1 tests must pass before merge.
2. **Before Each Cycle**: Run full E2E suite against staging with realistic data volume. Manual walkthrough of admin workflow.
3. **Before Each Publication**: Run security scan (OWASP ZAP). Manual verification of public page rendering. Accessibility spot-check with axe-core.
4. **After Deployment**: Smoke test suite (5-10 critical E2E tests) runs automatically against production.

---

### 4.2 Test Summary

| Test ID | Feature ID(s) | Test Type | Description | Priority |
|---------|---------------|-----------|-------------|----------|
| T-001 | F-005 | Integration | BenchmarkCycle valid state transitions (happy path) | Critical |
| T-002 | F-005 | Integration | BenchmarkCycle invalid state transitions rejected | Critical |
| T-003 | F-005 | Integration | Cycle suspension stores and restores previous_state | Critical |
| T-004 | F-005 | Integration | Cycle cannot enter Evaluation without minimum tool count (BR-T03) | Critical |
| T-005 | F-005 | Integration | Methodology lock enforced after Evaluation entry (BR-S03) | Critical |
| T-006 | F-011 | Unit | Score synthesis median calculation from model evaluations | Critical |
| T-007 | F-011 | Unit | Confidence tag derivation from model agreement (BR-S09) | Critical |
| T-008 | F-011 | Unit | Not-applicable dimension handling in synthesis (BR-S08) | Critical |
| T-009 | F-011 | Integration | Editorial override requires non-empty rationale (BR-SYN02) | Critical |
| T-010 | F-011 | Integration | SynthesisRecord.final_value matches Score.value (BR-SYN01) | Critical |
| T-011 | F-012 | Unit | Composite score weighted average with renormalized weights (BR-S05) | Critical |
| T-012 | F-012 | Unit | Dense ranking with tie-breaking rules (BR-S14) | Critical |
| T-013 | F-012 | Unit | Tool with zero applicable dimensions excluded from leaderboard | Critical |
| T-014 | F-016 | Integration | Audit package immutability after sealing (BR-AUD02) | Critical |
| T-015 | F-016 | Integration | Cycle cannot enter Publication without sealed audit package (BR-AUD01) | Critical |
| T-016 | F-025 | E2E | Admin routes redirect to login when unauthenticated | Critical |
| T-017 | F-025 | Integration | Session expiry after 24 hours | Critical |
| T-018 | F-025 | Security | Brute-force lockout after 5 failed attempts | Critical |
| T-019 | F-007 | Integration | AI model evaluation retry with exponential backoff (BR-S10) | High |
| T-020 | F-007 | Integration | Failed evaluations retained and never deleted (BR-S12) | High |
| T-021 | F-007 | Integration | Minimum 4 successful models required for automated synthesis (BR-S07, BR-S11) | High |
| T-022 | F-007 | Integration | Prompt linkage traceability (BR-S15) | High |
| T-023 | F-018 | Integration | Evidence required before Score transition Draft to Reviewed (BR-S06) | High |
| T-024 | F-006 | Integration | Tool enrollment blocked after cycle leaves Planning (BR-T01) | High |
| T-025 | F-006 | Integration | Tool withdrawal preserves data but excludes from rankings (BR-T02) | High |
| T-026 | F-015 | Integration | Vendor review window enforces 5-business-day duration (BR-V05) | High |
| T-027 | F-015 | Integration | Vendor portal shows only own tool data (BR-V04) | High |
| T-028 | F-013 | Integration | Dimension weights must sum to 100.00 per track (BR-S04) | High |
| T-029 | F-022 | Unit | Anomaly detection flags score change greater than 3 points (BR-S13) | High |
| T-030 | F-014 | Integration | Report publication transitions all scores Reviewed to Published | High |
| T-031 | F-014 | Integration | Publication is one-way: published scores cannot be unpublished | High |
| T-032 | F-023 | Integration | Score correction preserves original value and requires different approver (BR-S02) | High |
| T-033 | F-002 | E2E | Track leaderboard renders ranked tools with correct ordering | Medium |
| T-034 | F-002 | E2E | Segment filter re-renders leaderboard with correct filtered set | Medium |
| T-035 | F-003 | E2E | Tool detail page displays all dimension scores, confidence tags, and evidence links | Medium |
| T-036 | F-003 | E2E | Not-applicable dimensions display "N/A" with correct styling | Medium |
| T-037 | F-001 | E2E | Homepage displays current cycle highlights when published cycle exists | Medium |
| T-038 | F-001 | E2E | Homepage displays "Coming Soon" when no published cycle exists | Medium |
| T-039 | F-004 | E2E | Comparison view renders 2-4 tools side by side with correct data | Medium |
| T-040 | F-017 | E2E | Methodology page displays current version with all dimensions and weights | Medium |
| T-041 | F-010 | Integration | Vendor company_name uniqueness enforced | Medium |
| T-042 | F-019 | Integration | Badge awarded only to non-withdrawn tools meeting threshold | Medium |
| T-043 | F-024 | E2E | About page loads with disclosure statement visible | Low |
| T-044 | F-021 | E2E | Vendor directory renders with disclosure status indicators | Low |
| T-045 | F-020 | E2E | Cycle archive lists past cycles in reverse chronological order | Low |
| T-046 | F-005, F-006, F-007, F-011, F-012, F-014, F-016 | E2E | Full Pipeline E2E: Cycle Creation Through Publication | Critical |
| T-047 | F-005, F-014, F-020, F-003 | Integration | Multi-Cycle Data Integrity: Second Publication Preserves First | High |
| T-048 | F-012 | Unit | Composite Score Recalculation Idempotency | High |
| T-049 | F-011, F-014, F-023 | Integration | Score State Machine Invalid Transitions Rejected | Medium |
| T-050 | F-005 | Integration | Concurrent Active Cycle Prevention | Medium |
| T-051 | F-016 | Integration | Audit Package Content Accuracy and Completeness Verification | Critical |
| T-052 | F-011, F-012 | Unit | Rounding Boundary Impact on Rankings and Tie-Breaking | Critical |
| T-053 | F-011, F-012 | Integration | Synthesis Pipeline Determinism Across Repeated Runs | High |
| T-054 | F-023, F-012 | Integration | Score Correction Triggers Composite and Ranking Recalculation Cascade | High |
| T-055 | F-014, F-023 | Integration | Published Score Value Immutability Enforcement | High |
| T-056 | F-025 | Security | Admin API Endpoints Return 401 Without Authentication | Critical |
| T-057 | F-015 | Security | Vendor Portal API Zero Cross-Vendor Data Leakage | Critical |
| T-058 | F-025, F-005 | Security | CSRF Protection for All State-Changing Actions | High |
| T-059 | F-011, F-014, F-024 | Security | Admin Text Fields Sanitized Against XSS | High |
| T-060 | F-016 | Security | Audit Package and Public Responses Contain No Secrets | High |

---

### 4.3 Test Cases (GWT Format)

---

#### T-001: BenchmarkCycle Valid State Transitions (Happy Path)

| Attribute | Value |
|-----------|-------|
| Feature(s) | F-005 |
| Type | Integration |
| Priority | Critical |
| Automation | Automated |

**Given**: A BenchmarkCycle exists in Planning state with a valid methodology version assigned, active prompt sets, and 5+ tools enrolled on at least one track

**When**: The admin triggers sequential transitions: Planning -> Evaluation -> Synthesis -> VendorReview -> Publication -> Completed, with all entry/exit conditions met at each step

**Then**: Each transition succeeds; the cycle.state reflects the correct value after each transition; timestamps are recorded for each transition; no validation errors are raised

**Edge Cases**:
- Transition from Planning to Evaluation with exactly 5 tools (minimum threshold)
- Transition from VendorReview to Publication immediately after the 5-business-day window closes
- Transition from Publication to Completed with all badges awarded and report published

**Test Data**:
- 1 BenchmarkCycle in Planning state
- 1 active MethodologyVersion with 2 tracks, 8 dimensions per track
- 6 active AIModels
- 7 tools enrolled across tracks (5+ per track)
- Active PromptSets for all dimensions

---

#### T-002: BenchmarkCycle Invalid State Transitions Rejected

| Attribute | Value |
|-----------|-------|
| Feature(s) | F-005 |
| Type | Integration |
| Priority | Critical |
| Automation | Automated |

**Given**: BenchmarkCycles exist in various states

**When**: The admin attempts invalid transitions (Planning -> Synthesis, Evaluation -> Publication, Completed -> Planning, Cancelled -> Evaluation, Suspended -> Completed)

**Then**: Each invalid transition is rejected with an appropriate error message; the cycle state remains unchanged; no data is modified

**Edge Cases**:
- Attempting to resume a Cancelled cycle (terminal state must be enforced)
- Attempting to transition Completed cycle to any other state
- Attempting Evaluation -> VendorReview without completing synthesis
- Attempting VendorReview -> Publication without sealed audit package

**Test Data**:
- 5 BenchmarkCycles, one in each of: Planning, Evaluation, Completed, Cancelled, Suspended

---

#### T-003: Cycle Suspension Stores and Restores Previous State

| Attribute | Value |
|-----------|-------|
| Feature(s) | F-005 |
| Type | Integration |
| Priority | Critical |
| Automation | Automated |

**Given**: A BenchmarkCycle is in Evaluation state

**When**: The admin suspends the cycle with a required suspension_reason, then resumes the cycle

**Then**: On suspension: state changes to Suspended, previous_state is set to "Evaluation", suspension_reason is stored. On resumption: state returns to Evaluation, previous_state is preserved in audit log, all in-progress evaluation data is intact

**Edge Cases**:
- Suspend from Synthesis state and resume to Synthesis
- Suspend from VendorReview and resume to VendorReview (vendor review timer should pause or be documented)
- Suspend and then cancel (Suspended -> Cancelled)
- Attempt to suspend from Planning (not allowed per state machine -- only Evaluation, Synthesis, VendorReview)
- Attempt to suspend without providing suspension_reason (should be rejected)

**Test Data**:
- 1 BenchmarkCycle in Evaluation state with partial evaluation data
- Suspension reason text: "Vendor data access issue requiring investigation"

---

#### T-004: Cycle Cannot Enter Evaluation Without Minimum Tool Count

| Attribute | Value |
|-----------|-------|
| Feature(s) | F-005, F-006 |
| Type | Integration |
| Priority | Critical |
| Automation | Automated |

**Given**: A BenchmarkCycle is in Planning state with only 3 tools enrolled on the GEO Platform track and 0 tools on the llms.txt track

**When**: The admin attempts to transition the cycle to Evaluation state

**Then**: The transition is rejected with a validation error listing: "GEO Platform track: 3/5 minimum tools enrolled" and "llms.txt track: 0/5 minimum tools enrolled" (BR-T03); the cycle remains in Planning state

**Edge Cases**:
- One track meets the minimum (5+) and the other does not -- the cycle should still be blocked (all tracks must meet the threshold or be explicitly excluded)
- Exactly 5 tools enrolled: transition should succeed
- 5 tools enrolled but 1 is withdrawn: effective count is 4, transition should be blocked
- Track has 5 enrolled but 2 tools have inactive status: verify handling

**Test Data**:
- 1 BenchmarkCycle in Planning state
- 3 tools with CycleToolEnrollment records for GEO Platform track
- 0 tools enrolled for llms.txt track

---

#### T-005: Methodology Lock Enforced After Evaluation Entry

| Attribute | Value |
|-----------|-------|
| Feature(s) | F-005, F-013 |
| Type | Integration |
| Priority | Critical |
| Automation | Automated |

**Given**: A BenchmarkCycle has transitioned from Planning to Evaluation with MethodologyVersion v1.0.0 assigned

**When**: The admin attempts to modify the MethodologyVersion v1.0.0 (change a dimension weight, edit a rubric, or update the description)

**Then**: The modification is rejected with a message: "Methodology version v1.0.0 is locked by an active cycle" (BR-S03); the MethodologyVersion record remains unchanged

**Edge Cases**:
- Attempt to create a new MethodologyVersion and reassign it to the active cycle (should be rejected: methodology_id on BenchmarkCycle is immutable after Evaluation)
- Modify a MethodologyVersion that is NOT linked to any active cycle (should succeed)
- Modify a MethodologyVersion linked to a Completed or Cancelled cycle (should succeed, as those are terminal states)
- Attempt to modify PromptSets linked to the locked methodology (should also be rejected)

**Test Data**:
- 1 BenchmarkCycle in Evaluation state referencing MethodologyVersion v1.0.0
- 1 separate MethodologyVersion v2.0.0 in draft state (not linked to any cycle)

---

#### T-006: Score Synthesis Median Calculation

| Attribute | Value |
|-----------|-------|
| Feature(s) | F-011 |
| Type | Unit |
| Priority | Critical |
| Automation | Automated |

**Given**: A tool-dimension pair has 6 ModelEvaluation records: 5 with status=success (scores: 6, 7, 7, 8, 9) and 1 with status=failed

**When**: The synthesis pipeline runs with method=median

**Then**: The SynthesisRecord is created with: method_used="median", suggested_value=7.0 (median of [6,7,7,8,9]), final_value=7, model_agreement_score=std_dev([6,7,7,8,9])=1.0, model_scores_snapshot containing all 6 evaluations (including the failed one); a Score record is created with value=7 and state=Draft

**Edge Cases**:
- Even number of successful evaluations (e.g., 4 successes: [6,7,8,9]): median should be 7.5, final_value rounds to 8
- All models return the same score: std_dev=0, median=that score
- Scores at extremes: [0, 0, 10, 10, 10] -- median=10, high disagreement
- Single decimal suggested_scores: [6.5, 7.0, 7.5, 8.0, 8.5] -- median=7.5, final_value=8 (rounding to nearest integer)
- Exactly 4 successful evaluations (minimum for automated synthesis)

**Test Data**:
- 6 ModelEvaluation records with specified scores and statuses
- Linked PromptSet and ScoringDimension

---

#### T-007: Confidence Tag Derivation from Model Agreement

| Attribute | Value |
|-----------|-------|
| Feature(s) | F-011 |
| Type | Unit |
| Priority | Critical |
| Automation | Automated |

**Given**: Multiple tool-dimension pairs with varying model agreement characteristics

**When**: The confidence tag derivation function is called for each pair per BR-S09

**Then**: Confidence tags are assigned deterministically:
- std_dev=0.8, 5 successes, is_applicable=true -> "High"
- std_dev=1.4, 5 successes, is_applicable=true -> "High" (< 1.5 threshold)
- std_dev=1.5, 5 successes, is_applicable=true -> "Medium" (>= 1.5)
- std_dev=2.0, 5 successes, is_applicable=true -> "Medium"
- std_dev=2.5, 5 successes, is_applicable=true -> "Low" (>= 2.5)
- std_dev=0.5, 4 successes, is_applicable=true -> "Medium" (exactly 4 models)
- std_dev=1.0, 3 successes, is_applicable=true -> "Low" (fewer than 4 but >= 3)
- std_dev=0.5, 2 successes, is_applicable=true -> "Insufficient Data" (fewer than 3)
- is_applicable=false -> "Not Applicable" (regardless of other metrics)

**Edge Cases**:
- Boundary values: std_dev exactly 1.5 (should be Medium, not High)
- Boundary values: std_dev exactly 2.5 (should be Low, not Medium)
- Exactly 5 successes with low std_dev: High
- Exactly 4 successes: always Medium at best, regardless of std_dev
- 0 successful evaluations: Insufficient Data

**Test Data**:
- 9 test scenarios as described above with pre-computed model evaluation sets

---

#### T-008: Not-Applicable Dimension Handling in Synthesis

| Attribute | Value |
|-----------|-------|
| Feature(s) | F-011, F-012 |
| Type | Unit |
| Priority | Critical |
| Automation | Automated |

**Given**: A tool has 8 scoring dimensions on a track; 6 are applicable and 2 are marked as not applicable (is_applicable=false)

**When**: The synthesis pipeline processes all 8 dimensions and composite score is calculated

**Then**: For the 2 not-applicable dimensions: Score.value is null (not 0), Score.confidence is "Not Applicable", no SynthesisRecord computation is performed, no evidence artifacts are required (BR-S08). For the composite score calculation: only the 6 applicable dimensions are included, their weights are renormalized to sum to 100% (BR-S05)

**Edge Cases**:
- All dimensions not applicable: no composite score can be generated; tool excluded from leaderboard
- Only 1 dimension applicable: composite score equals that single dimension's score
- A dimension switches from applicable to not-applicable mid-synthesis (should not happen if data is consistent, but test the guard)
- Score.value explicitly set to 0 for an applicable dimension (valid: means the feature exists but performs poorly; must not be confused with N/A)

**Test Data**:
- 8 ScoringDimension records (6 applicable, 2 not applicable)
- Weights: 15%, 15%, 15%, 15%, 10%, 10%, 10%, 10% (sums to 100%)
- Expected renormalized weights for 6 applicable: each weight / 80% * 100%

---

#### T-009: Editorial Override Requires Non-Empty Rationale

| Attribute | Value |
|-----------|-------|
| Feature(s) | F-011 |
| Type | Integration |
| Priority | Critical |
| Automation | Automated |

**Given**: A SynthesisRecord has been created with method_used="median" and suggested_value=7.0

**When**: The admin applies an editorial override (method_used="editorial_override") with final_value=5

**Then**: If editor_rationale is provided and non-empty: the override succeeds, SynthesisRecord is updated with method_used="editorial_override", the original computed values are preserved in model_scores_snapshot, and Score.value=5 (BR-SYN02). If editor_rationale is empty or whitespace-only: the override is rejected with a validation error

**Edge Cases**:
- Rationale containing only whitespace or newlines (should be rejected)
- Rationale containing only a period or single character (should be rejected -- "substantive explanation" required)
- Override value identical to computed value (allowed but should still require rationale)
- Override value outside 0-10 range (should be rejected)

**Test Data**:
- 1 SynthesisRecord with computed values
- Various rationale strings: null, "", " ", ".", "The tool's recent update to v3.0 introduced features not yet reflected in model training data"

---

#### T-010: SynthesisRecord.final_value Matches Score.value

| Attribute | Value |
|-----------|-------|
| Feature(s) | F-011 |
| Type | Integration |
| Priority | Critical |
| Automation | Automated |

**Given**: The synthesis pipeline has processed a tool-dimension pair and produced a SynthesisRecord with final_value=7

**When**: The corresponding Score record is created or linked via synthesis_id

**Then**: Score.value must equal SynthesisRecord.final_value (BR-SYN01). If a mismatch is detected (e.g., Score.value=8 but SynthesisRecord.final_value=7), the Score cannot transition from Draft to Reviewed

**Edge Cases**:
- SynthesisRecord updated after Score creation (final_value changes but Score.value is not updated -- should block Draft->Reviewed)
- Score manually set to a value different from SynthesisRecord.final_value (should be caught at validation)
- SynthesisRecord with final_value=null (should not be possible; final_value is required)

**Test Data**:
- 1 SynthesisRecord with final_value=7
- 1 Score with synthesis_id referencing the SynthesisRecord
- Matching and mismatching value scenarios

---

#### T-011: Composite Score Weighted Average with Renormalized Weights

| Attribute | Value |
|-----------|-------|
| Feature(s) | F-012 |
| Type | Unit |
| Priority | Critical |
| Automation | Automated |

**Given**: A tool on the GEO Platform track has scores for 8 dimensions with the following weights and values: Dim1 (20%, score=8), Dim2 (20%, score=7), Dim3 (15%, score=9), Dim4 (15%, score=6), Dim5 (10%, score=7), Dim6 (10%, score=5), Dim7 (5%, N/A), Dim8 (5%, N/A)

**When**: The composite score calculation runs per BR-S05

**Then**: Only 6 applicable dimensions are included. Renormalized weights: Dim1=22.22%, Dim2=22.22%, Dim3=16.67%, Dim4=16.67%, Dim5=11.11%, Dim6=11.11%. Composite = (8*22.22 + 7*22.22 + 9*16.67 + 6*16.67 + 7*11.11 + 5*11.11) / 100 = 7.17 (to 2 decimal places). CompositeScore.applicable_dimension_count=6, total_dimension_count=8

**Edge Cases**:
- All dimensions applicable: weights already sum to 100%, no renormalization needed
- Single applicable dimension (weight=10% but renormalized to 100%): composite equals that score
- All scores are 0 (applicable): composite=0.00 (valid; not excluded from leaderboard)
- All scores are 10: composite=10.00
- Mixed integer scores producing a composite with many decimal places: verify 2-decimal precision

**Test Data**:
- 8 ScoringDimension records with specified weights
- 8 Score records (6 with values, 2 with is_applicable=false)

---

#### T-012: Dense Ranking with Tie-Breaking Rules

| Attribute | Value |
|-----------|-------|
| Feature(s) | F-012 |
| Type | Unit |
| Priority | Critical |
| Automation | Automated |

**Given**: 5 tools on a track with composite scores: Tool_A=8.50 (3 High-confidence dims), Tool_B=8.50 (5 High-confidence dims), Tool_C=7.25, Tool_D=7.25 (2 High-confidence dims), Tool_E=7.25 (2 High-confidence dims, name "Alpha" vs Tool_D name "Bravo")

**When**: Rankings are computed per BR-S14

**Then**: Dense ranking applied: Tool_B and Tool_A both get rank 1 (same composite score 8.50). Tool_B displayed first (5 High > 3 High). The three 7.25 tools all receive rank 2 (dense ranking: 1, 1, 2, 2, 2). Within rank 2, ordered by High count then alphabetically.

**Edge Cases**:
- All tools have the same composite score: all rank 1
- No ties: standard sequential ranking (1, 2, 3, 4, 5)
- Tie-breaking by High-confidence count produces further ties: resolved alphabetically
- Withdrawn tool has a composite score but no rank: excluded from ranking entirely

**Test Data**:
- 5 tools with specified composite scores and High-confidence dimension counts
- Tool names chosen to test alphabetical tiebreaking

---

#### T-013: Tool with Zero Applicable Dimensions Excluded from Leaderboard

| Attribute | Value |
|-----------|-------|
| Feature(s) | F-012 |
| Type | Unit |
| Priority | Critical |
| Automation | Automated |

**Given**: A tool enrolled on a track has all 8 dimensions marked as is_applicable=false

**When**: Composite score calculation is attempted for this tool

**Then**: No CompositeScore record is generated; the tool is excluded from the leaderboard for that track; a log entry records the reason ("zero applicable dimensions"); the tool's individual dimension scores (all N/A) are still accessible for audit

**Edge Cases**:
- Tool has 1 applicable dimension out of 8: composite score equals that single dimension's score (not excluded)
- Tool has all dimensions applicable but all scores are 0: composite=0.00, still ranked (not excluded)

**Test Data**:
- 1 tool with 8 Score records all having is_applicable=false
- 1 tool with 1 applicable dimension for contrast

---

#### T-014: Audit Package Immutability After Sealing

| Attribute | Value |
|-----------|-------|
| Feature(s) | F-016 |
| Type | Integration |
| Priority | Critical |
| Automation | Automated |

**Given**: A CycleAuditPackage has been generated and sealed (is_sealed=true)

**When**: Any attempt is made to modify the package: update methodology_version_snapshot, update prompt_sets_snapshot, update model_configs_snapshot, update tool_list_snapshot, set is_sealed back to false, or update file_url

**Then**: Every modification attempt is rejected at the application level (BR-AUD02); the package record remains exactly as it was when sealed; error message indicates "Sealed audit packages cannot be modified"

**Edge Cases**:
- Attempt to delete a sealed audit package (should be rejected)
- Attempt to create a second audit package for the same cycle (should be rejected -- uniqueness constraint on cycle_id)
- Modification of an unsealed package (is_sealed=false): should succeed normally
- Setting is_sealed from true to false (must be explicitly rejected -- one-way seal)

**Test Data**:
- 1 CycleAuditPackage with is_sealed=true and populated JSON snapshots
- 1 CycleAuditPackage with is_sealed=false for contrast

---

#### T-015: Cycle Cannot Enter Publication Without Sealed Audit Package

| Attribute | Value |
|-----------|-------|
| Feature(s) | F-016, F-005 |
| Type | Integration |
| Priority | Critical |
| Automation | Automated |

**Given**: A BenchmarkCycle is in VendorReview state with the 5-business-day window closed, all scores reviewed, but no CycleAuditPackage generated

**When**: The admin attempts to transition the cycle to Publication

**Then**: The transition is rejected with a validation error: "CycleAuditPackage must exist and be sealed before transitioning to Publication" (BR-AUD01); the cycle remains in VendorReview

**Edge Cases**:
- Audit package exists but is_sealed=false: transition should be rejected
- Audit package exists and is_sealed=true: transition should succeed (if other conditions also met)
- Audit package generated after VendorReview window closes but before transition: should be accepted

**Test Data**:
- 1 BenchmarkCycle in VendorReview with all other prerequisites met
- Scenarios: no audit package, unsealed package, sealed package

---

#### T-016: Admin Routes Redirect to Login When Unauthenticated

| Attribute | Value |
|-----------|-------|
| Feature(s) | F-025 |
| Type | E2E |
| Priority | Critical |
| Automation | Automated |

**Given**: A visitor is not authenticated (no active session)

**When**: The visitor attempts to navigate to any admin route: /admin, /admin/cycles, /admin/cycles/:cycleId, /admin/tools, /admin/models, /admin/vendors, /admin/methodology, /vendor-portal, /vendor-portal/review/:cycleId

**Then**: For every route, the visitor is redirected to the login page; no admin content, data, or page structure is exposed in the response; the original requested URL is preserved for post-login redirect

**Edge Cases**:
- Direct API calls to admin endpoints without auth header (should return 401, not redirect)
- Expired session token in cookie (should redirect to login, not show cached admin content)
- Public routes (/benchmarks, /methodology, /about) remain accessible without auth

**Test Data**:
- List of all admin and vendor-portal routes
- List of all public routes (for negative test: should NOT require auth)

---

#### T-017: Session Expiry After 24 Hours

| Attribute | Value |
|-----------|-------|
| Feature(s) | F-025 |
| Type | Integration |
| Priority | Critical |
| Automation | Automated |

**Given**: An admin has successfully authenticated and has an active session

**When**: 24 hours elapse without any activity (or the session age exceeds 24 hours)

**Then**: The next request to any admin route redirects to the login page; the expired session is invalidated; the admin must re-authenticate

**Edge Cases**:
- Session at exactly 24 hours (boundary: should still be valid or expired depending on implementation -- test the boundary)
- Active usage extending beyond 24 hours (sliding window vs fixed expiry -- document which is implemented)
- Multiple concurrent sessions (not expected for solopreneur, but verify no session leakage)

**Test Data**:
- 1 authenticated session with manipulated creation timestamp

---

#### T-018: Brute-Force Lockout After 5 Failed Attempts

| Attribute | Value |
|-----------|-------|
| Feature(s) | F-025 |
| Type | Security |
| Priority | Critical |
| Automation | Automated |

**Given**: The admin login page is accessible

**When**: 5 consecutive failed login attempts are made with incorrect credentials

**Then**: The account is locked; subsequent login attempts (even with correct credentials) are rejected for a lockout period; an appropriate message is shown (e.g., "Account locked. Try again in 15 minutes"); the lockout event is logged

**Edge Cases**:
- 4 failed attempts followed by 1 success: counter resets, no lockout
- 5 failed attempts followed by waiting out the lockout period: account unlocks, correct credentials succeed
- Failed attempts from different IP addresses (if IP-based lockout is implemented vs account-based)

**Test Data**:
- Valid admin credentials
- 5+ sets of invalid credentials

---

#### T-019: AI Model Evaluation Retry with Exponential Backoff

| Attribute | Value |
|-----------|-------|
| Feature(s) | F-007 |
| Type | Integration |
| Priority | High |
| Automation | Automated |

**Given**: A tool-dimension evaluation is in progress and an AI model API call returns a timeout error

**When**: The retry policy executes per BR-S10

**Then**: Retry 1 fires at ~30 seconds, retry 2 at ~60 seconds, retry 3 at ~120 seconds. If all retries fail, the ModelEvaluation is recorded with status="timeout" and the evaluation continues with the remaining 5 models. The failed evaluation record includes retry count and final failure details

**Edge Cases**:
- First retry succeeds: no further retries, evaluation recorded as success
- Different failure types across retries (timeout on retry 1, error on retry 2, timeout on retry 3)
- API returns rate limit (429): verify backoff respects rate limit headers if available
- All 6 models fail all retries: all recorded as failures, dimension flagged per BR-S11

**Test Data**:
- Mocked API responses: configurable success/failure per retry attempt
- 1 tool-dimension pair with 6 AI models configured

---

#### T-020: Failed Evaluations Retained and Never Deleted

| Attribute | Value |
|-----------|-------|
| Feature(s) | F-007 |
| Type | Integration |
| Priority | High |
| Automation | Automated |

**Given**: A ModelEvaluation record exists with status="failed" for a specific cycle-tool-model-dimension combination

**When**: Any attempt is made to delete the record (via API, admin UI, or direct database operation at the application layer)

**Then**: The deletion is rejected (BR-S12); the failed evaluation record persists; it is excluded from synthesis calculations but included in the CycleAuditPackage

**Edge Cases**:
- Attempting to overwrite a failed evaluation with a new evaluation for the same (cycle, tool, model, dimension) combination (should create a new record or be rejected based on uniqueness constraint)
- Re-running an evaluation for the same model (should the failed record remain alongside the new attempt? Uniqueness constraint suggests only one record per combination -- clarify behavior)
- Soft delete vs hard delete: verify application layer blocks both

**Test Data**:
- 1 ModelEvaluation with status="failed"
- 1 ModelEvaluation with status="success" for contrast

---

#### T-021: Minimum Model Success Count for Automated Synthesis

| Attribute | Value |
|-----------|-------|
| Feature(s) | F-007, F-011 |
| Type | Integration |
| Priority | High |
| Automation | Automated |

**Given**: A tool-dimension pair has completed all 6 model evaluation attempts

**When**: The synthesis readiness check runs

**Then**: If 4+ models have status=success: the dimension proceeds to automated synthesis. If exactly 3 models succeeded: the dimension is flagged for manual evaluation (BR-S11); the flag appears on the admin Synthesis Dashboard. If fewer than 3 models succeeded: Score.confidence is set to "Insufficient Data" (BR-S09)

**Edge Cases**:
- Exactly 4 successes (boundary): automated synthesis proceeds, confidence is Medium at best per BR-S09
- 6 successes: best-case scenario
- 3 successes with very low std_dev: still flagged for manual despite good agreement
- All 6 failed: dimension cannot be synthesized automatically; requires editorial intervention

**Test Data**:
- 4 scenarios with varying success counts: 6, 4, 3, 1

---

#### T-022: Prompt Linkage Traceability

| Attribute | Value |
|-----------|-------|
| Feature(s) | F-007, F-008 |
| Type | Integration |
| Priority | High |
| Automation | Automated |

**Given**: A ModelEvaluation is about to be created for a specific tool-dimension pair in a cycle

**When**: The evaluation is recorded

**Then**: The ModelEvaluation.prompt_id references a valid PromptSet that: (a) matches the evaluation's dimension_id, (b) is associated with the cycle's methodology_id, and (c) has status="active" (BR-S15). If any of these conditions fail, the evaluation cannot be created

**Edge Cases**:
- PromptSet exists for the dimension but linked to a different methodology version (should be rejected)
- PromptSet has status="deprecated" (should be rejected)
- No active PromptSet exists for the dimension (evaluation should not proceed)
- Multiple active PromptSets for the same dimension and methodology (which one is selected? Should only one be active per dimension-methodology pair)

**Test Data**:
- 1 active PromptSet matching dimension and methodology
- 1 deprecated PromptSet for the same dimension
- 1 PromptSet for a different methodology version

---

#### T-023: Evidence Required Before Score Transition to Reviewed

| Attribute | Value |
|-----------|-------|
| Feature(s) | F-018, F-011 |
| Type | Integration |
| Priority | High |
| Automation | Automated |

**Given**: A Score record is in Draft state with is_applicable=true and its linked ModelEvaluations have zero EvidenceArtifact records

**When**: The admin attempts to transition the Score from Draft to Reviewed

**Then**: The transition is rejected with a validation error: "At least one evidence artifact is required for applicable scores" (BR-S06); the Score remains in Draft state

**Edge Cases**:
- Score with is_applicable=false: evidence is not required, transition should succeed without artifacts (BR-S08)
- Score with evidence on one ModelEvaluation but not others: one evidence artifact is sufficient
- Evidence artifact exists but linked to a different evaluation (wrong evaluation_id): should not count
- Evidence artifact with artifact_type="url" (valid) vs no file_url (invalid)

**Test Data**:
- 1 Score (Draft, is_applicable=true) with 0 evidence artifacts
- 1 Score (Draft, is_applicable=true) with 1+ evidence artifacts
- 1 Score (Draft, is_applicable=false) with 0 evidence artifacts

---

#### T-024: Tool Enrollment Blocked After Planning State

| Attribute | Value |
|-----------|-------|
| Feature(s) | F-006 |
| Type | Integration |
| Priority | High |
| Automation | Automated |

**Given**: A BenchmarkCycle has transitioned to Evaluation state

**When**: The admin attempts to enroll a new tool in the cycle (create a CycleToolEnrollment record)

**Then**: The enrollment is rejected with a message: "Tools can only be enrolled during the Planning state" (BR-T01); no CycleToolEnrollment record is created

**Edge Cases**:
- Enrollment attempt during Synthesis, VendorReview, Publication states (all should be rejected)
- Enrollment attempt during Suspended state (should be rejected -- Suspended is not Planning)
- Re-enrollment of a previously withdrawn tool (should be rejected since the cycle is past Planning)

**Test Data**:
- 1 BenchmarkCycle in Evaluation state
- 1 Tool with active ToolTrackMapping not yet enrolled

---

#### T-025: Tool Withdrawal Preserves Data but Excludes from Rankings

| Attribute | Value |
|-----------|-------|
| Feature(s) | F-006 |
| Type | Integration |
| Priority | High |
| Automation | Automated |

**Given**: A tool is enrolled in a cycle with completed ModelEvaluations, SynthesisRecords, and Scores

**When**: The admin withdraws the tool (sets withdrawn_at and withdrawal_reason on CycleToolEnrollment)

**Then**: All existing evaluation data is preserved (ModelEvaluations, SynthesisRecords, Scores remain intact). The tool is excluded from CompositeScore rankings (BR-T02). The tool does not appear on the published leaderboard. The tool is not eligible for badges. The tool's data is included in the CycleAuditPackage. withdrawal_reason is required

**Edge Cases**:
- Withdrawal during VendorReview: vendor review data for this tool is preserved
- Withdrawal of a tool that drops the track below 5 tools: track is deferred (BR-T03)
- Withdrawal without providing withdrawal_reason (should be rejected)
- Attempting to "un-withdraw" a tool (re-set withdrawn_at to null): define expected behavior

**Test Data**:
- 1 enrolled tool with full evaluation data
- 7 total tools on the track (withdrawal would leave 6, still above minimum)

---

#### T-026: Vendor Review Window Enforces 5-Business-Day Duration

| Attribute | Value |
|-----------|-------|
| Feature(s) | F-015 |
| Type | Integration |
| Priority | High |
| Automation | Automated |

**Given**: A BenchmarkCycle has transitioned to VendorReview state on a Monday at 09:00

**When**: The admin attempts to transition to Publication before 5 business days have elapsed

**Then**: The transition is rejected with a message indicating the vendor review window has not closed; the message shows the expected window close date/time (BR-V05)

**Edge Cases**:
- Transition to VendorReview on a Friday: 5 business days = the following Friday (weekends excluded)
- Vendor review window spanning a holiday period (configurable holidays)
- Transition attempted at exactly the 5-business-day mark (boundary)
- Unresolved vendor corrections at window close: transition should still succeed (BR-V05)

**Test Data**:
- 1 BenchmarkCycle entering VendorReview on specific dates (Monday, Friday, pre-holiday)
- Calendar configuration with holidays

---

#### T-027: Vendor Portal Data Isolation

| Attribute | Value |
|-----------|-------|
| Feature(s) | F-015 |
| Type | Integration |
| Priority | High |
| Automation | Automated |

**Given**: Two vendors exist (Vendor_A with Tool_1 and Vendor_B with Tool_2) in a cycle currently in VendorReview state

**When**: The admin accesses the vendor review portal scoped to Vendor_A

**Then**: Only Tool_1's individual dimension scores and editorial notes are visible. The following data is NOT accessible: composite scores, rankings, Tool_2's scores or any data, model-level evaluation outputs, SynthesisRecord details (BR-V04)

**Edge Cases**:
- Vendor with multiple tools: all of that vendor's tools should be visible
- Attempt to access another vendor's tool by manipulating URL parameters or query (should be blocked)
- Data returned in API responses: verify no other vendor's data leaks in the response payload
- Composite scores should not be calculable from the dimension-level data exposed (weights are public, but composite is explicitly hidden during VendorReview)

**Test Data**:
- 2 vendors, each with 1+ tools
- Scores for all tools in the cycle
- Composite scores calculated but not yet published

---

#### T-028: Dimension Weights Must Sum to 100.00 Per Track

| Attribute | Value |
|-----------|-------|
| Feature(s) | F-013 |
| Type | Integration |
| Priority | High |
| Automation | Automated |

**Given**: An admin is editing a MethodologyVersion with ScoringDimensions for the GEO Platform track

**When**: The admin attempts to activate the methodology version

**Then**: If the sum of all active dimension weight_percent values for the track equals exactly 100.00: activation succeeds (BR-S04). If the sum does not equal 100.00 (e.g., 99.99, 100.01, 95.00): activation is rejected with a validation error showing the current sum and the track name

**Edge Cases**:
- Floating point precision: weights of 33.33, 33.33, 33.34 = 100.00 (valid)
- Multiple tracks: each track validated independently; one track valid and one invalid should block activation
- Adding a new dimension that pushes the sum over 100.00
- Removing a dimension (deprecating it) that causes the sum to fall below 100.00
- Rounding edge: weight_percent stored as Decimal(5,2) -- verify precision handling

**Test Data**:
- Track with dimensions summing to exactly 100.00
- Track with dimensions summing to 99.99
- Track with dimensions summing to 100.01

---

#### T-029: Anomaly Detection Flags Score Change Greater Than 3 Points

| Attribute | Value |
|-----------|-------|
| Feature(s) | F-022 |
| Type | Unit |
| Priority | High |
| Automation | Automated |

**Given**: Tool_X scored 8 on "Citation Accuracy" in the most recent published cycle

**When**: The current draft cycle produces a score of 4 for the same tool-dimension pair (delta = |4 - 8| = 4, exceeding the 3-point threshold)

**Then**: The score is flagged as an anomaly (BR-S13); the flag includes the previous score (8), current score (4), and delta (4); the Score cannot transition from Draft to Reviewed until Score.editorial_notes contains an explanation

**Edge Cases**:
- Delta of exactly 3: not flagged (threshold is "more than 3")
- Delta of 3.01: if scores are integers this cannot occur, but verify threshold is strictly > 3
- Upward change of 4 points (4 -> 8): also flagged (absolute value)
- Tool's first evaluation (no previous published cycle): no anomaly check performed
- Previous score was N/A and current score is 7: no comparison performed
- Previous cycle was Cancelled (not Published): comparison should use the last Published cycle
- Tool evaluated on the same track but in a non-consecutive cycle (skipped a cycle): should compare to the last published cycle that included the tool

**Test Data**:
- 1 published cycle with scores for Tool_X
- 1 draft cycle with scores showing various deltas (2, 3, 4, -4)

---

#### T-030: Report Publication Transitions All Scores to Published

| Attribute | Value |
|-----------|-------|
| Feature(s) | F-014 |
| Type | Integration |
| Priority | High |
| Automation | Automated |

**Given**: A BenchmarkCycle is in Publication state with 50 Score records (across all tools and dimensions) in Reviewed state

**When**: The admin triggers report generation and publication

**Then**: A BenchmarkReport record is created; all 50 Score records transition from Reviewed to Published; the BenchmarkCycle.publication_date is set; all scores become accessible on public pages

**Edge Cases**:
- Some scores are still in Draft state (should block publication or force all to Reviewed first)
- Report publication partially fails (e.g., 49 of 50 scores transition): should this roll back? Publication should be atomic
- Scores for withdrawn tools: do they transition to Published or remain in Reviewed? (They are excluded from leaderboard but preserved)

**Test Data**:
- 1 BenchmarkCycle in Publication state
- 50 Score records in Reviewed state
- 2 Score records for a withdrawn tool

---

#### T-031: Publication Is One-Way

| Attribute | Value |
|-----------|-------|
| Feature(s) | F-014 |
| Type | Integration |
| Priority | High |
| Automation | Automated |

**Given**: A BenchmarkCycle is in Completed state with all scores Published

**When**: The admin attempts to: (a) change the cycle state back to Publication or any earlier state, (b) transition any Published score back to Reviewed or Draft, (c) delete the BenchmarkReport

**Then**: All attempts are rejected; Completed is a terminal state; Published scores can only transition to Corrected (via ScoreCorrection, not back to Draft/Reviewed); the BenchmarkReport cannot be deleted

**Edge Cases**:
- Attempt to modify BenchmarkReport content after publication (executive_summary, methodology_notes): should this be allowed for minor textual corrections, or fully locked?
- Deleting badge records for a completed cycle (should be rejected)
- Modifying CompositeScore records for a completed cycle (should be rejected unless triggered by a Score Correction)

**Test Data**:
- 1 BenchmarkCycle in Completed state with BenchmarkReport and Published scores

---

#### T-032: Score Correction Preserves Original Value and Requires Different Approver

| Attribute | Value |
|-----------|-------|
| Feature(s) | F-023 |
| Type | Integration |
| Priority | High |
| Automation | Automated |

**Given**: A Score record with state=Published and value=7

**When**: The admin applies a correction with new_value=8, reason="Evidence re-review confirmed higher feature coverage", corrected_by="operator", approved_by="editor"

**Then**: A ScoreCorrection record is created with previous_value=7, new_value=8, reason, corrected_by, approved_by (which differ per BR-S02), and correction_date. Score.value is updated to 8. Score.state transitions to Corrected. The original value (7) is preserved in ScoreCorrection.previous_value. CompositeScore and rankings should be recalculated

**Edge Cases**:
- corrected_by and approved_by are the same person: rejected (BR-S02 requires different users)
- Correction with new_value identical to previous_value: should be rejected (no actual change)
- Multiple corrections to the same score: each creates a new ScoreCorrection record; Corrected -> Corrected transition
- Correction with empty reason: rejected
- Correction to a Score that is still in Draft or Reviewed state (not yet Published): should be rejected (corrections are post-publication only)

**Test Data**:
- 1 Published Score with value=7
- Correction parameters as specified

---

#### T-033: Track Leaderboard Renders Ranked Tools with Correct Ordering

| Attribute | Value |
|-----------|-------|
| Feature(s) | F-002 |
| Type | E2E |
| Priority | Medium |
| Automation | Automated |

**Given**: A published cycle exists with 7 non-withdrawn tools on the GEO Platform track, each with composite scores and ranks

**When**: A visitor navigates to /benchmarks/geo-platform

**Then**: The leaderboard displays all 7 tools in rank order (ascending rank number). Each row shows: rank, tool name (linked to tool detail), vendor name, composite score (2 decimal places), badge icon (if awarded), and a confidence summary. Dense ranking is visually reflected (tied tools show the same rank number)

**Edge Cases**:
- Track with no published cycle: page should show an appropriate empty state
- Track slug that does not exist: 404 page

**Test Data**:
- 7 tools with pre-computed CompositeScore and rank values including at least one tie

---

#### T-034: Segment Filter Re-Renders Leaderboard

| Attribute | Value |
|-----------|-------|
| Feature(s) | F-002 |
| Type | E2E |
| Priority | Medium |
| Automation | Automated |

**Given**: The leaderboard is displayed with 7 tools, 3 of which belong to the "Enterprise SEO" market segment

**When**: A visitor selects the "Enterprise SEO" segment filter

**Then**: The leaderboard re-renders showing only the 3 tools in that segment; rankings are recalculated for the filtered set (e.g., the tool ranked 4th overall might be ranked 1st within the segment); the URL updates to include the segment parameter

**Edge Cases**:
- Segment with 0 tools: empty state message displayed
- Clearing the segment filter: full leaderboard restored
- Segment filter combined with cycle selector: both filters applied simultaneously

**Test Data**:
- 7 tools with various ToolSegmentMapping assignments
- 3 segments: "Enterprise SEO" (3 tools), "SMB Marketing" (2 tools), "E-commerce" (4 tools, with overlap)

---

#### T-035: Tool Detail Page Displays Complete Scoring Breakdown

| Attribute | Value |
|-----------|-------|
| Feature(s) | F-003 |
| Type | E2E |
| Priority | Medium |
| Automation | Automated |

**Given**: A published cycle exists with scores for Tool_A on the GEO Platform track

**When**: A visitor navigates to /benchmarks/geo-platform/tool-a

**Then**: The page displays: tool name, vendor name with link, composite score, rank within track, and a table of all dimension scores showing dimension name, score value (0-10), weight percentage, and confidence tag (color-coded). Evidence artifact links are accessible from each dimension section. Vendor disclosure section appears if disclosures exist

**Edge Cases**:
- Tool with no vendor disclosures: disclosure section is absent (not shown as empty)
- Tool that is an AI Search Mastery product: COI disclosure banner displayed prominently at top
- Tool slug that does not exist: 404 page

**Test Data**:
- 1 published tool with complete dimension scores, evidence, and vendor disclosure

---

#### T-036: Not-Applicable Dimensions Display "N/A" Correctly

| Attribute | Value |
|-----------|-------|
| Feature(s) | F-003 |
| Type | E2E |
| Priority | Medium |
| Automation | Automated |

**Given**: A tool on the GEO Platform track has 6 applicable dimensions and 2 not-applicable dimensions

**When**: A visitor views the tool detail page

**Then**: The 6 applicable dimensions show their numeric score (0-10), weight, and confidence tag. The 2 not-applicable dimensions show "N/A" instead of a score, confidence shows "Not Applicable" (gray), and a tooltip or note explains that the dimension does not apply to this tool

**Edge Cases**:
- All dimensions N/A: page should still render but indicate no numeric scores available
- Dimension with score=0 (applicable): displays "0" not "N/A" -- distinct from N/A

**Test Data**:
- 1 tool with mixed applicable and not-applicable dimensions including a score of 0

---

#### T-037: Homepage Displays Current Cycle Highlights

| Attribute | Value |
|-----------|-------|
| Feature(s) | F-001 |
| Type | E2E |
| Priority | Medium |
| Automation | Automated |

**Given**: One BenchmarkCycle exists with state=Completed and published results

**When**: A visitor loads the homepage (/)

**Then**: The page displays the cycle name, publication date, top 5 tools by composite score for each published track, badge icons next to badge-holding tools, and links to the full leaderboard. The conflict of interest disclosure statement is visible below the fold (not footer-only)

**Edge Cases**:
- Multiple completed cycles: only the most recent is featured
- Cycle with fewer than 5 tools: displays all available tools (not padded)

**Test Data**:
- 1 Completed BenchmarkCycle with 7 tools and at least 2 badges awarded

---

#### T-038: Homepage Displays "Coming Soon" Before First Publication

| Attribute | Value |
|-----------|-------|
| Feature(s) | F-001 |
| Type | E2E |
| Priority | Medium |
| Automation | Automated |

**Given**: No BenchmarkCycle exists with state=Completed (pre-launch state)

**When**: A visitor loads the homepage (/)

**Then**: The page displays a "Coming Soon" message with: methodology preview link (/methodology), target launch date (March 2026), and brand positioning statement. No benchmark data is shown. Navigation to /methodology still works

**Edge Cases**:
- A cycle exists but is in Planning or Evaluation state (not Completed): still shows "Coming Soon"
- A cycle was Cancelled: still shows "Coming Soon" (Cancelled cycles are not published)

**Test Data**:
- Empty database (no cycles) or 1 cycle in Planning state

---

#### T-039: Comparison View Renders 2-4 Tools Side by Side

| Attribute | Value |
|-----------|-------|
| Feature(s) | F-004 |
| Type | E2E |
| Priority | Medium |
| Automation | Automated |

**Given**: A published cycle exists with scores for 4 tools on the GEO Platform track

**When**: A visitor navigates to /benchmarks/geo-platform/compare?tools=tool1,tool2,tool3

**Then**: A side-by-side table renders with: column headers showing tool name, logo, composite score, and rank; one row per dimension showing each tool's score; the highest score in each row is visually highlighted (green); N/A values are displayed with gray styling and excluded from highlight logic

**Edge Cases**:
- Fewer than 2 tools selected: validation message displayed, comparison not rendered
- More than 4 tools selected: validation message, comparison not rendered
- Invalid tool slug in URL: graceful error handling, message to return to leaderboard
- All tools have the same score for a dimension: all highlighted (or none highlighted -- define behavior)

**Test Data**:
- 4 tools with varied scores including N/A dimensions and tied scores

---

#### T-040: Methodology Page Displays Current Version

| Attribute | Value |
|-----------|-------|
| Feature(s) | F-017 |
| Type | E2E |
| Priority | Medium |
| Automation | Automated |

**Given**: MethodologyVersion v1.0.0 is active with 2 tracks and 8 dimensions per track

**When**: A visitor navigates to /methodology

**Then**: The page displays: methodology version number (v1.0.0), effective date, all tracks with their scoring dimensions (name, description, weight percentage, evaluation criteria), the 70/30 prompt rotation explanation, confidence tag definitions with visual examples, and the conflict of interest disclosure statement in a styled callout block

**Edge Cases**:
- No active methodology version: page should show an appropriate message (edge case for pre-setup)
- Methodology history page (/methodology/history) with multiple versions: displays all in reverse chronological order

**Test Data**:
- 1 active MethodologyVersion with complete dimension definitions

---

#### T-041: Vendor Company Name Uniqueness Enforced

| Attribute | Value |
|-----------|-------|
| Feature(s) | F-010 |
| Type | Integration |
| Priority | Medium |
| Automation | Automated |

**Given**: A Vendor record exists with company_name="Acme Corp"

**When**: The admin attempts to create a second Vendor with company_name="Acme Corp"

**Then**: The creation is rejected with a uniqueness constraint error; only one vendor named "Acme Corp" exists in the database

**Edge Cases**:
- Case sensitivity: "Acme Corp" vs "acme corp" (define and test behavior -- typically case-insensitive uniqueness is preferred)
- Leading/trailing whitespace: "Acme Corp " vs "Acme Corp" (should be normalized)
- Updating an existing vendor to a name that conflicts with another vendor

**Test Data**:
- 1 existing Vendor with company_name="Acme Corp"
- Attempted duplicate with same name

---

#### T-042: Badge Awarded Only to Non-Withdrawn Tools Meeting Threshold

| Attribute | Value |
|-----------|-------|
| Feature(s) | F-019 |
| Type | Integration |
| Priority | Medium |
| Automation | Automated |

**Given**: 7 tools on a track with composite scores calculated; Tool_A ranks 1st, Tool_B ranks 2nd (withdrawn), Tool_C ranks 3rd, Tool_D ranks 4th

**When**: Badge awarding runs with threshold=top 3 (Top Performer badge)

**Then**: Badges are awarded to Tool_A (rank 1) and Tool_C (rank 3). Tool_B is skipped (withdrawn, not eligible per BR-T02). Tool_D receives a badge as the next non-withdrawn tool to fill the top 3. Each Badge record includes badge_type, badge_label, badge_image_url, and embed_code

**Edge Cases**:
- Fewer than 3 non-withdrawn tools: award badges to all available
- All top 3 tools are withdrawn: no Top Performer badges awarded for this cycle
- Tied tools: both receive badges if within top 3

**Test Data**:
- 7 tools with ranks, 1 withdrawn

---

#### T-043: About Page Loads with Disclosure Statement

| Attribute | Value |
|-----------|-------|
| Feature(s) | F-024 |
| Type | E2E |
| Priority | Low |
| Automation | Automated |

**Given**: The application is running

**When**: A visitor navigates to /about

**Then**: The page loads successfully with: mission statement, relationship to AI Search Mastery, conflict of interest disclosure with structural safeguards, and contact information. The disclosure statement is in a prominent callout block, not buried in body text

**Edge Cases**:
- Page loads under 2 seconds (performance baseline for static page)

**Test Data**:
- None required (static content)

---

#### T-044: Vendor Directory Renders with Disclosure Status

| Attribute | Value |
|-----------|-------|
| Feature(s) | F-021 |
| Type | E2E |
| Priority | Low |
| Automation | Automated |

**Given**: 5 vendors exist with published benchmark results: 2 with disclosure_status="full", 1 with "partial", 2 with "none"

**When**: A visitor navigates to /vendors

**Then**: All 5 vendors are listed with company name, tool count, and disclosure status indicator. Vendors with disclosure_status="none" display a "No Disclosure on File" label (BR-V01) with red/warning styling. Full disclosure vendors show green indicator

**Edge Cases**:
- Vendor exists but has no tools in any published cycle: should not appear in the directory
- Vendor search/filter functionality: verify search by company name works

**Test Data**:
- 5 vendors with varying disclosure statuses
- 1 vendor with no published tools (should be excluded from directory)

---

#### T-045: Cycle Archive Lists Past Cycles Chronologically

| Attribute | Value |
|-----------|-------|
| Feature(s) | F-020 |
| Type | E2E |
| Priority | Low |
| Automation | Automated |

**Given**: 3 published cycles exist: March 2026, April 2026, May 2026

**When**: A visitor navigates to /cycles

**Then**: All 3 cycles are displayed in reverse chronological order (May, April, March). Each cycle shows: cycle name, publication date, number of tools evaluated, and links to the full report and audit package download

**Edge Cases**:
- Only 1 published cycle: archive page renders with single entry
- Cancelled or Suspended cycles: not displayed in the public archive
- No published cycles: empty state with appropriate message

**Test Data**:
- 3 BenchmarkCycles in Completed state with BenchmarkReports

---

#### T-046: Full Pipeline E2E: Cycle Creation Through Publication

| Attribute | Value |
|-----------|-------|
| Feature(s) | F-005, F-006, F-007, F-011, F-012, F-014, F-016 |
| Type | E2E |
| Priority | Critical |
| Automation | Automated |

**Given**: An authenticated admin user exists, the system has no active benchmark cycle, and at least 3 tools (ToolAlpha, ToolBeta, ToolGamma) are registered in the tool catalog with associated vendor accounts, and a published methodology version "v2026.03" is available

**When**: The admin performs the following sequential operations:
1. Creates a new benchmark cycle "March 2026" (state transitions Draft)
2. Transitions the cycle to Planning and enrolls ToolAlpha, ToolBeta, ToolGamma
3. Transitions the cycle to Evaluation and submits 0-10 integer scores from 6 AI models across 4 dimensions for each tool
4. Transitions the cycle to Synthesis, triggering median-based synthesis, confidence derivation per BR-S09, composite score calculation with renormalized weights, and dense ranking with tie-breaking
5. Transitions the cycle to Review, triggering vendor review notification; each vendor approves within the 5 business day window (BR-V04)
6. Admin generates the CycleAuditPackage and seals it
7. Transitions the cycle to Publication, generating the public report
8. Admin transitions the cycle to Completed

**Then**:
- The cycle record shows state = "Completed" with a complete state transition history: Draft, Planning, Evaluation, Synthesis, Review, Publication, Completed
- Each tool has exactly 4 synthesized dimension scores (one decimal precision) and 1 composite score (one decimal precision) in state "Published"
- Confidence levels are assigned per BR-S09 for every dimension score (expected "High" for 6 models with std dev < 1.5)
- Dense rankings are assigned with no gaps: ranks 1, 2, 3 (ties resolved by highest confidence count, then alphabetical)
- The CycleAuditPackage is sealed (immutable) and contains all scores, model-level evidence, methodology snapshot "v2026.03", tool enrollment list, and synthesis records
- The public report page returns HTTP 200, displays the correct cycle title "March 2026", shows all 3 tools with their composite scores and rankings, and is accessible without authentication
- The vendor portal for each vendor shows only their own tool's data during and after the cycle

**Edge Cases**:
- Attempting to skip a state (e.g., Draft directly to Evaluation) is rejected at each attempted skip
- Attempting to publish without a sealed audit package is rejected
- Attempting to enroll a tool after leaving Planning state is rejected

**Test Data**:
- 3 registered tools with vendor accounts: ToolAlpha (VendorA), ToolBeta (VendorB), ToolGamma (VendorC)
- 6 AI model evaluation fixtures per tool per dimension (4 dimensions x 3 tools x 6 models = 72 individual scores, all integers 0-10)
- Published methodology version "v2026.03" with 4 dimensions and defined weights (e.g., Accuracy: 0.3, Coverage: 0.3, Freshness: 0.2, Speed: 0.2)
- Admin user with valid session credentials

---

#### T-047: Multi-Cycle Data Integrity: Second Publication Preserves First

| Attribute | Value |
|-----------|-------|
| Feature(s) | F-005, F-014, F-020, F-003 |
| Type | Integration |
| Priority | High |
| Automation | Automated |

**Given**: A fully completed and published benchmark cycle "March 2026" exists with 3 tools (ToolAlpha composite 8.2 rank 1, ToolBeta composite 7.5 rank 2, ToolGamma composite 6.8 rank 3), and the cycle is in state "Completed" with a sealed CycleAuditPackage

**When**: A second benchmark cycle "April 2026" is created, fully evaluated with different scores for the same 3 tools (ToolAlpha composite 7.1, ToolBeta composite 8.6, ToolGamma composite 7.0), and published to Completed state

**Then**:
- The March 2026 cycle data is completely unchanged: ToolAlpha composite = 8.2 rank 1, ToolBeta composite = 7.5 rank 2, ToolGamma composite = 6.8 rank 3
- The March 2026 CycleAuditPackage remains sealed and byte-identical to pre-second-publication state (hash comparison)
- The April 2026 cycle has its own independent rankings: ToolBeta rank 1 (8.6), ToolAlpha rank 2 (7.1), ToolGamma rank 3 (7.0)
- The tool detail page for ToolAlpha shows historical data: March 2026 composite 8.2, April 2026 composite 7.1
- The cycle archive page lists both cycles in reverse chronological order (April 2026 first) with correct composite scores per cycle
- The anomaly detection system flags ToolAlpha (March 8.2 to April 7.1 = 1.1 point change, below 3-point threshold, so no flag) and no anomaly flags are raised for any tool since no change exceeds 3 points per BR-S13

**Edge Cases**:
- Querying March 2026 data via API during April 2026 evaluation returns unmodified March data
- Tool added in April but not in March shows "N/A" for March in historical view
- Anomaly detection correctly flags a tool if April score differs by > 3 points from March

**Test Data**:
- Complete March 2026 cycle fixture with known scores and sealed audit package (hash recorded)
- April 2026 evaluation data for same 3 tools with different model scores producing composites 7.1, 8.6, 7.0
- One additional tool (ToolDelta) enrolled only in April 2026 with composite 5.5

---

#### T-048: Composite Score Recalculation Idempotency

| Attribute | Value |
|-----------|-------|
| Feature(s) | F-012 |
| Type | Unit |
| Priority | High |
| Automation | Automated |

**Given**: A set of synthesized dimension scores for ToolAlpha: Accuracy = 8.3, Coverage = 7.1, Freshness = 9.0, Speed = 6.5, with dimension weights Accuracy = 0.30, Coverage = 0.25, Freshness = 0.25, Speed = 0.20 (sum = 1.00, no renormalization needed)

**When**: The composite score calculation function is invoked 100 times with the identical input scores and weights

**Then**:
- All 100 results are identical to the bit level (no floating-point non-determinism)
- The composite score equals exactly 7.8 (calculated: (8.3 x 0.30) + (7.1 x 0.25) + (9.0 x 0.25) + (6.5 x 0.20) = 2.49 + 1.775 + 2.25 + 1.30 = 7.815, rounded to one decimal = 7.8)
- No intermediate rounding occurs before the final round-to-one-decimal step

**Edge Cases**:
- Renormalized weights scenario: if Speed dimension is N/A (tool does not have Speed), weights renormalize to Accuracy = 0.375, Coverage = 0.3125, Freshness = 0.3125; composite = (8.3 x 0.375) + (7.1 x 0.3125) + (9.0 x 0.3125) = 3.1125 + 2.21875 + 2.8125 = 8.14375, rounded to 8.1; verify 100 runs produce 8.1 every time
- All dimensions score 0: composite = 0.0 across 100 runs
- All dimensions score 10: composite = 10.0 across 100 runs
- Weights that produce a composite of exactly X.X50000: verify consistent rounding direction (round half up)

**Test Data**:
- Primary fixture: 4 dimension scores (8.3, 7.1, 9.0, 6.5) with weights (0.30, 0.25, 0.25, 0.20)
- Renormalized fixture: 3 dimension scores (8.3, 7.1, 9.0) with original weights (0.30, 0.25, 0.25) renormalized
- Boundary fixture: scores designed to produce composite at exact .X5 boundary (e.g., scores producing 7.850000)

---

#### T-049: Score State Machine Invalid Transitions Rejected

| Attribute | Value |
|-----------|-------|
| Feature(s) | F-011, F-014, F-023 |
| Type | Integration |
| Priority | Medium |
| Automation | Automated |

**Given**: A benchmark cycle in Evaluation state with ToolAlpha enrolled and dimension scores in various states: one score in "Draft" state, one score in "Reviewed" state, and one score in "Published" state

**When**: The following invalid state transitions are attempted via the API:
1. Draft -> Published (skipping Reviewed)
2. Published -> Draft (backward transition)
3. Reviewed -> Draft (backward transition)
4. Published -> Reviewed (backward transition)
5. Draft -> Corrected (invalid entry to correction without Publication)
6. Reviewed -> Corrected (invalid entry to correction without Publication)

**Then**:
- Each of the 6 invalid transitions returns HTTP 422 with an error payload containing the attempted transition (e.g., "from": "Draft", "to": "Published") and a human-readable message (e.g., "Invalid state transition: Draft cannot transition directly to Published")
- The score's state remains unchanged after each rejected attempt (verified by subsequent GET)
- No database writes occur for rejected transitions (audit log shows rejection, not state change)
- Valid transitions still work after rejections: Draft -> Reviewed succeeds, Reviewed -> Published succeeds
- For Published scores, only the Score Correction workflow (F-023) can create a Corrected entry, and it requires a different approver than the original reviewer per BR-S02

**Edge Cases**:
- Rapidly submitting the same invalid transition 10 times in sequence: all 10 are rejected, no race condition allows one through
- Attempting a transition on a score that belongs to a cycle in Completed state: rejected regardless of score state
- Attempting to transition a score while the parent cycle is in a state that does not permit score modifications (e.g., cycle in Publication state, score still in Draft)

**Test Data**:
- Cycle in Evaluation state with 3 enrolled tools
- Pre-created scores in Draft, Reviewed, and Published states
- Admin user credentials and a separate approver user for BR-S02 testing

---

#### T-050: Concurrent Active Cycle Prevention

| Attribute | Value |
|-----------|-------|
| Feature(s) | F-005 |
| Type | Integration |
| Priority | Medium |
| Automation | Automated |

**Given**: An active benchmark cycle "March 2026" exists in "Evaluation" state (a non-terminal state)

**When**: An admin attempts to create a new benchmark cycle "April 2026" via the cycle creation API endpoint

**Then**:
- The API returns HTTP 409 Conflict with error message "Cannot create a new cycle while cycle 'March 2026' is in non-terminal state 'Evaluation'"
- No new cycle record is created in the database
- The existing March 2026 cycle remains unaffected in Evaluation state

**Edge Cases**:
- Cycle in each non-terminal state blocks creation: test with Draft, Planning, Evaluation, Synthesis, Review, Publication, and Suspended states; all 7 return HTTP 409
- Cycle in terminal state Completed: new cycle creation succeeds (HTTP 201)
- Cycle in terminal state Cancelled: new cycle creation succeeds (HTTP 201)
- Two simultaneous cycle creation requests when no active cycle exists: exactly one succeeds (HTTP 201), the other fails (HTTP 409); verify via database that only one cycle was created
- After transitioning existing cycle from Suspended to Cancelled (terminal), a new cycle creation succeeds

**Test Data**:
- Cycle fixtures in each of the 7 non-terminal states and 2 terminal states
- Admin user credentials with cycle creation permissions
- Concurrent request harness for race condition testing (2 simultaneous POST requests)

---

#### T-051: Audit Package Content Accuracy and Completeness Verification

| Attribute | Value |
|-----------|-------|
| Feature(s) | F-016 |
| Type | Integration |
| Priority | Critical |
| Automation | Automated |

**Given**: A benchmark cycle "March 2026" in Review state with: 3 enrolled tools (ToolAlpha, ToolBeta, ToolGamma), 4 dimensions evaluated, 6 AI models per dimension per tool (72 model-level scores total), synthesized scores with confidence levels, composite scores, rankings, and methodology version "v2026.03"

**When**: The CycleAuditPackage is generated and sealed

**Then**:
- The sealed package contains exactly 72 model-level evidence records (3 tools x 4 dimensions x 6 models)
- Each model-level record includes: model identifier, raw integer score (0-10), timestamp, and any model-specific metadata
- The package contains exactly 12 synthesized dimension scores (3 tools x 4 dimensions), each with: median value (one decimal), confidence level (High/Medium/Low/Insufficient/N/A), standard deviation, and count of successful model responses
- The package contains exactly 3 composite scores (one per tool), each with: composite value (one decimal), the weights used per dimension, and the renormalization calculation if any dimension was N/A
- The package contains a complete methodology snapshot matching version "v2026.03" including dimension definitions, weight definitions, scoring rules, and confidence thresholds
- The package contains the tool enrollment list with all 3 tools and their enrollment timestamps
- The package contains all synthesis records including intermediate calculations
- The package contains a cryptographic hash (SHA-256) of its contents for tamper detection
- After sealing, any attempt to modify the package contents returns an error
- The package is downloadable and the downloaded file's SHA-256 hash matches the stored hash

**Edge Cases**:
- Tool with one dimension marked N/A: audit package includes the N/A designation and the renormalized weight calculation for that tool's composite
- Attempting to seal a package for a cycle with incomplete evaluations (missing scores for one tool): sealing is rejected with a completeness error listing missing items
- Re-generating the audit package after sealing: system returns the existing sealed package, does not create a duplicate

**Test Data**:
- Complete March 2026 cycle data: 3 tools, 4 dimensions, 6 models, all 72 scores populated
- Methodology version "v2026.03" fixture with defined dimensions, weights, and scoring rules
- One variant fixture where ToolGamma has N/A for the Speed dimension (only 54 model-level scores for that tool across 3 dimensions)

---

#### T-052: Rounding Boundary Impact on Rankings and Tie-Breaking

| Attribute | Value |
|-----------|-------|
| Feature(s) | F-011, F-012 |
| Type | Unit |
| Priority | Critical |
| Automation | Automated |

**Given**: Two tools with dimension scores that produce pre-rounding composite values:
- ToolAlpha: raw composite = 7.9500001 (rounds to 8.0)
- ToolBeta: raw composite = 7.9499999 (rounds to 7.9)
And a separate scenario with two tools that round to identical composites:
- ToolGamma: raw composite = 7.8500001 (rounds to 7.9)
- ToolDelta: raw composite = 7.8510000 (rounds to 7.9)

**When**: Composite scores are calculated, rounded to one decimal, and dense rankings are assigned

**Then**:
- Scenario 1: ToolAlpha composite = 8.0, ToolBeta composite = 7.9; ToolAlpha rank 1, ToolBeta rank 2 (no tie, 0.1 difference after rounding)
- Scenario 2: ToolGamma composite = 7.9, ToolDelta composite = 7.9; they are tied at rank 1 (dense ranking); tie-break by highest count of "High" confidence scores; if equal, tie-break alphabetically (ToolDelta rank 1, ToolGamma rank 2)
- No floating-point comparison is performed on pre-rounded values for ranking purposes; ranking is strictly on the rounded one-decimal value
- Dense ranking confirmed: if a third tool ToolEpsilon has composite 7.5, it receives rank 2 (not rank 3) in the tied scenario per dense ranking rules

**Edge Cases**:
- Composite of exactly 7.950000000 (mathematically exact half): verify the rounding direction is consistent (round half up = 8.0)
- Three-way tie at same composite: all three receive rank 1, next distinct score receives rank 2
- All tools have identical composite scores: all rank 1, tie-broken by confidence count then alphabetical for display order
- Tool with composite 0.0 and tool with composite 0.04999 (rounds to 0.0): tied at rank, alphabetical tie-break applies

**Test Data**:
- Dimension scores and weights engineered to produce ToolAlpha raw composite = 7.9500001 and ToolBeta raw composite = 7.9499999
- Dimension scores and weights engineered to produce ToolGamma and ToolDelta both rounding to 7.9
- Confidence level distributions: ToolGamma with 3 "High" confidence scores, ToolDelta with 3 "High" confidence scores (forcing alphabetical tie-break)
- ToolEpsilon with composite 7.5 for dense ranking verification
- Exact-half boundary fixture: scores producing composite of exactly 7.950000000

---

#### T-053: Synthesis Pipeline Determinism Across Repeated Runs

| Attribute | Value |
|-----------|-------|
| Feature(s) | F-011, F-012 |
| Type | Integration |
| Priority | High |
| Automation | Automated |

**Given**: A benchmark cycle in Evaluation state with complete model-level scores: 3 tools, 4 dimensions, 6 AI models per dimension per tool (72 integer scores total, all values fixed and known), methodology version "v2026.03" with defined weights

**When**: The full synthesis pipeline (median calculation, confidence derivation, composite calculation, ranking assignment) is executed, then the cycle is reset to pre-synthesis state, and the pipeline is executed again with identical inputs; this is repeated 5 times total

**Then**:
- All 5 runs produce bit-identical synthesized dimension scores (12 values)
- All 5 runs produce identical confidence levels for every dimension score (12 confidence levels)
- All 5 runs produce bit-identical composite scores (3 values)
- All 5 runs produce identical ranking assignments (3 rankings)
- All 5 runs produce identical standard deviation values used in confidence derivation
- No timestamps, random seeds, or execution-order dependencies affect the output values
- The full output payload (JSON) from each run is byte-identical when timestamps are normalized

**Edge Cases**:
- Run synthesis with an even number of model scores (6 models): median is average of 3rd and 4th sorted values; verify this averaging step is deterministic
- Run synthesis where 2 models returned identical scores: sorting stability does not affect median
- Run synthesis with a model returning score 0 (feature absent): verify 0 is included in median calculation, not treated as missing
- Run synthesis concurrently (2 parallel synthesis requests on separate cycle copies): both produce identical results

**Test Data**:
- Fixed 72-score matrix (3 tools x 4 dimensions x 6 models) with known expected outputs
- Expected synthesized scores, confidence levels, composites, and rankings pre-calculated for assertion
- Methodology "v2026.03" with weights: Accuracy 0.30, Coverage 0.25, Freshness 0.25, Speed 0.20

---

#### T-054: Score Correction Triggers Composite and Ranking Recalculation Cascade

| Attribute | Value |
|-----------|-------|
| Feature(s) | F-023, F-012 |
| Type | Integration |
| Priority | High |
| Automation | Automated |

**Given**: A published benchmark cycle "March 2026" in Completed state with:
- ToolAlpha: Accuracy = 9.0, Coverage = 7.0, Freshness = 8.0, Speed = 6.0; composite = 7.8; rank 1
- ToolBeta: Accuracy = 8.0, Coverage = 7.0, Freshness = 7.0, Speed = 7.0; composite = 7.3; rank 2
- Weights: Accuracy 0.30, Coverage 0.25, Freshness 0.25, Speed 0.20
- Original reviewer: AdminA; different approver available: AdminB

**When**: AdminA initiates a score correction for ToolAlpha's Accuracy dimension from 9.0 to 6.0, and AdminB (a different approver per BR-S02) approves the correction

**Then**:
- ToolAlpha's Accuracy score enters "Corrected" state; the original value 9.0 is preserved in the correction history alongside the new value 6.0
- ToolAlpha's composite is automatically recalculated: (6.0 x 0.30) + (7.0 x 0.25) + (8.0 x 0.25) + (6.0 x 0.20) = 1.80 + 1.75 + 2.00 + 1.20 = 6.75, rounded to 6.8
- Rankings are automatically recalculated: ToolBeta composite 7.3 rank 1, ToolAlpha composite 6.8 rank 2
- The anomaly detection system evaluates the corrected score but does not flag it as a cross-cycle anomaly (BR-S13 applies to between-cycle changes, not corrections)
- The CycleAuditPackage is updated with a correction addendum (the original sealed package is preserved, a correction record is appended)
- The public report reflects the corrected composite and updated rankings
- The correction is logged with: original value, corrected value, correction requester (AdminA), correction approver (AdminB), timestamp, and rationale

**Edge Cases**:
- Correction where the same admin attempts to both request and approve: rejected per BR-S02 different-approver requirement
- Correction that does not change the ranking order: composite recalculates but rankings remain the same; verify no spurious ranking churn
- Multiple corrections to the same score: each correction preserves the full history chain (original -> correction 1 -> correction 2)
- Correction that creates a tie: tie-breaking rules apply to the new ranking

**Test Data**:
- Published March 2026 cycle with ToolAlpha and ToolBeta scores as specified
- AdminA credentials (original reviewer) and AdminB credentials (approver)
- Expected post-correction composite for ToolAlpha: 6.8
- Expected post-correction rankings: ToolBeta rank 1, ToolAlpha rank 2

---

#### T-055: Published Score Value Immutability Enforcement

| Attribute | Value |
|-----------|-------|
| Feature(s) | F-014, F-023 |
| Type | Integration |
| Priority | High |
| Automation | Automated |

**Given**: A benchmark cycle "March 2026" in Completed state with ToolAlpha's Accuracy dimension score = 8.5 in "Published" state

**When**: The following direct modification attempts are made:
1. PUT request to the score API endpoint attempting to change the value from 8.5 to 9.0
2. PATCH request to the score API endpoint attempting to update the score value field
3. Direct database-level update simulation via the admin bulk operations endpoint (if one exists)
4. Attempt to transition the Published score back to Draft state, modify, then re-publish

**Then**:
- Attempt 1: Returns HTTP 403 with message "Published scores cannot be directly modified. Use the Score Correction workflow."
- Attempt 2: Returns HTTP 403 with the same message
- Attempt 3: Returns HTTP 403 or is not possible through any API endpoint
- Attempt 4: State transition back to Draft is rejected per score state machine rules (HTTP 422)
- After all attempts, a GET request confirms ToolAlpha's Accuracy score remains exactly 8.5 in "Published" state
- Only a properly executed Score Correction workflow (F-023) with a different approver can create a corrected value

**Edge Cases**:
- Attempting modification during a narrow window (e.g., between cycle Publication and Completed transition): score immutability applies from the moment of Publication state entry, not Completed
- Attempting to delete a Published score: rejected with HTTP 403
- Attempting to modify a non-value field on a Published score (e.g., adding a note): verify which fields are mutable vs immutable after Publication

**Test Data**:
- Published cycle with ToolAlpha Accuracy = 8.5 in Published state
- Admin user credentials with full permissions
- Various HTTP methods and payloads targeting the score modification endpoints

---

#### T-056: Admin API Endpoints Return 401 Without Authentication

| Attribute | Value |
|-----------|-------|
| Feature(s) | F-025 |
| Type | Security |
| Priority | Critical |
| Automation | Automated |

**Given**: The application is running and no authentication session or token is provided in the request headers

**When**: HTTP requests are sent to every admin API endpoint without any authentication credentials, specifically:
1. POST /api/admin/cycles (cycle creation)
2. PUT /api/admin/cycles/{id}/state (cycle state transition)
3. POST /api/admin/cycles/{id}/tools (tool enrollment)
4. POST /api/admin/evaluations (submit evaluation scores)
5. POST /api/admin/synthesis/run (trigger synthesis)
6. GET /api/admin/vendors (list vendors)
7. PUT /api/admin/vendors/{id} (update vendor)
8. POST /api/admin/reports/generate (generate report)
9. POST /api/admin/audit-packages/seal (seal audit package)
10. GET /api/admin/audit-packages/{id}/download (download audit package)
11. DELETE /api/admin/tools/{id} (remove tool)
12. PUT /api/admin/scores/{id}/correct (score correction)

**Then**:
- Every single endpoint returns HTTP 401 Unauthorized
- No response body contains any sensitive data, internal structure, or stack traces
- Response headers do not leak server technology or version information
- No partial processing occurs: no database records created, no state transitions initiated, no files generated
- The 401 response body contains only a generic error: {"error": "Authentication required"}
- Response time for unauthenticated requests does not differ significantly from authenticated requests (no timing oracle)

**Edge Cases**:
- Expired session token (24h expiry per spec): returns 401, not 403
- Malformed session token (random string): returns 401
- Empty Authorization header: returns 401
- Session token from a locked-out account (5 failed attempts per spec): returns 401 with no indication of lockout status
- OPTIONS preflight requests: return appropriate CORS headers without requiring authentication

**Test Data**:
- Complete list of admin API routes extracted from the application route configuration
- An expired session token (created 25 hours ago)
- A malformed token string
- A valid token from a locked-out admin account

---

#### T-057: Vendor Portal API Zero Cross-Vendor Data Leakage

| Attribute | Value |
|-----------|-------|
| Feature(s) | F-015 |
| Type | Security |
| Priority | Critical |
| Automation | Automated |

**Given**: Two vendor accounts exist: VendorA (owns ToolAlpha) and VendorB (owns ToolBeta), both enrolled in the active benchmark cycle "March 2026" in Review state with published scores and vendor review windows open. VendorA is authenticated with a valid session.

**When**: VendorA's authenticated session is used to attempt the following data access:
1. GET /api/vendor/tools (list tools) - should return only ToolAlpha
2. GET /api/vendor/tools/{ToolBeta.id}/scores - attempt to access ToolBeta's scores directly by ID
3. GET /api/vendor/reviews/{ToolBeta.reviewId} - attempt to access ToolBeta's review data
4. GET /api/vendor/tools/{ToolBeta.id} - attempt to access ToolBeta's tool detail
5. Enumerate tool IDs sequentially (ToolBeta.id - 1, ToolBeta.id, ToolBeta.id + 1) to probe for accessible records
6. Modify request to include ToolBeta's ID in VendorA's review submission payload

**Then**:
- Request 1: Returns HTTP 200 with an array containing only ToolAlpha; ToolBeta does not appear in any field of the response
- Request 2: Returns HTTP 403 Forbidden with message "Access denied" (not 404, to avoid information leakage about resource existence while maintaining clear authorization boundaries; OR 404 if the design treats non-owned resources as non-existent to the vendor)
- Request 3: Returns HTTP 403 or 404 with no ToolBeta data in the response body
- Request 4: Returns HTTP 403 or 404 with no ToolBeta data in the response body
- Request 5: All ID enumeration attempts for non-owned resources return 403 or 404; no valid data returned for any non-owned ID
- Request 6: Returns HTTP 403; no review record is created or modified for ToolBeta
- No response from any request contains ToolBeta's name, scores, review status, or any metadata
- Audit log records all cross-vendor access attempts with VendorA's identity and the target resource

**Edge Cases**:
- VendorA attempts to access data for a tool that belongs to no vendor (system-owned): returns 403
- VendorA attempts access after vendor review window closes: returns 403 with "Review window closed"
- VendorA's token used with manipulated vendor_id claim (if JWT-based): signature validation rejects the token
- VendorA accesses the public report API (non-vendor endpoint): can see aggregated public data for all tools (this is expected and allowed)

**Test Data**:
- VendorA account with ToolAlpha (known scores: Accuracy 8.5, Coverage 7.0)
- VendorB account with ToolBeta (known scores: Accuracy 7.0, Coverage 8.5)
- Both tools enrolled in March 2026 cycle in Review state
- Valid session tokens for VendorA and VendorB
- Known IDs for ToolAlpha, ToolBeta, and their associated review records

---

#### T-058: CSRF Protection for All State-Changing Actions

| Attribute | Value |
|-----------|-------|
| Feature(s) | F-025, F-005 |
| Type | Security |
| Priority | High |
| Automation | Automated |

**Given**: An authenticated admin session with a valid session token and the application's CSRF protection mechanism is active

**When**: The following state-changing requests are sent WITHOUT a valid CSRF token (token omitted or set to an invalid value):
1. POST /api/admin/cycles (create cycle)
2. PUT /api/admin/cycles/{id}/state (transition cycle state from Draft to Planning)
3. POST /api/admin/cycles/{id}/tools (enroll a tool)
4. POST /api/admin/evaluations (submit evaluation scores)
5. POST /api/admin/synthesis/run (run synthesis)
6. PUT /api/admin/scores/{id}/correct (correct a score)
7. POST /api/admin/reports/generate (generate report)
8. POST /api/admin/audit-packages/seal (seal audit package)
9. DELETE /api/admin/tools/{id} (remove tool)
10. PUT /api/admin/vendors/{id} (update vendor)

**Then**:
- All 10 requests return HTTP 403 Forbidden with error message "CSRF token invalid or missing"
- No state changes occur: cycle remains in its original state, no tools enrolled, no scores submitted, no synthesis run, no corrections made, no reports generated, no packages sealed, no tools removed, no vendors updated
- Database state is verified unchanged after all 10 rejected requests
- When the same 10 requests are re-sent WITH valid CSRF tokens, they all succeed (HTTP 2xx), confirming that CSRF was the only barrier

**Edge Cases**:
- Reusing a CSRF token from a previous (expired) session: rejected with 403
- Using a CSRF token from a different admin user's session: rejected with 403
- CSRF token present but in wrong header/field name: rejected with 403
- GET requests to admin endpoints (read-only) do not require CSRF tokens
- Vendor portal state-changing actions (review submission) also require CSRF protection

**Test Data**:
- Authenticated admin session with valid CSRF token
- A second admin session for cross-session CSRF testing
- An expired session with its associated CSRF token
- Cycle in Draft state for state transition testing
- Enrolled tools and scores for modification testing

---

#### T-059: Admin Text Fields Sanitized Against XSS

| Attribute | Value |
|-----------|-------|
| Feature(s) | F-011, F-014, F-024 |
| Type | Security |
| Priority | High |
| Automation | Automated |

**Given**: An authenticated admin user with permissions to create and edit content, and the following XSS payloads prepared:
- Payload A: `<script>alert('xss')</script>`
- Payload B: `<img src=x onerror=alert('xss')>`
- Payload C: `<svg onload=alert('xss')>`
- Payload D: `javascript:alert('xss')`
- Payload E: `<div onmouseover="alert('xss')">hover</div>`
- Payload F: `&#60;script&#62;alert('xss')&#60;/script&#62;` (HTML entity encoded)

**When**: Each payload is submitted as input to:
1. Editorial override rationale field (score correction justification)
2. Tool description field (tool catalog entry)
3. Vendor notes field (vendor management)
4. Report content / commentary field (published report editorial content)
5. Cycle description/notes field

**Then**:
- All submissions are accepted (HTTP 2xx) - input is not rejected, but sanitized
- When the stored content is retrieved via API (GET), the response contains sanitized/escaped versions: `<script>` tags are stripped or entity-encoded, event handlers (onerror, onload, onmouseover) are removed, `javascript:` protocol is removed or neutralized
- When the content is rendered on public pages (report page, tool detail page), viewing the page source confirms no executable JavaScript exists in the rendered HTML
- The page's Content-Security-Policy header includes `script-src` directive that blocks inline scripts as a defense-in-depth measure
- A headless browser rendering each public page with stored payloads does not execute any JavaScript alert or equivalent (verified by monitoring browser console and dialog events)
- The stored text retains its informational content where safe (e.g., "alert xss" text may remain, but not in executable form)

**Edge Cases**:
- Double-encoding attack: `%253Cscript%253E` - verify the application does not double-decode
- Unicode obfuscation: `\u003cscript\u003e` - verify Unicode escape sequences are handled
- Null byte injection: `<scr\0ipt>` - verify null bytes do not bypass sanitization
- Very long payload (10,000 characters of nested tags): verify no buffer overflow or truncation that could break sanitization
- Mixed content: legitimate HTML entities like `&amp;` and `&lt;` in valid editorial text are preserved correctly

**Test Data**:
- 6 XSS payloads (A through F) as defined above
- 5 target text fields across different features
- Headless browser configuration for render testing
- Expected sanitized output for each payload/field combination

---

#### T-060: Audit Package and Public Responses Contain No Secrets

| Attribute | Value |
|-----------|-------|
| Feature(s) | F-016 |
| Type | Security |
| Priority | High |
| Automation | Automated |

**Given**: A completed benchmark cycle "March 2026" with a sealed CycleAuditPackage, published public report, and public API endpoints serving tool data and cycle results. The application is configured with: API keys for 6 AI model services, admin user credentials in the database, internal service URLs, and database connection strings.

**When**: The following outputs are collected and scanned:
1. The downloaded CycleAuditPackage file (full binary/JSON content)
2. GET /api/public/reports/march-2026 (public report API response)
3. GET /api/public/tools (public tool listing API response)
4. GET /api/public/tools/{id} (public tool detail API response)
5. The rendered HTML source of the public report page
6. The rendered HTML source of the tool detail page
7. All HTTP response headers from public endpoints

**Then**:
- None of the 7 scanned outputs contain any of the following patterns:
  - API keys or tokens (regex: strings matching common API key patterns, e.g., `sk-`, `api_key=`, `Bearer ey`, base64 strings > 40 characters in key-like contexts)
  - Admin credentials (no password hashes, no plaintext passwords, no admin usernames in non-public contexts)
  - Internal URLs (no `localhost`, no `127.0.0.1`, no internal hostnames, no private IP ranges `10.x.x.x`, `192.168.x.x`, `172.16-31.x.x`)
  - Database connection strings (no `mongodb://`, `postgres://`, `mysql://`, `redis://`)
  - Server file paths (no `/usr/`, `/var/`, `/home/`, `/app/`, or OS-specific paths)
  - Stack traces (no programming language stack traces, no line numbers with file references)
  - Internal database IDs that serve no public purpose (auto-increment IDs in contexts where UUIDs or slugs should be used)
  - Model API tokens or service credentials for the 6 AI evaluation models
  - Environment variable names with values (no `ENV_VAR=value` patterns)
- The audit package contains only: scores, model identifiers (not model API keys), methodology, timestamps, tool names, and calculation records
- HTTP response headers do not include: `X-Powered-By`, server version strings, or debug headers
- Error responses from public endpoints (e.g., requesting a non-existent cycle) return generic messages with no internal details

**Edge Cases**:
- Force an application error on a public endpoint (e.g., malformed query parameter): error response contains no stack trace or internal path
- Request a very large page size on a public list endpoint: response does not include internal pagination metadata that leaks record counts or database details
- Audit package for a cycle where a score correction occurred: correction record does not expose admin approver's internal user ID or email; uses display name or role only
- Public API responses use consistent identifier format (UUIDs or slugs) rather than sequential database IDs

**Test Data**:
- Sealed CycleAuditPackage for March 2026 cycle
- Configured application with known API keys (e.g., `sk-test-abc123...`), internal URL (`http://internal-service:8080`), database string (`postgres://user:pass@db:5432/arena`)
- Regex pattern library for secret detection covering: API keys, credentials, URLs, paths, stack traces, connection strings
- Public API endpoint inventory for exhaustive scanning

---

### 4.4 Test Coverage Matrix

| Feature ID | Feature Name | Unit | Integration | E2E | Performance | Security |
|-----------|-------------|------|-------------|-----|-------------|----------|
| F-001 | Public Homepage | -- | -- | T-037, T-038 | Baseline TTFB | -- |
| F-002 | Track Leaderboard | -- | -- | T-033, T-034 | Baseline TTFB | -- |
| F-003 | Tool Detail Page | -- | T-047 | T-035, T-036 | Baseline TTFB | -- |
| F-004 | Tool Comparison View | -- | -- | T-039 | -- | -- |
| F-005 | Benchmark Cycle Lifecycle | -- | T-001, T-002, T-003, T-004, T-005, T-015, T-047, T-050 | T-046 | -- | T-058 |
| F-006 | Tool Enrollment | -- | T-024, T-025 | T-046 | -- | -- |
| F-007 | AI Model Evaluation Execution | -- | T-019, T-020, T-021, T-022 | T-046 | Batch eval timing | -- |
| F-008 | Prompt Set Management | -- | T-022 | -- | -- | -- |
| F-009 | AI Model Configuration | -- | -- | -- | -- | -- |
| F-010 | Vendor & Tool Admin | -- | T-041 | -- | -- | -- |
| F-011 | Score Synthesis Pipeline | T-006, T-007, T-008, T-052 | T-009, T-010, T-021, T-023, T-049, T-053 | T-046 | Synthesis batch timing | T-059 |
| F-012 | Composite Score & Ranking | T-011, T-012, T-013, T-048, T-052 | T-053, T-054 | T-046 | -- | -- |
| F-013 | Methodology Version Mgmt | -- | T-005, T-028 | -- | -- | -- |
| F-014 | Report Generation & Publication | -- | T-030, T-031, T-047, T-049, T-055 | T-046 | -- | T-059 |
| F-015 | Vendor Review Workflow | -- | T-026, T-027 | -- | -- | T-027, T-057 |
| F-016 | Audit Package Generation | -- | T-014, T-015, T-051 | T-046 | -- | T-060 |
| F-017 | Methodology Public Pages | -- | -- | T-040 | -- | -- |
| F-018 | Evidence Artifact Capture | -- | T-023 | -- | -- | -- |
| F-019 | Badge Awarding | -- | T-042 | -- | -- | -- |
| F-020 | Cycle Archive | -- | T-047 | T-045 | -- | -- |
| F-021 | Vendor Directory | -- | -- | T-044 | -- | -- |
| F-022 | Anomaly Detection | T-029 | -- | -- | -- | -- |
| F-023 | Score Correction | -- | T-032, T-049, T-054, T-055 | -- | -- | -- |
| F-024 | Static Pages | -- | -- | T-043 | -- | T-059 |
| F-025 | Admin Authentication | -- | T-017 | T-016 | -- | T-018, T-056, T-058 |

**Coverage Summary**:

| Test Type | Count | Automation Rate |
|-----------|-------|----------------|
| Unit | 8 | 100% Automated |
| Integration | 33 | 100% Automated |
| E2E | 14 | 100% Automated |
| Security | 7 (T-018, T-027, T-056, T-057, T-058, T-059, T-060) | 100% Automated |
| **Total** | **60** (2 dual-tagged: T-027 Integration+Security, T-052 Unit cross-ref) | **100% Automated** |

**Coverage by Priority**:

| Priority | Feature Count | Features with Tests | Coverage |
|----------|--------------|--------------------|---------|
| P0 (MVP) | 19 | 19/19 | 100% |
| P1 | 4 | 4/4 | 100% |
| P2 | 1 | 1/1 | 100% |

**Note on F-009 (AI Model Configuration Management)**: This feature is a simple CRUD interface with S (<1 day) effort. Its business logic is validated indirectly through T-019, T-020, T-021, and T-022 (which test that model configurations are correctly used during evaluation). A dedicated unit or integration test for F-009 is not included due to low risk; however, if the developer prefers explicit coverage, a simple CRUD validation test can be added.

**Gaps and Recommendations**:

1. **Performance testing** is noted as needed but not expressed as specific test cases. Before each publication cycle, the developer should verify: public pages load within 2 seconds TTFB, the synthesis pipeline completes within acceptable batch time for 27 tools x 8 dimensions x 6 models (~1,296 evaluations), and admin pages remain responsive under operational data volumes.

2. **Accessibility testing** should be performed manually with axe-core on public pages (F-001, F-002, F-003, F-017, F-024) before launch. Automated axe-core assertions can be added to the E2E tests for these pages as a low-effort extension.

3. **Security scanning** (OWASP ZAP or similar) should be run against staging before each publication cycle. The seven security test cases (T-018, T-027, T-056, T-057, T-058, T-059, T-060) provide comprehensive coverage of authentication, authorization, CSRF, XSS, and data leakage vectors. A full automated scan adds defense in depth.

---

*AISearchArena.com PRD | Section 4: Testing & Validation | v1.1 (Expert Review Incorporated) | 2026-02-24*
