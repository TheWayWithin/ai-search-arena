# Sprint 2: Admin Panel — Operator Console

## Goal

Build out the admin panel from stubs to a functional operator console. All backend logic (state machine, CRUD, enrollments, methodology) already exists — this sprint wires it to UI.

After this sprint, the operator can create and run a full benchmark cycle entirely from the admin panel.

## State Machine Reference

```
Draft → Planning → Evaluation → Synthesis → Review → VendorReview → Publication → Completed
  ↓        ↓          ↓
Suspended ←┘       (locked)     Cancelled (from Draft/Planning/Suspended)
```

Guards:

- Draft → Planning: methodology version must be assigned
- Planning → Evaluation: minimum 5 enrolled tools per track (BR-T03)

Side effects:

- Draft → Planning: locks methodology version
- Review → VendorReview: opens vendor review window + sends emails

---

## Tickets

### T1: Admin Dashboard

**File**: `app/(admin)/admin/(authenticated)/page.tsx`

Replace the stub with a real dashboard showing:

- Active cycle card: name, state (color-coded badge), days in current state, next valid transitions
- Quick stats: total tools, total vendors, active models
- If no active cycle: prominent "Start New Cycle" CTA linking to `/admin/cycles`
- Recent activity summary (latest cycle transitions)

**Backend**: `getActiveCycle()`, `listCycles()`, `getValidTransitions()`

**Depends on**: Nothing (can start immediately)

---

### T2: Cycles List + Create Cycle

**File**: `app/(admin)/admin/(authenticated)/cycles/page.tsx`
**New file**: `app/actions/admin/cycles.ts` (server actions)

**List view**:

- Table: cycle identifier, display name, state (badge), start date, enrolled tools count, methodology version
- State badges color-coded (Draft=gray, Planning=blue, Evaluation=amber, etc.)
- Each row links to cycle detail page

**Create cycle**:

- "New Cycle" button opens inline form or dialog
- Fields: cycle identifier (e.g. "2026-04"), display name, start date, methodology version (dropdown)
- Calls `createCycle()` — shows error if an active cycle already exists
- On success: redirects to new cycle detail page

**Backend**: `listCycles()`, `createCycle()`, `getCurrentMethodology()`

**Depends on**: Nothing

---

### T3: Cycle Detail + State Transitions

**New file**: `app/(admin)/admin/(authenticated)/cycles/[id]/page.tsx`
**New file**: `app/actions/admin/cycle-transitions.ts` (server actions)

This is the core operator page for running a benchmark.

**Header section**:

- Cycle name, identifier, state (large badge), methodology version
- Start date, days active

**State machine controls**:

- Show current state prominently
- Buttons for each valid transition from current state (from `getValidTransitions()`)
- Each button triggers a confirmation dialog: "Transition from {current} to {target}?"
- Transition calls `transitionCycle()` — shows guard failure reasons on error
- After transition: page refreshes to show new state and new valid transitions

**Enrollment summary** (read-only on this page, link to enrollment sub-page):

- Count of enrolled tools per track
- Green/red indicator for 5-tool minimum threshold
- "Manage Enrollment" link (only shown in Draft/Planning states)

**Backend**: `getCycleById()`, `getValidTransitions()`, `transitionCycle()`, `getEnrollmentCountsByTrack()`

**Depends on**: T2 (for navigation from cycles list)

---

### T4: Tool Enrollment Dashboard

**New file**: `app/(admin)/admin/(authenticated)/cycles/[id]/enrollment/page.tsx`
**New file**: `app/actions/admin/enrollments.ts` (server actions)

Only accessible when cycle is in Draft or Planning state.

**Layout**:

- List of all non-archived tools grouped by track
- Checkbox per tool: checked = enrolled, unchecked = not enrolled
- Enroll action calls `enrollTool()`, withdraw opens a reason dialog then calls `withdrawTool()`
- Track summary row: "X / 5 minimum" with green/red indicator per track
- "Enroll All" convenience button for enrolling all tools in a track

**Backend**: `getEnrollments()`, `getTools()`, `enrollTool()`, `withdrawTool()`, `getEnrollmentCountsByTrack()`

**Depends on**: T3 (cycle detail page exists to link from)

