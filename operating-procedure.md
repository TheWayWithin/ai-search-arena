# AI Search Arena — Operating Procedure

How to run a benchmark cycle from start to finish.

---

## Prerequisites

Before starting a new cycle, ensure:

- [ ] No active (non-terminal) cycle exists — only one at a time (BR-AC-005-04)
- [ ] Methodology version is finalized and ready to lock
- [ ] All tools you want to evaluate are created with track/segment mappings
- [ ] Vendor contact emails are set for vendors who should receive review notifications
- [ ] Environment variables configured: `DATABASE_URL`, `OPENROUTER_API_KEY`, `RESEND_API_KEY`, `R2_*`

---

## The 10-State Lifecycle

```
Draft → Planning → Evaluation → Synthesis → Review → VendorReview → Publication → Completed
```

Each state transition is an explicit operator action. Guards enforce preconditions. Side effects run automatically.

---

## Step-by-Step Procedure

### 1. Create Cycle (→ Draft)

**Admin UI** (Sprint 2): `/admin/cycles` → "New Cycle"
**Script**: `npx tsx scripts/run-cycle.ts`

Fill in:

- **Cycle identifier**: Format `YYYY-MM` (e.g., `2026-04`)
- **Display name**: Human-readable (e.g., "April 2026 Benchmark")
- **Start date**: When the cycle officially begins
- **Methodology version**: Select from available versions

The cycle is created in `Draft` state.

### 2. Enroll Tools (Draft state)

**Admin UI** (Sprint 2): `/admin/cycles/[id]/enrollment`
**Script**: The run-cycle script auto-enrolls all non-archived tools with track mappings

- Review the tool roster — enroll or withdraw tools as needed
- Each tool must have at least one track mapping
- You can enroll/withdraw tools in both Draft and Planning states
- Withdrawal requires a reason (preserved for audit trail)

### 3. Draft → Planning

**What happens**: Methodology version is locked (immutable for this cycle)

**Guard**: Methodology version must be assigned

**Action**: Click "Advance to Planning" on cycle detail page, or the script handles this automatically

**After this**: The methodology dimensions and weights cannot be changed for this cycle.

### 4. Planning → Evaluation

**What happens**: Tools are locked for this cycle. Evaluation can begin.

**Guard**: Each track must have ≥ 5 enrolled (non-withdrawn) tools (BR-T03)

**If guard fails**: Enroll more tools or check for accidental withdrawals. The error message tells you which track is short and by how many.

### 5. Run Evaluations (Evaluation state)

**Script**: `npx tsx scripts/run-cycle.ts`

This is the longest step. For each enrolled tool:

- 51 dimensions × 6 AI models = 306 API calls per tool
- All models queried in parallel per dimension
- Retry with exponential backoff on failure
- Results stored as `ModelEvaluation` records

**Volume**: ~8,568 total API calls for 28 tools.

**Resumability**: Re-running the script skips tools that are already fully evaluated. Safe to restart if interrupted.

**Monitoring**: Watch for:

- Model timeouts (configurable per model, default 30s–60s)
- Parse failures (model didn't return a score in expected format)
- Rate limiting from OpenRouter

### 6. Evaluation → Synthesis

**What happens**: Raw model scores are aggregated.

**No guard**: Transition proceeds immediately.

### 7. Synthesize Scores (Synthesis state)

**Script**: Handled by run-cycle script

Per tool × dimension:

1. Collect all successful model scores (status=Success, parsedScore not null)
2. Require minimum 4/6 successful scores
3. Compute **median** score → dimension score
4. Compute standard deviation → confidence tag
5. Store `Score` and `SynthesisRecord`

Then:

1. Compute overall composite scores (weighted sum with N/A renormalization)
2. Compute per-segment composite scores (7 segments)
3. Apply dense ranking (ties get same rank)

### 8. Synthesis → Review

**What happens**: Scores are ready for internal review.

**No guard**: Transition proceeds immediately.

### 9. Internal Review (Review state)

**Current process**: Manual review of scores for outliers or obvious errors.

**What to check**:

- Any tool with an unusually high or low composite score
- Dimensions with `Low` confidence or `InsufficientData` tags
- Score distributions that seem inconsistent with known tool capabilities
- Any parse failures or model errors that slipped through

**Score states**: Each score starts as `Draft`. Review moves it to `Reviewed`. Publication moves it to `Published`.

### 10. Review → VendorReview

**What happens automatically** (side effect):

1. `openReviewWindow()` creates a `VendorReview` record per enrolled vendor
2. Each record gets a unique `accessToken` (32-byte hex) for a secure review URL
3. Window opens now, closes in 5 business days (weekends skipped)
4. Notification email sent to each vendor's contact email via Resend

**Email contents**: Link to `{siteUrl}/review/{accessToken}`, deadline date, confidentiality notice.

### 11. Manage Vendor Review Window (VendorReview state)

**Duration**: 5 business days from window open.

**What vendors can do**:

- View their tools' dimension scores at their unique review URL
- Submit factual corrections with: proposed value, justification, and evidence URLs

**What you do when corrections come in**:

- Review the justification and evidence
- **Accept**: Score is updated, vendor notified by email
- **Reject**: Must provide a reason, vendor notified by email. Vendor may resubmit before window closes.

**When to advance**: After the 5 business day window closes and all corrections are resolved.

### 12. VendorReview → Publication

**What happens**: Scores are finalized. Time to generate deliverables.

### 13. Generate Deliverables (Publication state)

In this order:

1. **Generate audit package**: Captures all methodology, enrollments, evaluations, scores, corrections, and vendor reviews into a single JSON document
2. **Seal audit package**: SHA-256 hash computed and stored. Package is now immutable.
3. **Award badges**: Overall Leader/Runner-Up/Top Three + Segment Leaders (7 segments)
4. **Generate report**: Cycle summary with ranked tool list, methodology version, badge awards
5. **Publish report**: Sets `publishedAt` timestamp

### 14. Publication → Completed

**What happens**: Cycle marked complete. `endDate` set. Terminal state — no further transitions.

**Public site**: Leaderboard, tool detail pages, and comparison views now show the new cycle's data. Homepage switches from pre-launch to results view (if first cycle).

---

## Running via Script vs Admin UI

| Step              | Script (`run-cycle.ts`)       | Admin UI (Sprint 2)        |
| ----------------- | ----------------------------- | -------------------------- |
| Create cycle      | Auto-creates if none exists   | "New Cycle" form           |
| Enroll tools      | Auto-enrolls all non-archived | Checkbox per tool          |
| State transitions | Automatic progression         | Button per transition      |
| Evaluations       | Runs all in sequence          | Triggered from UI (future) |
| Synthesis         | Runs automatically            | Triggered from UI (future) |
| Vendor review     | Opens window automatically    | Manage from admin          |
| Deliverables      | Generated automatically       | Buttons in UI (future)     |

The script (`npx tsx scripts/run-cycle.ts`) handles the entire flow end-to-end. The admin UI gives you granular control over each step.

For the second benchmark, you can use either approach. The script is faster for a full run. The admin UI is better when you need to pause, inspect, or intervene at specific stages.

---

## Post-Publication

### Score Corrections

After publication, score corrections require dual approval:

- `correctedBy`: person making the correction
- `approvedBy`: different person approving it (cannot be the same)
- Previous value preserved in `ScoreCorrection` record

### Cycle Archive

Published cycles remain accessible via the cycle selector on the leaderboard and tool detail pages. The `/cycles` page lists all published cycles.

---

## Timing Guide

| Phase            | Typical Duration                              |
| ---------------- | --------------------------------------------- |
| Draft + Planning | 1 day (tool roster review)                    |
| Evaluation       | 2–4 hours (API calls, depends on rate limits) |
| Synthesis        | Minutes (computation)                         |
| Review           | 1–2 days (manual review)                      |
| Vendor Review    | 5 business days (mandatory window)            |
| Publication      | 1 day (generate deliverables, final checks)   |
| **Total**        | **~8–10 business days**                       |

---

## Troubleshooting

### Guard failure: "Track X has only N tools (minimum 5)"

Enroll more tools to that track before transitioning from Planning to Evaluation. Check that tools have track mappings assigned.

### Model evaluation failures

- **Timeout**: Increase `timeoutMs` for the model in admin
- **Parse failure**: Model response didn't contain a score. Check the raw response. May need prompt adjustment.
- **Rate limiting**: OpenRouter returns 429. The script retries with backoff, but sustained rate limiting may require slowing down parallel requests.

### Vendor didn't receive review email

- Check `vendor.contactEmail` is set
- Check Resend dashboard for delivery status
- The review URL can be shared manually: `/review/{accessToken}` (token is in the `VendorReview` record)

### Re-running a partially completed cycle

The run-cycle script is resumable. It checks the current state and picks up where it left off. Already-evaluated tools are skipped. Safe to run multiple times.

### Active cycle blocking new cycle creation

Only one non-terminal cycle can exist at a time. Either complete (→ Completed) or cancel (→ Cancelled) the existing cycle before creating a new one.
