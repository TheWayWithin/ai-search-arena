import { prisma } from "@/lib/db";

/**
 * Get all vendors with their tools.
 */
export async function getVendors() {
  return prisma.vendor.findMany({
    include: {
      tools: {
        where: { isArchived: false },
        include: {
          trackMappings: { include: { track: true } },
          segmentMappings: { include: { segment: true } },
        },
      },
    },
    orderBy: { companyName: "asc" },
  });
}

/**
 * Get a vendor by slug.
 */
export async function getVendorBySlug(slug: string) {
  return prisma.vendor.findUnique({
    where: { slug },
    include: {
      tools: {
        include: {
          trackMappings: { include: { track: true } },
          segmentMappings: { include: { segment: true } },
        },
      },
    },
  });
}

/**
 * Create a vendor (AC-010-01).
 */
export async function createVendor(data: {
  companyName: string;
  slug: string;
  websiteUrl?: string;
  contactName?: string;
  contactEmail?: string;
  description?: string;
}) {
  return prisma.vendor.create({ data });
}

/**
 * Create a tool linked to a vendor (AC-010-02).
 */
export async function createTool(data: {
  name: string;
  slug: string;
  description: string;
  websiteUrl: string;
  vendorId: string;
  trackIds?: string[];
  segmentIds?: string[];
}) {
  const { trackIds, segmentIds, ...toolData } = data;

  return prisma.tool.create({
    data: {
      ...toolData,
      trackMappings: trackIds ? { create: trackIds.map((trackId) => ({ trackId })) } : undefined,
      segmentMappings: segmentIds
        ? { create: segmentIds.map((segmentId) => ({ segmentId })) }
        : undefined,
    },
    include: {
      vendor: true,
      trackMappings: { include: { track: true } },
      segmentMappings: { include: { segment: true } },
    },
  });
}

/**
 * Get all vendors that have at least one non-archived tool, with tool counts.
 */
export async function getVendorsWithToolCounts() {
  const vendors = await prisma.vendor.findMany({
    where: {
      tools: { some: { isArchived: false } },
    },
    include: {
      _count: { select: { tools: { where: { isArchived: false } } } },
    },
    orderBy: { companyName: "asc" },
  });

  return vendors.map((v) => ({
    id: v.id,
    companyName: v.companyName,
    slug: v.slug,
    description: v.description,
    websiteUrl: v.websiteUrl,
    toolCount: v._count.tools,
  }));
}

/**
 * Get vendor with their tools' composite scores and badges for a cycle.
 */
export async function getVendorWithScores(slug: string, cycleId?: string) {
  const vendor = await prisma.vendor.findUnique({
    where: { slug },
    include: {
      tools: {
        where: { isArchived: false },
        orderBy: { name: "asc" },
      },
    },
  });

  if (!vendor) return null;

  // Resolve cycle
  let targetCycleId = cycleId;
  if (!targetCycleId) {
    const latestCycle = await prisma.benchmarkCycle.findFirst({
      where: { state: "Completed" },
      orderBy: { publishedAt: "desc" },
      select: { id: true },
    });
    targetCycleId = latestCycle?.id;
  }

  if (!targetCycleId) {
    return {
      vendor,
      tools: vendor.tools.map((t) => ({ ...t, compositeScore: null, badges: [] })),
      cycle: null,
    };
  }

  const cycle = await prisma.benchmarkCycle.findUnique({
    where: { id: targetCycleId },
    select: { id: true, displayName: true, cycleIdentifier: true },
  });

  const toolIds = vendor.tools.map((t) => t.id);

  // Batch fetch composite scores (overall) for all vendor tools
  const compositeScores = await prisma.compositeScore.findMany({
    where: {
      cycleId: targetCycleId,
      toolId: { in: toolIds },
      segmentId: null,
    },
  });
  const csMap = new Map(compositeScores.map((cs) => [cs.toolId, cs]));

  // Batch fetch badges for all vendor tools
  const badges = await prisma.badge.findMany({
    where: {
      cycleId: targetCycleId,
      toolId: { in: toolIds },
    },
    orderBy: [{ tier: "asc" }, { badgeType: "asc" }],
  });
  const badgeMap = new Map<string, typeof badges>();
  for (const b of badges) {
    const arr = badgeMap.get(b.toolId) ?? [];
    arr.push(b);
    badgeMap.set(b.toolId, arr);
  }

  const toolsWithScores = vendor.tools.map((t) => ({
    ...t,
    compositeScore: csMap.get(t.id) ?? null,
    badges: badgeMap.get(t.id) ?? [],
  }));

  return { vendor, tools: toolsWithScores, cycle };
}

/**
 * Archive a tool (soft delete, AC-010-03).
 * Tools with published evaluations cannot be hard-deleted.
 */
export async function archiveTool(toolId: string) {
  return prisma.tool.update({
    where: { id: toolId },
    data: { isArchived: true },
  });
}

/**
 * Get all tools with track and segment mappings.
 */
export async function getTools(options?: { includeArchived?: boolean }) {
  return prisma.tool.findMany({
    where: options?.includeArchived ? {} : { isArchived: false },
    include: {
      vendor: true,
      trackMappings: { include: { track: true } },
      segmentMappings: { include: { segment: true } },
    },
    orderBy: { name: "asc" },
  });
}

/**
 * Get a tool by slug.
 */
export async function getToolBySlug(slug: string) {
  return prisma.tool.findUnique({
    where: { slug },
    include: {
      vendor: true,
      trackMappings: { include: { track: true } },
      segmentMappings: { include: { segment: true } },
    },
  });
}

/**
 * Get all market segments.
 */
export async function getMarketSegments() {
  return prisma.marketSegment.findMany({
    orderBy: { name: "asc" },
  });
}
