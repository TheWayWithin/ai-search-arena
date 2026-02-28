## Section 3: Features & Requirements

### 3.1 Feature Summary

| Feature ID | Feature Name | Type | Priority | Touched Entities | Est. Effort | Dependencies |
|-----------|-------------|------|----------|-----------------|-------------|-------------|
| F-001 | Public Homepage & Current Cycle Highlights | CRUD / ANALYTICS | P0 | BenchmarkCycle, BenchmarkReport, CompositeScore, Badge | M (1-3 days) | F-005, F-014 |
| F-002 | Track Leaderboard | CRUD / SEARCH | P0 | BenchmarkTrackDefinition, CompositeScore, Tool, ToolSegmentMapping, MarketSegment, Badge, CycleToolEnrollment | L (3-5 days) | F-005, F-012 |
| F-003 | Tool Detail Page | CRUD / ANALYTICS | P0 | Tool, Vendor, Score, ScoringDimension, CompositeScore, EvidenceArtifact, Badge, VendorDisclosure, BenchmarkCycle | L (3-5 days) | F-002 |
| F-004 | Tool Comparison View | CRUD | P1 | Tool, Score, ScoringDimension, CompositeScore, BenchmarkTrackDefinition | M (1-3 days) | F-003 |
| F-005 | Benchmark Cycle Lifecycle Management | WORKFLOW | P0 | BenchmarkCycle, CycleToolEnrollment, MethodologyVersion, PromptSet, BenchmarkReport, CycleAuditPackage | XL (5+ days) | None |
| F-006 | Tool Enrollment & Track Assignment | CRUD / WORKFLOW | P0 | CycleToolEnrollment, Tool, ToolTrackMapping, ToolSegmentMapping, BenchmarkTrackDefinition, MarketSegment | M (1-3 days) | F-005, F-010 |
| F-007 | AI Model Evaluation Execution | WORKFLOW / INTEGRATION | P0 | ModelEvaluation, AIModel, PromptSet, ScoringDimension, EvidenceArtifact, Tool, BenchmarkCycle | XL (5+ days) | F-005, F-008, F-009 |
| F-008 | Prompt Set Management | CRUD | P0 | PromptSet, ScoringDimension, MethodologyVersion | M (1-3 days) | F-013 |
| F-009 | AI Model Configuration Management | CRUD | P0 | AIModel, BenchmarkCycle | S (<1 day) | None |
| F-010 | Vendor & Tool Administration | CRUD | P0 | Vendor, Tool, ToolTrackMapping, ToolSegmentMapping, BenchmarkTrackDefinition, MarketSegment | M (1-3 days) | None |
| F-011 | Score Synthesis Pipeline | WORKFLOW / ANALYTICS | P0 | SynthesisRecord, ModelEvaluation, Score, ScoringDimension, AIModel | XL (5+ days) | F-007 |
| F-012 | Composite Score & Ranking Calculation | ANALYTICS | P0 | CompositeScore, Score, ScoringDimension, BenchmarkTrackDefinition, CycleToolEnrollment | M (1-3 days) | F-011 |
| F-013 | Methodology Version Management | CRUD / WORKFLOW | P0 | MethodologyVersion, ScoringDimension, BenchmarkTrackDefinition | M (1-3 days) | None |
| F-014 | Report Generation & Publication | WORKFLOW | P0 | BenchmarkReport, BenchmarkCycle, CycleAuditPackage, Badge, CompositeScore | L (3-5 days) | F-012, F-016 |
| F-015 | Vendor Review Workflow | WORKFLOW | P0 | VendorCorrection, VendorDisclosure, Score, BenchmarkCycle, Tool, Vendor, ScoringDimension | L (3-5 days) | F-011 |
| F-016 | Audit Package Generation | WORKFLOW | P0 | CycleAuditPackage, MethodologyVersion, PromptSet, AIModel, CycleToolEnrollment, Tool | M (1-3 days) | F-011 |
| F-017 | Methodology Public Pages | CRUD | P0 | MethodologyVersion, ScoringDimension, BenchmarkTrackDefinition | M (1-3 days) | F-013 |
| F-018 | Evidence Artifact Capture & Storage | CRUD / INTEGRATION | P0 | EvidenceArtifact, ModelEvaluation | M (1-3 days) | F-007 |
| F-019 | Badge Awarding & Display | WORKFLOW / CRUD | P1 | Badge, CompositeScore, Tool, BenchmarkCycle, BenchmarkTrackDefinition | M (1-3 days) | F-012 |
| F-020 | Cycle Archive & Historical Access | CRUD | P1 | BenchmarkCycle, BenchmarkReport, CompositeScore, CycleAuditPackage | M (1-3 days) | F-014 |
| F-021 | Vendor Directory & Profile Pages | CRUD | P1 | Vendor, Tool, VendorDisclosure, Badge | S (<1 day) | F-010 |
| F-022 | Cross-Cycle Anomaly Detection | ANALYTICS | P1 | Score, BenchmarkCycle, ScoringDimension, Tool | M (1-3 days) | F-011 |
| F-023 | Score Correction Workflow (Post-Publication) | WORKFLOW | P2 | ScoreCorrection, Score, BenchmarkCycle | S (<1 day) | F-014 |
| F-024 | Static Content & About Pages | CRUD | P0 | None (static content) | S (<1 day) | None |
| F-025 | Admin Authentication | WORKFLOW | P0 | None (infrastructure) | S (<1 day) | None |

---

### 3.2 Feature Details

---

#### Area 1: Public Benchmark Experience

---

#### F-001: Public Homepage & Current Cycle Highlights

| Attribute | Value |
|-----------|-------|
| Type | CRUD / ANALYTICS |
| Priority | P0 |
| Touched Entities | BenchmarkCycle, BenchmarkReport, CompositeScore, Badge |
| Dependencies | F-005, F-014 |
| Estimated Effort | M (1-3 days) |

**Description**: The public homepage serves as the primary entry point for AISearchArena.com. It displays the most recent published benchmark cycle highlights, top-performing tools, active tracks, and the conflict of interest disclosure statement. The page establishes the brand essence of Rigor immediately by leading with methodology transparency and current data. Before any benchmark cycle is published, the homepage displays a "Coming Soon" state with methodology preview and launch timeline.

**User Story**: As a practitioner evaluating GEO/AEO tools, I want to see the latest benchmark results as soon as I land on AISearchArena.com so that I can quickly assess which tools are currently leading and navigate to detailed comparisons.

**Acceptance Criteria (GWT)**:

| AC ID | Given | When | Then |
|-------|-------|------|------|
| AC-001-01 | At least one BenchmarkCycle exists with state = Completed | A visitor loads the homepage | The page displays the most recent completed cycle's name, publication date, top 5 tools by composite score for each published track, and a prominent link to the full leaderboard |
| AC-001-02 | No BenchmarkCycle exists with state = Completed | A visitor loads the homepage | The page displays a "Coming Soon" message with the methodology preview link, the target launch date (March 2026), and the brand positioning statement |
| AC-001-03 | A completed cycle exists with awarded badges | A visitor views the homepage | Badge-holding tools display their badge icons next to the tool name in the top performers section |
| AC-001-04 | The homepage is loaded | A visitor scrolls below the fold | The conflict of interest disclosure statement is visible in a dedicated section (not footer-only) with a link to the full methodology page |

**UI/UX Notes**:
- Hero section: cycle name, publication date, track selector
- Top Performers card grid (top 5 per track) with composite score, rank, and badge if applicable
- "How We Score" teaser section linking to `/methodology`
- Conflict of interest disclosure in a visible, styled callout block -- not hidden or minimized
- Clear CTAs: "View Full Leaderboard," "Read Methodology," "Compare Tools"
- Responsive design: mobile-first, card layout stacks vertically

**Technical Notes**:
- Data is read-only from published cycle data; no dynamic computation on page load
- Page is statically generated or cached aggressively (content changes only at publication time)
- SEO: meta title "AISearchArena | Independent Monthly Benchmark for AI Search Optimization Tools"
- Structured data (JSON-LD) for organization and benchmark dataset

**Out of Scope**:
- Newsletter signup or email capture
- Personalized content or user preferences
- Real-time score updates (data refreshes only at cycle publication)

---

#### F-002: Track Leaderboard

| Attribute | Value |
|-----------|-------|
| Type | CRUD / SEARCH |
| Priority | P0 |
| Touched Entities | BenchmarkTrackDefinition, CompositeScore, Tool, ToolSegmentMapping, MarketSegment, Badge, CycleToolEnrollment |
| Dependencies | F-005, F-012 |
| Estimated Effort | L (3-5 days) |

**Description**: The track leaderboard is the primary benchmark results page. It displays all evaluated tools for a given track ranked by composite score, with segment filtering, dimension score previews, confidence indicators, and badge markers. This is the page practitioners will use most frequently when comparing tools. The leaderboard reflects data from the most recent published cycle by default, with the ability to view any past published cycle.

**User Story**: As an SEO consultant choosing a GEO tool for a client, I want to see all evaluated tools ranked by overall score with the ability to filter by market segment so that I can quickly identify the best-fit tools for my client's specific context.

**Acceptance Criteria (GWT)**:

| AC ID | Given | When | Then |
|-------|-------|------|------|
| AC-002-01 | A published cycle exists for the GEO Platform track with 5+ evaluated tools | A visitor navigates to `/benchmarks/geo-platform` | The page displays all non-withdrawn tools ranked by composite score in dense ranking order, showing: rank, tool name, vendor name, composite score (to 2 decimal places), badge icon (if awarded), and a confidence summary |
| AC-002-02 | The leaderboard is displayed and market segments exist | A visitor selects a market segment filter (e.g., "Enterprise SEO") | The leaderboard re-filters to show only tools mapped to that segment, with rankings recalculated based on the filtered set |
| AC-002-03 | Two tools have identical composite scores | The leaderboard renders | Tied tools display the same rank, ordered by number of High-confidence dimensions (descending), then alphabetically; the next rank after the tie is the next sequential integer (dense ranking per BR-S14) |
| AC-002-04 | A visitor is viewing the leaderboard | The visitor clicks on a tool name | The visitor is navigated to the Tool Detail page (`/benchmarks/:track/:tool`) |
| AC-002-05 | Multiple published cycles exist | The visitor selects a different cycle from the cycle selector | The leaderboard updates to show rankings from the selected historical cycle |

