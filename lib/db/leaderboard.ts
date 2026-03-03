import { prisma } from "@/lib/db";

/**
 * Get leaderboard data for a cycle.
 * Returns ranked tools with composite scores.
 */
export async function getLeaderboardData(cycleId: string, segmentId: string | null = null) {
  const where: { cycleId: string; segmentId: string | null } = {
    cycleId,
    segmentId,
  };

  return prisma.compositeScore.findMany({
    where,
    include: {
      tool: {
        include: {
          vendor: true,
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
    if (!latestCycle) return { tool, scores: [], compositeScore: null, cycle: null };
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

  return { tool, scores, compositeScore, cycle };
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
