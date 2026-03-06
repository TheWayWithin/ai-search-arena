# Sprint 1: GEO Benchmark Framework

**Status**: Complete
**Created**: 2026-03-02
**Goal**: Extract the AISearchArena benchmark methodology into a standalone, public, versioned framework repository — and update AISearchArena to load its configuration from that framework rather than hardcoded seed files.

---

## Background

AISearchArena currently has all benchmark configuration hardcoded in two TypeScript files:

- `prisma/seed.ts` — 51 dimensions with names, weights, categories
- `prisma/seed-prompts.ts` — 2-3 evaluation prompts per dimension

This works for v1.0 but has real problems at scale:

- Changing a weight or prompt requires a code change and redeployment
- The methodology is opaque — vendors can't audit it
- Nothing is versioned in a meaningful way
- The framework can't be reused across other products

**Inspiration**: The [MASTERY-AI Framework](https://github.com/TheWayWithin/mastery-ai-framework) (used by aimpactscanner.com) demonstrates this pattern — the assessment logic is defined in a public repository, separate from the application code, with a clear versioning strategy.

---

## Deliverables

### 1. New Public Repository: `geo-benchmark-framework`

A standalone GitHub repository containing the complete GEO/AEO benchmark methodology as structured YAML files. Fully public, citable, and auditable by vendors.

**Repository structure:**

```
geo-benchmark-framework/
├── README.md
├── CHANGELOG.md
├── LICENSE                          # e.g. CC BY 4.0
│
├── methodology/
│   └── v1.0/
│       ├── overview.md              # Philosophy, scoring approach, principles
│       ├── dimensions.yaml          # All 51 dimensions — the heart of the framework
│       ├── prompts.yaml             # Evaluation prompts per dimension (2-3 each)
│       └── models.yaml              # AI models used, timeouts, roles
│
└── tracks/
    └── geo-platform.yaml            # Track definition (which dimensions apply)
```

**`dimensions.yaml` format** (one entry of 51):

```yaml
- slug: ai-citation-frequency
  name: AI Citation Frequency
  category: AI Search Visibility
  weight: 0.04
  display_order: 1
  description: >
    Measures how frequently a tool helps websites appear as cited sources
    in AI-generated responses across major AI assistants.
  prompts:
    - >
      How frequently does this tool help websites get cited in AI-generated
      responses across major AI assistants (ChatGPT, Perplexity, Gemini, Claude)?
      Evaluate the breadth of monitoring coverage and the tool's ability to
      increase citation rates.
    - >
      Assess this tool's capability to track and improve how often a website
      appears as a cited source in AI search results. Consider both monitoring
      frequency and actionable optimization features.
```

**`models.yaml` format:**

```yaml
- provider: OpenAI
  model_identifier: openai/gpt-4o
  display_name: GPT-4o
  timeout_ms: 30000
  is_active: true

- provider: Anthropic
  model_identifier: anthropic/claude-sonnet-4-6
  display_name: Claude Sonnet 4.6
  timeout_ms: 30000
  is_active: true
# ... 4 more models
```

**`tracks/geo-platform.yaml`** format:

```yaml
slug: geo-platform
name: GEO Platform Track
description: >
  Comprehensive assessment of tools that help websites appear in AI-generated
  search results. Covers 51 dimensions across 6 categories.
methodology_version: "1.0"
dimension_slugs:
  - ai-citation-frequency
  - ai-citation-accuracy
  # ... all 51
```

### 2. Updated AISearchArena Seed Pipeline

Replace the hardcoded `prisma/seed.ts` and `prisma/seed-prompts.ts` with a framework-aware loader that reads from the repository.

**New file: `prisma/load-framework.ts`**

```
fetch framework YAML from GitHub (raw URL) or local clone
  → parse dimensions.yaml
  → upsert ScoringDimensions into DB
  → parse prompts.yaml
  → upsert PromptSets into DB
  → parse models.yaml
  → upsert AIModels into DB
```

**Updated `package.json` scripts:**

```json
"framework:load": "tsx prisma/load-framework.ts"
"framework:load:local": "tsx prisma/load-framework.ts --local ../geo-benchmark-framework"
```

The `--local` flag lets you test framework changes before pushing to GitHub.

### 3. Methodology Version Pinning

AISearchArena should know _which version_ of the framework it loaded. The `MethodologyVersion` record in the database should store the framework version (`1.0`), git SHA, and load timestamp — so you always know exactly what methodology produced any given benchmark cycle.

---

## Tasks

### Phase 1: Create the Framework Repository

- [x] Create `geo-benchmark-framework` repo on GitHub (public, CC BY 4.0) — 2026-03-02
- [x] Write `methodology/v1.0/overview.md` — philosophy, scoring approach, fairness principles — 2026-03-02
- [x] Extract all 51 dimensions from `prisma/seed.ts` into `methodology/v1.0/dimensions.yaml` — 2026-03-02
- [x] Extract all 128 prompts from `prisma/seed-prompts.ts` inline with dimensions — 2026-03-02
- [x] Write `methodology/v1.0/models.yaml` from seed data — 2026-03-02
- [x] Write `tracks/geo-platform.yaml` — 2026-03-02
- [x] Write `README.md` — what this is, why it's public, how to contribute — 2026-03-02
- [x] Write `CHANGELOG.md` — initial v1.0 entry — 2026-03-02
- [x] Add LICENSE (CC BY 4.0) — 2026-03-02

### Phase 2: Build the Framework Loader

- [x] Create `prisma/load-framework.ts` that accepts a framework URL or local path — 2026-03-02
- [x] Parse `dimensions.yaml` → upsert ScoringDimensions — 2026-03-02
- [x] Parse prompts from dimensions entries → upsert PromptSets — 2026-03-02
- [x] Parse `models.yaml` → upsert AIModels — 2026-03-02
- [x] Store framework version + git SHA in MethodologyVersion record — 2026-03-02
- [x] Add `framework:load`, `framework:load:local`, and `framework:dry-run` npm scripts — 2026-03-02
- [x] Test: dry-run and live load with local repo — 2026-03-02

### Phase 3: Validate & Clean Up

- [x] Run `npm run framework:load` against the live database — 51 dims updated, 51 prompt sets created, 6 models updated — 2026-03-02
- [x] Verify all 51 PromptSets exist and match framework YAML — confirmed via loader output — 2026-03-02
- [ ] Run `npm run cycle:run -- --limit 1` to confirm evaluation pipeline still works (requires user to run — costs ~$2)
- [x] `prisma/seed-prompts.ts` retained; `load-framework.ts` is now the source of truth — 2026-03-02
- [ ] Update AISearchArena README.md to reference the framework repo (deferred — no README.md exists yet)

---

## Design Decisions

### Why YAML, not JSON?

YAML is human-readable and supports multi-line strings (critical for prompts). JSON is better for machines; YAML is better for a document a vendor reads to understand how they're being scored.

### Why inline prompts inside dimensions.yaml?

Keeps each dimension's definition self-contained. A vendor looking at their scoring criteria sees both the weight and the exact questions being asked in one place.

### Why a separate repo, not a folder in aisearcharena?

- **Independently auditable** — vendors can review methodology without accessing application code
- **Reusable** — future products can reference the same framework
- **Community contributions** — others can propose new dimensions via PRs
- **Versioning clarity** — framework v1.1 is independent of app deployments

### Framework versioning strategy

- `v1.x` — same 51 dimensions, prompt or weight refinements only
- `v2.x` — new dimensions added or dimensions removed (breaks historical comparisons)
- `v3.x` — complete methodology redesign

The application enforces: a benchmark cycle is permanently linked to one framework version. Upgrading the framework creates a new cycle, never re-scores old ones.

### Local dev vs. GitHub loading

The loader supports `--local <path>` to read from a local clone. This means:

- You can draft framework changes, test locally, then push
- No internet dependency for dev/CI
- GitHub loading is the default for production seeds

---

## Out of Scope for Sprint 1

- Automatic framework polling / live reloading (the app does not watch for framework changes)
- Web UI for browsing the framework (future — link to GitHub for now)
- Multiple concurrent methodology versions (future)
- Community contribution workflow (document but don't build in Sprint 1)

---

## Success Criteria

1. `geo-benchmark-framework` repo is public on GitHub with all YAML files
2. `npm run framework:load` runs against the AISearchArena database and produces identical results to the current hardcoded seeds
3. A `--limit 1` benchmark cycle run succeeds using framework-loaded data
4. If a weight changes in `dimensions.yaml`, re-running `framework:load` updates the DB — no code changes needed
5. A vendor reviewing the public framework can understand exactly how they're being scored

---

## Estimated Effort

| Task                                 | Estimate   |
| ------------------------------------ | ---------- |
| Extract dimensions + prompts to YAML | 2-3 hours  |
| Write overview.md + README           | 1-2 hours  |
| Build framework loader script        | 3-4 hours  |
| Integration testing                  | 1-2 hours  |
| **Total**                            | **~1 day** |