**UI/UX Notes**:
- Sortable table: default sort by rank (composite score descending)
- Each row: rank badge, tool logo (if available), tool name (linked), vendor name, composite score, mini bar chart showing top 3 dimension scores, confidence indicator (colored dot or icon), badges
- Segment filter: dropdown or pill-style toggle above the table
- Cycle selector: dropdown in the page header showing available published cycles
- "Compare Selected" button: checkbox per row, enables multi-tool comparison (links to F-004)
- Mobile: cards instead of table rows, swipeable dimension scores
- Disclosure callout for any AI Search Mastery-affiliated tools (prominent, inline)

**Technical Notes**:
- All data is pre-computed at publication time (CompositeScore, rank values); no runtime calculation
- Segment filtering operates on ToolSegmentMapping join; rankings within a filtered view are computed client-side from the existing composite scores
- URL structure supports direct linking: `/benchmarks/geo-platform?segment=enterprise&cycle=2026-03`
- Structured data: ItemList schema for SEO

**Out of Scope**:
- Custom weighting or user-defined scoring preferences
- Export to CSV/PDF (deferred to P2)
- Inline dimension-level score expansion (that is the Tool Detail page)

---

#### F-003: Tool Detail Page

| Attribute | Value |
|-----------|-------|
| Type | CRUD / ANALYTICS |
| Priority | P0 |
| Touched Entities | Tool, Vendor, Score, ScoringDimension, CompositeScore, EvidenceArtifact, Badge, VendorDisclosure, BenchmarkCycle |
| Dependencies | F-002 |
| Estimated Effort | L (3-5 days) |

**Description**: The tool detail page provides the full evaluation breakdown for a single tool within a track and cycle. It shows every dimension score with confidence tag, editorial notes, evidence artifact links, the composite score calculation breakdown, any vendor disclosures, badge history, and the conflict of interest disclosure where applicable. This is where practitioners go to understand not just how a tool ranked, but why it scored the way it did across each dimension.

**User Story**: As a marketing director evaluating a specific GEO tool, I want to see the complete dimension-by-dimension scoring breakdown with confidence levels and supporting evidence so that I can assess whether this tool's strengths align with my organization's priorities.

**Acceptance Criteria (GWT)**:

| AC ID | Given | When | Then |
|-------|-------|------|------|
| AC-003-01 | A published cycle exists with scores for a tool on the GEO Platform track | A visitor navigates to `/benchmarks/geo-platform/toolname` | The page displays: tool name, vendor name and link, composite score, rank within track, and a complete table of all dimension scores showing dimension name, score value (0-10), weight percentage, confidence tag (color-coded), and whether the dimension is applicable |
| AC-003-02 | A dimension has Score.is_applicable = false | The dimension row renders | The row displays "N/A" instead of a numeric score, confidence shows "Not Applicable," and a tooltip explains that this dimension does not apply to this tool's category |
| AC-003-03 | The tool's vendor has VendorDisclosure records for this cycle | The page renders | A "Vendor Disclosure" section displays the disclosure type and description prominently |
| AC-003-04 | The tool is an AI Search Mastery product (AImpactScanner or LLM.txt Mastery) | The page renders | The conflict of interest disclosure callout appears at the top of the page in a visually distinct block, linking to the methodology page for full safeguard details |
| AC-003-05 | Multiple published cycles contain scores for this tool | The page renders | A "Score History" section displays a trend chart or table showing the composite score across all published cycles, with links to view any past cycle's detail |

**UI/UX Notes**:
- Header: tool name, logo, vendor, website link, pricing model tag, composite score (large), rank badge
- Dimension score table: grouped visually, each row expandable to show editorial notes
- Confidence tags as colored badges: green (High), yellow (Medium), orange (Low), red (Insufficient Data), gray (Not Applicable)
- Evidence section: links to evidence artifacts (screenshots, URLs) grouped by dimension
- Vendor disclosure section: styled callout if disclosures exist
- COI disclosure: for affiliated tools, a prominent banner at page top
- Score history: simple line chart or sparkline for composite score over time
- Navigation: breadcrumb back to leaderboard; prev/next tool links within the current ranking

**Technical Notes**:
- Data is read-only from published scores; all pre-computed
- Score history requires querying CompositeScore across multiple published cycles for the same tool+track
- Canonical URL: `/benchmarks/geo-platform/tool-slug` (slug derived from tool_name)
- SEO: Product schema with review/rating aggregate

**Out of Scope**:
- Exposing raw ModelEvaluation outputs or SynthesisRecord internals (admin/audit only)
- User-generated reviews or comments
- Side-by-side comparison on this page (that is F-004)

---

#### F-004: Tool Comparison View

| Attribute | Value |
|-----------|-------|
| Type | CRUD |
| Priority | P1 |
| Touched Entities | Tool, Score, ScoringDimension, CompositeScore, BenchmarkTrackDefinition |
| Dependencies | F-003 |
| Estimated Effort | M (1-3 days) |

**Description**: The comparison view allows practitioners to place 2 to 4 tools side by side for a dimension-by-dimension comparison within the same track and cycle. This is the feature that directly supports the practitioner buying decision: narrowing a shortlist to a final selection by comparing strengths across specific dimensions that matter to their use case.

**User Story**: As an SEO consultant with a shortlist of 3 tools, I want to compare them side by side across all scoring dimensions so that I can identify which tool is strongest in the dimensions most relevant to my client's needs.

**Acceptance Criteria (GWT)**:

| AC ID | Given | When | Then |
|-------|-------|------|------|
| AC-004-01 | A visitor has selected 2-4 tools from the leaderboard or navigated to the comparison URL | The comparison page renders | A side-by-side table displays each dimension as a row, with each selected tool as a column, showing score value, confidence tag, and the highest score in each row visually highlighted |
| AC-004-02 | A visitor has selected fewer than 2 or more than 4 tools | The visitor attempts to load the comparison | A validation message indicates the comparison requires 2 to 4 tools, with guidance to return to the leaderboard to adjust selection |
| AC-004-03 | One of the compared tools has a dimension marked as not applicable | The comparison row for that dimension renders | The cell shows "N/A" with gray styling; the highlighting logic skips N/A values when determining the highest score |

**UI/UX Notes**:
- Column headers: tool name, logo, composite score, rank
- Row per dimension: dimension name, weight, and score cells per tool
- Color highlighting: highest score in each row gets a subtle green background
- Summary row at bottom: composite scores with rank indicators
- Tool selector: ability to add/remove tools via dropdown without full page reload
- URL encodes tool selection: `/benchmarks/geo-platform/compare?tools=tool1,tool2,tool3`
- Print-friendly layout for practitioners who need to include in client proposals

**Technical Notes**:
- All data from published scores; no runtime computation beyond highlighting
- Shareable URL with tool slugs as query parameters
- Maximum 4 tools enforced at the UI level

**Out of Scope**:
- Cross-track comparison (tools must be on the same track)
- Custom dimension weighting by the user
- Downloadable comparison report (P2 consideration)

---

#### Area 2: Benchmark Cycle Management

---

#### F-005: Benchmark Cycle Lifecycle Management

| Attribute | Value |
|-----------|-------|
| Type | WORKFLOW |
| Priority | P0 |
| Touched Entities | BenchmarkCycle, CycleToolEnrollment, MethodologyVersion, PromptSet, BenchmarkReport, CycleAuditPackage |
| Dependencies | None |
| Estimated Effort | XL (5+ days) |

**Description**: The central workflow engine for managing a benchmark cycle from creation through completion. This feature implements the full BenchmarkCycle state machine (Planning, Evaluation, Synthesis, VendorReview, Publication, Completed, Suspended, Cancelled) with validated state transitions, entry/exit condition enforcement, and admin controls. Every other admin feature depends on this workflow. For a solopreneur operator, this is the command center that ensures the monthly publication cadence is maintained with full process discipline.

**User Story**: As the benchmark operator (admin), I want to create and manage benchmark cycles through their complete lifecycle with enforced state transitions so that every cycle follows the defined methodology process and produces reliable, auditable results.

**Acceptance Criteria (GWT)**:

| AC ID | Given | When | Then |
|-------|-------|------|------|
| AC-005-01 | An admin is authenticated | The admin creates a new benchmark cycle | A BenchmarkCycle record is created in Planning state with required fields (cycle_name, methodology_id, start_date, end_date) and appears on the admin dashboard |
| AC-005-02 | A cycle is in Planning state with 5+ enrolled tools on at least one track, a locked methodology version, and active prompt sets | The admin triggers transition to Evaluation | The cycle state changes to Evaluation; no further tool enrollments are accepted (BR-T01); the methodology version becomes immutable for this cycle (BR-S03) |
| AC-005-03 | A cycle is in Planning state with fewer than 5 enrolled tools on all tracks | The admin attempts to transition to Evaluation | The transition is rejected with a validation message listing which tracks have insufficient tool enrollment (BR-T03) |
| AC-005-04 | A cycle is in Evaluation, Synthesis, or VendorReview state | The admin triggers Suspension | The cycle transitions to Suspended; previous_state is recorded; suspension_reason is required; all in-progress work is preserved |
| AC-005-05 | A cycle is in Suspended state | The admin triggers Resume | The cycle returns to the state recorded in previous_state; a log entry records the suspension period |
| AC-005-06 | A cycle is in VendorReview state and the 5-business-day window has closed and the CycleAuditPackage is sealed | The admin triggers transition to Publication | The cycle transitions to Publication; the BenchmarkReport can now be finalized and published (BR-AUD01) |
| AC-005-07 | A cycle is in Planning or Suspended state | The admin triggers Cancellation | The cycle transitions to Cancelled (terminal state); all existing data is preserved but marked as unpublished |

