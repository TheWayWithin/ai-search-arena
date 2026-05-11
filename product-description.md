# AI Search Arena — Product Description

## What It Is

AI Search Arena is an independent monthly benchmark that evaluates AI search optimization (GEO/AEO) tools against 50+ standardized metrics using a 6-model AI consensus methodology. Every tool is scored by the same models, against the same criteria, using the same methodology — then published with full transparency.

The benchmark exists because the GEO/AEO tool market has grown to 27+ tools across 7 market segments with no independent, structured comparison. Practitioners choose tools based on vendor marketing, peer anecdotes, and limited trials — leading to wasted budgets, poor fits, and high switching costs.

**Operator:** Jamie Watters, as part of the AI Search Mastery ecosystem. This relationship is disclosed on the site.

**Revenue model:** None in v1. Credibility-first — no paywalls, no ads, no affiliate links.

---

## Public Features

### Leaderboard (`/leaderboard`)

Ranked table of all evaluated tools showing composite score (0–10), rank, confidence tag, and tier badges. Filterable by market segment. Cycle selector for historical views once multiple benchmarks are published.

### Tool Detail Pages (`/tools/[slug]`)

Full breakdown of a tool's scores across all 51 dimensions, grouped by 6 categories. Shows composite score, rank, confidence tag, tier badges, and market segments. Links to comparison view.

### Side-by-Side Comparison (`/compare`)

Compare 2–4 tools across all dimensions in a single view. Best score per dimension highlighted. URL-driven state (shareable links). Accessible from tool detail pages and leaderboard.

### Vendor Directory (`/vendors`)

Grid of all 29 vendors with company name, description, and tool count.

### Vendor Profile Pages (`/vendors/[slug]`)

Shows all tools for a vendor with their composite scores, ranks, and badges for the selected cycle.

### Methodology Page (`/methodology`)

Complete transparency: 4-step evaluation process, confidence tag definitions with thresholds, full dimension table (51 dimensions with weights), composite score formula, and N/A handling rules.

### Disclosure Page (`/disclosure`)

Ownership disclosure (AI Search Mastery parent), conflict of interest statement, structural safeguards, editorial firewall policy, vendor disclosure status, and corrections policy.

### Benchmark Cycles Archive (`/cycles`)

List of all published benchmark cycles with display name, publish date, tool count, and methodology version.

### Contact (`/contact`)

Contact form (name, email, message) that sends to `support@aisearcharena.com` via Resend. Direct mailto link as alternative.

### Newsletter

Email subscription via Buttondown. Shown on the pre-launch homepage hero. Subscribers notified when new benchmark results are published.

---

## Scoring Methodology

### Scale

All scores: 0.0–10.0, one decimal place, round half up.

### Scoring Rubric

| Range | Label         | Meaning                                          |
| ----- | ------------- | ------------------------------------------------ |
| 0–2   | Poor/Missing  | Feature barely exists or is fundamentally broken |
| 3–4   | Below Average | Basic functionality with significant gaps        |
| 5–6   | Average       | Functional but nothing exceptional               |
| 7–8   | Good          | Strong capability with minor gaps                |
| 9–10  | Excellent     | Best-in-class implementation                     |

### 6-Model AI Consensus

Every tool × dimension is evaluated by 6 independent AI models via OpenRouter:

| Provider  | Model             |
| --------- | ----------------- |
| OpenAI    | GPT-5.2           |
| Anthropic | Claude Sonnet 4.6 |
| Google    | Gemini 3 Flash    |
| xAI       | Grok 4.1 Fast     |
| DeepSeek  | DeepSeek V3.2     |
| Mistral   | Mistral Large 3   |

All models queried in parallel. Temperature 0.1. Retry with exponential backoff (1s, 4s, 16s).

### Score Synthesis

Per dimension per tool:

- **Median** of successful model scores (not mean — reduces outlier influence)
- Minimum 4 of 6 models must succeed; otherwise tagged `InsufficientData`
- Round half up to one decimal place

### Confidence Tags

| Tag              | Condition                       |
| ---------------- | ------------------------------- |
| High             | Standard deviation ≤ 0.5        |
| Medium           | 0.5 < stdDev ≤ 1.5              |
| Low              | stdDev > 1.5                    |
| InsufficientData | Fewer than 4/6 models succeeded |

### Composite Score

```
Composite = Σ (dimension_score × weight / total_applicable_weight)
```

Weights renormalized when dimensions are marked N/A so they always sum to 1.0. Dense ranking: tied scores get the same rank. Separate rankings for overall and per segment.

### Evaluation Volume

28 tools × 51 dimensions × 6 models = **8,568 API calls** per cycle.

---

## The 51 Scoring Dimensions

Six categories. Weights sum to exactly 100%.

### AI Search Visibility (~22%)

AI Citation Frequency (4%), AI Citation Accuracy (4%), AI Citation Prominence (3%), Multi-Model Visibility (3%), Query Coverage Breadth (3%), Brand Mention Detection (2%), Source Attribution Quality (2%), Conversational Query Handling (1%)

