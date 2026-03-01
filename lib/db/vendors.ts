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
      trackMappings: trackIds
        ? { create: trackIds.map((trackId) => ({ trackId })) }
        : undefined,
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
