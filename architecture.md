# AISearchArena.com - Architecture

> Generated: 2026-02-28 | Version: 1.0
> Product: Monthly independent benchmark publication for AI search optimization tools
> Operator: Jamie Watters / AI Search Mastery (solopreneur)
> Target Launch: March 2026, Week 4

---

## 1. Executive Summary

AISearchArena.com is a monthly benchmark publication platform that evaluates 27+ AI search optimization (GEO/AEO) tools against 50+ standardized metrics using a 6-model AI consensus methodology. The platform publishes ranked leaderboards, tool detail pages, benchmark reports, and methodology documentation.

**Key architectural decisions:**

| Area | Decision | Rationale |
|------|----------|-----------|
| Architecture | Monolith (Next.js) | Solopreneur operation; batch evaluation workflow, not real-time |
| Frontend | Next.js App Router + Tailwind + shadcn/ui + MDX | SSG/ISR for SEO-critical benchmark pages |
| Database | Neon serverless PostgreSQL + Prisma | 24-entity model, $0 free tier, type-safe queries |
| Auth | Custom (deferred) | Admin-only; not needed at launch for public site |
| AI Pipeline | 6 providers, parallel with retry | Core product differentiator; min 4/6 for synthesis |
| Hosting | Vercel + GitHub Actions | Zero-config Next.js deploys, preview branches |
| Storage | Cloudflare R2 | $0 egress for publicly-served evidence artifacts |
| Monitoring | Sentry + Plausible | Error tracking + privacy-respecting analytics |

---

## 2. System Overview

```
                        AISearchArena.com - System Architecture
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  VISITORS (Public)                          OPERATOR (Admin - Post-Launch)
       │                                            │
       ▼                                            ▼
  ┌─────────────────────────────────────────────────────────────┐
  │                     Vercel Edge Network                      │
  │                     (CDN + SSL + Edge)                       │
  └──────────────────────────┬──────────────────────────────────┘
                             │
                             ▼
  ┌─────────────────────────────────────────────────────────────┐
  │                    Next.js Application                       │
  │                                                             │
  │  ┌──────────────────┐  ┌──────────────────┐                │
  │  │  (public)/       │  │  admin/          │                │
  │  │                  │  │  (post-launch)   │                │
  │  │  Homepage        │  │                  │                │
  │  │  Leaderboard     │  │  Cycle Mgmt      │                │
  │  │  Tool Detail     │  │  Tool Enrollment │                │
  │  │  Reports         │  │  Evaluation Run  │                │
  │  │  Methodology     │  │  Score Review    │                │
  │  │  Disclosure      │  │  Publication     │                │
  │  │                  │  │                  │                │
  │  │  (SSG/ISR)       │  │  (Auth-protected)│                │
  │  └──────────────────┘  └──────────────────┘                │
  │                                                             │
  │  ┌──────────────────────────────────────────┐              │
  │  │  API Routes (/api)                        │              │
  │  │  - Benchmark data queries                 │              │
  │  │  - Evaluation pipeline triggers           │              │
  │  │  - Score synthesis                        │              │
  │  │  - Admin operations                       │              │
  │  └──────────────────┬───────────────────────┘              │
  └──────────────────────┼──────────────────────────────────────┘
                         │
          ┌──────────────┼──────────────┐
          ▼              ▼              ▼
  ┌──────────────┐ ┌──────────┐ ┌──────────────┐
  │ Neon         │ │ R2       │ │ AI Models    │
  │ PostgreSQL   │ │ Storage  │ │              │
  │              │ │          │ │ OpenAI       │
  │ 24 entities  │ │ Evidence │ │ Anthropic    │
  │ Prisma ORM   │ │ Artifacts│ │ Google       │
  │              │ │          │ │ Cohere       │
  │ (Free tier)  │ │ ($0 egr) │ │ Mistral      │
  └──────────────┘ └──────────┘ │ Meta         │
                                └──────────────┘

  EXTERNAL SERVICES:
  ┌──────────┐ ┌──────────────┐ ┌─────────┐ ┌──────────┐
  │ Resend   │ │ Buttondown   │ │ Sentry  │ │ Plausible│
  │ (email)  │ │ (newsletter) │ │ (errors)│ │ (analyt.)│
  └──────────┘ └──────────────┘ └─────────┘ └──────────┘
```

---

## 3. Application Architecture

### 3.1 Monolithic Structure

