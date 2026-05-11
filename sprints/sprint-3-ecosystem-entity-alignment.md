# Sprint 3: Ecosystem Entity Alignment

**Status**: Ready
**Created**: 2026-03-14
**Priority**: Low-Medium
**Source**: `docs/ideation/agent-11-aisearcharena-brief.md`
**Goal**: Add ecosystem property links to the footer and enhance structured data with `sameAs` references — connecting AI Search Arena to the broader AI Search Mastery ecosystem.

---

## Background

AI Search Arena is part of the AI Search Mastery ecosystem alongside LLM.txt Mastery and AImpact Scanner. The footer currently links only to the parent org (aisearchmastery.com). Adding the sibling properties improves entity recognition across AI models and search engines.

### Brief Validation

The ideation brief recommended 4 changes. Two are already done, one isn't a code change, and two are valid:

| #   | Recommendation                        | Verdict               | Reason                                                                                                                  |
| --- | ------------------------------------- | --------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| 1   | Include LLM.txt Mastery in benchmarks | **Already done**      | Tool is seeded in `prisma/seed.ts` (line 1101). Enrolling it in a cycle is an admin-panel operation, not a code change. |
| 2   | Add ecosystem footer links            | **Valid**             | Footer only links to aisearchmastery.com today.                                                                         |
| 3   | Enhance schema with sameAs            | **Valid (small)**     | Organization schema exists on about page but lacks `sameAs` array.                                                      |
| 4   | Canonical reference sentence          | **Not a code change** | Editorial guidance for benchmark descriptions. No implementation needed.                                                |

---

## Tickets

### T1: Ecosystem Footer Links

**File**: `components/site-footer.tsx`

Update the copyright line from:

```
© 2026 AI Search Arena. An AI Search Mastery project.
```

To include sibling property links:

```
© 2026 AI Search Arena. An AI Search Mastery project.
AI Search Mastery · LLM.txt Mastery · AImpact Scanner
```

**Implementation**:

- Add a second line below the existing copyright text
- Three external links separated by `·` (middle dot)
- Same styling as existing AI Search Mastery link (`text-mastery-blue underline underline-offset-2`)
- All links open in new tab with `rel="noopener noreferrer"`

**Links**:

- AI Search Mastery → https://aisearchmastery.com
- LLM.txt Mastery → https://llmtxtmastery.com
- AImpact Scanner → https://aimpactscanner.com

**Depends on**: Nothing

---

### T2: Organization Schema — Add sameAs

**File**: `app/(public)/about/page.tsx`

The about page already has an Organization schema (lines 14-30) with `parentOrganization`. Add a `sameAs` array to the parent organization to declare the ecosystem entities:

```diff
  parentOrganization: {
    "@type": "Organization",
    name: "AI Search Mastery",
    url: "https://aisearchmastery.com",
+   sameAs: [
+     "https://aisearcharena.com",
+     "https://llmtxtmastery.com",
+     "https://aimpactscanner.com"
+   ]
  },
```

**Note**: `sameAs` goes on the parent org (AI Search Mastery) because it's the entity that owns all properties. The Arena schema correctly identifies itself as a child via `parentOrganization`.

**Depends on**: Nothing

---

## Out of Scope

- **Tool enrollment in cycles** — Operational task via admin panel, not a code change
- **Tool description updates** — Current seed description is accurate; the brief's version is marketing copy better suited for LLM.txt Mastery's own site
- **AImpact Monitor** — Not mentioned in the brief; can be added to footer later if needed

---

## Acceptance Criteria

1. Footer displays three ecosystem links below the copyright line
2. All links open in new tabs with proper `rel` attributes
3. Organization schema on about page includes `sameAs` array on the parent org
4. `npm run typecheck` and `npm run build` pass
5. Footer looks clean on mobile (links wrap gracefully)

---

## Execution Order

T1 and T2 have no dependencies and can be built in parallel.

**Estimated effort**: Small — two file edits, no new components or database changes.