**UI/UX Notes**:
- Admin dashboard card per active cycle showing: cycle name, current state (color-coded), days in current state, next required action
- State transition buttons with confirmation dialogs listing all preconditions and their current status (met/unmet)
- Visual state machine diagram on cycle detail page showing current position
- Timeline view: planned dates vs actual dates for each state
- Validation summary before each transition: checklist of entry conditions with pass/fail indicators

**Technical Notes**:
- State transitions are atomic: either all conditions are met and the transition succeeds, or it is rejected entirely
- All state transitions logged with timestamp and actor for audit trail
- Business rules BR-T01, BR-T03, BR-S03, BR-V05, BR-AUD01 enforced at the transition layer
- Suspended state stores previous_state for correct resumption
- No concurrent cycles required for MVP (one active cycle at a time is acceptable)

**Out of Scope**:
- Automated scheduling of state transitions (all transitions are admin-initiated in v1)
- Parallel cycle execution
- Cycle templates or cloning from previous cycles (P2)

---

#### F-006: Tool Enrollment & Track Assignment

| Attribute | Value |
|-----------|-------|
| Type | CRUD / WORKFLOW |
| Priority | P0 |
| Touched Entities | CycleToolEnrollment, Tool, ToolTrackMapping, ToolSegmentMapping, BenchmarkTrackDefinition, MarketSegment |
| Dependencies | F-005, F-010 |
| Estimated Effort | M (1-3 days) |

**Description**: Manages which tools participate in which benchmark cycle on which tracks. Tools are enrolled during the Planning state only, and can be withdrawn at any state (with data preservation). This feature enforces minimum tool counts per track (BR-T03) and provides the operator with a clear view of enrollment status before transitioning to evaluation.

**User Story**: As the benchmark operator, I want to enroll specific tools in a cycle on their applicable tracks and manage withdrawals so that each cycle evaluates the right set of tools with proper audit trail.

**Acceptance Criteria (GWT)**:

| AC ID | Given | When | Then |
|-------|-------|------|------|
| AC-006-01 | A cycle is in Planning state and a tool has an active ToolTrackMapping for the GEO Platform track | The admin enrolls the tool in the cycle for that track | A CycleToolEnrollment record is created with enrolled_at timestamp; the tool appears in the cycle's enrollment list |
| AC-006-02 | A cycle is in Evaluation state | The admin attempts to enroll a new tool | The enrollment is rejected with a message citing BR-T01 (tools can only be added during Planning) |
| AC-006-03 | A tool is enrolled in a cycle and evaluations have begun | The admin withdraws the tool | The CycleToolEnrollment record is updated with withdrawn_at and withdrawal_reason; existing evaluation data is preserved; the tool is excluded from rankings and badge eligibility (BR-T02) |
| AC-006-04 | The admin views enrollment for a cycle | The enrollment dashboard renders | A summary shows: total tools enrolled per track, tools with complete track mappings, tools with segment assignments, and a clear indicator of whether the minimum 5-tool threshold is met per track |

**UI/UX Notes**:
- Enrollment dashboard: table of tools with checkboxes per track
- Track columns show enrollment status (enrolled, withdrawn, not mapped)
- Withdrawal requires a reason (text input, mandatory)
- Count summary bar: "GEO Platform: 7/5 minimum" with green/red indicator
- Quick-add: search and add tools from the tool registry

**Technical Notes**:
- Enrollment validation: tool must have active ToolTrackMapping for the target track
- Withdrawal preserves all related ModelEvaluation, SynthesisRecord, and Score data
- Minimum count enforcement checked at cycle state transition, not at individual enrollment

**Out of Scope**:
- Automated tool enrollment based on rules or previous cycles
- Vendor-initiated enrollment requests (admin-only in v1)

---

#### Area 3: Evaluation Engine

---

#### F-007: AI Model Evaluation Execution

| Attribute | Value |
|-----------|-------|
| Type | WORKFLOW / INTEGRATION |
| Priority | P0 |
| Touched Entities | ModelEvaluation, AIModel, PromptSet, ScoringDimension, EvidenceArtifact, Tool, BenchmarkCycle |
| Dependencies | F-005, F-008, F-009 |
| Estimated Effort | XL (5+ days) |

**Description**: The core evaluation engine that executes AI model assessments of enrolled tools against each scoring dimension. For each tool-dimension combination in a cycle, the system sends the appropriate prompt to each of the 6 configured AI models, captures the raw output, extracts a suggested score and reasoning, and records the result. This is a semi-automated process: the system handles API calls, retries, and response parsing, but the operator reviews results and can flag issues before proceeding to synthesis. Implements BR-S07 (minimum model count), BR-S10 (retry policy), BR-S12 (failed evaluation retention), and BR-S15 (prompt linkage).

**User Story**: As the benchmark operator, I want to run AI model evaluations across all enrolled tools and dimensions with automated API orchestration and retry handling so that I can efficiently collect multi-model assessments while maintaining full traceability from score to prompt.

**Acceptance Criteria (GWT)**:

| AC ID | Given | When | Then |
|-------|-------|------|------|
| AC-007-01 | A cycle is in Evaluation state with 5 enrolled tools and 8 active scoring dimensions and 6 active AI models | The admin initiates evaluation for a specific tool-dimension pair | The system sends the matching PromptSet prompt to all 6 AI models, records a ModelEvaluation for each with the raw_output, suggested_score, reasoning, status, and prompt_id (BR-S15) |
| AC-007-02 | An AI model API call fails (timeout, error, or invalid response) | The system processes the failure | The system retries with exponential backoff (30s, 60s, 120s) up to 3 retries (BR-S10); if all retries fail, the ModelEvaluation is recorded with the appropriate failure status; the evaluation continues with remaining models |
| AC-007-03 | All 6 models have been attempted for a tool-dimension pair and 3 or fewer returned success | The evaluation results are displayed | The dimension is flagged as requiring manual evaluation (BR-S11); a visual indicator appears on the admin evaluation dashboard |
| AC-007-04 | The admin views the evaluation progress dashboard | The dashboard renders | A matrix view shows tools as rows, dimensions as columns, with each cell indicating: number of successful model evaluations (e.g., "5/6"), any failures, and whether the minimum threshold of 4 successes is met (BR-S07) |
| AC-007-05 | A model evaluation has been recorded with status = failed | The admin views the evaluation record | The failed evaluation is visible with its failure details; it cannot be deleted (BR-S12); it is excluded from synthesis calculations |

**UI/UX Notes**:
- Evaluation dashboard: matrix grid (tools x dimensions) with status cells
- Cell colors: green (6/6 success), yellow (4-5/6), orange (3/6, flagged), red (<3/6)
- Tool-dimension detail view: expandable panel showing each model's raw output, suggested score, reasoning, and status
- Batch execution controls: "Run All for Tool," "Run All for Dimension," "Run Single"
- Progress bar for batch operations with estimated time remaining
- Error log panel: filterable list of failed evaluations with retry option

**Technical Notes**:
- API calls are sequential per tool-dimension pair (to manage rate limits), parallelizable across different pairs
- Each API call records the exact prompt_id used (BR-S15) for full traceability
- Raw model outputs stored in full (ModelEvaluation.raw_output) -- no truncation
- Score extraction from model output uses structured output formats (JSON mode where available) with fallback regex parsing
- API key management: keys stored as environment variables, never in database
- Rate limit handling: respect per-provider rate limits with backoff queue

**Out of Scope**:
- Fully automated batch processing without operator oversight (semi-automated is the design)
- Real-time evaluation streaming to public pages
- Custom model fine-tuning or training

---

#### F-008: Prompt Set Management

| Attribute | Value |
|-----------|-------|
| Type | CRUD |
| Priority | P0 |
| Touched Entities | PromptSet, ScoringDimension, MethodologyVersion |
| Dependencies | F-013 |
| Estimated Effort | M (1-3 days) |

**Description**: Administrative interface for creating, versioning, and managing the prompt sets used in AI model evaluations. Each prompt is linked to a specific scoring dimension and methodology version. Prompts define the evaluation criteria the AI models use to assess tools, including the expected output format. The 70/30 rotation strategy (70% consistent across cycles for comparability, 30% refreshed to prevent gaming) is managed through prompt versioning.

**User Story**: As the benchmark operator, I want to create and version evaluation prompts for each scoring dimension so that AI model evaluations are consistent within a cycle and traceable across cycles while allowing controlled evolution of the evaluation approach.

**Acceptance Criteria (GWT)**:

| AC ID | Given | When | Then |
|-------|-------|------|------|
| AC-008-01 | An active methodology version and scoring dimensions exist | The admin creates a new prompt set for a dimension | The PromptSet record is created with prompt_text, expected_output_format, prompt_version, and references to the dimension_id and methodology_id |
| AC-008-02 | A prompt set is linked to a methodology version that is associated with an active cycle in Evaluation state | The admin attempts to modify the prompt text | The modification is rejected; the prompt is immutable for the active cycle (enforced via methodology lock, BR-S03) |
| AC-008-03 | The admin views the prompt management page | The page renders | All prompts are listed grouped by dimension, showing prompt version, status (active/deprecated), linked methodology version, and usage count across cycles |

**UI/UX Notes**:
- List view grouped by scoring dimension
- Prompt editor: rich text area with variable highlighting (tool name, dimension name placeholders)
- Version comparison: diff view between prompt versions
- Status toggle: active/deprecated with confirmation
- Preview mode: shows rendered prompt with sample tool data

**Technical Notes**:
- Prompt immutability enforced via methodology lock (BR-S03)
- New prompt versions create new records (not in-place updates)
- Expected output format should specify JSON structure for reliable parsing

**Out of Scope**:
- AI-assisted prompt generation or optimization
- A/B testing of prompts within a single cycle

---

#### F-009: AI Model Configuration Management

| Attribute | Value |
|-----------|-------|
| Type | CRUD |
| Priority | P0 |
| Touched Entities | AIModel, BenchmarkCycle |
| Dependencies | None |
| Estimated Effort | S (<1 day) |

**Description**: Administrative interface for managing the AI models used in evaluations. Tracks provider, model name, version, API identifier, and configuration parameters (temperature, max tokens, system prompt). Models are first-class entities to ensure reproducibility: every evaluation is linked to a specific model configuration, and that configuration is snapshot in the audit package.

