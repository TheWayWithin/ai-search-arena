# Business Requirements Document: AISearchArena Track Architecture

**Project:** Evolve AISearchArena from a single leaderboard into a track-based evaluation framework.
**Target Audience for this Document:** Agent-11 (Development)
**Context:** The current single leaderboard mixes fundamentally different tool types (e.g., schema generators vs. enterprise SEO platforms). To maintain our position as the definitive independent benchmark, we must evaluate tools within their natural functional categories ("Tracks").

---

## 1. Core Business Requirements

The system must be updated to support multiple independent leaderboards (Tracks) while maintaining the existing 51-dimension scoring framework. The existing "Use Case" segments (e.g., Agency, E-commerce) will transition from being the primary filter to becoming secondary tags within each Track.

### 1.1 The Six Tracks
The data model must support assigning tools to one of the following six tracks. **Crucially, each tool must be assigned to exactly one primary track.**

| Track ID | Track Name | Description |
| :--- | :--- | :--- |
| `track_1` | AI Visibility Monitoring | Citation tracking, sentiment, share of voice across AI engines. |
| `track_2` | Content Optimization for AI | Scoring and structuring content for AI citation. |
| `track_3` | Technical AI Readiness | Entity optimization, structured data, llms.txt, AI crawler access. |
| `track_4` | End-to-End GEO Platforms | Full-stack: SEO data + AI visibility + content workflows. |
| `track_5` | GEO Agencies & Consultancies | Managed GEO services, evaluated on methodology and outcomes. (MVP: Directory only, no leaderboard). |
| `track_6` | AI Content Generation for Search | AI writing tools evaluated specifically on AI visibility readiness (structure, entities, factuality, exportability), not generic copywriting. |

### 1.2 The Secondary Tagging System
Because many tools have overlapping features (e.g., a Track 4 platform might have Track 1 monitoring features), the system must support a robust secondary tagging system to prevent classification chaos.

*   **Requirement:** The data model must support assigning multiple tags to a tool across three categories:
    *   **Use Case Tags:** Agency, E-commerce, Enterprise, SMB, Local.
    *   **Capability Tags:** Monitoring, Technical, Content, Reporting, API/Export.
    *   **Buyer Fit Tags:** Enterprise, Mid-market, Solo, Agency.

### 1.3 Dimension Weighting per Track
The scoring engine must support variable weighting of the 51 dimensions based on the Track. For example, a tool in Track 3 (Technical AI Readiness) should not be penalized for lacking content generation features, which are critical for Track 2. 

*   **Requirement:** The YAML framework (or equivalent configuration) must allow dimensions to be weighted (e.g., 0.0 to 1.0) or toggled on/off per Track.

### 1.4 The "Transparency Profile" Meta-Dimension
A new cross-track evaluation metric must be introduced to counter unverifiable market claims.

*   **Requirement:** Every tool, regardless of its Track, must receive a "Transparency Profile" consisting of three sub-scores:
    1.  **Methodology Clarity:** Do they document scoring and data sources?
    2.  **Evidence/Proof Disclosure:** Do they disclose LLM versions and limitations?
    3.  **Data Portability:** Can users export and verify their data?
*   **Requirement:** This profile should be prominently displayed on the tool's detail page and factored into the overall Track score.

---

## 2. MVP vs. Post-MVP Scope

The following table defines what must be delivered in the initial release versus what should be architected for but delivered later.

| Requirement | MVP | Post-MVP |
| :--- | :--- | :--- |
| Six Tracks defined in data model | Yes | — |
| Tools assigned to Tracks | Yes | — |
| Dimension weighting per Track (configurable) | Yes | — |
| Track-specific leaderboard pages with URLs | Yes | — |
| Use Case filters as secondary tags on Track pages | Yes | — |
| Track label on tool detail pages | Yes | — |
| Transparency Profile meta-dimension | — | Phase 2 |
| Stack Benchmark (tool combinations across Tracks) | — | Phase 3 |
| Track 5: GEO Agencies directory page | Yes | — |
| Track 5: GEO Agencies evaluation framework & leaderboard | — | Phase 2 (requires new evaluation criteria for services vs. software) |
| Vendor PR asset generation (badges, one-pagers) | — | Phase 2 |
| Headline composite metric ("AI Visibility Score") | — | Phase 2 |

---

## 3. User Interface & Experience Requirements

The website architecture must be updated to reflect the new Track-based model, creating new SEO opportunities and improving user navigation.

