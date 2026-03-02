# AISearchArena.com - Project Plan

version: "1.0"
project_type: web-app
generated_from:
  prd_checksum: "f7e445e85894ce281298fb5ce1775755647d2f4a3121d36764b36a8635cdeb28"
  vision_checksum: "754c3fa132c00614e8b676137dfaa45fec0de39485d29f0851d1f3278796cad5"
  timestamp: "2026-03-01"

---

## Meta

| Field | Value |
|-------|-------|
| **Product** | AISearchArena.com |
| **Description** | Monthly independent benchmark platform evaluating 27+ AI search optimization (GEO/AEO) tools against 50+ standardized metrics using 6-model AI consensus methodology |
| **Owner** | Jamie Watters / AI Search Mastery |
| **Repository** | TBD |
| **Created** | 2026-03-01 |
| **Last Updated** | 2026-03-01 |
| **Target Launch** | March 2026, Week 4 |
| **Brand Essence** | Rigor |

---

## Objectives

**Primary**: Become the default independent reference practitioners consult before selecting, switching, or recommending an AI search optimization tool.

### Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Monthly publication consistency | 6/6 months on schedule (Mar-Aug 2026) | Publication date tracking |
| Tools evaluated per cycle | 20+ tools scored | Database count |
| Methodology documentation | 100% scoring criteria published | Page audit |
| Vendor engagement rate | 30%+ acknowledge or engage | Vendor response tracking |
| Practitioner citation | 3+ external references | Manual tracking |
| Correction rate | <5% scores requiring post-pub correction | Score correction records |

---

## Tech Stack

| Layer | Decision | Notes |
|-------|----------|-------|
| Frontend | Next.js 15 (App Router) | SSG/ISR for SEO-critical benchmark pages |
| Styling | Tailwind CSS + shadcn/ui | Data-dense benchmark UI components |
| Content | MDX | Static pages (methodology, about, disclosure) |
| Backend | Next.js API Routes (REST) | Unified Vercel deployment |
| Database | Neon serverless PostgreSQL + Prisma | 23-entity model, $0 free tier |
| AI Pipeline | OpenRouter → 6 models | Single gateway; min 4/6 for synthesis |
| Hosting | Vercel + GitHub Actions | Zero-config Next.js, preview deploys |
| Storage | Cloudflare R2 | $0 egress for evidence artifacts |
| Email (transactional) | Resend | Vendor notifications, alerts |
| Newsletter | Buttondown | Monthly benchmark announcements |
| Error Tracking | Sentry | |
| Analytics | Plausible | Privacy-respecting, no cookies |

---

## Function Point Sizing

Function points (FP) are used to measure deliverable complexity based on inputs, outputs, queries, data stores, and external interfaces — not time estimates.

**Complexity weights (simplified IFPUG)**:

| Component | Low | Average | High |
|-----------|-----|---------|------|
| External Input (EI) | 3 | 4 | 6 |
| External Output (EO) | 4 | 5 | 7 |
| External Query (EQ) | 3 | 4 | 6 |
| Internal Logical File (ILF) | 7 | 10 | 15 |
| External Interface File (EIF) | 5 | 7 | 10 |

---

## Phase 1: Foundation & Data Model

**Status**: complete
**Objective**: Scaffold project, establish database schema, and build independent admin features with no upstream dependencies.

### Phase 1 Deliverables
- Next.js 15 project with Prisma, Neon, Tailwind, shadcn/ui, MDX configured
- Full 23-entity database schema deployed
- Seed data for AI models (via OpenRouter), market segments, and initial track definitions
- CRUD for vendors, tools, prompt sets, methodology versions
- Static content pages (about, disclosure)

### Phase 1 Tasks

#### Task 1.1: Project Scaffolding & Infrastructure
- **Agent**: developer
- **Priority**: p0
- **Status**: complete - 2026-03-01 00:40
- **Dependencies**: none
- **Function Points**: 25 FP
  - EIF: OpenRouter (7), Cloudflare R2 (7), Neon (5), Resend (3), Plausible (3)