```
aisearcharena/
├── app/
│   ├── (public)/                  # Public benchmark pages
│   │   ├── page.tsx               # Homepage + current cycle highlights
│   │   ├── leaderboard/
│   │   │   └── [trackSlug]/       # Track leaderboards (F-002)
│   │   ├── tools/
│   │   │   └── [toolSlug]/        # Tool detail pages (F-003)
│   │   ├── reports/
│   │   │   └── [cycleId]/         # Benchmark reports (F-014)
│   │   ├── methodology/           # Methodology documentation (F-012)
│   │   ├── disclosure/            # Conflict-of-interest disclosure (F-015)
│   │   └── about/                 # About page
│   ├── admin/                     # Admin dashboard (POST-LAUNCH)
│   │   ├── layout.tsx             # Auth-protected layout
│   │   ├── cycles/                # Benchmark cycle management (F-005)
│   │   ├── tools/                 # Tool & vendor management (F-006, F-010)
│   │   ├── evaluations/           # Evaluation pipeline (F-007)
│   │   ├── synthesis/             # Score synthesis (F-011)
│   │   ├── review/                # Score review (F-005 Review state)
│   │   └── publication/           # Publication workflow (F-005 Publication)
│   ├── api/
│   │   ├── benchmark/             # Public benchmark data API
│   │   ├── admin/                 # Admin operations (POST-LAUNCH)
│   │   └── webhooks/              # Future webhook endpoints
│   └── layout.tsx                 # Root layout
├── components/
│   ├── ui/                        # shadcn/ui components
│   ├── benchmark/                 # Benchmark-specific components
│   │   ├── leaderboard-table.tsx  # Ranked tool table
│   │   ├── score-card.tsx         # Dimension score display
│   │   ├── confidence-badge.tsx   # High/Medium/Low/Insufficient
│   │   ├── composite-breakdown.tsx# Weight breakdown visualization
│   │   ├── trend-chart.tsx        # Historical score trends
│   │   └── badge-display.tsx      # Award badges
│   └── content/                   # MDX content components
├── lib/
│   ├── db/                        # Prisma client + queries
│   ├── evaluation/                # AI evaluation engine
│   │   ├── pipeline.ts            # Orchestrates 6-model evaluation
│   │   ├── providers/             # Per-provider API adapters
│   │   │   ├── openai.ts
│   │   │   ├── anthropic.ts
│   │   │   ├── google.ts
│   │   │   ├── cohere.ts
│   │   │   ├── mistral.ts
│   │   │   └── meta.ts
│   │   └── retry.ts               # Exponential backoff logic
│   ├── synthesis/                 # Score synthesis engine
│   │   ├── aggregate.ts           # Median-based aggregation (BR-S09)
│   │   ├── confidence.ts          # Confidence tag derivation (BR-S10)
│   │   └── composite.ts           # Weighted composite calculation (BR-S04)
│   ├── scoring/                   # Scoring utilities
│   │   ├── ranking.ts             # Dense ranking (BR-S08)
│   │   ├── validation.ts          # 0-10 scale, 1dp precision (BR-S01)
│   │   └── renormalize.ts         # Weight renormalization for N/A (BR-S04)
│   ├── state-machine/             # State transition management
│   │   ├── cycle.ts               # BenchmarkCycle state machine
│   │   └── score.ts               # Score state machine
│   └── seo/                       # SEO utilities
│       ├── json-ld.ts             # Structured data generation
│       └── sitemap.ts             # Dynamic sitemap generation
├── content/                       # MDX content files
│   ├── methodology/               # Methodology pages
│   ├── about/                     # About pages
│   └── disclosure/                # Disclosure pages
├── prisma/
│   ├── schema.prisma              # Database schema (24 entities)
│   ├── migrations/                # Migration history
│   └── seed.ts                    # Seed data for development
├── public/                        # Static assets
└── tests/
    ├── unit/                      # Vitest unit tests
    └── e2e/                       # Playwright E2E tests
```

### 3.2 Frontend Architecture

**Rendering Strategy:**

| Page Type | Strategy | Rationale |
|-----------|----------|-----------|
| Homepage | ISR (revalidate on publish) | Updates monthly when new cycle publishes |
| Leaderboard | ISR (revalidate on publish) | Static between publications; dense ranking display |
| Tool Detail | ISR (revalidate on publish) | Score data changes monthly |
| Reports | SSG | Immutable after publication |
| Methodology | SSG (MDX) | Static content, rarely changes |
| Disclosure | SSG (MDX) | Static content |
| Admin pages | CSR (dynamic) | Auth-protected, real-time interactions |

**Component Library:** shadcn/ui provides the base components (DataTable, Card, Badge, Dialog, Tabs, Select, Tooltip). Custom benchmark-specific components built on top for leaderboard tables, score displays, and confidence indicators.

**State Management:** No external state library. React Server Components handle data fetching server-side. Client-side interactivity (filters, sorting) uses URL search params + React `useState`. This keeps the architecture simple and SEO-friendly.

**MDX Integration:** Methodology, disclosure, and about pages authored in MDX. Custom components (score breakdowns, methodology diagrams) can be embedded in content.

### 3.3 Backend Architecture