**User Story**: As the benchmark operator, I want to register and configure the AI models used for evaluation so that each model's exact configuration is recorded for reproducibility and audit purposes.

**Acceptance Criteria (GWT)**:

| AC ID | Given | When | Then |
|-------|-------|------|------|
| AC-009-01 | The admin navigates to AI Model Management | The admin creates a new model entry | The AIModel record is created with provider, model_name, model_version, api_identifier, configuration_params (JSON including temperature, max_tokens, system_prompt), and status = active |
| AC-009-02 | A model has been used in at least one ModelEvaluation | The admin views the model record | The record shows first_used_cycle and last_used_cycle with links to those cycles; the model cannot be deleted (only retired) |

**UI/UX Notes**:
- Simple CRUD table: provider, model name, version, API identifier, status
- Configuration editor: JSON editor for configuration_params with validation
- Status toggle: active/retired (retired models excluded from new evaluations)
- Usage history: list of cycles where the model was used

**Technical Notes**:
- API identifiers must match the exact string used in API calls (e.g., "gpt-4o-2024-05-13")
- Configuration params validated as valid JSON with required keys (temperature, max_tokens)
- Retiring a model does not affect historical evaluations
- Target: 6 active models (2 OpenAI, 2 Anthropic, 2 Google as starting configuration)

**Out of Scope**:
- Automated model version detection or updates
- Model performance benchmarking or comparison

---

#### Area 4: Score Synthesis & Quality

---

#### F-011: Score Synthesis Pipeline

| Attribute | Value |
|-----------|-------|
| Type | WORKFLOW / ANALYTICS |
| Priority | P0 |
| Touched Entities | SynthesisRecord, ModelEvaluation, Score, ScoringDimension, AIModel |
| Dependencies | F-007 |
| Estimated Effort | XL (5+ days) |

**Description**: The synthesis pipeline takes the raw evaluations from multiple AI models and produces a single synthesized score per tool-dimension pair. It calculates model agreement (standard deviation), derives confidence tags deterministically (BR-S09), creates SynthesisRecord entries with full audit trail, and generates Score records. The pipeline supports median, mean, weighted median, and editorial override synthesis methods. Editorial overrides require documented rationale (BR-SYN02). The operator reviews synthesis results and can intervene where model disagreement is high or automated flagging occurs.

**User Story**: As the benchmark operator, I want to synthesize multi-model evaluation results into single dimension scores with deterministic confidence tags so that every published score has a clear, auditable derivation from individual model assessments.

**Acceptance Criteria (GWT)**:

| AC ID | Given | When | Then |
|-------|-------|------|------|
| AC-011-01 | A tool-dimension pair has 6 model evaluations with 5 successes (scores: 7, 7, 8, 7, 8) and 1 failure | The admin triggers synthesis for this pair | A SynthesisRecord is created with: method_used = median, model_agreement_score = standard deviation of [7,7,8,7,8], model_scores_snapshot containing all 6 evaluations (including the failed one), suggested_value = 7.0, final_value = 7; a Score record is created in Draft state with value = 7 and synthesis_id linking to this record |
| AC-011-02 | The model_agreement_score (standard deviation) is < 1.5 and 5 models succeeded | The confidence tag is computed | Score.confidence = "High" (per BR-S09) |
| AC-011-03 | The model_agreement_score is >= 2.5 or fewer than 4 models succeeded (but >= 3) | The confidence tag is computed | Score.confidence = "Low" (per BR-S09); the score is flagged for editorial attention on the synthesis dashboard |
| AC-011-04 | Fewer than 3 models returned success for a tool-dimension pair | The synthesis is attempted | Score.confidence = "Insufficient Data"; the score is flagged as requiring manual evaluation; the operator must provide editorial review before the score can transition from Draft |
| AC-011-05 | The operator disagrees with the computed synthesis and applies an editorial override | The operator enters the override value and rationale | SynthesisRecord.method_used = "editorial_override"; SynthesisRecord.editor_rationale is required and must be non-empty (BR-SYN02); the original computed values are preserved in the snapshot |
| AC-011-06 | A dimension is marked as not applicable for a tool (Score.is_applicable = false) | The synthesis processes this dimension | Score.value = null, Score.confidence = "Not Applicable", no synthesis computation is performed (BR-S08) |

**UI/UX Notes**:
- Synthesis dashboard: matrix view (tools x dimensions) showing synthesis status
- Cell detail: expandable to show all model scores, agreement metric, computed confidence, and override option
- Color coding by confidence: green (High), yellow (Medium), orange (Low), red (Insufficient Data)
- Editorial override panel: text area for rationale (validated as non-empty), with the original computed value shown for reference
- Batch synthesis: "Synthesize All" button with progress indicator
- Flagged items panel: filtered list of dimensions requiring attention (high disagreement, insufficient data, anomalies)

**Technical Notes**:
- Synthesis method default: median (most robust against outliers in small sample sizes)
- Standard deviation calculated across successful model evaluations only
- Confidence tag derivation is deterministic per BR-S09 thresholds
- SynthesisRecord.model_scores_snapshot stores complete data for all 6 attempts including failures
- Score.synthesis_id is required before Score can transition Draft to Reviewed (BR-SYN01)
- Rounding: suggested_value preserves decimals; final_value is integer (0-10), rounded to nearest

**Out of Scope**:
- Automated editorial override suggestion
- Machine learning-based synthesis weighting
- Real-time synthesis (batch processing is acceptable)

---

#### F-012: Composite Score & Ranking Calculation

| Attribute | Value |
|-----------|-------|
| Type | ANALYTICS |
| Priority | P0 |
| Touched Entities | CompositeScore, Score, ScoringDimension, BenchmarkTrackDefinition, CycleToolEnrollment |
| Dependencies | F-011 |
| Estimated Effort | M (1-3 days) |

**Description**: Calculates the composite (overall) score for each tool within a track by computing the weighted average of applicable dimension scores with renormalized weights (BR-S05). Assigns dense rankings with tie-breaking rules (BR-S14). This is the final calculation step before vendor review and publication.

**User Story**: As the benchmark operator, I want composite scores and rankings calculated automatically from dimension scores so that the leaderboard ordering is derived purely from methodology-defined weights with no manual ranking decisions.

**Acceptance Criteria (GWT)**:

| AC ID | Given | When | Then |
|-------|-------|------|------|
| AC-012-01 | All dimension scores for a tool on a track have been synthesized and the tool has 6 of 8 dimensions applicable | The admin triggers composite calculation | A CompositeScore record is created with composite_value calculated as the weighted average across only the 6 applicable dimensions with weights renormalized to sum to 100% (BR-S05); applicable_dimension_count = 6, total_dimension_count = 8 |
| AC-012-02 | Composite scores have been calculated for all 7 tools on a track; two tools have identical composite_value | Rankings are computed | Both tied tools receive the same rank; tie-breaking orders by count of High-confidence dimensions (descending), then alphabetically (BR-S14); the next rank after the tie is the next integer (dense ranking) |
| AC-012-03 | A tool has been withdrawn from the cycle | Composite scores are calculated | The withdrawn tool does not receive a rank and is excluded from the leaderboard (BR-T02); its composite score is still calculated for audit purposes but marked as withdrawn |
| AC-012-04 | A tool has zero applicable dimensions on a track | Composite calculation is attempted | No composite score is generated; the tool is excluded from the leaderboard for that track with a logged reason |

**UI/UX Notes**:
- Admin view: table showing all tools with composite scores, ranks, and a breakdown of the calculation (which dimensions contributed, their weights, renormalized weights)
- Visual indicator of tied tools
- Recalculation button with before/after comparison if scores have changed
- Withdrawn tool rows are grayed out with withdrawal reason shown

**Technical Notes**:
- Composite calculation formula: SUM(value * weight) / SUM(weight) for applicable dimensions only
- Ranking uses dense ranking (1, 2, 2, 4 not 1, 2, 2, 3)
- Calculation is deterministic and re-runnable (idempotent)
- CompositeScore records are overwritten on recalculation (not versioned; the underlying Scores and SynthesisRecords provide the audit trail)

**Out of Scope**:
- Segment-specific composite scores (all tools ranked in one pool per track; segment filtering is a UI-level concern on the leaderboard)
- Alternative ranking methods (only dense ranking in v1)

---

#### F-022: Cross-Cycle Anomaly Detection

| Attribute | Value |
|-----------|-------|
| Type | ANALYTICS |
| Priority | P1 |
| Touched Entities | Score, BenchmarkCycle, ScoringDimension, Tool |
| Dependencies | F-011 |
| Estimated Effort | M (1-3 days) |

**Description**: Implements BR-S13 (cross-cycle anomaly detection). When a dimension score for a tool changes by more than 3 points between consecutive published cycles, the system flags the score and requires an editorial note explaining the change before the score can transition from Draft to Reviewed. This protects benchmark credibility by ensuring large score swings are intentional and documented, not artifacts of evaluation errors.

**User Story**: As the benchmark operator, I want to be automatically alerted when a tool's score changes dramatically from the previous cycle so that I can investigate whether the change reflects a genuine product improvement/regression or an evaluation anomaly.

**Acceptance Criteria (GWT)**:

| AC ID | Given | When | Then |
|-------|-------|------|------|
| AC-022-01 | Tool X scored 8 on "Citation Accuracy" in the previous published cycle and scores 4 in the current draft cycle (a change of 4 points, exceeding the 3-point threshold) | The synthesis pipeline creates the draft score | The score is automatically flagged with a visual indicator; the admin sees a warning on the synthesis dashboard; the score cannot transition from Draft to Reviewed until Score.editorial_notes contains an explanation (BR-S13) |
| AC-022-02 | Tool Y scored 6 on a dimension in the previous cycle and scores 8 in the current cycle (a change of 2 points, below the 3-point threshold) | The synthesis pipeline creates the draft score | No anomaly flag is raised; the score can transition normally |
| AC-022-03 | A tool is being evaluated for the first time (no previous published cycle) | The synthesis creates the draft score | No anomaly comparison is performed; the score proceeds normally |

