/**
 * Seed PromptSets for all 51 scoring dimensions.
 *
 * Each PromptSet contains 2-3 tailored evaluation prompts for its dimension.
 * The evaluation pipeline randomly selects one prompt per evaluation run,
 * which reduces systematic bias from prompt phrasing.
 *
 * Run: npx tsx prisma/seed-prompts.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Dimension-specific evaluation prompts, keyed by slug.
 * Each array contains 2-3 prompts that probe different facets of the dimension.
 */
const DIMENSION_PROMPTS: Record<string, string[]> = {
  // ── AI Search Visibility (8) ──────────────────────────────────
  "ai-citation-frequency": [
    "How frequently does this tool help websites get cited in AI-generated responses across major AI assistants (ChatGPT, Perplexity, Gemini, Claude)? Evaluate the breadth of monitoring coverage and the tool's ability to increase citation rates.",
    "Assess this tool's capability to track and improve how often a website appears as a cited source in AI search results. Consider both monitoring frequency and actionable optimization features.",
    "Evaluate the tool's AI citation tracking depth: Does it monitor citation frequency across multiple AI platforms? Does it provide benchmarks against competitors? Can it demonstrate improvement over time?",
  ],
  "ai-citation-accuracy": [
    "How accurately does this tool track whether AI-generated citations correctly represent the source content? Evaluate its ability to detect misattributions, hallucinated citations, and factual errors in AI responses.",
    "Assess this tool's capability to verify that AI citations are faithful to the original content. Consider detection of misquotes, context distortion, and attribution errors.",
    "Evaluate the accuracy of this tool's citation tracking: Does it validate that AI mentions are factually correct? Can it flag when AI systems misrepresent source material?",
  ],
  "ai-citation-prominence": [
    "How well does this tool help optimize for prominent placement in AI-generated responses (e.g., being cited first, appearing in featured snippets, or being the primary recommended source)? Evaluate positioning optimization capabilities.",
    "Assess this tool's ability to track and improve citation prominence — not just being cited, but being cited prominently (top position, primary recommendation, featured source).",
  ],
  "multi-model-visibility": [
    "How comprehensively does this tool track visibility across different AI models and platforms (GPT, Claude, Gemini, Perplexity, Copilot, etc.)? Evaluate cross-platform monitoring breadth.",
    "Assess this tool's multi-model tracking: Does it cover all major AI search platforms? Can it identify platform-specific optimization opportunities? Does it normalize data across models?",
    "Evaluate the tool's ability to provide a unified view of brand visibility across multiple AI engines, with comparative analytics and platform-specific recommendations.",
  ],
  "query-coverage-breadth": [
    "How broad is this tool's query monitoring? Does it track performance across informational, navigational, transactional, and conversational query types in AI search? Evaluate query taxonomy breadth.",
    "Assess this tool's coverage of diverse query patterns: long-tail queries, voice-style questions, multi-turn conversations, and intent-based categories. How comprehensive is the monitoring?",
  ],
  "brand-mention-detection": [
    "How effectively does this tool detect brand mentions in AI-generated responses, including indirect references, competitor comparisons, and category mentions? Evaluate detection sensitivity and accuracy.",
    "Assess this tool's brand monitoring in AI outputs: Can it find direct mentions, implied references, and comparative mentions? Does it track sentiment alongside detection?",
    "Evaluate brand mention detection scope: Does the tool monitor branded and unbranded queries? Can it detect mentions in multi-turn conversations and follow-up responses?",
  ],
  "source-attribution-quality": [
    "How well does this tool evaluate and improve source attribution quality — ensuring that when AI systems cite a website, the attribution includes proper links, context, and credit? Evaluate attribution optimization features.",
    "Assess this tool's capability to analyze how AI systems attribute sources: Does it track link quality, citation formatting, and whether attributions drive traffic back to the original source?",
  ],
  "conversational-query-handling": [
    "How effectively does this tool optimize content for conversational AI queries — multi-turn dialogues, follow-up questions, and natural language interactions? Evaluate conversational SEO features.",
    "Assess this tool's support for conversational query optimization: Does it help structure content for Q&A formats, dialogue patterns, and the way users interact with AI assistants?",
  ],

  // ── Content Optimization (9) ──────────────────────────────────
  "content-structure-analysis": [
    "How thoroughly does this tool analyze content structure for AI readability? Evaluate its assessment of heading hierarchy, paragraph organization, list usage, and overall document architecture for AI consumption.",
    "Assess this tool's content structure analysis: Does it evaluate HTML semantics, heading depth, content chunking, and structural signals that help AI systems understand and extract information?",
    "Evaluate the tool's ability to audit and recommend structural improvements that make content more parseable by AI systems, including section organization, data formatting, and information hierarchy.",
  ],
  "semantic-relevance-scoring": [
    "How accurately does this tool score content for semantic relevance to target topics and queries? Evaluate its NLP/embedding-based analysis capabilities versus simple keyword matching.",
    "Assess the depth of semantic analysis: Does the tool use modern NLP techniques (embeddings, topic modeling) to evaluate content relevance, or rely on basic keyword density metrics?",
    "Evaluate semantic scoring sophistication: Can the tool identify topical gaps, semantic relationships between concepts, and content comprehensiveness relative to the knowledge domain?",
  ],
  "entity-recognition-quality": [
    "How well does this tool identify and leverage named entities (people, organizations, places, concepts) within content? Evaluate entity extraction accuracy and its application to content optimization.",
    "Assess entity recognition capabilities: Does the tool identify entities, map relationships between them, suggest entity enrichment, and connect to knowledge graphs?",
  ],
  "content-gap-identification": [
    "How effectively does this tool identify content gaps — topics, questions, and subtopics that competitors cover but the target site doesn't? Evaluate gap analysis comprehensiveness.",
    "Assess content gap detection: Does the tool analyze competitor content, AI-generated answers, and search intent data to reveal missing topics and underserved user needs?",
    "Evaluate the tool's content gap methodology: Is it based on keyword gaps only, or does it incorporate semantic analysis, question mining, and AI-answer coverage analysis?",
  ],
  "readability-optimization": [
    "How effectively does this tool optimize content readability for both human readers and AI systems? Evaluate readability scoring, simplification suggestions, and accessibility recommendations.",
    "Assess readability optimization features: Does the tool provide actionable suggestions for sentence structure, vocabulary level, and formatting that improve both user engagement and AI comprehension?",
  ],
  "answer-engine-formatting": [
    "How well does this tool optimize content specifically for AI answer engines — formatting content so it's more likely to be selected and quoted in AI-generated responses?",
    "Assess answer engine optimization: Does the tool help format content as concise answers, structured data, FAQ blocks, and direct response formats that AI systems prefer?",
    "Evaluate the tool's ability to structure content for featured snippets, People Also Ask, and AI answer panels — including paragraph answers, table formats, and step-by-step lists.",
  ],
  "topic-authority-building": [
    "How effectively does this tool help build topical authority through content clustering, pillar-page strategies, and comprehensive topic coverage recommendations?",
    "Assess topic authority features: Does the tool map topic clusters, recommend internal linking for authority signals, and track topical coverage depth relative to competitors?",
  ],
  "content-freshness-signals": [
    "How well does this tool manage content freshness — identifying stale content, recommending update schedules, and ensuring freshness signals are properly communicated to AI systems?",
    "Assess content freshness management: Does the tool track content age, monitor for accuracy decay, suggest update priorities, and help implement freshness metadata?",
    "Evaluate freshness signal capabilities: Can the tool detect when AI systems are using outdated information from the site and recommend content refreshes accordingly?",
  ],
  "multimodal-content-support": [
    "How effectively does this tool optimize multimodal content (images, videos, audio, infographics) for AI search visibility? Evaluate alt text optimization, video transcript analysis, and visual content recommendations.",
    "Assess multimodal support: Does the tool analyze non-text content formats, optimize image metadata, evaluate video content for AI comprehension, and recommend multimodal content strategies?",
  ],

  // ── Technical Implementation (9) ──────────────────────────────
  "schema-markup-support": [
    "How comprehensive is this tool's schema markup support? Evaluate the range of schema types supported, ease of implementation, validation capabilities, and advanced markup features.",
    "Assess schema markup features: Does the tool support JSON-LD generation, schema validation, rich result testing, and advanced types (FAQ, HowTo, Product, Organization)?",
    "Evaluate schema implementation quality: Can the tool generate, deploy, and monitor schema markup at scale? Does it support nested schemas and knowledge graph integration?",
  ],
  "llms-txt-generation": [
    "How well does this tool support the llms.txt standard — generating, validating, and maintaining AI-readable site documentation files that help AI systems understand site content?",
    "Assess llms.txt capabilities: Does the tool auto-generate llms.txt files, keep them updated with site changes, and validate compliance with the standard?",
    "Evaluate llms.txt tooling: Can the tool create comprehensive llms.txt content that covers site structure, key pages, content summaries, and API documentation in AI-friendly formats?",
  ],
  "structured-data-validation": [
    "How thoroughly does this tool validate structured data implementation? Evaluate testing against Google's rich result requirements, AI-specific structured data, and cross-platform compatibility.",
    "Assess structured data validation: Does the tool detect errors, warnings, and opportunities in existing markup? Can it validate against multiple schema specifications?",
  ],
  "api-quality-documentation": [
    "How well-designed and documented is this tool's API? Evaluate endpoint coverage, authentication methods, rate limiting, error handling, and documentation quality (OpenAPI spec, examples, SDKs).",
    "Assess API quality: Is the API RESTful/GraphQL? Does it have comprehensive documentation, versioning, webhook support, and sandbox/testing environments?",
    "Evaluate the developer experience: Are there code examples, client libraries, clear authentication flows, and responsive API support?",
  ],
  "integration-ecosystem": [
    "How extensive is this tool's integration ecosystem? Evaluate native integrations (CMS, analytics, CI/CD), API extensibility, webhook support, and marketplace/plugin availability.",
    "Assess integration breadth: Does the tool connect with major platforms (WordPress, Shopify, HubSpot, Google Analytics, Search Console) and support custom integrations?",
  ],
  "performance-impact": [
    "What is this tool's impact on site performance? Evaluate whether it adds client-side scripts, affects page load times, or introduces rendering overhead. Consider both positive optimization features and negative performance costs.",
    "Assess performance characteristics: Does the tool operate server-side or client-side? Does it affect Core Web Vitals? Are there performance optimization recommendations built in?",
  ],
  "implementation-complexity": [
    "How complex is this tool to implement and maintain? Evaluate the onboarding process, technical requirements, learning curve, and ongoing maintenance burden for different team sizes.",
    "Assess implementation ease: Can non-technical users get value quickly? What's the technical ceiling for advanced usage? How much ongoing technical maintenance is required?",
  ],
  "crawlability-optimization": [
    "How effectively does this tool optimize site crawlability for both traditional search engine bots and AI crawlers? Evaluate robots.txt management, sitemap optimization, and crawl budget recommendations.",
    "Assess crawlability features: Does the tool manage crawl directives, monitor crawl patterns from AI bots (GPTBot, ClaudeBot, etc.), and optimize for efficient content discovery?",
  ],
  "ai-agent-accessibility": [
    "How well does this tool prepare content for AI agent access — making information available to AI systems that browse, extract, and synthesize web content on behalf of users?",
    "Assess AI agent readiness: Does the tool optimize for machine-readable formats, API endpoints for content access, and compatibility with AI browsing agents?",
  ],

  // ── Analytics & Reporting (8) ──────────────────────────────────
  "ai-search-analytics-depth": [
    "How deep are this tool's AI search analytics? Evaluate the breadth of metrics tracked (impressions, citations, sentiment, traffic from AI sources), data granularity, and analysis capabilities.",
    "Assess analytics depth: Does the tool track AI-specific metrics beyond traditional SEO? Can it attribute traffic from AI assistants? Does it provide insight into AI search behavior patterns?",
    "Evaluate analytical sophistication: Does the tool offer segmentation, cohort analysis, and predictive analytics specifically for AI search performance?",
  ],
  "competitive-benchmarking": [
    "How effectively does this tool benchmark performance against competitors in AI search? Evaluate competitive tracking features, share-of-voice metrics, and competitive gap analysis.",
    "Assess competitive analysis: Can the tool track competitors' AI search visibility, compare citation rates, and identify competitive advantages and threats in the AI search landscape?",
  ],
  "reporting-customization": [
    "How customizable are this tool's reporting capabilities? Evaluate template flexibility, white-labeling, scheduled reports, dashboard customization, and stakeholder-appropriate views.",
    "Assess reporting features: Can reports be customized for different audiences (C-suite, SEO team, content team)? Are there automated scheduling, PDF export, and interactive dashboards?",
  ],
  "data-export-capabilities": [
    "How robust are this tool's data export capabilities? Evaluate supported formats (CSV, JSON, API), bulk export, automated data pipelines, and data warehouse integration.",
    "Assess data portability: Can users export raw data, connect to BI tools, set up automated data feeds, and maintain data ownership?",
  ],
  "historical-trend-tracking": [
    "How well does this tool track and visualize historical trends in AI search performance? Evaluate data retention periods, trend analysis features, and ability to correlate changes with events.",
    "Assess historical data: How far back does data go? Can users overlay events (algorithm updates, content changes) on trend charts? Is there forecasting based on historical patterns?",
  ],
  "alert-notification-system": [
    "How effective is this tool's alert and notification system? Evaluate alerting on ranking changes, citation drops, competitor movements, and anomaly detection capabilities.",
    "Assess alerting features: Does the tool provide real-time notifications, customizable thresholds, multi-channel delivery (email, Slack, webhook), and intelligent anomaly detection?",
  ],
  "roi-attribution": [
    "How well does this tool attribute ROI to AI search optimization efforts? Evaluate revenue tracking, conversion attribution, and ability to connect AI visibility to business outcomes.",
    "Assess ROI measurement: Can the tool track the revenue impact of AI search visibility? Does it provide cost-per-citation, value-per-mention, and optimization ROI metrics?",
  ],
  "cross-platform-analytics": [
    "How well does this tool unify analytics across platforms — traditional search, AI search, social, and referral channels? Evaluate cross-platform data integration and holistic performance views.",
    "Assess cross-platform capabilities: Does the tool aggregate data from Google Search Console, AI platform APIs, analytics tools, and social platforms into a unified dashboard?",
  ],

  // ── User Experience (8) ────────────────────────────────────────
  "dashboard-usability": [
    "How usable is this tool's dashboard? Evaluate layout clarity, information hierarchy, navigation intuitiveness, visual design quality, and ability to surface actionable insights quickly.",
    "Assess dashboard UX: Can users find key metrics quickly? Is the interface cluttered or clean? Does it guide users toward high-impact actions? Is it responsive across devices?",
  ],
  "onboarding-experience": [
    "How effective is this tool's onboarding experience? Evaluate the setup wizard, initial data import, guided tours, time-to-first-value, and support during the initial learning period.",
    "Assess onboarding quality: How long does it take a new user to see value? Are there interactive tutorials, template projects, and progress indicators?",
    "Evaluate first-run experience: Does the tool help users connect data sources, set goals, and understand key features within the first session?",
  ],
  "documentation-quality": [
    "How comprehensive and useful is this tool's documentation? Evaluate coverage (API docs, user guides, tutorials, FAQs), searchability, freshness, and practical example quality.",
    "Assess documentation: Is it well-organized, regularly updated, and accessible to different skill levels? Are there video tutorials, code examples, and troubleshooting guides?",
  ],
  "workflow-efficiency": [
    "How efficiently does this tool support common workflows? Evaluate task completion speed, batch operations, keyboard shortcuts, automation features, and elimination of repetitive manual steps.",
    "Assess workflow design: Can users complete common tasks (audit a page, optimize content, generate a report) with minimal clicks? Are there templates, presets, and automation rules?",
  ],
  "multi-user-collaboration": [
    "How well does this tool support multi-user collaboration? Evaluate team workspaces, role-based access, shared dashboards, commenting, task assignment, and approval workflows.",
    "Assess collaboration features: Can teams work simultaneously? Are there audit logs, permission levels, and shared project spaces?",
  ],
  "mobile-accessibility": [
    "How accessible is this tool on mobile devices? Evaluate responsive design, mobile app availability, touch interaction quality, and feature parity with the desktop experience.",
    "Assess mobile experience: Can users monitor performance, review alerts, and access key data on mobile? Is it a responsive web app or native mobile app?",
  ],
  "error-handling-guidance": [
    "How well does this tool handle errors and guide users through problems? Evaluate error messages, recovery suggestions, contextual help, and graceful degradation.",
    "Assess error UX: When something goes wrong, does the tool explain what happened, suggest fixes, and prevent data loss? Are error messages actionable?",
  ],
  "customization-flexibility": [
    "How flexible is this tool's customization? Evaluate dashboard configuration, metric selection, workflow customization, and ability to adapt the tool to specific business needs.",
    "Assess customization depth: Can users create custom metrics, build custom dashboards, define custom scoring rubrics, and tailor the tool to their industry vertical?",
  ],

  // ── Market & Value (9) ─────────────────────────────────────────
  "pricing-transparency": [
    "How transparent is this tool's pricing? Evaluate whether pricing is publicly available, clearly structured, and free of hidden fees. Consider clarity of plan tiers, overage charges, and contract terms.",
    "Assess pricing clarity: Is pricing published on the website? Are feature differences between tiers clear? Are there surprise charges for data usage, API calls, or user seats?",
  ],
  "value-for-investment": [
    "How does this tool's value proposition compare to its price point? Evaluate feature depth relative to cost, ROI potential, and whether the tool justifies its price for its target market segment.",
    "Assess value delivery: Does the tool provide capabilities that justify its cost? How does the price-to-feature ratio compare to alternatives? Is there a clear ROI pathway?",
  ],
  "vendor-transparency": [
    "How transparent is the vendor about their product, practices, and roadmap? Evaluate public roadmap availability, changelog transparency, data handling policies, and communication openness.",
    "Assess vendor openness: Does the vendor publish a product roadmap? Are they transparent about data usage, AI model sources, and product limitations?",
  ],
  "update-frequency": [
    "How frequently is this tool updated with new features and improvements? Evaluate release cadence, feature development velocity, and responsiveness to user feedback and market changes.",
    "Assess product evolution: How often are meaningful updates released? Does the vendor adapt quickly to AI search landscape changes? Is there a visible innovation trajectory?",
  ],
  "support-responsiveness": [
    "How responsive and effective is this tool's customer support? Evaluate response times, support channel availability (chat, email, phone), knowledge base quality, and resolution rates.",
    "Assess support quality: How quickly do support tickets get resolved? Is there 24/7 support? Are there dedicated account managers for enterprise customers? Is the knowledge base comprehensive?",
  ],
  scalability: [
    "How well does this tool scale with growing business needs? Evaluate performance under increasing data volumes, multi-site management, enterprise-grade features, and infrastructure reliability.",
    "Assess scalability: Can the tool handle 1,000+ pages? 100,000+ keywords? Multiple domains? Enterprise-scale data volumes without performance degradation?",
  ],
  "community-ecosystem": [
    "How vibrant is this tool's community and ecosystem? Evaluate user community size, third-party integrations, educational content, conferences/events, and ecosystem partner network.",
    "Assess community strength: Is there an active user community (forums, Slack, Discord)? Are there third-party plugins, certified partners, and community-contributed resources?",
  ],
  "contract-flexibility": [
    "How flexible are this tool's contract terms? Evaluate monthly vs. annual options, cancellation policies, downgrade paths, and negotiation openness for enterprise deals.",
    "Assess contract terms: Can users try before committing? Are there month-to-month options? What are the cancellation and downgrade policies?",
  ],
  "training-education-resources": [
    "How comprehensive are this tool's training and education resources? Evaluate onboarding training, certification programs, webinars, tutorials, and ongoing education content.",
    "Assess educational investment: Does the vendor offer structured training programs? Are there certifications, regular webinars, and a learning academy?",
  ],
};