**API Design:** Next.js API Routes (REST). All public data served via SSG/ISR — API routes primarily support admin operations and data mutations.

**Evaluation Pipeline:** The core backend logic. Orchestrates parallel AI model evaluations with retry and synthesis. See Section 10 for detailed pipeline architecture.

---

## 4. Data Architecture

### 4.1 Database

- **Provider:** Neon serverless PostgreSQL (free tier)
- **ORM:** Prisma (type-safe queries, auto-generated migrations)
- **Connection:** Prisma connects via Neon connection pooler
- **Branching:** Neon database branches for dev/staging environments

### 4.2 Entity Model (24 Entities)

Organized by domain:

```
BENCHMARK DOMAIN (Core Workflow)
├── BenchmarkCycle          State-machine-driven monthly cycle
├── BenchmarkTrackDefinition  Evaluation tracks (GEO Platform, llms.txt)
├── CycleToolEnrollment     Tool-to-cycle enrollment with withdrawal tracking
├── BenchmarkReport         Published monthly report content
└── CycleAuditPackage       Sealed, immutable audit trail (SHA-256 hash)

TOOL DOMAIN (What We Evaluate)
├── Tool                    Software product under evaluation
├── Vendor                  Company producing tools
├── ToolTrackMapping        Tool-to-track assignment
├── ToolSegmentMapping      Tool-to-market-segment assignment
└── MarketSegment           Market categories (e.g., Enterprise SEO)

METHODOLOGY DOMAIN (How We Evaluate)
├── MethodologyVersion      Versioned, lockable methodology definition
├── ScoringDimension        Individual criterion with weight
├── PromptSet               Evaluation prompts (70% stable / 30% rotating)
└── AIModel                 AI provider configuration (encrypted API keys)

EVALUATION DOMAIN (Raw Data)
├── ModelEvaluation         Single model's response for one tool × dimension
├── EvidenceArtifact        Supporting evidence (screenshots, URLs, docs)
└── SynthesisRecord         Aggregation metadata (models used, agreement)

SCORING DOMAIN (Published Results)
├── Score                   Synthesized dimension score with confidence tag
├── ScoreCorrection         Post-publication corrections (dual approval)
├── CompositeScore          Weighted composite with dense ranking
└── Badge                   Awards for top performers

VENDOR ENGAGEMENT DOMAIN
├── VendorDisclosure        Vendor-submitted transparency disclosures
└── VendorReview            Pre-publication review window tracking

CONTENT DOMAIN
└── ContentBlock            Managed content blocks for static pages
```

**Key Prisma Schema (core entities):**