**UI/UX Notes**:
- Anomaly flags appear as warning icons on the synthesis dashboard matrix
- Clicking the flag shows: previous score, current score, delta, dimension name, and a text area for editorial notes
- Anomaly list view: all flagged scores across the current cycle in one filterable panel
- Resolved/unresolved status tracking

**Technical Notes**:
- Comparison is against the most recent published cycle containing a score for the same tool on the same track and dimension
- Absolute value comparison: |current - previous| > 3
- Only compares published scores (state = Published or Corrected), not draft scores from suspended/cancelled cycles
- Does not apply when previous score was N/A or current score is N/A

**Out of Scope**:
- Automated anomaly resolution or score adjustment
- Statistical trend analysis beyond the 3-point threshold
- Anomaly detection based on cross-tool patterns (only per-tool, per-dimension)

---

#### Area 5: Vendor Management

---

#### F-010: Vendor & Tool Administration

| Attribute | Value |
|-----------|-------|
| Type | CRUD |
| Priority | P0 |
| Touched Entities | Vendor, Tool, ToolTrackMapping, ToolSegmentMapping, BenchmarkTrackDefinition, MarketSegment |
| Dependencies | None |
| Estimated Effort | M (1-3 days) |

**Description**: Administrative interface for managing the vendor and tool registry. This is the foundational data layer: vendors are companies, tools are their products, and each tool is mapped to applicable tracks and market segments. For MVP, this is admin-only (no vendor self-service). The interface supports the initial population of 27+ tools across 7 market segments for the GEO Platform track.

**User Story**: As the benchmark operator, I want to maintain a registry of vendors and their tools with track and segment assignments so that I have a clean, structured dataset for benchmark cycle enrollment.

**Acceptance Criteria (GWT)**:

| AC ID | Given | When | Then |
|-------|-------|------|------|
| AC-010-01 | The admin navigates to Vendor Management | The admin creates a new vendor | A Vendor record is created with company_name (unique), website_url, contact_email, contact_name, vendor_status = pending_review, and disclosure_status = none |
| AC-010-02 | A vendor exists and the admin adds a tool | The admin creates a tool for the vendor | A Tool record is created linked to the vendor_id; the admin can then assign the tool to tracks (via ToolTrackMapping) and segments (via ToolSegmentMapping) |
| AC-010-03 | The admin assigns a tool to the GEO Platform track | The ToolTrackMapping record is created | The tool becomes eligible for enrollment in cycles on that track; the mapping records first_cycle_id as null until the tool is first enrolled |
| AC-010-04 | The admin assigns a tool to multiple market segments | The ToolSegmentMapping records are created | The tool appears in segment-filtered views on the public leaderboard for each assigned segment |

**UI/UX Notes**:
- Vendor list: searchable table with columns for company name, tool count, disclosure status, vendor status
- Tool list (within vendor detail): tool name, tracks, segments, status, pricing model
- Track assignment: checkbox interface showing available tracks
- Segment assignment: multi-select dropdown or checkbox group
- Batch import: CSV upload for initial tool population (27+ tools)
- Inline editing for quick updates

**Technical Notes**:
- Vendor company_name must be unique (database constraint)
- Tool deletion is soft (status = inactive), not hard delete, to preserve referential integrity
- ToolTrackMapping.first_cycle_id is set automatically when the tool is first enrolled in a cycle on that track
- Initial data load: 27+ tools with pre-defined track and segment assignments

**Out of Scope**:
- Vendor self-registration portal
- Automated vendor data enrichment (manual entry in v1)
- Vendor communication tracking (email history, etc.)

---

#### F-015: Vendor Review Workflow

| Attribute | Value |
|-----------|-------|
| Type | WORKFLOW |
| Priority | P0 |
| Touched Entities | VendorCorrection, VendorDisclosure, Score, BenchmarkCycle, Tool, Vendor, ScoringDimension |
| Dependencies | F-011 |
| Estimated Effort | L (3-5 days) |

**Description**: Implements the vendor review window (5 business days) during the VendorReview state. The operator (admin) accesses the vendor portal on behalf of each vendor (no vendor self-service login in v1) to review dimension-level scores for their tools and submit corrections. Vendors see only their own tool's individual dimension scores and editorial notes -- not composite scores, rankings, or other vendors' data (BR-V04). The workflow tracks correction submissions, resolution status, and ensures the cycle can proceed to Publication after the window closes regardless of unresolved disputes (BR-V05). Vendor disclosures are also managed here.

**User Story**: As the benchmark operator, I want to manage the vendor review process where vendors can review their dimension scores and submit factual corrections within a 5-day window so that the benchmark process is fair and vendors have an opportunity to correct errors before publication.

**Acceptance Criteria (GWT)**:

| AC ID | Given | When | Then |
|-------|-------|------|------|
| AC-015-01 | A cycle transitions to VendorReview state | The vendor review window opens | A 5-business-day timer starts; the admin can access the vendor review portal to see each vendor's tool scores (dimension-level only, no composite or rank per BR-V04) |
| AC-015-02 | The admin is reviewing scores on behalf of a vendor during VendorReview state | The admin submits a VendorCorrection for a specific tool-dimension score | A VendorCorrection record is created with status = submitted, including the vendor's claim and optional supporting evidence; the targeted score is flagged for review |
| AC-015-03 | A VendorCorrection has been submitted | The admin reviews and accepts the correction | The correction status changes to accepted; resolution_notes are recorded; the admin can modify the score (creating a new synthesis if needed) |
| AC-015-04 | A VendorCorrection has been submitted | The admin reviews and rejects the correction | The correction status changes to rejected; resolution_notes explain why; the original score stands |
| AC-015-05 | The 5-business-day window has closed and 2 vendor corrections remain unresolved | The admin triggers transition from VendorReview to Publication | The transition proceeds (BR-V05); unresolved corrections are documented in the BenchmarkReport |
| AC-015-06 | The admin records a vendor disclosure for a cycle | The VendorDisclosure is created | The disclosure_type and description are recorded; the vendor's disclosure_status is updated; the disclosure is displayed on the tool's public detail page after publication |

**UI/UX Notes**:
- Vendor review portal (admin-accessed): per-vendor view showing only that vendor's tools and dimension scores
- Score display: dimension name, score value, confidence tag, editorial notes
- Correction submission form: claim text (required), supporting evidence (optional file upload or URL), target dimension
- Correction management dashboard: list of all corrections with status filters (submitted, under review, accepted, rejected)
- Timer display: days remaining in vendor review window
- Disclosure management: form for recording vendor disclosures with type categorization

**Technical Notes**:
- Vendor review portal is accessed by the admin on the vendor's behalf (no vendor authentication in v1)
- In practice for v1: the operator emails vendors a PDF or summary of their scores, vendors reply with corrections via email, and the operator enters corrections into the system
- BR-V04 strictly enforced: vendor portal view filters data to only the authenticated vendor's tools
- 5-business-day calculation: excludes weekends and configurable holidays
- Post-publication corrections accepted as feedback but tracked separately (BR-V02)

**Out of Scope**:
- Vendor self-service authentication and login
- Automated email notifications to vendors (manual email in v1)
- Vendor portal for direct vendor access (admin-mediated in v1)

---

#### Area 6: Reporting & Publication

---

#### F-014: Report Generation & Publication

| Attribute | Value |
|-----------|-------|
| Type | WORKFLOW |
| Priority | P0 |
| Touched Entities | BenchmarkReport, BenchmarkCycle, CycleAuditPackage, Badge, CompositeScore |
| Dependencies | F-012, F-016 |
| Estimated Effort | L (3-5 days) |

**Description**: Generates the published benchmark report for a completed cycle. The report includes executive summary, track leaderboards, tool detail summaries, methodology notes, vendor disclosure summaries, and any correction notes. Publication triggers the cycle transition from Publication to Completed, makes all scores publicly accessible, and awards badges to qualifying tools. The report is the primary deliverable of each benchmark cycle.

**User Story**: As the benchmark operator, I want to generate and publish a comprehensive benchmark report that packages all cycle results into a professional, accessible format so that practitioners can access the complete findings and the benchmark's monthly cadence commitment is fulfilled.

**Acceptance Criteria (GWT)**:

| AC ID | Given | When | Then |
|-------|-------|------|------|
| AC-014-01 | A cycle is in Publication state with the audit package sealed (BR-AUD01), all scores in Reviewed state, and composite scores calculated | The admin triggers report generation | A BenchmarkReport record is created with title, executive_summary, methodology_notes, and full_report_url; all associated Scores transition from Reviewed to Published |
| AC-014-02 | The report has been generated | The admin publishes the report | The cycle transitions to Completed; the publication_date is set on the BenchmarkCycle; all report data becomes accessible on public pages |
| AC-014-03 | The benchmark report is published and a tool's composite score meets the "Top Performer" threshold (top 3 in track) | Badges are awarded | Badge records are created for qualifying tools with badge_type, badge_label, badge_image_url, and embed_code; badges appear on tool detail and leaderboard pages |
| AC-014-04 | Unresolved vendor corrections exist at publication time | The report includes correction notes | The BenchmarkReport.methodology_notes section includes a summary of unresolved vendor claims with their current status |

**UI/UX Notes**:
- Report generation wizard: step-by-step (1. Review scores, 2. Write executive summary, 3. Review methodology notes, 4. Generate, 5. Publish)
- Executive summary editor: rich text with auto-populated data points (total tools evaluated, cycle date range, top performers)
- Publication confirmation: final checklist showing all prerequisites (audit package sealed, all scores reviewed, minimum tool counts met)
- Post-publication view: the report as it appears publicly, with an admin "Edit Summary" option for corrections

**Technical Notes**:
- Score state transition (Reviewed to Published) is batch operation triggered by publication
- Badge criteria: configurable thresholds (default: top 3 tools by composite score = "Top Performer")
- Badge embed code: simple HTML/JS snippet vendors can place on their websites
- Report URL structure: `/cycles/2026-03` with SEO-friendly paths
- Publication is a one-way operation: once published, scores cannot be unpublished (only corrected)

