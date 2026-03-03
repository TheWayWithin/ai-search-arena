import { prisma } from "@/lib/db";

/**
 * Generate a benchmark report for a cycle.
 * AC-014-01: Structured data + narrative sections from approved scores.
 */
export async function generateReport(data: {
  cycleId: string;
  title: string;
  slug: string;
  executiveSummary?: string;
}) {
  // Get composite scores with rankings
  const compositeScores = await prisma.compositeScore.findMany({
    where: { cycleId: data.cycleId, segmentId: null },
    include: {
      tool: { include: { vendor: true } },
    },
    orderBy: { rank: "asc" },
  });

  // Get cycle metadata
  const cycle = await prisma.benchmarkCycle.findUniqueOrThrow({
    where: { id: data.cycleId },
    include: {
      methodologyVersion: true,
      _count: {
        select: {
          enrollments: true,
          scores: true,
        },
      },
    },
  });

  // Build structured report content
  const reportContent = {
    cycleIdentifier: cycle.cycleIdentifier,
    displayName: cycle.displayName,
    methodologyVersion: cycle.methodologyVersion?.versionNumber,
    toolsEvaluated: compositeScores.length,
    totalScores: cycle._count.scores,
    rankings: compositeScores.map((cs) => ({
      rank: cs.rank,
      toolName: cs.tool.name,
      vendorName: cs.tool.vendor?.companyName,
      compositeScore: Number(cs.value),
      confidenceTag: cs.confidenceTag,
    })),
    generatedAt: new Date().toISOString(),
  };

  return prisma.benchmarkReport.upsert({
    where: { cycleId: data.cycleId },
    update: {
      title: data.title,
      slug: data.slug,
      executiveSummary: data.executiveSummary,
      content: reportContent,
    },
    create: {
      cycleId: data.cycleId,
      title: data.title,
      slug: data.slug,
      executiveSummary: data.executiveSummary,
      content: reportContent,
    },
  });
}

/**
 * Publish a report (set publishedAt timestamp).
 * AC-014-02: Publication transitions cycle to Publication state.
 */
export async function publishReport(reportId: string) {
  return prisma.benchmarkReport.update({
    where: { id: reportId },
    data: { publishedAt: new Date() },
  });
}

/**
 * Get a published report by slug.
 */
export async function getReportBySlug(slug: string) {
  return prisma.benchmarkReport.findUnique({
    where: { slug },
    include: {
      cycle: {
        include: {
          methodologyVersion: true,
        },
      },
    },
  });
}

/**
 * Get the latest published report.
 */
export async function getLatestReport() {
  return prisma.benchmarkReport.findFirst({
    where: { publishedAt: { not: null } },
    include: {
      cycle: {
        include: {
          methodologyVersion: true,
        },
      },
    },
    orderBy: { publishedAt: "desc" },
  });
}