async function main() {
  console.log("Seeding PromptSets for evaluation dimensions...\n");

  // Get the current methodology version with its active dimensions
  const methodology = await prisma.methodologyVersion.findFirst({
    where: { versionNumber: "1.0.0" },
    include: {
      scoringDimensions: {
        where: { isActive: true },
        orderBy: { displayOrder: "asc" },
      },
    },
  });

  if (!methodology) {
    throw new Error("Methodology v1.0.0 not found — run db:seed first");
  }

  console.log(
    `Found methodology v${methodology.versionNumber} with ${methodology.scoringDimensions.length} active dimensions\n`
  );

  let created = 0;
  let skipped = 0;
  const missing: string[] = [];

  for (const dimension of methodology.scoringDimensions) {
    const prompts = DIMENSION_PROMPTS[dimension.slug];

    if (!prompts || prompts.length === 0) {
      missing.push(dimension.slug);
      console.warn(`  ⚠ No prompts defined for "${dimension.name}" (${dimension.slug})`);
      continue;
    }

    // Check if a prompt set already exists for this dimension + methodology + version
    const existing = await prisma.promptSet.findUnique({
      where: {
        methodologyVersionId_dimensionId_version: {
          methodologyVersionId: methodology.id,
          dimensionId: dimension.id,
          version: "1.0",
        },
      },
    });

    if (existing) {
      skipped++;
      continue;
    }

    await prisma.promptSet.create({
      data: {
        methodologyVersionId: methodology.id,
        dimensionId: dimension.id,
        name: `${dimension.name} — v1.0 Prompts`,
        prompts: prompts,
        version: "1.0",
        isRotating: false,
      },
    });

    created++;
    console.log(`  ✓ ${dimension.name} (${prompts.length} prompts)`);
  }

  console.log(`\nDone: ${created} created, ${skipped} already existed`);

  if (missing.length > 0) {
    console.error(`\n✗ ${missing.length} dimensions have no prompts defined:`);
    for (const slug of missing) {
      console.error(`  - ${slug}`);
    }
    process.exit(1);
  }

  console.log("\n✓ All 51 dimensions have prompt sets");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