### 3.1 Primary Navigation
*   **Requirement:** The main navigation must be updated to feature the six Tracks prominently. The single "Leaderboard" link should be replaced by a dropdown or a landing page that routes users to specific Track leaderboards.

### 3.2 Track Leaderboard Pages
*   **Requirement:** Tracks 1, 2, 3, 4, and 6 must have their own dedicated leaderboard pages (e.g., `/leaderboard/ai-visibility-monitoring`).
*   **Requirement:** Track 5 (Agencies) must have a dedicated directory page in MVP, clearly marked as "Benchmark Coming Soon," featuring the agency evaluation methodology. It must not display an empty leaderboard.
*   **Requirement:** Each Track page must include a brief explanation of what the Track covers and how the methodology applies specifically to that category.
*   **Requirement:** The new secondary tags (Use Case, Capability, Buyer Fit) must be available as filters on these Track pages.

### 3.3 Tool Detail Pages
*   **Requirement:** Individual tool pages must clearly display the tool's primary Track and all associated secondary tags.
*   **Requirement:** The page must display the new Transparency Profile alongside the existing dimensional scores.

---

## 4. Future-Proofing: The Stack Benchmark

While not part of the immediate MVP, the architecture must support a future "Stack Benchmark" feature.

*   **Requirement:** The data model should allow for the creation of "Stacks" — combinations of tools from different Tracks (e.g., one tool from Track 1, one from Track 2, one from Track 3). 
*   **Requirement:** The system should eventually be able to calculate a composite score for a Stack based on the individual scores of its component tools.

---

## 5. Implementation Guidelines for Agent-11

*   **Tech Stack:** Use the existing tech stack. Do not introduce new frameworks unless absolutely necessary for the data model changes.
*   **Data Migration:** Ensure a smooth migration path for the existing 32 tools into their appropriate new Tracks. (See the provided mapping in the master plan for initial assignments).
*   **Integration:** Ensure all changes align with the foundation business documents created by BOS-AI to maintain vision integrity.
*   **Public Repo Sync:** The public GitHub repository (`geo-benchmark-framework`) must be updated simultaneously with the site deployment to reflect the new track architecture, dimension weights, and tagging system. This is a hard requirement for maintaining the "audit it yourself" positioning.

---

## Appendix A: Current Tool-to-Track Mapping

The following table provides the initial assignment of the existing 32 AISearchArena tools into the six Tracks. Agent-11 should use this as the basis for the data migration.

| Track | Tools |
| :--- | :--- |
| **Track 1: AI Visibility Monitoring** | AImpact Scanner, AImpact Monitor |
| **Track 2: Content Optimization for AI** | Surfer SEO, Frase, Clearscope, MarketMuse, Content Harmony, OutRanking, NeuronWriter, Scalenut, PageOptimizer Pro, Dashword, GrowthBar, RankIQ |
| **Track 3: Technical AI Readiness** | WordLift, Schema App, InLinks, Alli AI |
| **Track 4: End-to-End GEO Platforms** | BrightEdge, Semrush, Conductor, seoClarity, Ahrefs, SearchAtlas, Yext, Rio SEO |
| **Track 5: GEO Agencies & Consultancies** | None (new track, tools to be added in Phase 2) |
| **Track 6: AI Content Generation for Search** | Jasper, Writesonic, Writer, Copy.ai |

**Note on AI Search Mastery:** AI Search Mastery has multiple products that span Tracks 1 and 4. Agent-11 should confirm the correct assignment based on the specific product evaluated.

---

## Appendix B: Strategic Context

This section provides background for agent-11 to understand the "why" behind these requirements.

**Why Tracks?** The current single leaderboard forces fundamentally different tool types to compete on the same scoring dimensions. A schema generator (Track 3) should not be penalized for lacking a content editor (Track 2). Tracks create apples-to-apples comparisons and make the benchmark more credible.

**Why now?** A competitor, GenOptima, has entered the benchmarking space. They are a GEO agency that ranks itself #1 in their own benchmark. By introducing Track 5 (GEO Agencies), AISearchArena becomes the independent, neutral arbiter of agency performance — a position GenOptima cannot claim.

**Why the Transparency Profile?** The market's weakest spot is that most tools and agencies make claims they cannot substantiate. A cross-track Transparency Profile that evaluates methodology clarity, data exportability, and disclosure quality turns this weakness into AISearchArena's category wedge.