```prisma
// prisma/schema.prisma (excerpt)

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum CycleState {
  Draft
  Planning
  Evaluation
  Synthesis
  Review
  VendorReview
  Publication
  Completed
  Suspended
  Cancelled
}

enum ScoreState {
  Draft
  Reviewed
  Published
  Corrected
}

enum ConfidenceTag {
  High
  Medium
  Low
  InsufficientData
}

enum EvaluationStatus {
  Success
  Failed
  Timeout
}

enum ArtifactType {
  Screenshot
  URL
  Document
  Video
}

enum DisclosureStatus {
  Requested
  Submitted
  Reviewed
  Incorporated
  Expired
}

enum ReviewStatus {
  Pending
  InReview
  Completed
  Expired
}

model BenchmarkCycle {
  id                   String    @id @default(uuid())
  cycleIdentifier      String    @unique @map("cycle_identifier") // e.g., "2026-03"
  state                CycleState @default(Draft)
  startDate            DateTime  @map("start_date")
  endDate              DateTime? @map("end_date")
  methodologyVersionId String    @map("methodology_version_id")
  publishedAt          DateTime? @map("published_at")
  createdAt            DateTime  @default(now()) @map("created_at")
  updatedAt            DateTime  @updatedAt @map("updated_at")

  methodologyVersion   MethodologyVersion @relation(fields: [methodologyVersionId], references: [id])
  enrollments          CycleToolEnrollment[]
  report               BenchmarkReport?
  auditPackage         CycleAuditPackage?
  scores               Score[]
  compositeScores      CompositeScore[]
  badges               Badge[]
  vendorDisclosures    VendorDisclosure[]
  vendorReviews        VendorReview[]

  @@map("benchmark_cycles")
}

model Tool {
  id          String    @id @default(uuid())
  name        String
  slug        String    @unique
  description String
  websiteUrl  String    @map("website_url")
  logoUrl     String?   @map("logo_url")
  vendorId    String    @map("vendor_id")
  isArchived  Boolean   @default(false) @map("is_archived")
  createdAt   DateTime  @default(now()) @map("created_at")
  updatedAt   DateTime  @updatedAt @map("updated_at")

  vendor      Vendor    @relation(fields: [vendorId], references: [id])
  trackMappings    ToolTrackMapping[]
  segmentMappings  ToolSegmentMapping[]
  enrollments      CycleToolEnrollment[]
  scores           Score[]
  compositeScores  CompositeScore[]
  badges           Badge[]
  evaluations      ModelEvaluation[]

  @@map("tools")
}

model Score {
  id            String        @id @default(uuid())
  cycleId       String        @map("cycle_id")
  toolId        String        @map("tool_id")
  dimensionId   String        @map("dimension_id")
  value         Decimal       @db.Decimal(3, 1) // 0.0 - 10.0
  confidenceTag ConfidenceTag @map("confidence_tag")
  isApplicable  Boolean       @default(true) @map("is_applicable")
  state         ScoreState    @default(Draft)
  reviewedBy    String?       @map("reviewed_by")
  reviewedAt    DateTime?     @map("reviewed_at")
  createdAt     DateTime      @default(now()) @map("created_at")
  updatedAt     DateTime      @updatedAt @map("updated_at")

  cycle         BenchmarkCycle   @relation(fields: [cycleId], references: [id])
  tool          Tool             @relation(fields: [toolId], references: [id])
  dimension     ScoringDimension @relation(fields: [dimensionId], references: [id])
  synthesis     SynthesisRecord?
  corrections   ScoreCorrection[]

  @@unique([cycleId, toolId, dimensionId])
  @@map("scores")
}

model ModelEvaluation {
  id            String           @id @default(uuid())
  cycleId       String           @map("cycle_id")
  toolId        String           @map("tool_id")
  dimensionId   String           @map("dimension_id")
  modelId       String           @map("model_id")
  promptSetId   String           @map("prompt_set_id")
  rawResponse   String           @map("raw_response")
  parsedScore   Decimal?         @map("parsed_score") @db.Decimal(3, 1)
  responseTimeMs Int             @map("response_time_ms")
  status        EvaluationStatus
  retryCount    Int              @default(0) @map("retry_count")
  evaluatedAt   DateTime         @map("evaluated_at")

  cycle         BenchmarkCycle   @relation(fields: [cycleId], references: [id])
  tool          Tool             @relation(fields: [toolId], references: [id])
  dimension     ScoringDimension @relation(fields: [dimensionId], references: [id])
  model         AIModel          @relation(fields: [modelId], references: [id])
  promptSet     PromptSet        @relation(fields: [promptSetId], references: [id])
  evidence      EvidenceArtifact[]

  @@map("model_evaluations")
}
```

### 4.3 State Machines

#### BenchmarkCycle State Machine (10 states, 14 transitions)

```
BenchmarkCycle State Machine
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  ┌─────────┐
  │  Draft  │───────────────────────────────┐
  └────┬────┘                               │
       │ Lock methodology                   │
       ▼                                    │
  ┌──────────┐                              │
  │ Planning │──────────────────────┐       │
  └────┬─────┘                      │       │
       │ >= 5 tools/track           │       │
       ▼                            │       │
  ┌────────────┐                    │       │
  │ Evaluation │───────────┐        │       │
  └─────┬──────┘           │        │       │
        │ All evals done   │        │       │
        ▼                  │        │       │     ┌───────────┐
  ┌───────────┐            │ Suspend │       │     │ Suspended │
  │ Synthesis │            ├────────┼───────┼────▶│           │
  └─────┬─────┘            │        │       │     │ Resume ───┼──▶ Draft
        │ Scores ready     │        │       │     │ Cancel ───┼──▶ Cancelled
        ▼                  │        │       │     └───────────┘
  ┌────────┐               │        │       │
  │ Review │               │ Cancel │       │
  └───┬────┘               ├────────┼───────┤
      │ Operator approves  │        │       │
      ▼                    │        │       │
  ┌──────────────┐         │        │       │
  │ VendorReview │         │        │       │
  └──────┬───────┘         │        │       │
         │ 5 biz days      │        │       │
         ▼                 ▼        ▼       ▼
  ┌─────────────┐     ┌───────────────┐
  │ Publication │     │   Cancelled   │  (terminal)
  └──────┬──────┘     └───────────────┘
         │ Pages live
         ▼
  ┌───────────┐
  │ Completed │  (terminal)
  └───────────┘
```

**Transition validation code:**

