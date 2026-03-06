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
