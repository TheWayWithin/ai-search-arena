import { prisma } from "@/lib/db";

/**
 * Get leaderboard data for a cycle.
 * Returns ranked tools with composite scores.
 */
export async function getLeaderboardData(cycleId: string, segmentId: string | null = null) {
  return prisma.compositeScore.findMany({
    where: { cycleId, segmentId },
    include: {
      tool: {
        include: {
          vendor: true,
          badges: { where: { cycleId } },
        },
      },
    },
    orderBy: { rank: "asc" },
  });
}

/**
 * Get all market segments for the segment filter.
 */
export async function getMarketSegments() {
  return prisma.marketSegment.findMany({
    orderBy: { name: "asc" },
  });
}

/**
 * Get the latest published cycle.
 */
export async function getLatestPublishedCycle() {
  return prisma.benchmarkCycle.findFirst({
    where: {
      state: "Completed",
    },
    include: {
      methodologyVersion: true,
      report: true,
    },
    orderBy: { publishedAt: "desc" },
  });
}

/**
 * Get all published cycles for the cycle selector.
 */
export async function getPublishedCycles() {
  return prisma.benchmarkCycle.findMany({
    where: {
      state: "Completed",
    },
    select: {
      id: true,
      cycleIdentifier: true,
      displayName: true,
      publishedAt: true,
    },
    orderBy: { publishedAt: "desc" },
  });
}

/**
 * Get tool detail for a specific tool in a cycle.
 */
export async function getToolDetail(toolSlug: string, cycleId?: string) {
  const tool = await prisma.tool.findUnique({
    where: { slug: toolSlug },
    include: {
      vendor: true,
      segmentMappings: {
        include: { segment: true },
      },
      trackMappings: {
        include: { track: true },
      },
    },
  });

  if (!tool) return null;

  // Get the latest published cycle if no cycleId specified
  let targetCycleId = cycleId;
  if (!targetCycleId) {
    const latestCycle = await getLatestPublishedCycle();
    if (!latestCycle) return { tool, scores: [], compositeScore: null, cycle: null, badges: [] };
    targetCycleId = latestCycle.id;
  }

  const cycle = await prisma.benchmarkCycle.findUnique({
    where: { id: targetCycleId },
    include: { methodologyVersion: true },
  });

  // Get all dimension scores for this tool in the cycle
  const scores = await prisma.score.findMany({
    where: {
      toolId: tool.id,
      cycleId: targetCycleId,
    },
    include: {
      dimension: true,
      synthesis: true,
    },
    orderBy: { dimension: { category: "asc" } },
  });

  // Get composite score
  const compositeScore = await prisma.compositeScore.findFirst({
    where: {
      toolId: tool.id,
      cycleId: targetCycleId,
      segmentId: null,
    },
  });

  // Get badges for this tool in this cycle
  const badges = await prisma.badge.findMany({
    where: { toolId: tool.id, cycleId: targetCycleId },
    orderBy: [{ tier: "asc" }, { badgeType: "asc" }],
  });

  return { tool, scores, compositeScore, cycle, badges };
}

/**
 * Get all tool slugs for static generation.
 */
export async function getAllToolSlugs() {
  const tools = await prisma.tool.findMany({
    where: { isArchived: false },
    select: { slug: true },
  });
  return tools.map((t) => t.slug);
}

/**
 * Get methodology data for the methodology page.
 */
/**
 * Batch-fetch all data needed for the tool comparison view.
 */
export async function getComparisonData(toolSlugs: string[], cycleId?: string) {
  // Resolve cycle
  let targetCycleId = cycleId;
  if (!targetCycleId) {
    const latestCycle = await getLatestPublishedCycle();
    if (!latestCycle) return { cycle: null, tools: [], scores: [], compositeScores: [] };
    targetCycleId = latestCycle.id;
  }

  const cycle = await prisma.benchmarkCycle.findUnique({
    where: { id: targetCycleId },
    include: { methodologyVersion: true },
  });

  // Fetch tools by slug array
  const tools = await prisma.tool.findMany({
    where: { slug: { in: toolSlugs }, isArchived: false },
    include: { vendor: true },
  });

  const toolIds = tools.map((t) => t.id);

  // Fetch all dimension scores for all tools in one query
  const scores = await prisma.score.findMany({
    where: {
      cycleId: targetCycleId,
      toolId: { in: toolIds },
    },
    include: {
      dimension: true,
      synthesis: true,
    },
    orderBy: [{ dimension: { category: "asc" } }, { dimension: { displayOrder: "asc" } }],
  });

  // Fetch composite scores (overall, not segment-specific)
  const compositeScores = await prisma.compositeScore.findMany({
    where: {
      cycleId: targetCycleId,
      toolId: { in: toolIds },
      segmentId: null,
    },
  });

  return { cycle, tools, scores, compositeScores };
}

/**
 * Get all tools for the comparison selector dropdown.
 */
export async function getAllToolsForSelector() {
  const tools = await prisma.tool.findMany({
    where: { isArchived: false },
    include: { vendor: true },
    orderBy: { name: "asc" },
  });
  return tools.map((t) => ({
    slug: t.slug,
    name: t.name,
    vendorName: t.vendor?.companyName ?? "",
  }));
}

/**
 * Get all published cycles with tool counts and methodology versions.
 */
export async function getPublishedCyclesWithStats() {
  const cycles = await prisma.benchmarkCycle.findMany({
    where: { state: "Completed" },
    include: {
      methodologyVersion: { select: { versionNumber: true } },
      _count: { select: { compositeScores: { where: { segmentId: null } } } },
    },
    orderBy: { publishedAt: "desc" },
  });

  return cycles.map((c) => ({
    id: c.id,
    cycleIdentifier: c.cycleIdentifier,
    displayName: c.displayName,
    publishedAt: c.publishedAt,
    methodologyVersion: c.methodologyVersion?.versionNumber ?? null,
    toolCount: c._count.compositeScores,
  }));
}

export async function getMethodologyData() {
  const methodology = await prisma.methodologyVersion.findFirst({
    where: { isLocked: true },
    include: {
      scoringDimensions: {
        where: { isActive: true },
        orderBy: [{ category: "asc" }, { name: "asc" }],
      },
    },
    orderBy: { effectiveDate: "desc" },
  });

  // Fallback to latest methodology if none locked
  if (!methodology) {
    return prisma.methodologyVersion.findFirst({
      include: {
        scoringDimensions: {
          where: { isActive: true },
          orderBy: [{ category: "asc" }, { name: "asc" }],
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  return methodology;
}