**Out of Scope**:
- PDF report generation (HTML only in v1)
- Automated report narrative generation by AI
- Social media sharing automation
- Embeddable report widgets for third-party sites

---

#### F-016: Audit Package Generation

| Attribute | Value |
|-----------|-------|
| Type | WORKFLOW |
| Priority | P0 |
| Touched Entities | CycleAuditPackage, MethodologyVersion, PromptSet, AIModel, CycleToolEnrollment, Tool |
| Dependencies | F-011 |
| Estimated Effort | M (1-3 days) |

**Description**: Generates and seals the immutable audit package for a benchmark cycle (BR-AUD01, BR-AUD02). The audit package captures complete snapshots of all evaluation inputs: methodology version, prompt sets, AI model configurations, tool enrollment, and tool data at the time of generation. Once sealed, the package cannot be modified. The sealed audit package is a prerequisite for the cycle transitioning from VendorReview to Publication. This feature is central to the transparency and auditability commitments that underpin AISearchArena's credibility.

**User Story**: As the benchmark operator, I want to generate an immutable audit package that captures every evaluation input for a cycle so that anyone can verify the benchmark's methodology, data, and process after publication.

**Acceptance Criteria (GWT)**:

| AC ID | Given | When | Then |
|-------|-------|------|------|
| AC-016-01 | A cycle is in Synthesis or VendorReview state with all evaluations and syntheses complete | The admin triggers audit package generation | A CycleAuditPackage record is created with JSON snapshots of: methodology version, all prompt sets used, all AI model configurations, all tool enrollment records with track/segment assignments; is_sealed = false initially |
| AC-016-02 | An audit package has been generated and reviewed | The admin seals the package | is_sealed is set to true; a generated_at timestamp is recorded; the package content becomes immutable (BR-AUD02) |
| AC-016-03 | An audit package is sealed (is_sealed = true) | Any attempt is made to modify the package record | The modification is rejected at the application level (BR-AUD02) |
| AC-016-04 | A cycle is in VendorReview state and no sealed audit package exists | The admin attempts to transition to Publication | The transition is rejected with a message citing the audit package requirement (BR-AUD01) |

**UI/UX Notes**:
- Audit package page: shows current status (not generated, generated-unsealed, sealed)
- Preview mode: review snapshot contents before sealing
- Seal button with confirmation dialog explaining immutability
- Download option: export audit package as JSON file (file_url)
- Public audit page (`/cycles/:cycleId/audit`): downloadable sealed package for any completed cycle

**Technical Notes**:
- JSON snapshots capture the complete state of each entity at the time of generation (deep copy, not references)
- Immutability enforced at application level (all update operations check is_sealed before proceeding)
- File export: JSON file stored in cloud storage with integrity hash
- Package size consideration: for 27 tools x 8 dimensions x 6 models = ~1,296 evaluation records; JSON should be manageable

**Out of Scope**:
- Cryptographic signing of audit packages (P3 consideration)
- Third-party audit verification service integration
- Automated comparison between audit packages across cycles

---

#### F-019: Badge Awarding & Display

| Attribute | Value |
|-----------|-------|
| Type | WORKFLOW / CRUD |
| Priority | P1 |
| Touched Entities | Badge, CompositeScore, Tool, BenchmarkCycle, BenchmarkTrackDefinition |
| Dependencies | F-012 |
| Estimated Effort | M (1-3 days) |

**Description**: Awards badges to tools that meet defined achievement thresholds within a benchmark cycle. Badge types include Top Performer (top 3 composite score), Category Leader (highest in a segment), Most Improved (largest positive score change from previous cycle), and Newcomer (first cycle evaluated). Badges are displayed on public pages and include embeddable code vendors can use on their own websites. Badges reinforce the benchmark's value to vendors and create a virtuous cycle of vendor engagement.

**User Story**: As the benchmark operator, I want to award visual badge certifications to top-performing tools so that vendors have a tangible, shareable indicator of their benchmark performance, which increases vendor engagement and benchmark visibility.

**Acceptance Criteria (GWT)**:

| AC ID | Given | When | Then |
|-------|-------|------|------|
| AC-019-01 | Composite scores are calculated for a cycle and a tool ranks in the top 3 on a track | The admin triggers badge awarding | A Badge record is created with badge_type = top_performer, a descriptive badge_label (e.g., "Top Performer -- GEO Platform -- March 2026"), badge_image_url, and embed_code |
| AC-019-02 | A badge has been awarded | A visitor views the tool's detail page or the leaderboard | The badge icon is displayed prominently next to the tool name with the badge label as alt text/tooltip |
| AC-019-03 | A vendor wants to display the badge on their website | The vendor accesses the badge embed code | The embed_code provides a working HTML snippet that renders the badge image with a link back to the tool's AISearchArena detail page |

**UI/UX Notes**:
- Badge design: clean, professional icons per badge type (no flashy graphics -- aligned with "Rigor" brand essence)
- Leaderboard: badge icon in the rank column
- Tool detail: badge section showing all earned badges across cycles
- Admin: badge configuration page for defining thresholds and reviewing/approving awards
- Embed code: simple, self-contained HTML (no external JS dependencies)

**Technical Notes**:
- Badge thresholds configurable but defaulting to: Top Performer = top 3 by composite score, Category Leader = #1 in each segment, Most Improved = largest positive delta from previous cycle, Newcomer = first cycle on track
- Badge images: static SVG or PNG stored in cloud storage
- Embed code includes a canonical link back to the tool's AISearchArena page for backlink value
- Withdrawn tools are not eligible for badges (BR-T02)

**Out of Scope**:
- Custom badge designs per vendor request
- Paid or premium badge tiers
- Badge revocation workflow (badges are tied to the cycle; new cycles award new badges)

---

#### F-020: Cycle Archive & Historical Access

| Attribute | Value |
|-----------|-------|
| Type | CRUD |
| Priority | P1 |
| Touched Entities | BenchmarkCycle, BenchmarkReport, CompositeScore, CycleAuditPackage |
| Dependencies | F-014 |
| Estimated Effort | M (1-3 days) |

**Description**: Provides public access to all past published benchmark cycles, their reports, results, and audit packages. The archive is central to the "Build the Record" value: longitudinal data is a key differentiator and moat. This feature ensures that historical cycles remain accessible and discoverable, supporting trend analysis and demonstrating the benchmark's consistency over time.

**User Story**: As a practitioner researching tool performance trends, I want to access any past benchmark cycle's complete results and report so that I can evaluate how tools have performed over time and assess the benchmark's track record.

**Acceptance Criteria (GWT)**:

| AC ID | Given | When | Then |
|-------|-------|------|------|
| AC-020-01 | Three published cycles exist (March, April, May 2026) | A visitor navigates to `/cycles` | The page displays all three cycles in reverse chronological order with: cycle name, publication date, number of tools evaluated, and links to the full report and audit package |
| AC-020-02 | A visitor selects a specific past cycle | The visitor navigates to `/cycles/2026-03` | The page displays the complete report for that cycle: executive summary, leaderboard as of that cycle, methodology version used, and a link to download the audit package |

**UI/UX Notes**:
- Archive list: card or table layout, reverse chronological
- Cycle card: cycle name, date range, publication date, tool count, methodology version indicator
- Cycle detail: full report view identical to current cycle but with "Historical Cycle" header
- Audit package download link: prominent placement
- Navigation: breadcrumb (Home > Cycle Archive > March 2026)

**Technical Notes**:
- Archive pages are static/cached (content does not change after publication)
- Audit package download: direct link to stored JSON file
- URL structure: `/cycles/2026-03` (year-month format for readability)
- Historical leaderboards use the scores as published (not retroactively recalculated)

**Out of Scope**:
- Cross-cycle trend charts on the archive page (trend data lives on tool detail pages, F-003)
- Search within historical reports
- Side-by-side cycle comparison

---

#### Area 7: Content, SEO & Infrastructure

---

#### F-017: Methodology Public Pages

| Attribute | Value |
|-----------|-------|
| Type | CRUD |
| Priority | P0 |
| Touched Entities | MethodologyVersion, ScoringDimension, BenchmarkTrackDefinition |
| Dependencies | F-013 |
| Estimated Effort | M (1-3 days) |

**Description**: Public-facing pages that document the complete benchmark methodology. This is arguably the most important content on the site: methodology transparency is the primary trust signal and key differentiator. The pages include the current methodology version with all scoring dimensions, weights, rubrics, prompt rotation strategy explanation, confidence tag definitions, and the conflict of interest disclosure. A methodology history page shows all version changes with changelogs.

**User Story**: As a practitioner deciding whether to trust the benchmark, I want to read the complete evaluation methodology including scoring rubrics, dimension weights, and confidence tag definitions so that I can verify the benchmark's rigor and determine how much weight to give its scores.

**Acceptance Criteria (GWT)**:

| AC ID | Given | When | Then |
|-------|-------|------|------|
| AC-017-01 | An active methodology version exists with scoring dimensions defined | A visitor navigates to `/methodology` | The page displays: the methodology version number, effective date, all tracks with their scoring dimensions (name, description, weight percentage, evaluation criteria/rubric), the 70/30 prompt rotation strategy explanation, confidence tag definitions and thresholds, and the conflict of interest disclosure statement |
| AC-017-02 | Multiple methodology versions exist (at least one superseded) | A visitor navigates to `/methodology/history` | The page displays all methodology versions in reverse chronological order with: version number, effective date, status (active/superseded), and changelog for each version after 1.0.0 |
| AC-017-03 | The methodology page is loaded | A visitor reviews the content | The conflict of interest disclosure statement appears in a prominent, styled callout block (not buried in body text), matching the disclosure format specified in the positioning document |

**UI/UX Notes**:
- Methodology page structure: Table of contents (anchor links), overview, track-by-track dimension tables, scoring rubric detail sections, confidence tag system, prompt rotation strategy, disclosure statement
- Dimension tables: dimension name, weight (%), description, scoring rubric (0-10 scale descriptors)
- Confidence tag visual guide: color-coded examples matching the tags used on score displays
- Version history: accordion or expandable sections per version with diff-like changelog
- Print-friendly: methodology page should print cleanly for offline reference
- "Last updated" timestamp prominently displayed

