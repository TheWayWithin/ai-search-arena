# Agent Context - AISearchArena.com

**Mission**: Build AISearchArena.com - Monthly independent benchmark platform for AI search optimization tools
**Phase**: ALL PHASES COMPLETE + DEPLOYED TO PRODUCTION
**Started**: 2026-03-01
**Last Updated**: 2026-03-01 17:30

## Mission Objectives

- Build a monthly benchmark publication platform evaluating 27+ AI search optimization tools
- 50+ standardized metrics using 6-model AI consensus methodology
- Target launch: March 2026, Week 4

## Technical Decisions

- **Stack**: Next.js 15 (App Router) + Tailwind v4 + shadcn/ui + MDX + Prisma + Neon + Vercel
- **AI Pipeline**: OpenRouter gateway to 6 AI models (OpenAI, Anthropic, Google, Cohere, Mistral, Meta)
- **Storage**: Cloudflare R2 for evidence artifacts ($0 egress)
- **Monitoring**: Sentry (errors) + Plausible (analytics, privacy-respecting)
- **Email**: Resend (transactional) + Buttondown (newsletter)
- **Schema**: 24 entities, 8 enums, camelCase fields with @map("snake_case")
- **Scoring**: 51 dimensions across 6 categories, weights sum to 1.0

## Accumulated Findings

### Phase 1 Completions

- 24-entity schema with state machines (CycleState: 10 states, ScoreState: 4 states)
- 51 scoring dimensions in 6 categories (expanded from initial 35)
- 28 vendor/tool records seeded across 7 market segments
- 5 data access modules: ai-models, methodology, vendors, prompt-sets, db/index
- 2 static pages with JSON-LD structured data
- Quality gates: build, typecheck, lint, test all pass

### Phase 2 Completions

- Cycle state machine: 10 states, 14 transitions, 2 guards, 1 side effect
- Tool enrollment: enroll/withdraw with track validation
- OpenRouter evaluation pipeline: parallel 6-model dispatch with retry
- Evidence storage: R2 upload with graceful degradation

### Phase 3 Completions

- Score synthesis: median-based, deterministic, with confidence tags
- Composite scoring: weighted average with N/A renormalization + dense ranking
- Vendor review: full lifecycle (open → correction → accept/reject → close)
- Report generation: structured data + publication workflow
- Audit packages: SHA-256 hashed, sealable, file-based storage

### Phase 4 Completions

- 6 public pages with JSON-LD structured data
- Pre-launch state handling on all data-dependent pages
- SEO: robots.txt, sitemap.xml, OG meta, Twitter cards
- Plausible analytics + Sentry error tracking

### Production Deployment

- Neon PostgreSQL live: 24 tables migrated, seed data loaded
- Vercel: live at aisearcharena.com with auto-deploy from GitHub
- All 7 external services configured (Neon, Vercel, OpenRouter, R2, Resend, Plausible, Sentry)
- DNS configured on Namecheap (Vercel A/CNAME + Resend DKIM/SPF/MX/DMARC)

### Issues Resolved

1. Prisma validate requires DATABASE_URL → created .env with placeholder
2. Badge model needed cycleId/toolId fields for reverse relations
3. ScoringDimension needed evaluations[] array for ModelEvaluation relation
4. shadcn init fails if components.json exists → delete first
5. PromptSet requires name field → fixed createPromptSet function
6. Plausible now uses custom script URLs with init() call (not data-domain approach)
7. Namecheap MX records managed in separate Mail Settings section
8. Vercel sensitive env vars cannot target Development environment

## Known Issues

- Resend domain DNS pending verification (non-blocking, emails will work once verified)

## Dependencies

- None blocking. All services operational.

---

## Migrated from handoff-notes.md (2026-05-07)

# Handoff Notes - AISearchArena.com

**Last Updated**: 2026-03-05

## Current State

- **Phase**: Post-Launch — Admin Auth Complete
- **Status**: Live at https://aisearcharena.com with published rankings + admin panel
- **Benchmark**: Cycle 2026-03 COMPLETE (32 tools, 9,792 evaluations, 1,632 scores)
- **Leaderboard**: Live with 7 market segment filters
- **Admin**: `/admin` routes protected with JWT auth, login at `/admin/login`
- **Framework Repo**: https://github.com/TheWayWithin/geo-benchmark-framework (public)

### What Just Happened (2026-03-05)

1. **F-025 Admin Authentication implemented** — Full auth gate for `/admin/*` routes.
   - `bcryptjs` (pure-JS bcrypt) + `jose` (Edge-compatible JWT)
   - `AdminLoginAttempt` Prisma model for DB-backed brute-force lockout (5 attempts → 15min)
   - `lib/auth.ts` — JWT sign/verify (24h HS256), bcrypt + timingSafeEqual, lockout, session helpers
   - `middleware.ts` — Edge Runtime JWT verification, redirects to `/admin/login?from=<path>`
   - Login page with `useActionState`, server actions for login/logout
   - Authenticated layout with admin nav (Dashboard, Cycles, Tools, Models, Vendors, Methodology)
   - 5 stub pages so nav links don't 404
   - Password hash stored as base64-encoded bcrypt (avoids `$` escaping with Next.js dotenv-expand)
   - All admin pages: `robots: { index: false, follow: false }`
   - Build script: `prisma generate && next build` (fixes Vercel cached Prisma client)
   - Vercel env vars set + deployed to production — login verified at aisearcharena.com/admin
   - Issues resolved: bcrypt `$` escaping (base64), Vercel `echo` newline injection (`echo -n`), Prisma cache (prisma generate in build)