```typescript
// lib/state-machine/cycle.ts

const VALID_CYCLE_TRANSITIONS: Record<CycleState, CycleState[]> = {
  Draft:        ['Planning', 'Suspended', 'Cancelled'],
  Planning:     ['Evaluation', 'Suspended', 'Cancelled'],
  Evaluation:   ['Synthesis', 'Suspended'],
  Synthesis:    ['Review'],
  Review:       ['VendorReview'],
  VendorReview: ['Publication'],
  Publication:  ['Completed'],
  Completed:    [],  // terminal
  Suspended:    ['Draft', 'Cancelled'],
  Cancelled:    [],  // terminal
};

type TransitionGuard = (cycleId: string) => Promise<{ valid: boolean; reason?: string }>;

const TRANSITION_GUARDS: Partial<Record<string, TransitionGuard>> = {
  'Draft->Planning': async (cycleId) => {
    const cycle = await prisma.benchmarkCycle.findUnique({
      where: { id: cycleId },
      include: { methodologyVersion: true },
    });
    if (!cycle?.methodologyVersion) {
      return { valid: false, reason: 'No methodology version assigned' };
    }
    return { valid: true };
  },
  'Planning->Evaluation': async (cycleId) => {
    const enrollmentCount = await prisma.cycleToolEnrollment.count({
      where: { cycleId, withdrawnAt: null },
    });
    if (enrollmentCount < 5) {
      return { valid: false, reason: `Only ${enrollmentCount} tools enrolled (minimum 5 per BR-T03)` };
    }
    return { valid: true };
  },
  // ... additional guards
};

export async function transitionCycle(
  cycleId: string,
  newState: CycleState
): Promise<void> {
  const cycle = await prisma.benchmarkCycle.findUniqueOrThrow({
    where: { id: cycleId },
  });

  const validTargets = VALID_CYCLE_TRANSITIONS[cycle.state];
  if (!validTargets.includes(newState)) {
    throw new Error(
      `Invalid transition: ${cycle.state} -> ${newState}. Valid targets: ${validTargets.join(', ')}`
    );
  }

  const guardKey = `${cycle.state}->${newState}`;
  const guard = TRANSITION_GUARDS[guardKey];
  if (guard) {
    const result = await guard(cycleId);
    if (!result.valid) {
      throw new Error(`Guard failed for ${guardKey}: ${result.reason}`);
    }
  }

  await prisma.benchmarkCycle.update({
    where: { id: cycleId },
    data: { state: newState },
  });
}
```

#### Score State Machine (4 states, 5 transitions)

```
Score State Machine
━━━━━━━━━━━━━━━━━━

  ┌─────────┐
  │  Draft  │◄───── Re-synthesis
  └────┬────┘       (self-loop)
       │
       │ Operator approves
       │ (guard: evidence exists)
       ▼
  ┌──────────┐
  │ Reviewed │
  └────┬─────┘
       │
       │ Cycle reaches Publication
       │ (guard: audit package sealed)
       ▼
  ┌───────────┐
  │ Published │
  └─────┬─────┘
        │
        │ Correction applied
        │ (guard: dual approval BR-S02)
        ▼
  ┌───────────┐
  │ Corrected │◄──── Additional corrections
  └───────────┘      (self-loop)
```

### 4.4 Business Rules (27 Rules)

#### Scoring Rules (BR-S01 — BR-S15)

| ID | Rule | Enforcement |
|----|------|-------------|
| BR-S01 | Scores use 0-10 scale, one decimal place | DB constraint (`Decimal(3,1)`), Zod validation |
| BR-S02 | Corrections require dual approval (different corrected_by/approved_by) | Application validation on ScoreCorrection creation |
| BR-S03 | N/A scores excluded from composite calculation | Composite calculation logic |
| BR-S04 | Composites use weighted average with renormalized weights for N/A | CompositeScore calculation function |
| BR-S05 | Composites rounded to one decimal place (round half up) | Calculation function |
| BR-S06 | Applicable scores must have evidence artifacts | Transition guard: Draft → Reviewed |
| BR-S07 | Synthesis requires minimum 4/6 successful model evaluations | Synthesis pipeline validation |
| BR-S08 | Dense ranking (tied scores get same rank) | Ranking calculation function |
| BR-S09 | Synthesis uses median-based aggregation | Synthesis pipeline |
| BR-S10 | Confidence tags derived from inter-model agreement | Synthesis pipeline |
| BR-S11 | Model failures don't block synthesis if >= 4 succeed | Graceful degradation in pipeline |
| BR-S12 | Synthesis is deterministic | Function design + regression tests |
| BR-S13 | AI Search Mastery products scored identically | Operational policy + audit verification |
| BR-S14 | No automated publishing (human review gate) | Score state machine (Review state mandatory) |
| BR-S15 | Correction cascades trigger composite recalculation | Application logic on ScoreCorrection |

#### Vendor Rules (BR-V01 — BR-V05)

| ID | Rule | Enforcement |
|----|------|-------------|
| BR-V01 | Disclosure status displayed wherever scores appear | UI rendering requirement |
| BR-V02 | Vendor review window = exactly 5 business days | Timer on VendorReview state |
| BR-V03 | Vendor corrections limited to factual accuracy | Submission form + operator review |
| BR-V04 | Vendor-facing outputs show only their own data | Access controls, IDOR prevention |
| BR-V05 | Benchmark functions without vendor participation | Architecture design |