### Content Optimization (~20%)

Content Structure Analysis (3%), Semantic Relevance Scoring (3%), Entity Recognition Quality (2%), Content Gap Identification (2%), Readability Optimization (2%), Answer Engine Formatting (2%), Topic Authority Building (2%), Content Freshness Signals (2%), Multimodal Content Support (2%)

### Technical Implementation (~18%)

Schema Markup Support (3%), llms.txt Generation (2%), Structured Data Validation (2%), API Quality & Documentation (2%), Integration Ecosystem (2%), Performance Impact (2%), Implementation Complexity (2%), Crawlability Optimization (2%), AI Agent Accessibility (1%)

### Analytics & Reporting (~14%)

AI Search Analytics Depth (3%), Competitive Benchmarking (2%), Reporting Customization (2%), Historical Trend Tracking (2%), ROI Attribution (2%), Data Export Capabilities (1%), Alert & Notification System (1%), Cross-Platform Analytics (1%)

### User Experience & Usability (~13%)

Dashboard Usability (2%), Onboarding Experience (2%), Documentation Quality (2%), Workflow Efficiency (2%), Mobile Accessibility (2%), Multi-User Collaboration (1%), Error Handling & Guidance (1%), Customization Flexibility (1%)

### Market & Value (~13%)

Pricing Transparency (2%), Value for Investment (2%), Update Frequency (2%), Scalability (2%), Vendor Transparency (1%), Support Responsiveness (1%), Community & Ecosystem (1%), Contract Flexibility (1%), Training & Education Resources (1%)

---

## Market Segments

Tools are mapped to one or more of 7 segments. Segment-specific leaderboard rankings and badges are computed separately.

| Segment                | Description                                                       |
| ---------------------- | ----------------------------------------------------------------- |
| Enterprise SEO         | Large organizations with complex SEO needs and dedicated teams    |
| SMB Marketing          | Small and medium businesses with limited marketing resources      |
| E-commerce             | Online retail businesses optimizing product and category pages    |
| Content Marketing      | Content-driven organizations focused on organic visibility        |
| Technical SEO          | Organizations requiring deep technical optimization capabilities  |
| Agency & Consulting    | Agencies and consultants managing multiple client accounts        |
| Local & Multi-Location | Businesses with physical locations optimizing for local AI search |

---

## Benchmark Tracks

| Track                  | Status                                          |
| ---------------------- | ----------------------------------------------- |
| GEO Platform Track     | Active — all 51 dimensions scored               |
| llms.txt Tooling Track | Defined, no dimensions yet (Phase 3, Oct 2026+) |

---

## Badge System

Badges are awarded per cycle after composite scores are finalized.

### Overall Badges

| Rank | Tier   | Badge             |
| ---- | ------ | ----------------- |
| 1st  | Gold   | Overall Leader    |
| 2nd  | Silver | Overall Runner-Up |
| 3rd  | Bronze | Overall Top Three |

### Segment Badges

| Rank            | Tier | Badge                          |
| --------------- | ---- | ------------------------------ |
| 1st per segment | Gold | Segment Leader: {Segment Name} |

Maximum 10 badges per cycle (3 overall + 7 segment leaders).

---

## Vendor Review Process

Before publication, every vendor receives a 5 business day window to review their scores and submit factual corrections with evidence.

1. Cycle transitions to VendorReview state
2. Each vendor with a contact email receives a unique, confidential review link
3. Vendors view only their own tools' dimension scores
4. Vendors can submit corrections with: proposed value, justification, and evidence URLs
5. Operator reviews and accepts or rejects each correction
6. Vendors are notified of decisions by email
7. Accepted corrections are applied before publication

Score corrections after publication require dual approval (different corrector and approver).

---

## Audit Packages

Every benchmark cycle produces a sealed audit package containing:

- Full methodology snapshot (version + all dimensions)
- All enrollments (including withdrawals with reasons)
- All raw model evaluations (8,568 records with scores, response times)
- All synthesized scores with confidence tags
- All composite scores and rankings
- All vendor reviews and corrections

Package integrity verified by SHA-256 hash. Once sealed, the package is immutable.

---

## Evaluated Tools (v1)

29 vendors, 32 tools across GEO and llms.txt tracks. Notable vendors include BrightEdge, Conductor, seoClarity, Surfer SEO, MarketMuse, Clearscope, Semrush, Ahrefs, Jasper, Writer, and Yext.

AI Search Mastery (the parent organization) has 4 tools enrolled. These are scored using the identical methodology and this relationship is disclosed prominently.

---

## Tech Stack

| Layer          | Technology                               |
| -------------- | ---------------------------------------- |
| Framework      | Next.js 15 (App Router, RSC)             |
| Database       | PostgreSQL via Prisma ORM                |
| Hosting        | Vercel                                   |
| Object Storage | Cloudflare R2                            |
| Email          | Resend                                   |
| Newsletter     | Buttondown                               |
| AI Evaluation  | OpenRouter (unified gateway to 6 models) |
| Methodology    | v1.0.0, effective March 1, 2026          |
