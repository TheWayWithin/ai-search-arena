import { prisma } from "@/lib/db";

/**
 * Get the current (latest unlocked or most recent locked) methodology version.
 */
export async function getCurrentMethodology() {
  return prisma.methodologyVersion.findFirst({
    orderBy: { effectiveDate: "desc" },
    include: {
      scoringDimensions: {
        where: { isActive: true },
        orderBy: { displayOrder: "asc" },
      },
    },
  });
}

/**
 * Get a methodology version with all its dimensions.
 */
export async function getMethodologyWithDimensions(versionId: string) {
  return prisma.methodologyVersion.findUnique({
    where: { id: versionId },
    include: {
      scoringDimensions: {
        where: { isActive: true },
        orderBy: { displayOrder: "asc" },
        include: { track: true },
      },
    },
  });
}

/**
 * Lock a methodology version (AC-013-02).
 * Once locked, the methodology is immutable for its linked cycles.
 */
export async function lockMethodologyVersion(versionId: string) {
  const version = await prisma.methodologyVersion.findUnique({
    where: { id: versionId },
    include: { scoringDimensions: { where: { isActive: true } } },
  });

  if (!version) throw new Error("Methodology version not found");
  if (version.isLocked) throw new Error("Methodology version is already locked");

  // Validate weights sum to 1.0 per track before locking
  const dimensionsByTrack = new Map<string, number>();
  for (const dim of version.scoringDimensions) {
    const current = dimensionsByTrack.get(dim.trackId) ?? 0;
    dimensionsByTrack.set(dim.trackId, current + Number(dim.weight));
  }

  for (const [trackId, totalWeight] of dimensionsByTrack) {
    if (Math.abs(totalWeight - 1.0) > 0.001) {
      throw new Error(
        `Weights for track ${trackId} sum to ${totalWeight.toFixed(4)}, expected 1.0`
      );
    }
  }

  return prisma.methodologyVersion.update({
    where: { id: versionId },
    data: {
      isLocked: true,
      lockedAt: new Date(),
    },
  });
}

/**
 * Validate that dimension weights within a track sum to 1.0.
 */
export async function validateDimensionWeights(methodologyVersionId: string, trackId: string) {
  const dimensions = await prisma.scoringDimension.findMany({
    where: {
      methodologyVersionId,
      trackId,
      isActive: true,
    },
  });

  const totalWeight = dimensions.reduce((sum, d) => sum + Number(d.weight), 0);

  return {
    valid: Math.abs(totalWeight - 1.0) <= 0.001,
    totalWeight,
    dimensionCount: dimensions.length,
  };
}