#### Track Rules (BR-T01 — BR-T03)

| ID | Rule | Enforcement |
|----|------|-------------|
| BR-T01 | One active (non-terminal) cycle at a time | Validation on cycle creation |
| BR-T02 | Withdrawn tools excluded from rankings/badges | Ranking calculation |
| BR-T03 | Minimum 5 enrolled tools per track | Transition guard: Planning → Evaluation |

#### Synthesis Rules (BR-SYN01 — BR-SYN02)

| ID | Rule | Enforcement |
|----|------|-------------|
| BR-SYN01 | 70/30 prompt rotation (70% stable, 30% rotating) | PromptSet `is_rotating` field |
| BR-SYN02 | Methodology locked at Draft → Planning transition | State machine side effect |

#### Audit Rules (BR-AUD01 — BR-AUD02)

| ID | Rule | Enforcement |
|----|------|-------------|
| BR-AUD01 | Audit package sealed before publication | Transition guard: VendorReview → Publication |
| BR-AUD02 | Sealed packages immutable | `is_sealed` flag + application enforcement |

---

## 5. Integration Architecture

### 5.1 AI Model Integration

Six AI providers are used per evaluation to generate consensus scores:

| Provider | Use | Fallback |
|----------|-----|----------|
| OpenAI | Primary evaluation model | Retry 3x, then mark failed |
| Anthropic | Primary evaluation model | Retry 3x, then mark failed |
| Google | Primary evaluation model | Retry 3x, then mark failed |
| Cohere | Primary evaluation model | Retry 3x, then mark failed |
| Mistral | Primary evaluation model | Retry 3x, then mark failed |
| Meta | Primary evaluation model | Retry 3x, then mark failed |

**Pipeline flow:** For each (tool × dimension), all 6 models are called in parallel. Individual failures are retried with exponential backoff. Synthesis proceeds with 4+ successes (BR-S07). See Section 10 for implementation detail.

**API key management:** Encrypted `api_config` JSON per AIModel record. Environment variables for API keys, never in client bundle.

### 5.2 Email

| Service | Purpose | Volume |
|---------|---------|--------|
| Resend | Transactional emails (vendor notifications, alerts) | < 100/month |
| Buttondown | Newsletter (benchmark publication announcements) | Monthly |

### 5.3 File Storage

**Cloudflare R2** for evidence artifacts (screenshots, documents, videos referenced in evaluations).
- $0 egress — critical for publicly-served evidence links on tool detail pages
- S3-compatible API — standard SDK usage
- Organized by cycle: `evidence/{cycleId}/{toolId}/{artifactId}.{ext}`

---

## 6. Infrastructure Architecture

### 6.1 Hosting

**Vercel** — Next.js application hosting.
- Automatic preview deployments per PR
- Edge network for static asset delivery
- Serverless functions for API routes
- Free hobby tier for launch

### 6.2 CI/CD Pipeline

```
CI/CD Pipeline (GitHub Actions → Vercel)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  git push / PR
       │
       ▼
  ┌─────────────────────────────┐
  │  GitHub Actions             │
  │                             │
  │  1. TypeScript type check   │
  │  2. ESLint                  │
  │  3. Prettier format check   │
  │  4. Vitest unit tests       │
  │  5. Playwright E2E tests    │
  │  6. Prisma schema validate  │
  └──────────────┬──────────────┘
                 │ All pass
                 ▼
  ┌─────────────────────────────┐
  │  Vercel                     │
  │                             │
  │  PR → Preview deployment    │
  │  main → Production deploy   │
  └─────────────────────────────┘
```

**Test coverage target:** 85% (60 test cases per PRD spec).

### 6.3 Environments

| Environment | Hosting | Database | Purpose |
|-------------|---------|----------|---------|
| Development | localhost:3000 | Neon dev branch | Local development |
| Staging | Vercel preview | Neon staging branch | PR review, QA |
| Production | Vercel production | Neon main branch | Live site |

Neon database branching provides isolated environments without additional cost.

---

## 7. Security Architecture

### 7.1 Launch Security

| Measure | Implementation |
|---------|---------------|
| Type safety | Strict TypeScript (`strict: true` in tsconfig) |
| Input validation | Zod schemas on all API route inputs |
| CORS | Configured for production domain only |
| HTTPS | Vercel default (automatic SSL) |
| Environment variables | Vercel env var management, never in client bundle |
| Dependency security | `npm audit` in CI pipeline |

### 7.2 Deferred Security (Post-Launch, with Admin Dashboard)

| Measure | When | Implementation |
|---------|------|---------------|
| Rate limiting | Admin API routes | Per-IP and per-user limits |
| CSRF protection | Admin forms | Token-based CSRF |
| CSP headers | All pages | Strict Content Security Policy |
| Audit logging | Admin operations | audit_logs table |
| Structured logging | All environments | JSON logs with log aggregator |