**Technical Notes**:
- Content is rendered from MethodologyVersion and ScoringDimension data (not hardcoded static pages)
- Methodology page is regenerated when a new methodology version becomes active
- SEO: "AISearchArena Methodology" should be a high-ranking page for trust and authority
- Static/cached: content changes only when methodology versions change

**Out of Scope**:
- Interactive methodology exploration tools
- Methodology feedback form (v1 uses email for methodology questions)
- Downloadable methodology document (PDF) -- the web page is the canonical version

---

#### F-013: Methodology Version Management

| Attribute | Value |
|-----------|-------|
| Type | CRUD / WORKFLOW |
| Priority | P0 |
| Touched Entities | MethodologyVersion, ScoringDimension, BenchmarkTrackDefinition |
| Dependencies | None |
| Estimated Effort | M (1-3 days) |

**Description**: Administrative interface for creating, editing, and publishing methodology versions. Each version captures the complete evaluation framework: dimension definitions, weights, scoring rubrics, and change logs. Methodology versions are linked to benchmark cycles and locked once a cycle enters Evaluation (BR-S03). This ensures that scoring criteria are stable within a cycle and that changes between cycles are documented and transparent.

**User Story**: As the benchmark operator, I want to create and manage versioned methodology definitions with scoring dimensions and weights so that each benchmark cycle operates under a defined, immutable methodology and changes between cycles are documented.

**Acceptance Criteria (GWT)**:

| AC ID | Given | When | Then |
|-------|-------|------|------|
| AC-013-01 | The admin navigates to the methodology editor | The admin creates a new methodology version | A MethodologyVersion record is created in draft status with version_number (semver format), description, and dimensions_snapshot (JSON); the admin can add/modify scoring dimensions with names, descriptions, weights, and rubrics |
| AC-013-02 | All dimension weights for a track within a methodology version have been set | The admin attempts to activate the methodology version | The system validates that weights sum to exactly 100.00 for each track (BR-S04); if valid, the version status changes to active and any previously active version becomes superseded |
| AC-013-03 | A methodology version is linked to a cycle in Evaluation or later state | The admin attempts to modify the methodology version | The modification is rejected (BR-S03); a message indicates the version is locked by an active cycle |

**UI/UX Notes**:
- Version list: version number, status (draft/active/superseded), effective date, linked cycles
- Dimension editor: sortable table with inline editing for name, weight, description, rubric
- Weight validation: real-time sum display per track with pass/fail indicator
- Changelog editor: required for versions after 1.0.0
- Clone button: create new draft version from existing version (for incremental changes)

**Technical Notes**:
- Weight validation: SUM(weight_percent) = 100.00 per track, enforced at save and at activation
- Methodology lock: checked against BenchmarkCycle state when update is attempted
- dimensions_snapshot (JSON): deep copy of all dimension definitions at the point of version creation
- scoring_rubric (JSON): structured rubric definitions per dimension
- Semver format validation on version_number

**Out of Scope**:
- Collaborative editing or approval workflows (solopreneur project; one editor)
- Automated methodology optimization based on evaluation results
- Public commenting on methodology drafts

---

#### F-024: Static Content & About Pages

| Attribute | Value |
|-----------|-------|
| Type | CRUD |
| Priority | P0 |
| Touched Entities | None (static content) |
| Dependencies | None |
| Estimated Effort | S (<1 day) |

**Description**: Static content pages that establish AISearchArena's identity, purpose, and credibility. Includes the About page (mission, purpose, relationship to AI Search Mastery, conflict disclosure), tool submission guidance, and contact information. These pages must exist before the first benchmark publishes to establish trust and context (per positioning document Section 13).

**User Story**: As a practitioner or vendor encountering AISearchArena for the first time, I want to understand who operates the benchmark, what their motivations are, and how conflicts of interest are managed so that I can make an informed judgment about the benchmark's credibility.

**Acceptance Criteria (GWT)**:

| AC ID | Given | When | Then |
|-------|-------|------|------|
| AC-024-01 | A visitor navigates to `/about` | The page loads | The page displays: the benchmark's purpose and mission (from vision-mission document), the relationship to AI Search Mastery, the conflict of interest disclosure with structural safeguards, and contact information |
| AC-024-02 | A vendor navigates to `/submit` | The page loads | The page displays: guidance for vendors who want their tool included in the benchmark, including the evaluation criteria overview, the vendor disclosure template, and a contact form or email address for submissions |

**UI/UX Notes**:
- About page: professional, text-focused layout; no marketing fluff; brand essence of "Rigor" reflected in direct, substantive content
- Team/operator section: brief, authentic (solopreneur context)
- Disclosure section: identical language to the disclosure statement in the positioning document
- Submit page: clear, honest expectations about evaluation process; not a sales funnel
- Footer: "Part of AI Search Mastery" attribution (consistent with brand architecture)

**Technical Notes**:
- Static pages: markdown or hardcoded HTML/content (not database-driven)
- SEO: appropriate meta tags, structured data for organization
- Must be live before first benchmark publication

**Out of Scope**:
- Blog or news section
- FAQ page (fold into methodology and about pages)
- Career page or team profiles beyond operator bio

---

#### F-025: Admin Authentication

| Attribute | Value |
|-----------|-------|
| Type | WORKFLOW |
| Priority | P0 |
| Touched Entities | None (infrastructure) |
| Dependencies | None |
| Estimated Effort | S (<1 day) |

**Description**: Simple authentication gate for the admin panel. This is a solopreneur project with a single admin user. The implementation should be minimal: a single username/password or magic link, with session management. No RBAC, no user management, no registration flow. The only purpose is to prevent unauthorized access to the admin panel and vendor portal management features.

**User Story**: As the benchmark operator, I want the admin panel to be protected by authentication so that only I can access evaluation management, scoring, and publication controls.

**Acceptance Criteria (GWT)**:

| AC ID | Given | When | Then |
|-------|-------|------|------|
| AC-025-01 | An unauthenticated visitor navigates to any `/admin/*` route | The page loads | The visitor is redirected to a login page; no admin content is exposed |
| AC-025-02 | The admin enters valid credentials | The login form is submitted | The admin is authenticated, a session is created, and the admin is redirected to the admin dashboard |
| AC-025-03 | An authenticated admin session has been idle for more than 24 hours | The admin attempts to access an admin page | The session has expired; the admin is redirected to the login page |

**UI/UX Notes**:
- Minimal login page: username/password or email-based magic link
- No "forgot password" flow needed (solopreneur can reset via environment variables or database)
- No branding beyond site name on login page

**Technical Notes**:
- Single admin user: credentials stored as hashed environment variable or in a single-row auth table
- Session: server-side session or JWT with 24-hour expiry
- All `/admin/*` and `/vendor-portal/*` routes require authentication middleware
- No rate limiting beyond basic brute-force protection (account lockout after 5 failed attempts)

**Out of Scope**:
- Multi-user authentication or user management
- Role-based access control (RBAC)
- OAuth or social login
- Two-factor authentication (P3 consideration for security hardening)

---

#### F-018: Evidence Artifact Capture & Storage

| Attribute | Value |
|-----------|-------|
| Type | CRUD / INTEGRATION |
| Priority | P0 |
| Touched Entities | EvidenceArtifact, ModelEvaluation |
| Dependencies | F-007 |
| Estimated Effort | M (1-3 days) |

**Description**: Manages the capture, upload, and storage of evidence artifacts that substantiate evaluation scores. Every score with is_applicable = true must be backed by at least one evidence artifact (BR-S06). Artifacts include screenshots, URLs, API responses, documents, and videos. The feature supports both automated capture (screenshots during evaluation) and manual upload (admin adds supplementary evidence). Evidence artifacts are linked to specific model evaluations and are included in the public audit trail.

**User Story**: As the benchmark operator, I want to capture and attach evidence artifacts to model evaluations so that every published score is backed by verifiable proof and the benchmark's evidence-based claims are substantiated.

**Acceptance Criteria (GWT)**:

| AC ID | Given | When | Then |
|-------|-------|------|------|
| AC-018-01 | A model evaluation has been completed for a tool-dimension pair | The admin uploads or the system captures a screenshot as evidence | An EvidenceArtifact record is created with artifact_type, file_url (cloud storage), description, and captured_at timestamp, linked to the evaluation_id |
| AC-018-02 | A score has is_applicable = true and is being transitioned from Draft to Reviewed | The system checks for evidence | The transition is blocked if the linked model evaluations have zero evidence artifacts (BR-S06); an error message lists the dimensions lacking evidence |
| AC-018-03 | A visitor views a tool detail page for a published score | The visitor looks for evidence | Evidence artifact links (screenshots, URLs) are accessible from the dimension detail section of the tool page |

**UI/UX Notes**:
- Upload interface: drag-and-drop file upload within the evaluation detail view
- Artifact types: icon-coded (camera for screenshot, link for URL, document for files)
- Artifact preview: thumbnail view for images, clickable links for URLs
- Artifact count indicator on the evaluation matrix (shows N artifacts per cell)
- Bulk screenshot capture: optional integration with screenshot API for automated captures

**Technical Notes**:
- File storage: cloud storage (S3 or R2) for uploaded files; URLs stored as references
- Supported file types: PNG, JPG, PDF, MP4 (with size limits)
- Evidence artifacts are never deleted (aligned with evaluation data retention policy)
- Public access: evidence artifacts linked to published scores are publicly accessible via their file_url
- Screenshot API integration (optional): automated screenshot capture during evaluation using ScreenshotOne or similar service

**Out of Scope**:
- Video recording of evaluation processes
- AI-assisted evidence analysis or summarization
- Evidence artifact versioning (artifacts are immutable once created)

---

#### F-021: Vendor Directory & Profile Pages

| Attribute | Value |
|-----------|-------|
| Type | CRUD |
| Priority | P1 |
| Touched Entities | Vendor, Tool, VendorDisclosure, Badge |
| Dependencies | F-010 |
| Estimated Effort | S (<1 day) |