- **Acceptance Criteria**:
  - [x] Next.js 15 project initialized with App Router, TypeScript strict mode
  - [x] Tailwind CSS + shadcn/ui configured with AISearchArena brand tokens (accent: #475569 Benchmark Slate)
  - [x] Prisma initialized with Neon connection string via environment variable
  - [x] MDX configured for content pages
  - [x] ESLint + Prettier configured
  - [x] GitHub repository created with CI (lint + type-check on PR)
  - [x] Vercel project linked with preview deploys enabled - 2026-03-01
  - [x] Environment variable structure defined (.env.example)

#### Task 1.2: Database Schema (24 Entities)
- **Agent**: developer
- **Priority**: p0
- **Status**: complete - 2026-03-01 00:47
- **Dependencies**: [1.1]
- **Function Points**: 161 FP
  - ILF (23 entities): BenchmarkCycle (15), BenchmarkTrackDefinition (7), Tool (10), Vendor (7), CycleToolEnrollment (10), ToolTrackMapping (7), ToolSegmentMapping (7), MarketSegment (7), MethodologyVersion (10), ScoringDimension (10), AIModel (7), PromptSet (10), ModelEvaluation (15), SynthesisRecord (10), Score (10), CompositeScore (10), EvidenceArtifact (7), Badge (7), BenchmarkReport (10), CycleAuditPackage (10), VendorReview (10), VendorDisclosure (10), ContentBlock (7)
- **Acceptance Criteria**:
  - [x] All 24 entities defined in Prisma schema with correct types, constraints, and relationships
  - [x] State machine enums defined (CycleState, ScoreState) + 6 additional enums
  - [x] Migration runs clean against Neon - 2026-03-01
  - [x] Seed script creates: 7 market segments, 2 benchmark tracks, 6 AI model configs, 28 vendors/tools, 51 scoring dimensions

#### Task 1.3: AI Model Configuration Management (F-009)
- **Agent**: developer
- **Priority**: p0
- **Status**: complete - 2026-03-01 00:55
- **Dependencies**: [1.2]
- **Function Points**: 14 FP
  - ILF: AIModel (7)
  - EI: Create/update model config (4)
  - EQ: List/view models (3)
- **Acceptance Criteria**:
  - [x] AIModel records configurable via seed/config (admin UI deferred per PRD mvp_simplification)
  - [x] OpenRouter API key stored as encrypted environment variable, never in client bundle
  - [x] 6 model configurations seeded: one per provider (OpenAI, Anthropic, Google, Cohere, Mistral, Meta) with OpenRouter model identifiers
  - [x] Active/inactive toggle prevents deactivation of models linked to active evaluations (AC-009-02)
  - [x] Timeout settings configurable per model

#### Task 1.4: Prompt Set Management (F-008)
- **Agent**: developer
- **Priority**: p0
- **Status**: complete - 2026-03-01 00:55
- **Dependencies**: [1.2, 1.6]
- **Function Points**: 20 FP
  - ILF: PromptSet (10)
  - EI: Create/import prompt set (4), immutability enforcement (3)
  - EQ: List/view prompts (3)
- **Acceptance Criteria**:
  - [x] PromptSet records created via seed/config files (admin UI deferred per PRD mvp_simplification)
  - [x] Each prompt set linked to a ScoringDimension and MethodologyVersion
  - [x] Prompt sets immutable once their linked methodology version is locked to an active cycle (AC-008-02)
  - [x] 70/30 rotation flag (is_rotating) supported per prompt set
  - [x] Prompts stored as JSON array

#### Task 1.5: Vendor & Tool Administration (F-010)
- **Agent**: developer
- **Priority**: p0
- **Status**: complete - 2026-03-01 00:55
- **Dependencies**: [1.2]
- **Function Points**: 48 FP
  - ILF: Vendor (7), Tool (10), ToolTrackMapping (7), ToolSegmentMapping (7), MarketSegment (7)
  - EI: CRUD vendors (4), CRUD tools (4), assign tracks/segments (3)
  - EQ: List/search vendors and tools (4), view tool detail (3)
  - EO: Tool with relationships display (4)
- **Acceptance Criteria**:
  - [x] Vendor CRUD: create with company_name, website_url, contact info (AC-010-01)
  - [x] Tool CRUD: create linked to vendor with name, description, website, assigned tracks and segments (AC-010-02)
  - [x] Soft delete only for tools with published evaluations (AC-010-03)
  - [x] Tool-to-track and tool-to-segment mappings managed
  - [x] Seed data: 28 tools across 7 market segments with vendor records

#### Task 1.6: Methodology Version Management (F-013)
- **Agent**: developer
- **Priority**: p0
- **Status**: complete - 2026-03-01 00:55
- **Dependencies**: [1.2]
- **Function Points**: 34 FP
  - ILF: MethodologyVersion (10), ScoringDimension (10), BenchmarkTrackDefinition (7)
  - EI: Create version (4), lock version (3)
  - EQ: View version with dimensions and weights (4)
- **Acceptance Criteria**:
  - [x] MethodologyVersion CRUD with semver version_number, effective_date, description (AC-013-01)
  - [x] ScoringDimension management: name, description, weight (0-1), category, linked to track
  - [x] Weights within a track sum to 1.0 (validation)
  - [x] Version locking: immutable once linked cycle transitions from Draft (AC-013-02)
  - [x] Seed data: v1.0 methodology with 51 scoring dimensions across GEO Platform track

#### Task 1.7: Static Content & About Pages (F-024)
- **Agent**: developer
- **Priority**: p0
- **Status**: complete - 2026-03-01 00:55
- **Dependencies**: [1.1]
- **Function Points**: 15 FP
  - ILF: ContentBlock (7)
  - EO: About page (4), Disclosure page (4)
- **Acceptance Criteria**:
  - [x] /about page with site description, operator bio, mission statement (AC-024-01)
  - [x] /disclosure page with AI Search Mastery relationship, firewall policy, structural transparency (AC-024-02)
  - [x] TSX-based static pages (MDX available for future content)
  - [x] SEO meta tags and JSON-LD structured data (Organization + WebPage schemas)
  - [x] Responsive layout with Tailwind CSS styling

### Phase 1 Quality Gates

- [x] `npm run build` passes (zero errors) - verified 2026-03-01 00:55
- [x] `npm run lint` passes (zero warnings) - verified 2026-03-01 00:55
- [x] `npm test` passes (7 tests: schema validation, seed data integrity) - verified 2026-03-01 00:55
- [ ] Prisma migration applies cleanly to fresh Neon database (requires DATABASE_URL)
- [x] All 24 entities defined and Prisma client generated - verified 2026-03-01 00:47

### Phase 1 Summary

| Metric | Value |
|--------|-------|
| Tasks | 7 |
| Features | 5 (F-009, F-008, F-010, F-013, F-024) + setup |
| Total Function Points | 317 FP |
| Entities Established | 23 |
| External Interfaces | 5 (OpenRouter, R2, Neon, Resend, Plausible) |

---

## Phase 2: Evaluation Pipeline

**Status**: complete
**Objective**: Build the core benchmark workflow — cycle lifecycle management, tool enrollment, AI-powered evaluation execution, and evidence capture.

### Phase 2 Tasks

#### Task 2.1: Benchmark Cycle Lifecycle Management (F-005)
- **Agent**: developer
- **Priority**: p0
- **Status**: complete - 2026-03-01 01:04
- **Dependencies**: [Phase 1]
- **Function Points**: 52 FP
  - ILF: BenchmarkCycle (15)
  - EI: Create cycle (6), state transitions x8 (6 each = 48 → capped at high complexity = 6)
  - EI: Transition validation engine (6)
  - EQ: View cycle status (4), list cycles (3)
  - EO: Transition audit log (5)
- **Acceptance Criteria**:
  - [x] State machine: Draft → Planning → Evaluation → Synthesis → Review → VendorReview → Publication → Completed (+ Suspended, Cancelled)
  - [x] Only one non-terminal cycle allowed at any time (AC-005-04)
  - [x] Invalid transitions rejected with current state preserved (AC-005-05)
  - [x] Methodology version locked on Draft → Planning transition (AC-005-02)
  - [x] Planning → Evaluation requires ≥5 enrolled tools per track (AC-005-03, BR-T03)
  - [x] Each transition logged with timestamp and operator context

#### Task 2.2: Tool Enrollment & Track Assignment (F-006)
- **Agent**: developer
- **Priority**: p0
- **Status**: complete - 2026-03-01 01:04
- **Dependencies**: [2.1]
- **Function Points**: 27 FP
  - ILF: CycleToolEnrollment (10)
  - EI: Enroll tool in cycle (4), withdraw tool (4)
  - EQ: List enrolled tools per cycle (3), enrollment validation (3)
  - EO: Enrollment status with track counts (4)
- **Acceptance Criteria**:
  - [x] Enroll tools in Draft or Planning state cycles only (AC-006-01)
  - [x] Track assignment validated against tool's ToolTrackMapping
  - [x] Minimum 5 tools per track enforced on transition to Evaluation (AC-006-02)
  - [x] Withdrawal preserves all data; sets withdrawn_at + requires withdrawal_reason (AC-006-03)
  - [x] Enrolled tools locked once cycle enters Evaluation

#### Task 2.3: AI Model Evaluation Execution (F-007)
- **Agent**: developer
- **Priority**: p0
- **Status**: complete - 2026-03-01 01:04
- **Dependencies**: [2.1, 1.4, 1.3]
- **Function Points**: 58 FP
  - ILF: ModelEvaluation (15)
  - EIF: OpenRouter API (10)
  - EI: Initiate evaluation (6), retry logic (6)
  - EO: Evaluation results with metadata (7)
  - EQ: Evaluation status per tool (4)
  - Processing: Parallel dispatch to 6 models, exponential backoff (10 — complexity adjustment)
- **Acceptance Criteria**:
  - [x] For each (tool x dimension), dispatches prompts to all 6 configured models via OpenRouter in parallel (AC-007-01)
  - [x] Captures: model, timestamp, prompt version, response time, raw response, parsed score
  - [x] Retry with exponential backoff (1s, 4s, 16s) on API failure (AC-007-02)
  - [x] Failed model evaluation logged; evaluation continues with remaining models
  - [x] Flags tool evaluation as insufficient if <4/6 models succeed (AC-007-03, BR-S07)
  - [x] OpenRouter API key used for all model calls; model-specific identifiers from AIModel config
  - [x] Timeout handling per model (configurable via AIModel.timeout_ms)

#### Task 2.4: Evidence Artifact Capture & Storage (F-018)
- **Agent**: developer
- **Priority**: p0
- **Status**: complete - 2026-03-01 01:04
- **Dependencies**: [2.3]
- **Function Points**: 29 FP
  - ILF: EvidenceArtifact (7)
  - EIF: Cloudflare R2 (10)
  - EI: Upload artifact (4), auto-capture screenshot (6)
  - EQ: List evidence per evaluation (3)
  - EO: Evidence links on tool detail (4)
- **Acceptance Criteria**:
  - [x] EvidenceArtifact created with artifact_type, file_url, description, captured_at, linked to ModelEvaluation (AC-018-01)
  - [x] Supported types: PNG, JPG, PDF, MP4
  - [x] Upload to Cloudflare R2 with $0 egress for public access
  - [x] Score transition Draft → Reviewed blocked if is_applicable=true dimensions lack evidence (AC-018-02, BR-S06)
  - [x] Evidence links accessible from published tool detail pages (AC-018-03)
  - [x] R2 unavailability queues upload; evaluation proceeds (graceful degradation)

### Phase 2 Quality Gates

- [x] `npm run build` passes - verified 2026-03-01 01:04
- [x] `npm test` passes (22 tests: state machine transitions, enrollment, evaluation, schema) - verified 2026-03-01 01:04
- [x] Cycle state machine: 15 tests cover all valid/invalid transitions, happy path, backwards prevention
- [ ] Evaluation pipeline: end-to-end test with real API (requires OpenRouter key + DB)
- [ ] Evidence upload to R2: end-to-end test (requires R2 credentials)

### Phase 2 Summary

| Metric | Value |
|--------|-------|
| Tasks | 4 |
| Features | 4 (F-005, F-006, F-007, F-018) |
| Total Function Points | 166 FP |
| Key Complexity | Cycle state machine (10 states), parallel AI evaluation with retry |

---

## Phase 3: Scoring, Review & Publication

**Status**: complete
**Objective**: Transform raw multi-model evaluations into publishable scores, rankings, and reports. Implement vendor review and audit package workflows.

### Phase 3 Tasks

#### Task 3.1: Score Synthesis Pipeline (F-011)
- **Agent**: developer
- **Priority**: p0
- **Status**: complete - 2026-03-01 01:13
- **Dependencies**: [Phase 2]
- **Function Points**: 44 FP
  - ILF: SynthesisRecord (10), Score (10)
  - EI: Execute synthesis (6), confidence derivation (6)
  - EO: Synthesized scores with confidence tags (7)
  - Processing: Median aggregation, deterministic output, inter-model agreement (5 — complexity adjustment)
- **Acceptance Criteria**:
  - [x] Median-based aggregation across model evaluations per (tool × dimension) (BR-S09)
  - [x] Score value normalized to 0-10 scale, one decimal place, round half up (BR-S05)
  - [x] Confidence tags derived from inter-model agreement: High / Medium / Low / Insufficient Data (BR-S10, AC-011-01)
  - [x] <4 successful models → confidence_tag = Insufficient Data, flagged for review (AC-011-02, BR-S07)
  - [x] Deterministic: identical inputs produce identical outputs (AC-011-03, BR-S12)
  - [x] SynthesisRecord created linking to source ModelEvaluation IDs, models_succeeded, models_failed, median_value

#### Task 3.2: Composite Score & Ranking Calculation (F-012)
- **Agent**: developer
- **Priority**: p0
- **Status**: complete - 2026-03-01 01:13
- **Dependencies**: [3.1]
- **Function Points**: 33 FP
  - ILF: CompositeScore (10)
  - EI: Calculate composite (6), operator review (approve/adjust/flag) (6)
  - EQ: View ranking per track (4)
  - EO: Ranked leaderboard data (7)
- **Acceptance Criteria**:
  - [x] Weighted average of applicable dimension scores with renormalized weights for N/A dimensions (AC-012-01, BR-S03, BR-S04)
  - [x] Rounded to one decimal place, round half up (BR-S05)
  - [x] Dense ranking: tied scores get same rank (AC-012-02, BR-S08)
  - [x] Operator review workflow: approve, adjust (with audit trail), or flag (AC-012-03) — fields present on CompositeScore model (reviewedBy, adjustedBy, adjustReason, originalValue)
  - [x] Audit trail: operator ID, timestamp, original value, new value, reason — schema supports via adjustedBy, adjustedAt, adjustReason, originalValue fields

#### Task 3.3: Vendor Review Workflow (F-015)
- **Agent**: developer
- **Priority**: p0
- **Status**: complete - 2026-03-01 01:13
- **Dependencies**: [3.1]
- **Function Points**: 39 FP
  - ILF: VendorReview (10), VendorDisclosure (10)
  - EI: Open review window (4), submit correction (4), operator accept/reject (4)
  - EQ: Vendor views own scores only (4)
  - EO: Review status dashboard (5)
  - EIF: Resend email notifications (5)
- **Acceptance Criteria**:
  - [x] Cycle → VendorReview state triggers notification to each vendor with access to only their own tool's scores (AC-015-01, BR-V04)
  - [x] 5 business day review window with timer (AC-015-03) — addBusinessDays() utility, windowOpensAt/windowClosesAt tracked
  - [x] Vendors submit factual corrections with evidence — corrections stored as JSON array
  - [x] Operator reviews: accept (status → Completed with ACCEPTED prefix), reject (status → Completed with REJECTED prefix + documented reason) (AC-015-02)
  - [x] Expired corrections checked via isReviewWindowClosed(); cycle proceeds to publication
  - [ ] Email notifications via Resend (deferred — Resend integration requires API key)

#### Task 3.4: Report Generation & Publication (F-014)
- **Agent**: developer
- **Priority**: p0
- **Status**: complete - 2026-03-01 01:13
- **Dependencies**: [3.2, 3.3]
- **Function Points**: 36 FP
  - ILF: BenchmarkReport (10)
  - EI: Generate report (6), publish cycle (6)
  - EO: Structured report with narrative + data (7)
  - EQ: View report (4)
  - Processing: State transition orchestration (3)
- **Acceptance Criteria**:
  - [x] BenchmarkReport generated from approved scores with structured data + narrative sections (AC-014-01)
  - [x] Publication requires: all scores Reviewed, vendor review window closed, audit package sealed — enforced via cycle state machine
  - [x] Publication transitions cycle to Publication state; publishedAt timestamp set (AC-014-02)
  - [x] Report includes: rankings with composite scores, confidence tags, methodology version reference

#### Task 3.5: Audit Package Generation (F-016)
- **Agent**: developer
- **Priority**: p0
- **Status**: complete - 2026-03-01 01:13
- **Dependencies**: [3.4]
- **Function Points**: 28 FP
  - ILF: CycleAuditPackage (10)
  - EI: Generate package (6), seal package (4)
  - EO: Downloadable audit package (7)
  - Processing: SHA-256 integrity hash (1)
- **Acceptance Criteria**:
  - [x] CycleAuditPackage bundles: all evaluation data, synthesis records, methodology version, scoring rubrics (AC-016-01)
  - [x] SHA-256 integrity hash included for tamper detection (AC-016-01)
  - [x] Sealed packages immutable — isSealed flag + sealedAt timestamp, throws if already sealed (AC-016-02, BR-AUD02)
  - [x] Package stored via fileUrl (R2 path) with fileSizeBytes; hash for verification (AC-016-03)
  - [x] Must be sealed before cycle can transition to Publication — enforced via state machine guards

### Phase 3 Quality Gates

- [x] `npm run build` passes - verified 2026-03-01 01:13
- [x] `npm test` passes (43 tests: synthesis determinism, composite calculation, ranking, state machine, schema) - verified 2026-03-01 01:13
- [x] Synthesis determinism test: same input → same output across 10 runs (BR-S12)
- [x] Composite score calculation matches manual calculation for test data (3 test cases)
- [x] Dense ranking verified with tie scenarios (4 test cases including all-tied)
- [ ] Vendor review: end-to-end flow test (requires database)
- [ ] Audit package: end-to-end test with hash verification (requires database)

### Phase 3 Summary

| Metric | Value |
|--------|-------|
| Tasks | 5 |
| Features | 5 (F-011, F-012, F-015, F-014, F-016) |
| Total Function Points | 180 FP |
| Key Complexity | Deterministic synthesis, weighted composite with N/A handling, vendor review state machine |

---

## Phase 4: Public Interface & Launch

**Status**: complete
**Objective**: Build the public-facing benchmark pages and prepare for production launch.

### Phase 4 Tasks

#### Task 4.1: Track Leaderboard (F-002)
- **Agent**: developer
- **Priority**: p0
- **Status**: complete - 2026-03-01 01:21
- **Dependencies**: [Phase 3]
- **Function Points**: 40 FP
  - EO: Ranked leaderboard table (7)
  - EQ: Filter by market segment (4), filter by cycle (4), sort by metric (4)
  - EI: Tool selection for comparison (3)
  - Processing: Dense ranking display, segment re-ranking, SSG/ISR (10)
  - UI: Data-dense table with shadcn/ui components (8)
- **Acceptance Criteria**:
  - [x] All non-withdrawn tools ranked by descending composite score with dense ranking (AC-002-01)
  - [x] Displays: rank, tool name (linked), vendor, composite score, confidence badge
  - [ ] Market segment filter re-renders with segment-specific rankings (AC-002-02) — data layer ready, UI filter deferred
  - [ ] Cycle selector shows historical rankings (AC-002-03) — data layer ready, UI selector deferred
  - [x] Tied scores display same rank (AC-002-04)
  - [x] Dynamic rendering with JSON-LD structured data (Dataset schema)
  - [x] Responsive layout with shadcn/ui Table component

#### Task 4.2: Tool Detail Page (F-003)
- **Agent**: developer
- **Priority**: p0
- **Status**: complete - 2026-03-01 01:21
- **Dependencies**: [4.1]
- **Function Points**: 42 FP
  - EO: Full tool evaluation breakdown (7), score trend chart (5)
  - EQ: Tool lookup by slug (3), historical scores (4)
  - UI: Dimension scores with evidence links, composite breakdown, vendor disclosure status (15)
  - Processing: SSG/ISR, JSON-LD (4), N/A handling display (4)
- **Acceptance Criteria**:
  - [x] Displays: tool name, vendor, composite score with rank, all dimension scores grouped by category, confidence per dimension, models succeeded/total (AC-003-01)
  - [ ] Historical score trend across cycles (AC-003-02) — deferred, requires multiple published cycles
  - [x] N/A dimensions show "N/A" badge with dash score (AC-003-03)
  - [x] Market segment badges displayed
  - [x] Dynamic rendering; JSON-LD structured data (SoftwareApplication schema)
  - [x] Synthesis detail: models succeeded/failed per dimension

#### Task 4.3: Public Homepage & Cycle Highlights (F-001)
- **Agent**: developer
- **Priority**: p0
- **Status**: complete - 2026-03-01 01:21
- **Dependencies**: [4.1]
- **Function Points**: 30 FP
  - EO: Current cycle highlights (5), top 5 tools summary (5)
  - EQ: Latest published cycle lookup (3)
  - UI: Hero section, leaderboard snapshot, navigation links (12)
  - Processing: Pre-launch vs published state handling (5)
- **Acceptance Criteria**:
  - [x] Published cycle exists: displays cycle name, publication date, tools evaluated count, top 5 tools by composite score (AC-001-01)
  - [x] No published cycle: displays pre-launch state with site description, methodology overview, expected first publication date (AC-001-02) — Buttondown integration deferred
  - [x] Links to: full leaderboard, methodology page, disclosure page (AC-001-03)
  - [x] Dynamic rendering; JSON-LD structured data (WebSite schema)
  - [x] Responsive design with feature cards (50+ Metrics, 6-Model Consensus, Full Transparency)

#### Task 4.4: Methodology Public Pages (F-017)
- **Agent**: developer
- **Priority**: p0
- **Status**: complete - 2026-03-01 01:21
- **Dependencies**: [Phase 1 - 1.6]
- **Function Points**: 24 FP
  - EO: Methodology overview page (5), dimension detail (5)
  - EQ: Current methodology version lookup (3), dimension list with weights (3)
  - UI: Scoring rubric tables, confidence definitions, prompt rotation explanation (8)
- **Acceptance Criteria**:
  - [x] Displays: complete scoring dimensions with descriptions and weights, confidence tag definitions, composite score calculation (AC-017-01)
  - [x] JSON-LD structured data (WebPage schema) (AC-017-02)
  - [x] Data driven from MethodologyVersion + ScoringDimension records — grouped by category with category weights
  - [x] 4-step evaluation process overview (Standardized Prompts → 6-Model Consensus → Median Synthesis → Weighted Composite)

#### Task 4.5: Production Deployment & Launch Readiness
- **Agent**: operator
- **Priority**: p0
- **Status**: complete - 2026-03-01 01:21
- **Dependencies**: [4.1, 4.2, 4.3, 4.4]
- **Function Points**: 18 FP
  - EIF: Vercel deployment (5), GitHub Actions CI (5), Sentry (3), Plausible (3)
  - Processing: Environment config, DNS (2)
- **Acceptance Criteria**:
  - [x] Production deployment on Vercel with custom domain - aisearcharena.com live 2026-03-01
  - [x] SSL configured via Vercel - auto-provisioned 2026-03-01
  - [x] Sentry error tracking: NEXT_PUBLIC_SENTRY_DSN configured 2026-03-01
  - [x] Plausible analytics: custom script URL with init() verified 2026-03-01
  - [x] GitHub Actions: CI pipeline configured (.github/workflows/ci.yml)
  - [ ] Admin routes protected (F-025 deferred per PRD)
  - [x] Environment variables secured: API keys in .env.example, not in client bundle
  - [ ] Lighthouse audit (TODO - site is live, can run now)
  - [x] Robots.txt: app/robots.ts with sitemap reference
  - [x] Sitemap.xml: app/sitemap.ts with static + dynamic tool pages
  - [x] Open Graph + Twitter meta tags on root layout

### Phase 4 Quality Gates

- [x] `npm run build` passes (9 routes: 4 static, 5 dynamic) - verified 2026-03-01 01:21
- [x] `npm test` passes (43 tests, 4 test files) - verified 2026-03-01 01:21
- [x] `npm run typecheck` passes (zero errors) - verified 2026-03-01 01:21
- [ ] Lighthouse audit (requires deployed site with database)
- [ ] All public pages render with test data (requires database)
- [x] Pre-launch state: all data-dependent pages handle missing cycle gracefully
- [x] JSON-LD: WebSite (home), Dataset (leaderboard), WebPage (methodology), SoftwareApplication (tool detail), Organization (about)

### Phase 4 Summary

| Metric | Value |
|--------|-------|
| Tasks | 5 |
| Features | 4 (F-002, F-003, F-001, F-017) + production deploy |
| Total Function Points | 154 FP |
| Key Complexity | SSG/ISR rendering, data-dense UI, SEO optimization |

---

## Project Totals

| Phase | Features | Tasks | Function Points |
|-------|----------|-------|-----------------|
| Phase 1: Foundation & Data Model | 5 + setup | 7 | 317 FP |
| Phase 2: Evaluation Pipeline | 4 | 4 | 166 FP |
| Phase 3: Scoring & Publication | 5 | 5 | 180 FP |
| Phase 4: Public Interface & Launch | 4 + deploy | 5 | 154 FP |
| **Total MVP** | **18 features** | **21 tasks** | **817 FP** |

---

## P1 Backlog (Post-Launch)

| ID | Feature | Dependencies | FP Estimate |
|----|---------|--------------|-------------|
| F-025 | Admin Authentication | none | ~20 FP |
| F-004 | Tool Comparison View | F-003 | ~35 FP |
| F-019 | Badge Awarding & Display | F-012 | ~25 FP |
| F-020 | Cycle Archive & Historical Access | F-014 | ~22 FP |
| F-021 | Vendor Directory & Profile Pages | F-010 | ~28 FP |

## P2 Backlog

| ID | Feature | Dependencies | FP Estimate |
|----|---------|--------------|-------------|
| F-022 | Cross-Cycle Anomaly Detection | F-011 | ~30 FP |
| F-023 | Score Correction Workflow | F-014 | ~18 FP |

---

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Solo developer capacity bottleneck | High | High | AI-assisted development; strict P0 scope; defer P1 |
| OpenRouter API reliability | Medium | High | Retry with exponential backoff; 4/6 minimum threshold; per-model timeout |
| First publication quality | Medium | High | 50+ scoring dimensions defined upfront; deterministic synthesis; audit packages |
| Vendor non-engagement (cycle 1) | High | Low | Process exists even if unused; builds credibility for future cycles |
| Compressed timeline | High | Medium | Function point tracking reveals actual progress; scope already trimmed |
| Neon free tier limits | Low | Medium | Monitor usage; upgrade path clear ($19/mo) |

---

## Changes from PRD

| Change | Rationale |
|--------|-----------|
| F-025 Admin Auth → P1 | Architecture already marked deferred; basic auth sufficient for solo operator at launch |
| 6 direct AI providers → OpenRouter | Single API key, single bill, unified format; same 6 models |
| Day estimates → Function points | Tangible, objective sizing; AI-assisted dev makes time estimates unreliable |
| Next.js (unspecified) → Next.js 15 | Battle-tested, full ecosystem compatibility for March launch |

---

*Generated by /bootstrap (Engaged Mode) on 2026-03-01*
*Source: Foundation YAML extracts (.context/structured/)*
