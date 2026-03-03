import { ConfidenceTag } from "@prisma/client";
import { prisma } from "@/lib/db";

/**
 * Calculate composite score for a tool in a cycle.
 * AC-012-01: Weighted average with renormalized weights for N/A dimensions.
 * BR-S03, BR-S04: Weight renormalization.
 * BR-S05: Rounded to one decimal place, round half up.
 */
export function calculateCompositeScore(
  scores: { value: number; weight: number; isApplicable: boolean }[]
): { compositeScore: number; applicableDimensions: number; totalDimensions: number } {
  const applicableScores = scores.filter((s) => s.isApplicable);

  if (applicableScores.length === 0) {
    return { compositeScore: 0, applicableDimensions: 0, totalDimensions: scores.length };
  }

  // Renormalize weights for applicable dimensions only
  const totalApplicableWeight = applicableScores.reduce((sum, s) => sum + s.weight, 0);

  if (totalApplicableWeight === 0) {
    return { compositeScore: 0, applicableDimensions: applicableScores.length, totalDimensions: scores.length };
  }

  const weightedSum = applicableScores.reduce(
    (sum, s) => sum + s.value * (s.weight / totalApplicableWeight),
    0
  );

  // BR-S05: Round half up to one decimal place
  const compositeScore = Math.round(weightedSum * 10) / 10;

  return {
    compositeScore,
    applicableDimensions: applicableScores.length,
    totalDimensions: scores.length,
  };
}

/**
 * Derive a composite confidence tag from individual score confidence tags.
 * Uses the lowest confidence (most conservative) from the set.
 */
function deriveCompositeConfidence(tags: ConfidenceTag[]): ConfidenceTag {
  if (tags.length === 0) return ConfidenceTag.InsufficientData;
  const priority: ConfidenceTag[] = [
    ConfidenceTag.InsufficientData,
    ConfidenceTag.Low,
    ConfidenceTag.Medium,
    ConfidenceTag.High,
  ];
  let lowestIndex = priority.length - 1;
  for (const tag of tags) {
    const idx = priority.indexOf(tag);
    if (idx < lowestIndex) lowestIndex = idx;
  }
  return priority[lowestIndex];
}

/**
 * Apply dense ranking to a sorted list of scores.
 * AC-012-02, BR-S08: Tied scores get same rank.
 */
export function applyDenseRanking<T extends { compositeScore: number }>(
  items: T[]
): (T & { rank: number })[] {
  // Sort by descending composite score
  const sorted = [...items].sort((a, b) => b.compositeScore - a.compositeScore);

  let currentRank = 1;
  let previousScore: number | null = null;

  return sorted.map((item) => {
    if (previousScore !== null && item.compositeScore < previousScore) {
      currentRank++;
    }
    previousScore = item.compositeScore;
    return { ...item, rank: currentRank };
  });
}

/**
 * Calculate and store composite scores for all tools in a cycle.
 * Also computes per-segment composite scores.
 */
export async function calculateCycleCompositeScores(cycleId: string) {
  // Get cycle with methodology dimensions
  const cycle = await prisma.benchmarkCycle.findUniqueOrThrow({
    where: { id: cycleId },
    include: {
      methodologyVersion: {
        include: {
          scoringDimensions: {
            where: { isActive: true },
          },
        },
      },
    },
  });

  // Get all scores for this cycle
  const scores = await prisma.score.findMany({
    where: { cycleId },
    include: { dimension: true },
  });

  // Group scores by tool
  const toolScores = new Map<string, typeof scores>();
  for (const score of scores) {
    const group = toolScores.get(score.toolId) ?? [];
    group.push(score);
    toolScores.set(score.toolId, group);
  }

  const compositeResults: { toolId: string; compositeScore: number }[] = [];

  // Calculate composite for each tool
  for (const [toolId, tScores] of toolScores) {
    const dimensionWeights = new Map(
      cycle.methodologyVersion!.scoringDimensions.map((d) => [d.id, Number(d.weight)])
    );

    const scoreInputs = tScores.map((s) => ({
      value: Number(s.value),
      weight: dimensionWeights.get(s.dimensionId) ?? 0,
      isApplicable: s.isApplicable,
    }));

    const { compositeScore } = calculateCompositeScore(scoreInputs);

    // Derive composite confidence from individual score confidence tags
    const applicableTags = tScores
      .filter((s) => s.isApplicable)
      .map((s) => s.confidenceTag);
    const confidenceTag = deriveCompositeConfidence(applicableTags);

    // Nullable segmentId can't use compound unique in upsert, so find-then-create/update
    const existing = await prisma.compositeScore.findFirst({
      where: { cycleId, toolId, segmentId: null },
    });
    if (existing) {
      await prisma.compositeScore.update({
        where: { id: existing.id },
        data: { value: compositeScore, confidenceTag },
      });
    } else {
      await prisma.compositeScore.create({
        data: { cycleId, toolId, segmentId: null, value: compositeScore, rank: 0, confidenceTag },
      });
    }

    compositeResults.push({ toolId, compositeScore });
  }

  // Apply dense ranking
  const ranked = applyDenseRanking(compositeResults);

  // Update ranks
  for (const item of ranked) {
    const scoreRecord = await prisma.compositeScore.findFirst({
      where: { cycleId, toolId: item.toolId, segmentId: null },
    });
    if (scoreRecord) {
      await prisma.compositeScore.update({
        where: { id: scoreRecord.id },
        data: { rank: item.rank },
      });
    }
  }

  return ranked;
}
