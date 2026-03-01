# Agent Context - AISearchArena.com

**Mission**: Build AISearchArena.com - Monthly independent benchmark platform for AI search optimization tools
**Phase**: 1 COMPLETE → Phase 2 next
**Started**: 2026-03-01
**Last Updated**: 2026-03-01 00:55

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

### Issues Resolved
1. Prisma validate requires DATABASE_URL → created .env with placeholder
2. Badge model needed cycleId/toolId fields for reverse relations
3. ScoringDimension needed evaluations[] array for ModelEvaluation relation
4. shadcn init fails if components.json exists → delete first
5. PromptSet requires name field → fixed createPromptSet function

## Known Issues
- Database migration not yet run (no real Neon DATABASE_URL)
- Vercel project not linked (requires manual `vercel link`)

## Dependencies
- **Blocking**: Neon connection string required for database migration
- **Phase 2**: OpenRouter API key for evaluation execution
- **Phase 2**: Cloudflare R2 credentials for evidence capture
- **Phase 4**: Vercel project for deployment