---

### T5: Vendors & Tools Management

**File**: `app/(admin)/admin/(authenticated)/vendors/page.tsx`
**File**: `app/(admin)/admin/(authenticated)/tools/page.tsx`
**New files**: `app/actions/admin/vendors.ts`, `app/actions/admin/tools.ts`

**Vendors page**:

- Table: company name, contact name, contact email, tool count, website
- "Add Vendor" form: company name (required), slug (auto-generated from name), website, contact name, contact email, description
- Click row to expand/view tools for that vendor

**Tools page**:

- Table: tool name, vendor, tracks, segments, archived status
- "Add Tool" form: name, slug, description, website URL, vendor (dropdown), tracks (multi-select), segments (multi-select)
- Archive button with confirmation

**Backend**: `getVendors()`, `createVendor()`, `getTools()`, `createTool()`, `archiveTool()`, `getMarketSegments()`

**Depends on**: Nothing

---

### T6: AI Models Management

**File**: `app/(admin)/admin/(authenticated)/models/page.tsx`
**New file**: `app/actions/admin/models.ts`

**Layout**:

- Table: provider, model name, model identifier (OpenRouter ID), timeout, active status
- Toggle switch for active/inactive (calls `toggleModelActive()`)
- Inline edit for timeout (calls `updateModelTimeout()`)
- Error shown if deactivation blocked by active evaluations

**Backend**: `getActiveModels()`, `toggleModelActive()`, `updateModelTimeout()`

**Note**: No "add model" in this sprint — models are seeded. Can add later if needed.

**Depends on**: Nothing

---

### T7: Methodology Viewer

**File**: `app/(admin)/admin/(authenticated)/methodology/page.tsx`

**Layout**:

- Current methodology version: version number, effective date, locked status, locked date
- Dimensions table grouped by track: dimension name, weight, category, display order
- Weight validation summary per track (sum should equal 100%)
- Lock button (if unlocked): calls `lockMethodologyVersion()` with confirmation

**Note**: Full methodology editor (creating new versions, editing dimensions) is out of scope for this sprint. View + lock is sufficient for running the second benchmark.

**Backend**: `getCurrentMethodology()`, `getMethodologyWithDimensions()`, `lockMethodologyVersion()`, `validateDimensionWeights()`

**Depends on**: Nothing

---

## Shared Components to Create

| Component                             | Used By        | Purpose                       |
| ------------------------------------- | -------------- | ----------------------------- |
| `components/admin/state-badge.tsx`    | T1, T2, T3     | Color-coded cycle state badge |
| `components/admin/confirm-dialog.tsx` | T3, T4, T5     | Reusable confirmation dialog  |
| `components/admin/data-table.tsx`     | T2, T5, T6, T7 | Simple sortable table wrapper |

---

## Out of Scope (Future Sprints)

- Methodology editor (add/edit dimensions, create new versions)
- Vendor review management admin (accept/reject corrections queue)
- Audit package generation/sealing UI
- Report generation wizard
- Evaluation pipeline monitoring (synthesis progress matrix)
- Badge configuration admin
- Add/edit AI models

---

## Acceptance Criteria

1. Operator can create a new benchmark cycle from `/admin/cycles`
2. Operator can advance a cycle through all states via transition buttons on the cycle detail page
3. Guard failures show clear error messages (e.g., "Track X has only 3 tools, minimum 5")
4. Operator can enroll/withdraw tools during Draft and Planning states
5. Operator can add vendors and tools from the admin panel
6. Operator can toggle AI model active/inactive status
7. Operator can view methodology dimensions and lock a version
8. Dashboard shows active cycle status at a glance
9. All pages pass `npm run typecheck` and `npm run build`

---

## Execution Order

T5 and T6 and T7 have no dependencies and can be built in parallel.
T1 and T2 have no dependencies.
T3 depends on T2.
T4 depends on T3.

Recommended build order: **T2 → T3 → T4 → T1 → T5 → T6 → T7**

Rationale: Cycles + state transitions are the critical path for running a benchmark. Dashboard (T1) is more useful once the cycle pages exist so the "active cycle" card can link somewhere. Vendors/tools/models/methodology are independent and can be done in any order.