### Previous (2026-03-03)

1. **First benchmark cycle completed** — 32 tools evaluated across 51 dimensions by 6 AI models. 280.9 minutes, ~3.7M tokens, 100% success rate.
2. **Leaderboard live with data** — BrightEdge #1 (7.6), Semrush #2 (7.5), seoClarity #3 (7.4). All 32 tools ranked.
3. **Market segment filters added** — 7 segments with per-segment composite scores and dense ranking. Server-side pill filter UI.
4. **Critical fixes deployed** — segmentId null consistency, publishedAt on cycle, createMany type error (unblocked 3 failed Vercel deploys).
5. **llms.txt published** — `public/llms.txt` for AI discoverability.
6. **Daily report + blog** — Marketing physics angle blog post: "We Just Scored 32 AI SEO Tools With 9,792 Tests"

### Key Decisions Made

- **Bcrypt hash as base64 in .env** — Next.js dotenv-expand mangles `$` in bcrypt hashes (`$2b$12$...`). Storing as base64 avoids all escaping issues. `lib/auth.ts` decodes with `Buffer.from(hash, "base64")`.
- **Middleware only imports `jose`** — bcryptjs and Prisma aren't Edge-compatible. Middleware does JWT-only verification; `lib/auth.ts` (Node runtime) handles bcrypt/DB.
- **Defense-in-depth** — Middleware blocks unauthenticated access AND `(authenticated)/layout.tsx` re-checks session server-side.
- **Single-row lockout table** — `AdminLoginAttempt` with `identifier: "admin"` (unique). Serverless-compatible, no in-memory state.
- `segmentId: null` = overall scores (not `"overall"` string). All 6 files fixed. `run-cycle.ts` was already correct.
- Prisma nullable compound unique can't use `upsert` — must use `findFirst` + conditional `create`/`update` pattern.
- `publishedAt` now set on both BenchmarkReport AND BenchmarkCycle during Publication → Completed transition.
- Per-segment scoring reuses same score data as overall — filters by tool-segment mappings, ranks independently within segment.
- Segment filter UI is pure server-side (Next.js searchParams + Link components) — zero client JS.

## What Was Built

### Phase 1-4: MVP (2026-03-01)

- Next.js 15.5.12, TypeScript strict, Tailwind v4, shadcn/ui, Prisma
- 24-entity schema with 8 enums
- 10-state cycle state machine
- 6-model AI evaluation pipeline via OpenRouter
- Median-based deterministic score synthesis
- Weighted composite scoring with dense ranking
- Vendor review workflow + audit packages (SHA-256)
- 6 public pages with JSON-LD structured data
- Production: Vercel + Neon + OpenRouter + R2 + Resend + Plausible + Sentry

### Sprint 1: GEO Benchmark Framework (2026-03-02)

- Public methodology repo with 51 dimensions, 128 prompts, 6 models
- Framework loader: YAML → DB with git SHA pinning

### Post-Launch (2026-03-02 — 2026-03-03)

- Model panel v1.3 (frontier, cost-optimized)
- AI Search Mastery vendor + 4 products enrolled (32 total tools)
- First benchmark cycle complete and published
- Market segment filters on leaderboard (7 segments, 79 segment scores)
- llms.txt for AI discoverability
- Connection pool fixes, nullable FK fixes, build pipeline fixes

## Production Services (ALL LIVE)

| Service           | Status     | Details                                                        |
| ----------------- | ---------- | -------------------------------------------------------------- |
| **Neon**          | Live       | 25 tables, 32 tools, 9,792 evals, 1,632 scores, 111 composites |
| **Vercel**        | Live       | aisearcharena.com, auto-deploy from GitHub                     |
| **OpenRouter**    | Configured | 6-model panel v1.3                                             |
| **Cloudflare R2** | Configured | Evidence artifact storage                                      |
| **Resend**        | Configured | Email (domain DNS pending verification)                        |
| **Plausible**     | Verified   | Analytics tracking active                                      |
| **Sentry**        | Configured | Error tracking                                                 |

## Known Issues / Warnings

- All confidence tags are "Low" — expected for first cycle; will increase with more data over monthly cycles.
- Cycle selector (AC-002-03) deferred — data layer ready, UI not yet built (needs multiple published cycles).
- Historical score trends on tool detail (AC-003-02) deferred — requires multiple cycles.
- Email notifications via Resend not yet implemented — deferred.
- Lighthouse audit TODO — site is live, can run now.
- **Vercel env piping**: Always use `echo -n` (not `echo`) when piping values to `vercel env add` to avoid trailing newline injection.
- **Bcrypt in .env**: Always base64-encode bcrypt hashes for Next.js projects (dotenv-expand mangles `$`).

## What's Next

### P1 Backlog

- F-004: Tool Comparison View — **COMPLETE** (committed 2026-03-03)
- F-019: Badge Awarding & Display
- F-020: Cycle Archive & Historical Access
- F-021: Vendor Directory & Profile Pages

### Deferred UI Features

- Cycle selector for historical rankings
- Historical score trend on tool detail
- Newsletter signup integration (Buttondown)
