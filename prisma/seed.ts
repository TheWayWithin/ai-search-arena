import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding AISearchArena database...\n");

  // ── Market Segments (7) ──────────────────────────────────────
  const segments = await Promise.all(
    [
      { name: "Enterprise SEO", slug: "enterprise-seo", description: "Large organizations with complex SEO needs and dedicated teams" },
      { name: "SMB Marketing", slug: "smb-marketing", description: "Small and medium businesses with limited marketing resources" },
      { name: "E-commerce", slug: "e-commerce", description: "Online retail businesses optimizing product and category pages" },
      { name: "Content Marketing", slug: "content-marketing", description: "Content-driven organizations focused on organic visibility" },
      { name: "Technical SEO", slug: "technical-seo", description: "Organizations requiring deep technical optimization capabilities" },
      { name: "Agency & Consulting", slug: "agency-consulting", description: "Agencies and consultants managing multiple client accounts" },
      { name: "Local & Multi-Location", slug: "local-multi-location", description: "Businesses with physical locations optimizing for local AI search" },
    ].map((s) =>
      prisma.marketSegment.upsert({
        where: { slug: s.slug },
        update: {},
        create: s,
      })
    )
  );
  console.log(`✓ ${segments.length} market segments`);

  const segmentMap = Object.fromEntries(segments.map((s) => [s.slug, s.id]));

  // ── Benchmark Track Definitions (2) ──────────────────────────
  const tracks = await Promise.all(
    [
      { name: "GEO Platform Track", slug: "geo-platform", description: "Generative Engine Optimization platform evaluation — comprehensive assessment of tools that help websites appear in AI-generated search results" },
      { name: "llms.txt Tooling Track", slug: "llms-txt-tooling", description: "Evaluation of tools supporting the llms.txt standard for AI-readable site documentation" },
    ].map((t) =>
      prisma.benchmarkTrackDefinition.upsert({
        where: { slug: t.slug },
        update: {},
        create: t,
      })
    )
  );
  console.log(`✓ ${tracks.length} benchmark tracks`);

  const trackMap = Object.fromEntries(tracks.map((t) => [t.slug, t.id]));

  // ── AI Models (6 via OpenRouter) ─────────────────────────────
  const models = await Promise.all(
    [
      { provider: "OpenAI", modelIdentifier: "openai/gpt-4o", displayName: "GPT-4o", timeoutMs: 30000 },
      { provider: "Anthropic", modelIdentifier: "anthropic/claude-sonnet-4-6", displayName: "Claude Sonnet 4.6", timeoutMs: 30000 },
      { provider: "Google", modelIdentifier: "google/gemini-2.0-flash-001", displayName: "Gemini 2.0 Flash", timeoutMs: 30000 },
      { provider: "Cohere", modelIdentifier: "cohere/command-r-plus", displayName: "Command R+", timeoutMs: 45000 },
      { provider: "Mistral", modelIdentifier: "mistralai/mistral-large-latest", displayName: "Mistral Large", timeoutMs: 30000 },
      { provider: "Meta", modelIdentifier: "meta-llama/llama-3.1-405b-instruct", displayName: "Llama 3.1 405B", timeoutMs: 60000 },
    ].map((m) =>
      prisma.aIModel.upsert({
        where: { modelIdentifier: m.modelIdentifier },
        update: {},
        create: m,
      })
    )
  );
  console.log(`✓ ${models.length} AI models`);

  // ── Methodology Version v1.0 ─────────────────────────────────
  const methodology = await prisma.methodologyVersion.upsert({
    where: { versionNumber: "1.0.0" },
    update: {},
    create: {
      versionNumber: "1.0.0",
      effectiveDate: new Date("2026-03-01"),
      description: "Initial methodology for March 2026 benchmark cycle. 51 scoring dimensions across GEO Platform track.",
    },
  });
  console.log(`✓ Methodology version ${methodology.versionNumber}`);

  // ── Scoring Dimensions (51 — GEO Platform Track) ──────────────
  const geoTrack = tracks.find((t) => t.slug === "geo-platform")!;

  const dimensionData: { name: string; slug: string; weight: number; category: string }[] = [
    // Category: AI Search Visibility (8 dimensions, ~0.22)
    { name: "AI Citation Frequency", slug: "ai-citation-frequency", weight: 0.04, category: "AI Search Visibility" },
    { name: "AI Citation Accuracy", slug: "ai-citation-accuracy", weight: 0.04, category: "AI Search Visibility" },
    { name: "AI Citation Prominence", slug: "ai-citation-prominence", weight: 0.03, category: "AI Search Visibility" },
    { name: "Multi-Model Visibility", slug: "multi-model-visibility", weight: 0.03, category: "AI Search Visibility" },
    { name: "Query Coverage Breadth", slug: "query-coverage-breadth", weight: 0.03, category: "AI Search Visibility" },
    { name: "Brand Mention Detection", slug: "brand-mention-detection", weight: 0.02, category: "AI Search Visibility" },
    { name: "Source Attribution Quality", slug: "source-attribution-quality", weight: 0.02, category: "AI Search Visibility" },
    { name: "Conversational Query Handling", slug: "conversational-query-handling", weight: 0.01, category: "AI Search Visibility" },

    // Category: Content Optimization (9 dimensions, ~0.20)
    { name: "Content Structure Analysis", slug: "content-structure-analysis", weight: 0.03, category: "Content Optimization" },
    { name: "Semantic Relevance Scoring", slug: "semantic-relevance-scoring", weight: 0.03, category: "Content Optimization" },
    { name: "Entity Recognition Quality", slug: "entity-recognition-quality", weight: 0.02, category: "Content Optimization" },
    { name: "Content Gap Identification", slug: "content-gap-identification", weight: 0.02, category: "Content Optimization" },
    { name: "Readability Optimization", slug: "readability-optimization", weight: 0.02, category: "Content Optimization" },
    { name: "Answer Engine Formatting", slug: "answer-engine-formatting", weight: 0.02, category: "Content Optimization" },
    { name: "Topic Authority Building", slug: "topic-authority-building", weight: 0.02, category: "Content Optimization" },
    { name: "Content Freshness Signals", slug: "content-freshness-signals", weight: 0.02, category: "Content Optimization" },
    { name: "Multimodal Content Support", slug: "multimodal-content-support", weight: 0.02, category: "Content Optimization" },

    // Category: Technical Implementation (9 dimensions, ~0.18)
    { name: "Schema Markup Support", slug: "schema-markup-support", weight: 0.03, category: "Technical Implementation" },
    { name: "llms.txt Generation", slug: "llms-txt-generation", weight: 0.02, category: "Technical Implementation" },
    { name: "Structured Data Validation", slug: "structured-data-validation", weight: 0.02, category: "Technical Implementation" },
    { name: "API Quality & Documentation", slug: "api-quality-documentation", weight: 0.02, category: "Technical Implementation" },
    { name: "Integration Ecosystem", slug: "integration-ecosystem", weight: 0.02, category: "Technical Implementation" },
    { name: "Performance Impact", slug: "performance-impact", weight: 0.02, category: "Technical Implementation" },
    { name: "Implementation Complexity", slug: "implementation-complexity", weight: 0.02, category: "Technical Implementation" },
    { name: "Crawlability Optimization", slug: "crawlability-optimization", weight: 0.02, category: "Technical Implementation" },
    { name: "AI Agent Accessibility", slug: "ai-agent-accessibility", weight: 0.01, category: "Technical Implementation" },

    // Category: Analytics & Reporting (8 dimensions, ~0.14)
    { name: "AI Search Analytics Depth", slug: "ai-search-analytics-depth", weight: 0.03, category: "Analytics & Reporting" },
    { name: "Competitive Benchmarking", slug: "competitive-benchmarking", weight: 0.02, category: "Analytics & Reporting" },
    { name: "Reporting Customization", slug: "reporting-customization", weight: 0.02, category: "Analytics & Reporting" },
    { name: "Data Export Capabilities", slug: "data-export-capabilities", weight: 0.01, category: "Analytics & Reporting" },
    { name: "Historical Trend Tracking", slug: "historical-trend-tracking", weight: 0.02, category: "Analytics & Reporting" },
    { name: "Alert & Notification System", slug: "alert-notification-system", weight: 0.01, category: "Analytics & Reporting" },
    { name: "ROI Attribution", slug: "roi-attribution", weight: 0.02, category: "Analytics & Reporting" },
    { name: "Cross-Platform Analytics", slug: "cross-platform-analytics", weight: 0.01, category: "Analytics & Reporting" },

    // Category: User Experience & Usability (8 dimensions, ~0.13)
    { name: "Dashboard Usability", slug: "dashboard-usability", weight: 0.02, category: "User Experience" },
    { name: "Onboarding Experience", slug: "onboarding-experience", weight: 0.02, category: "User Experience" },
    { name: "Documentation Quality", slug: "documentation-quality", weight: 0.02, category: "User Experience" },
    { name: "Workflow Efficiency", slug: "workflow-efficiency", weight: 0.02, category: "User Experience" },
    { name: "Multi-User Collaboration", slug: "multi-user-collaboration", weight: 0.01, category: "User Experience" },
    { name: "Mobile Accessibility", slug: "mobile-accessibility", weight: 0.02, category: "User Experience" },
    { name: "Error Handling & Guidance", slug: "error-handling-guidance", weight: 0.01, category: "User Experience" },
    { name: "Customization Flexibility", slug: "customization-flexibility", weight: 0.01, category: "User Experience" },

    // Category: Market & Value (9 dimensions, ~0.13)
    { name: "Pricing Transparency", slug: "pricing-transparency", weight: 0.02, category: "Market & Value" },
    { name: "Value for Investment", slug: "value-for-investment", weight: 0.02, category: "Market & Value" },
    { name: "Vendor Transparency", slug: "vendor-transparency", weight: 0.01, category: "Market & Value" },
    { name: "Update Frequency", slug: "update-frequency", weight: 0.02, category: "Market & Value" },
    { name: "Support Responsiveness", slug: "support-responsiveness", weight: 0.01, category: "Market & Value" },
    { name: "Scalability", slug: "scalability", weight: 0.02, category: "Market & Value" },
    { name: "Community & Ecosystem", slug: "community-ecosystem", weight: 0.01, category: "Market & Value" },
    { name: "Contract Flexibility", slug: "contract-flexibility", weight: 0.01, category: "Market & Value" },
    { name: "Training & Education Resources", slug: "training-education-resources", weight: 0.01, category: "Market & Value" },
  ];

  // Verify weights sum to 1.0
  const totalWeight = dimensionData.reduce((sum, d) => sum + d.weight, 0);
  if (Math.abs(totalWeight - 1.0) > 0.001) {
    throw new Error(`Scoring dimension weights sum to ${totalWeight}, expected 1.0`);
  }

  let dimensionOrder = 0;
  const dimensions = await Promise.all(
    dimensionData.map((d) =>
      prisma.scoringDimension.upsert({
        where: {
          methodologyVersionId_slug: {
            methodologyVersionId: methodology.id,
            slug: d.slug,
          },
        },
        update: {},
        create: {
          methodologyVersionId: methodology.id,
          trackId: geoTrack.id,
          name: d.name,
          slug: d.slug,
          weight: d.weight,
          category: d.category,
          displayOrder: dimensionOrder++,
        },
      })
    )
  );
  console.log(`✓ ${dimensions.length} scoring dimensions (weights sum: ${totalWeight.toFixed(4)})`);

  // ── Vendors & Tools (27+ tools across 7 market segments) ──────
  const vendorToolData: {
    vendor: { companyName: string; slug: string; websiteUrl: string; description: string };
    tools: { name: string; slug: string; description: string; websiteUrl: string; tracks: string[]; segments: string[] }[];
  }[] = [
    // 1. BrightEdge
    {
      vendor: { companyName: "BrightEdge", slug: "brightedge", websiteUrl: "https://www.brightedge.com", description: "Enterprise SEO and content performance platform with AI-powered insights" },
      tools: [{ name: "BrightEdge", slug: "brightedge", description: "Enterprise SEO platform with AI-powered content and search optimization", websiteUrl: "https://www.brightedge.com", tracks: ["geo-platform"], segments: ["enterprise-seo", "agency-consulting"] }],
    },
    // 2. Conductor
    {
      vendor: { companyName: "Conductor", slug: "conductor", websiteUrl: "https://www.conductor.com", description: "Enterprise organic marketing platform" },
      tools: [{ name: "Conductor", slug: "conductor", description: "Organic marketing platform combining SEO, content, and web optimization", websiteUrl: "https://www.conductor.com", tracks: ["geo-platform"], segments: ["enterprise-seo", "content-marketing"] }],
    },
    // 3. seoClarity
    {
      vendor: { companyName: "seoClarity", slug: "seoclarity", websiteUrl: "https://www.seoclarity.net", description: "Enterprise SEO platform with AI-powered research and optimization" },
      tools: [{ name: "seoClarity", slug: "seoclarity", description: "Enterprise SEO platform with comprehensive rank tracking and content optimization", websiteUrl: "https://www.seoclarity.net", tracks: ["geo-platform"], segments: ["enterprise-seo", "agency-consulting"] }],
    },
    // 4. Surfer SEO
    {
      vendor: { companyName: "Surfer SEO", slug: "surfer-seo", websiteUrl: "https://surferseo.com", description: "AI-powered content optimization and SERP analysis platform" },
      tools: [{ name: "Surfer SEO", slug: "surfer-seo", description: "Content optimization platform using AI to analyze SERPs and guide content creation", websiteUrl: "https://surferseo.com", tracks: ["geo-platform"], segments: ["content-marketing", "smb-marketing", "agency-consulting"] }],
    },
    // 5. MarketMuse
    {
      vendor: { companyName: "MarketMuse", slug: "marketmuse", websiteUrl: "https://www.marketmuse.com", description: "AI content planning and optimization platform" },
      tools: [{ name: "MarketMuse", slug: "marketmuse", description: "AI-powered content strategy platform with topic modeling and competitive analysis", websiteUrl: "https://www.marketmuse.com", tracks: ["geo-platform"], segments: ["content-marketing", "enterprise-seo"] }],
    },
    // 6. Clearscope
    {
      vendor: { companyName: "Clearscope", slug: "clearscope", websiteUrl: "https://www.clearscope.io", description: "AI-powered content optimization for search visibility" },
      tools: [{ name: "Clearscope", slug: "clearscope", description: "Content optimization platform driven by AI analysis for improved search performance", websiteUrl: "https://www.clearscope.io", tracks: ["geo-platform"], segments: ["content-marketing", "enterprise-seo"] }],
    },
    // 7. Frase
    {
      vendor: { companyName: "Frase", slug: "frase", websiteUrl: "https://www.frase.io", description: "AI content creation and optimization for SEO" },
      tools: [{ name: "Frase", slug: "frase", description: "AI-powered content research, creation, and optimization platform for SEO teams", websiteUrl: "https://www.frase.io", tracks: ["geo-platform"], segments: ["content-marketing", "smb-marketing"] }],
    },
    // 8. Semrush
    {
      vendor: { companyName: "Semrush", slug: "semrush", websiteUrl: "https://www.semrush.com", description: "All-in-one digital marketing and SEO platform" },
      tools: [{ name: "Semrush", slug: "semrush", description: "Comprehensive digital marketing suite with AI-enhanced SEO, content, and competitive analysis", websiteUrl: "https://www.semrush.com", tracks: ["geo-platform"], segments: ["enterprise-seo", "smb-marketing", "agency-consulting", "e-commerce"] }],
    },
    // 9. Ahrefs
    {
      vendor: { companyName: "Ahrefs", slug: "ahrefs", websiteUrl: "https://ahrefs.com", description: "SEO toolset for backlink analysis, keyword research, and content optimization" },
      tools: [{ name: "Ahrefs", slug: "ahrefs", description: "SEO toolset with comprehensive backlink index, keyword research, and content analysis", websiteUrl: "https://ahrefs.com", tracks: ["geo-platform"], segments: ["enterprise-seo", "smb-marketing", "agency-consulting", "technical-seo"] }],
    },
    // 10. WordLift
    {
      vendor: { companyName: "WordLift", slug: "wordlift", websiteUrl: "https://wordlift.io", description: "AI-powered structured data and knowledge graph platform for SEO" },
      tools: [{ name: "WordLift", slug: "wordlift", description: "Structured data and knowledge graph platform optimizing content for AI search engines", websiteUrl: "https://wordlift.io", tracks: ["geo-platform", "llms-txt-tooling"], segments: ["enterprise-seo", "e-commerce", "technical-seo"] }],
    },
    // 11. InLinks
    {
      vendor: { companyName: "InLinks", slug: "inlinks", websiteUrl: "https://inlinks.com", description: "Entity-based SEO and internal linking optimization" },
      tools: [{ name: "InLinks", slug: "inlinks", description: "Entity-based SEO platform automating internal linking and schema markup", websiteUrl: "https://inlinks.com", tracks: ["geo-platform", "llms-txt-tooling"], segments: ["technical-seo", "content-marketing"] }],
    },
    // 12. SchemaApp
    {
      vendor: { companyName: "Schema App", slug: "schema-app", websiteUrl: "https://www.schemaapp.com", description: "Enterprise schema markup and structured data management" },
      tools: [{ name: "Schema App", slug: "schema-app", description: "Enterprise structured data platform for implementing and managing schema markup at scale", websiteUrl: "https://www.schemaapp.com", tracks: ["geo-platform", "llms-txt-tooling"], segments: ["enterprise-seo", "e-commerce", "technical-seo"] }],
    },
    // 13. Alli AI
    {
      vendor: { companyName: "Alli AI", slug: "alli-ai", websiteUrl: "https://www.alliai.com", description: "AI-powered SEO automation platform" },
      tools: [{ name: "Alli AI", slug: "alli-ai", description: "Automated SEO optimization using AI to implement changes across websites", websiteUrl: "https://www.alliai.com", tracks: ["geo-platform"], segments: ["smb-marketing", "agency-consulting"] }],
    },
    // 14. Jasper
    {
      vendor: { companyName: "Jasper", slug: "jasper", websiteUrl: "https://www.jasper.ai", description: "AI content creation platform for marketing teams" },
      tools: [{ name: "Jasper", slug: "jasper", description: "Enterprise AI content platform for creating optimized marketing and SEO content", websiteUrl: "https://www.jasper.ai", tracks: ["geo-platform"], segments: ["content-marketing", "enterprise-seo", "agency-consulting"] }],
    },
    // 15. Writer
    {
      vendor: { companyName: "Writer", slug: "writer", websiteUrl: "https://writer.com", description: "Enterprise AI writing platform with brand consistency" },
      tools: [{ name: "Writer", slug: "writer", description: "AI writing platform ensuring brand-consistent content optimized for search visibility", websiteUrl: "https://writer.com", tracks: ["geo-platform"], segments: ["enterprise-seo", "content-marketing"] }],
    },
    // 16. Scalenut
    {
      vendor: { companyName: "Scalenut", slug: "scalenut", websiteUrl: "https://www.scalenut.com", description: "AI-powered SEO and content marketing platform" },
      tools: [{ name: "Scalenut", slug: "scalenut", description: "AI content platform combining SEO research, content creation, and optimization", websiteUrl: "https://www.scalenut.com", tracks: ["geo-platform"], segments: ["smb-marketing", "content-marketing"] }],
    },
    // 17. NeuronWriter
    {
      vendor: { companyName: "NeuronWriter", slug: "neuronwriter", websiteUrl: "https://neuronwriter.com", description: "AI content optimization with semantic analysis" },
      tools: [{ name: "NeuronWriter", slug: "neuronwriter", description: "Content optimization tool using semantic models and NLP for better search rankings", websiteUrl: "https://neuronwriter.com", tracks: ["geo-platform"], segments: ["smb-marketing", "content-marketing"] }],
    },
    // 18. Dashword
    {
      vendor: { companyName: "Dashword", slug: "dashword", websiteUrl: "https://www.dashword.com", description: "Content optimization software for SEO teams" },
      tools: [{ name: "Dashword", slug: "dashword", description: "Streamlined content optimization tool for creating search-optimized content", websiteUrl: "https://www.dashword.com", tracks: ["geo-platform"], segments: ["smb-marketing", "content-marketing"] }],
    },
    // 19. Content Harmony
    {
      vendor: { companyName: "Content Harmony", slug: "content-harmony", websiteUrl: "https://www.contentharmony.com", description: "Content strategy and optimization workflow platform" },
      tools: [{ name: "Content Harmony", slug: "content-harmony", description: "Content brief and optimization platform for scalable search-optimized content production", websiteUrl: "https://www.contentharmony.com", tracks: ["geo-platform"], segments: ["agency-consulting", "content-marketing"] }],
    },
    // 20. GrowthBar
    {
      vendor: { companyName: "GrowthBar", slug: "growthbar", websiteUrl: "https://www.growthbarseo.com", description: "AI writing and SEO tool for bloggers and content teams" },
      tools: [{ name: "GrowthBar SEO", slug: "growthbar-seo", description: "AI SEO tool for content creation, keyword research, and competitive analysis", websiteUrl: "https://www.growthbarseo.com", tracks: ["geo-platform"], segments: ["smb-marketing", "content-marketing"] }],
    },
    // 21. PageOptimizer Pro
    {
      vendor: { companyName: "PageOptimizer Pro", slug: "pageoptimizer-pro", websiteUrl: "https://pageoptimizer.pro", description: "On-page SEO optimization using NLP analysis" },
      tools: [{ name: "PageOptimizer Pro", slug: "pageoptimizer-pro", description: "NLP-based on-page optimization tool for improving content relevance and rankings", websiteUrl: "https://pageoptimizer.pro", tracks: ["geo-platform"], segments: ["technical-seo", "agency-consulting"] }],
    },
    // 22. RankIQ
    {
      vendor: { companyName: "RankIQ", slug: "rankiq", websiteUrl: "https://www.rankiq.com", description: "AI SEO toolset for bloggers and small publishers" },
      tools: [{ name: "RankIQ", slug: "rankiq", description: "AI-powered keyword library and content optimizer for niche content creators", websiteUrl: "https://www.rankiq.com", tracks: ["geo-platform"], segments: ["smb-marketing", "content-marketing"] }],
    },
    // 23. SearchAtlas
    {
      vendor: { companyName: "SearchAtlas", slug: "searchatlas", websiteUrl: "https://searchatlas.com", description: "SEO software suite with AI content tools" },
      tools: [{ name: "SearchAtlas", slug: "searchatlas", description: "All-in-one SEO platform with AI content assistant and technical SEO auditing", websiteUrl: "https://searchatlas.com", tracks: ["geo-platform"], segments: ["smb-marketing", "agency-consulting"] }],
    },
    // 24. OutRanking
    {
      vendor: { companyName: "OutRanking", slug: "outranking", websiteUrl: "https://www.outranking.io", description: "AI-powered SEO content strategy and writing" },
      tools: [{ name: "OutRanking", slug: "outranking", description: "AI content strategy platform automating SEO writing and content optimization workflows", websiteUrl: "https://www.outranking.io", tracks: ["geo-platform"], segments: ["content-marketing", "smb-marketing"] }],
    },
    // 25. Writesonic
    {
      vendor: { companyName: "Writesonic", slug: "writesonic", websiteUrl: "https://writesonic.com", description: "AI writing platform for marketing and SEO content" },
      tools: [{ name: "Writesonic", slug: "writesonic", description: "AI content generation platform with SEO optimization for articles, ads, and landing pages", websiteUrl: "https://writesonic.com", tracks: ["geo-platform"], segments: ["smb-marketing", "e-commerce"] }],
    },
    // 26. Copy.ai
    {
      vendor: { companyName: "Copy.ai", slug: "copy-ai", websiteUrl: "https://www.copy.ai", description: "AI-powered copywriting and content automation" },
      tools: [{ name: "Copy.ai", slug: "copy-ai", description: "AI copywriting platform with workflows for SEO content, social media, and marketing copy", websiteUrl: "https://www.copy.ai", tracks: ["geo-platform"], segments: ["smb-marketing", "content-marketing"] }],
    },
    // 27. Yext
    {
      vendor: { companyName: "Yext", slug: "yext", websiteUrl: "https://www.yext.com", description: "Digital presence platform for multi-location businesses" },
      tools: [{ name: "Yext", slug: "yext", description: "AI-powered digital presence platform managing listings, reviews, and pages for local search", websiteUrl: "https://www.yext.com", tracks: ["geo-platform"], segments: ["local-multi-location", "enterprise-seo"] }],
    },
    // 28. Rio SEO
    {
      vendor: { companyName: "Rio SEO", slug: "rio-seo", websiteUrl: "https://www.rioseo.com", description: "Local search and reputation management for enterprises" },
      tools: [{ name: "Rio SEO", slug: "rio-seo", description: "Enterprise local marketing platform for search visibility, reputation, and reporting", websiteUrl: "https://www.rioseo.com", tracks: ["geo-platform"], segments: ["local-multi-location", "enterprise-seo"] }],
    },
  ];

  let vendorCount = 0;
  let toolCount = 0;

  for (const { vendor, tools } of vendorToolData) {
    const vendorRecord = await prisma.vendor.upsert({
      where: { slug: vendor.slug },
      update: {},
      create: vendor,
    });
    vendorCount++;

    for (const tool of tools) {
      const toolRecord = await prisma.tool.upsert({
        where: { slug: tool.slug },
        update: {},
        create: {
          name: tool.name,
          slug: tool.slug,
          description: tool.description,
          websiteUrl: tool.websiteUrl,
          vendorId: vendorRecord.id,
        },
      });

      // Track mappings
      for (const trackSlug of tool.tracks) {
        const tid = trackMap[trackSlug];
        if (tid) {
          await prisma.toolTrackMapping.upsert({
            where: { toolId_trackId: { toolId: toolRecord.id, trackId: tid } },
            update: {},
            create: { toolId: toolRecord.id, trackId: tid },
          });
        }
      }

      // Segment mappings
      for (const segSlug of tool.segments) {
        const sid = segmentMap[segSlug];
        if (sid) {
          await prisma.toolSegmentMapping.upsert({
            where: { toolId_segmentId: { toolId: toolRecord.id, segmentId: sid } },
            update: {},
            create: { toolId: toolRecord.id, segmentId: sid },
          });
        }
      }

      toolCount++;
    }
  }
  console.log(`✓ ${vendorCount} vendors, ${toolCount} tools`);

  console.log("\nSeed complete.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