### 7.3 Authentication (Deferred to Post-Launch)

When admin dashboard is built:

| Spec | Value |
|------|-------|
| Type | Custom (email/password) |
| Password hashing | bcrypt |
| Session | JWT, 24-hour expiry |
| Lockout | After 5 failed attempts |
| Scope | Admin-only (single operator) |
| OAuth | Not needed (solopreneur operation) |

At launch, first benchmark cycle data is seeded via Prisma Studio or seed scripts.

---

## 8. Observability

| Tool | Purpose | Cost |
|------|---------|------|
| Sentry | Error tracking + alerting | Free tier |
| Plausible Analytics | Privacy-respecting visitor analytics (no cookies) | ~$9/month |
| Vercel Analytics | Built-in performance monitoring | Free |
| Console logging | Application logs (v1) | $0 |

**Why Plausible over Google Analytics:** Privacy-respecting (no cookies, no consent banners needed), lightweight script, matches the benchmark's transparency values. GDPR-compliant by default.

**Future:** Structured JSON logging + log aggregator (Axiom or similar) when operational complexity warrants it.

---

## 9. SEO Architecture

SEO is critical — benchmark pages need to rank for tool comparison queries.

### 9.1 Rendering Strategy

Public pages use SSG (Static Site Generation) or ISR (Incremental Static Regeneration). Pages are pre-rendered at build time or on first request, then cached. Revalidation triggers when a new benchmark cycle is published.

### 9.2 Structured Data (JSON-LD)

| Page | Schema | Purpose |
|------|--------|---------|
| Tool detail | `Product` | Rich snippet for tool pages |
| Benchmark report | `Article` | Rich snippet for reports |
| Leaderboard | `ItemList` | Rich snippet for ranked list |

### 9.3 Sitemap

Dynamic sitemap regenerated after each publication cycle. Includes all tool pages, leaderboard pages, reports, and methodology pages.

### 9.4 Technical SEO

- Semantic HTML with proper heading hierarchy
- Meta descriptions generated from benchmark data
- Canonical URLs on all pages
- Open Graph + Twitter Card meta tags
- Fast page loads via SSG + Vercel CDN

---

## 10. Production Readiness

### 10.1 Evaluation Pipeline

The evaluation pipeline is the most operationally complex component. It calls 6 AI model APIs per tool per dimension.

```typescript
// lib/evaluation/pipeline.ts

interface EvaluationResult {
  modelId: string;
  status: 'Success' | 'Failed' | 'Timeout';
  parsedScore: number | null;
  rawResponse: string;
  responseTimeMs: number;
  retryCount: number;
}

async function evaluateToolDimension(
  toolId: string,
  dimensionId: string,
  cycleId: string,
  models: AIModel[],
  promptSet: PromptSet,
): Promise<EvaluationResult[]> {
  // Call all 6 models in parallel with individual retry
  const results = await Promise.allSettled(
    models.map((model) =>
      callModelWithRetry(model, promptSet, {
        maxRetries: 3,
        backoff: [1000, 4000, 16000], // exponential
        timeoutMs: model.timeoutMs,
      })
    )
  );

  return results.map((result, i) => {
    if (result.status === 'fulfilled') {
      return result.value;
    }
    return {
      modelId: models[i].id,
      status: 'Failed' as const,
      parsedScore: null,
      rawResponse: result.reason?.message || 'Unknown error',
      responseTimeMs: 0,
      retryCount: 3,
    };
  });
}

async function callModelWithRetry(
  model: AIModel,
  promptSet: PromptSet,
  options: { maxRetries: number; backoff: number[]; timeoutMs: number },
): Promise<EvaluationResult> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= options.maxRetries; attempt++) {
    try {
      const startTime = Date.now();
      const response = await callProvider(model, promptSet, options.timeoutMs);
      return {
        modelId: model.id,
        status: 'Success',
        parsedScore: parseScore(response),
        rawResponse: response,
        responseTimeMs: Date.now() - startTime,
        retryCount: attempt,
      };
    } catch (error) {
      lastError = error as Error;
      if (attempt < options.maxRetries) {
        await sleep(options.backoff[attempt]);
      }
    }
  }

  return {
    modelId: model.id,
    status: lastError?.message.includes('timeout') ? 'Timeout' : 'Failed',
    parsedScore: null,
    rawResponse: lastError?.message || 'All retries exhausted',
    responseTimeMs: 0,
    retryCount: options.maxRetries,
  };
}
```

### 10.2 Synthesis Pipeline