**Description**: Public-facing vendor directory and individual vendor profile pages. The directory lists all vendors whose tools have been evaluated, with their disclosure status prominently displayed (BR-V01). Individual vendor profiles show the vendor's information, their tools, disclosure history, and earned badges across cycles. This supports the transparency commitment by making vendor engagement visible.

**User Story**: As a practitioner, I want to browse the vendor directory to see which companies have tools in the benchmark and check their disclosure status so that I can assess vendor transparency alongside tool performance.

**Acceptance Criteria (GWT)**:

| AC ID | Given | When | Then |
|-------|-------|------|------|
| AC-021-01 | Multiple vendors with published benchmark results exist | A visitor navigates to `/vendors` | The page displays a searchable list of vendors showing: company name, number of tools evaluated, disclosure status indicator (full/partial/none per BR-V01), and links to vendor profile pages |
| AC-021-02 | A visitor navigates to a vendor profile (`/vendors/:vendorId`) | The page loads | The page displays: vendor name, website, disclosure status with details, list of their tools with latest composite scores and badge indicators, and disclosure history across cycles |

**UI/UX Notes**:
- Directory: searchable, sortable table or card grid
- Disclosure status: color-coded badge (green = full, yellow = partial, red = none with "No Disclosure on File" label per BR-V01)
- Vendor profile: clean layout with tool cards showing latest scores
- No vendor marketing content or endorsements -- data only

**Technical Notes**:
- Vendor profiles are generated from existing data (Vendor, Tool, VendorDisclosure, Badge entities)
- Only vendors with at least one tool in a published cycle appear in the directory
- SEO: vendor profiles can rank for "[vendor name] benchmark" searches

**Out of Scope**:
- Vendor-editable profiles
- Vendor comparison views
- Vendor rating or endorsement system

---

#### F-023: Score Correction Workflow (Post-Publication)

| Attribute | Value |
|-----------|-------|
| Type | WORKFLOW |
| Priority | P2 |
| Touched Entities | ScoreCorrection, Score, BenchmarkCycle |
| Dependencies | F-014 |
| Estimated Effort | S (<1 day) |

**Description**: Handles corrections to published scores (BR-S02). After a benchmark is published, if an error is discovered or a vendor correction is accepted post-publication, the operator can apply a score correction. Every correction creates a ScoreCorrection record preserving the original value, requires a documented reason, and transitions the Score state to Corrected. Corrections are publicly visible with timestamps, maintaining the transparency commitment.

**User Story**: As the benchmark operator, I want to correct a published score when an error is confirmed so that the benchmark record is accurate while maintaining a transparent history of all changes.

**Acceptance Criteria (GWT)**:

| AC ID | Given | When | Then |
|-------|-------|------|------|
| AC-023-01 | A score has state = Published and an error has been confirmed | The admin applies a correction | A ScoreCorrection record is created with previous_value, new_value, reason, corrected_by, and approved_by (must differ from corrected_by per BR-S02); the Score.value is updated and Score.state transitions to Corrected |
| AC-023-02 | A score has been corrected | A visitor views the tool detail page | The corrected score displays with a "Corrected" indicator; clicking the indicator shows the correction history (original value, new value, reason, date) |

**UI/UX Notes**:
- Admin: correction form requiring all BR-S02 fields
- Public: subtle "Corrected" badge on the score with expandable correction history
- Correction reason displayed transparently -- no attempt to hide that a change was made

**Technical Notes**:
- BR-S02 requires corrected_by and approved_by to differ; for a solopreneur project, this means the operator must use two distinct identifiers (e.g., "operator" and "editor" roles, even if the same person, to maintain the audit trail convention)
- Multiple corrections to the same score are supported (Corrected to Corrected transitions); full version history maintained
- Composite scores and rankings should be recalculated when a score is corrected

**Out of Scope**:
- Automated notifications to vendors when their tool's score is corrected
- Public correction request form (corrections are admin-initiated in v1)
- Batch corrections

---

### 3.3 MVP Feature Set

The MVP targets the March 2026 launch of the first complete benchmark cycle for the GEO Platform track with a minimum of 5 evaluated tools. All P0 features are required for MVP.

| Feature ID | Feature Name | Rationale for MVP Inclusion |
|-----------|-------------|---------------------------|
| F-001 | Public Homepage & Current Cycle Highlights | Entry point for all visitors; establishes brand presence and displays benchmark results |
| F-002 | Track Leaderboard | Core benchmark deliverable; the primary view practitioners use to compare tools by rank |
| F-003 | Tool Detail Page | Essential for practitioner decision-making; provides the dimension-level detail behind each score |
| F-005 | Benchmark Cycle Lifecycle Management | Foundational workflow; every other admin feature depends on the cycle state machine |
| F-006 | Tool Enrollment & Track Assignment | Required to populate each cycle with tools; enforces minimum tool counts |
| F-007 | AI Model Evaluation Execution | Core engine; produces the raw multi-model evaluations that feed synthesis |
| F-008 | Prompt Set Management | Required to define what the AI models evaluate; linked to methodology version |
| F-009 | AI Model Configuration Management | Required to register and configure the 6 AI models used in evaluation |
| F-010 | Vendor & Tool Administration | Foundational data layer; required to register the 27+ tools before any evaluation can occur |
| F-011 | Score Synthesis Pipeline | Transforms raw model evaluations into publishable scores with confidence tags; core quality mechanism |
| F-012 | Composite Score & Ranking Calculation | Produces the leaderboard rankings from dimension scores; required for meaningful benchmark results |
| F-013 | Methodology Version Management | Required to define and lock the evaluation framework before any cycle runs |
| F-014 | Report Generation & Publication | Produces the published benchmark report; the primary monthly deliverable |
| F-015 | Vendor Review Workflow | Required for fairness commitment; vendors must have the opportunity to review scores before publication |
| F-016 | Audit Package Generation | Required for transparency commitment; sealed audit package is a prerequisite for publication |
| F-017 | Methodology Public Pages | Must be live before first benchmark publishes; primary trust signal for new visitors |
| F-018 | Evidence Artifact Capture & Storage | Required for evidence-based claims; every applicable score must be backed by evidence |
| F-024 | Static Content & About Pages | Must exist before launch; establishes identity, discloses conflicts, provides context |
| F-025 | Admin Authentication | Security baseline; admin panel must not be publicly accessible |

**MVP Feature Count**: 19 features (all P0)

**Estimated MVP Effort**: 51-73 days of development effort (solo developer)

| Effort Category | Feature Count | Day Range |
|----------------|--------------|-----------|
| XL (5+ days) | 3 features (F-005, F-007, F-011) | 15-21 days |
| L (3-5 days) | 4 features (F-002, F-003, F-014, F-015) | 12-20 days |
| M (1-3 days) | 10 features (F-001, F-006, F-008, F-010, F-012, F-013, F-016, F-017, F-018) | 20-30 days |
| S (<1 day) | 2 features (F-009, F-024, F-025) | 2-3 days |

**Note**: Effort estimates reflect raw development time for a solo developer. Calendar time will be longer due to non-development tasks (content creation, initial data population, vendor outreach, testing). Plan for 3-4 months of calendar time from development start to March 2026 launch.

---

### 3.4 Post-MVP Roadmap

| Phase | Feature ID | Feature Name | Target Timeline | Rationale for Deferral |
|-------|-----------|-------------|----------------|----------------------|
| **Phase 1: First Enhancement** (April-May 2026) | F-004 | Tool Comparison View | April 2026 | High practitioner value but not required for first publication; leaderboard and tool detail pages provide comparison in v1 |
| **Phase 1** | F-019 | Badge Awarding & Display | April 2026 | Adds vendor engagement value; first badges can be awarded retroactively for the March cycle |
| **Phase 1** | F-020 | Cycle Archive & Historical Access | May 2026 | Becomes relevant once the second cycle publishes (April 2026); archive supports the "Build the Record" value |
| **Phase 1** | F-021 | Vendor Directory & Profile Pages | May 2026 | Enhances vendor visibility; not required for core benchmark function |
| **Phase 1** | F-022 | Cross-Cycle Anomaly Detection | May 2026 | Becomes relevant once there are two published cycles to compare; essential for quality control at scale |
| **Phase 2: Quality & Scale** (June-August 2026) | F-023 | Score Correction Workflow | June 2026 | Post-publication corrections are unlikely in the first cycle; process can be manual initially |
| **Phase 2** | -- | Leaderboard CSV/PDF Export | July 2026 | Practitioner convenience feature for client proposals |
| **Phase 2** | -- | Downloadable Comparison Reports | July 2026 | Extension of F-004; shareable comparison summaries |
| **Phase 2** | -- | Cycle Cloning/Templates | August 2026 | Efficiency improvement once monthly cadence is established; reduces setup time for recurring cycles |
| **Phase 3: Growth** (September 2026+) | -- | Newsletter/Email Subscription | September 2026 | Audience retention between publication cycles; requires email service integration |
| **Phase 3** | -- | llms.txt Track Launch | October 2026 | Second benchmark track; deferred until GEO Platform track is proven and stable |
| **Phase 3** | -- | Public API (Read-Only) | November 2026 | Enables third-party integrations and data syndication; requires API design and documentation |
| **Phase 3** | -- | Vendor Self-Service Portal | December 2026 | Allows vendors to log in, review their own scores, and submit corrections directly; reduces admin overhead |
| **Phase 4: Authority** (2027+) | -- | Premium Report Tier | Q1 2027 | First revenue experiment; deeper analysis reports for paying subscribers |
| **Phase 4** | -- | Trend Analysis Dashboard | Q1 2027 | Public longitudinal data visualization leveraging 12+ months of data |
| **Phase 4** | -- | Audit Package Cryptographic Signing | Q2 2027 | Enhanced trust signal; third-party verifiable integrity |
| **Phase 4** | -- | External Audit Integration | Q3 2027 | Invite third-party methodology auditors; strongest credibility signal |

---

*AISearchArena.com PRD | Section 3: Features & Requirements | v1.0 | 2026-02-24*
