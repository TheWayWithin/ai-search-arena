# Handoff Notes - AISearchArena.com

**Last Updated**: 2026-03-02 14:00

## Current State

- **Phase**: Sprint 1 — GEO Benchmark Framework (COMPLETE)
- **Status**: Live at https://aisearcharena.com (MVP deployed)
- **Framework Repo**: https://github.com/TheWayWithin/geo-benchmark-framework (public)
- **Sprint Plan**: `/sprints/Sprint-1-GEO-Benchmark-Framework.md`

### Sprint 1 Deliverables
- **geo-benchmark-framework** repo: 7 files (dimensions.yaml, models.yaml, geo-platform.yaml, overview.md, README.md, CHANGELOG.md, LICENSE)
- **Framework loader**: `prisma/load-framework.ts` — loads YAML from GitHub or local, upserts to DB
- **npm scripts**: `framework:load`, `framework:load:local`, `framework:dry-run`
- **Validation**: Dry-run passes, live load produces 51 dims + 51 prompt sets + 6 models, weights 1.0000
- **Dependency**: Added `yaml` npm package for reliable YAML parsing

## What Was Built

### Phase 1: Foundation & Data Model
- Next.js 15.5.12, TypeScript strict, Tailwind v4, shadcn/ui, Prisma
- 24-entity schema with 8 enums
- 51 scoring dimensions, 28 vendor/tool records
- Data access: ai-models, methodology, vendors, prompt-sets

### Phase 2: Evaluation Pipeline
- 10-state cycle state machine with guards and side effects
- Tool enrollment with track validation
- OpenRouter 6-model parallel evaluation with retry
- Evidence storage via R2 with graceful degradation

### Phase 3: Scoring, Review & Publication
- Median-based deterministic score synthesis
- Weighted composite scoring with N/A renormalization
- Dense ranking (tied scores share rank)
- Vendor review workflow (5 business day windows)
- Report generation + audit packages (SHA-256)

### Phase 4: Public Interface & Launch
- Homepage with pre-launch/published dual states
- Leaderboard with ranked tools table
- Tool detail page with dimension scores by category
- Methodology page (data-driven from DB)
- Header/footer navigation
- robots.txt, sitemap.xml, OG/Twitter meta, JSON-LD on all pages
- Plausible analytics + Sentry error tracking

## Production Services (ALL LIVE)

| Service | Status | Details |
|---------|--------|---------|
| **Neon** | Live | `ai-search-arena` project, AWS US East 1, Postgres 17, migrated + seeded |
| **Vercel** | Live | `aisearchareana` project, auto-deploy from GitHub, custom domain |
| **Domain** | Live | aisearcharena.com → Vercel (A record + CNAME www) |
| **OpenRouter** | Configured | API key in Vercel env vars |
| **Cloudflare R2** | Configured | Bucket: `aisearcharena-evidence`, API token scoped to bucket |
| **Resend** | Configured | API key set, domain DNS records added (DKIM, SPF, DMARC) |
| **Plausible** | Verified | Custom script URL with init(), tracking active |
| **Sentry** | Configured | DSN set in Vercel env vars |

## Environment Variables (Vercel)

| Variable | Environments | Sensitive |
|----------|-------------|-----------|
| DATABASE_URL | Production, Preview | Yes |
| OPENROUTER_API_KEY | Production, Preview | Yes |
| R2_ACCOUNT_ID | Production, Preview | Yes |
| R2_ACCESS_KEY_ID | Production, Preview | Yes |
| R2_SECRET_ACCESS_KEY | Production, Preview | Yes |
| R2_BUCKET_NAME | Production, Preview | Yes |
| RESEND_API_KEY | Production, Preview | Yes |
| NEXT_PUBLIC_PLAUSIBLE_SCRIPT_URL | All | No |
| NEXT_PUBLIC_SENTRY_DSN | All | No |

## Git History

| Commit | Description |
|--------|-------------|
| `fc6b2ac` | feat: complete AISearchArena.com MVP (all 4 phases) — 67 files, 24,280 lines |
| `9609888` | fix: update Plausible analytics to use custom script URL |
| `ff2f77e` | fix: add Plausible init script for verification |

## Files Created (Key Modules)

| Category | Files |
|----------|-------|
| Schema | `prisma/schema.prisma`, `prisma/seed.ts`, `prisma/migrations/` |
| State Machine | `lib/state-machine/cycle.ts` |
| Database Layer | `lib/db/index.ts`, `cycles.ts`, `enrollments.ts`, `ai-models.ts`, `methodology.ts`, `vendors.ts`, `prompt-sets.ts`, `vendor-reviews.ts`, `reports.ts`, `audit-packages.ts`, `leaderboard.ts` |
| Evaluation | `lib/evaluation/openrouter.ts`, `pipeline.ts`, `evidence.ts` |
| Scoring | `lib/synthesis/median.ts`, `lib/scoring/composite.ts` |
| Pages | `app/(public)/page.tsx`, `leaderboard/page.tsx`, `tools/[slug]/page.tsx`, `methodology/page.tsx`, `about/page.tsx`, `disclosure/page.tsx` |
| Components | `components/site-header.tsx`, `site-footer.tsx`, `ui/` (button, card, badge, table) |
| Config | `app/robots.ts`, `app/sitemap.ts`, `.env.example`, `.github/workflows/ci.yml` |
| Tests | `tests/unit/` (example, schema, state-machine, synthesis) — 43 tests |

## Verification Status

- Typecheck: PASSES (zero errors)
- Tests: 43/43 passing
- Build: 9 routes (4 static + 5 dynamic)
- Production: Live at aisearcharena.com

## What's Next

### Immediate (ready to execute)
- Run first benchmark cycle: create cycle, enroll tools, execute evaluations
- Requires: visiting admin routes or running via scripts/API

### P1 Backlog (post-launch)
- F-025: Admin Authentication
- F-004: Tool Comparison View
- F-019: Badge Awarding & Display
- F-020: Cycle Archive & Historical Access
- F-021: Vendor Directory & Profile Pages

### Deferred UI Features
- Market segment filter on leaderboard (data layer ready)
- Cycle selector for historical rankings (data layer ready)
- Historical score trend on tool detail (requires multiple cycles)