```typescript
// lib/synthesis/aggregate.ts

function synthesizeScore(evaluations: EvaluationResult[]): {
  value: number;
  confidenceTag: ConfidenceTag;
  modelsSucceeded: number;
  modelsFailed: number;
  agreementMetric: number;
} {
  const successful = evaluations.filter(
    (e) => e.status === 'Success' && e.parsedScore !== null
  );

  // BR-S07: Minimum 4 successful evaluations
  if (successful.length < 4) {
    return {
      value: 0,
      confidenceTag: 'InsufficientData',
      modelsSucceeded: successful.length,
      modelsFailed: evaluations.length - successful.length,
      agreementMetric: 0,
    };
  }

  const scores = successful.map((e) => e.parsedScore!);

  // BR-S09: Median-based aggregation
  const median = calculateMedian(scores);

  // BR-S10: Confidence from inter-model agreement
  const agreementMetric = calculateAgreement(scores);
  const confidenceTag = deriveConfidence(agreementMetric, successful.length);

  // BR-S01, BR-S05: Round to one decimal place (half up)
  const rounded = Math.round(median * 10) / 10;

  return {
    value: rounded,
    confidenceTag,
    modelsSucceeded: successful.length,
    modelsFailed: evaluations.length - successful.length,
    agreementMetric,
  };
}
```

### 10.3 Graceful Degradation

| Failure | Response |
|---------|----------|
| AI model API timeout | Retry 3x with exponential backoff (1s, 4s, 16s) |
| < 4 models succeed | Confidence tag = Insufficient Data; flag for review |
| All models fail for one dimension | Score not generated; operator notified |
| Database connection lost | Neon auto-reconnect; Prisma retry |
| R2 storage unavailable | Evidence upload queued; evaluation proceeds |

### 10.4 Future Scaling

When volume or operational needs grow:
- **BullMQ** job queue for evaluation pipeline (replace async/await)
- **Separate worker** for evaluation runs (extract from monolith)
- **Redis** for rate limiting and caching
- **Structured JSON logging** with Axiom

---

## 11. Decision Log

| # | Decision | Options Considered | Choice | Rationale |
|---|----------|-------------------|--------|-----------|
| 1 | Application Architecture | Monolith, Modular Monolith, Headless CMS + App | **Monolith** | Solopreneur; batch eval workflow; public pages mostly static |
| 2 | Frontend Stack | Various combinations | **Next.js App Router + Tailwind + shadcn/ui + MDX** | SSG/ISR for SEO; shadcn for benchmark UI; MDX for content; no Zustand (overkill) |
| 3 | Backend & Database | Neon, Supabase, Neon+Supabase | **Neon + Prisma** | $0 free tier vs $10/mo Supabase addon; type-safe 24-entity model |
| 4 | Authentication | Supabase Auth, Custom, NextAuth | **Custom (deferred)** | Admin-only, single operator; not needed at launch; PRD specifies custom |
| 5 | External Integrations | Various providers | **6 AI providers + R2 + Resend + Plausible + Sentry** | R2 for $0 egress; Plausible for privacy; 6 models for consensus |
| 6 | Infrastructure | Vercel, Netlify, Railway | **Vercel + GitHub Actions** | Native Next.js support; preview deploys; free tier |
| 7 | Security & Observability | Various levels | **PRD defaults (launch)** | Minimal attack surface at launch (public site, no auth) |
| 8 | Production Readiness | Queue vs retry, various patterns | **Parallel + retry** | Simple async/await with 3x exponential backoff; upgrade to queue later |

---

## 12. Future Considerations

### Intentionally Deferred

| Item | When to Revisit | Trigger |
|------|-----------------|---------|
| Admin dashboard + auth | After first benchmark is seeded | Need to manage cycles via UI |
| Rate limiting | When admin API is built | Auth-protected endpoints exist |
| Job queue (BullMQ) | Evaluation runs exceed 10 minutes | Performance monitoring |
| Worker extraction | Evaluation affects site performance | Vercel function timeouts |
| Redis caching | Public traffic exceeds ISR capacity | Analytics show cache misses |
| Structured logging | Debugging requires log search | Console logging insufficient |
| Revenue infrastructure | After credibility established | Revenue readiness triggers met |
| Vendor portal | Vendor engagement > 50% | Vendors requesting self-service |

### Architecture Boundaries

This architecture supports the **Foundation Phase** (Months 1-6) success indicators:
- Monthly publication consistency (SSG/ISR ensures fast page loads)
- 20+ tools scored per cycle (evaluation pipeline handles parallel processing)
- 100% methodology documentation published (MDX content system)
- < 5% score correction rate (dual approval, state machine guards)

When the product enters the **Growth Phase** (Months 7-18), the primary architectural changes will be:
1. Admin dashboard + custom auth
2. Vendor portal for disclosure submissions
3. Email notification system for publication alerts
4. Potentially extracting evaluation pipeline to background worker

The monolithic architecture supports all of these as extensions — no architectural rewrite required.
