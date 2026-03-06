import { ConfidenceTag } from "@prisma/client";
import { prisma } from "@/lib/db";

/**
 * Compute the median of an array of numbers.
 * BR-S09: Median-based aggregation.
 */
function computeMedian(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2;
  }
  return sorted[mid];
}

/**
 * Round to one decimal place, round half up.
 * BR-S05: Score value normalized to 0-10 scale, one decimal place, round half up.
 */
function roundHalfUp(value: number): number {
  return Math.round(value * 10) / 10;
}

/**
 * Derive confidence tag from inter-model agreement.
 * BR-S10, AC-011-01: High / Medium / Low / Insufficient Data.
 */
function deriveConfidenceTag(
  scores: number[],
  successCount: number,
  totalModels: number
): ConfidenceTag {
  // AC-011-02, BR-S07: <4 successful models = Insufficient Data
  if (successCount < 4) {
    return ConfidenceTag.InsufficientData;
  }

  // Calculate inter-model agreement (standard deviation)
  const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
  const variance = scores.reduce((sum, s) => sum + Math.pow(s - mean, 2), 0) / scores.length;
  const stdDev = Math.sqrt(variance);

  // Agreement thresholds based on standard deviation
  if (stdDev <= 0.5) return ConfidenceTag.High;
  if (stdDev <= 1.5) return ConfidenceTag.Medium;
  return ConfidenceTag.Low;
}

/**
 * Synthesize scores for a single (tool x dimension) from model evaluations.
 * AC-011-03, BR-S12: Deterministic — identical inputs produce identical outputs.
 */
export function synthesizeScores(
  evaluations: {
    modelId: string;
    parsedScore: number | null;
    status: string;
  }[]
): {
  medianValue: number;
  confidenceTag: ConfidenceTag;
  modelsSucceeded: number;
  modelsFailed: number;
  agreementMetric: number;
  isInsufficient: boolean;
} {
  const successfulScores = evaluations
    .filter((e) => e.status === "Success" && e.parsedScore !== null)
    .map((e) => e.parsedScore as number);

  const modelsSucceeded = successfulScores.length;
  const modelsFailed = evaluations.length - modelsSucceeded;

  if (modelsSucceeded === 0) {
    return {
      medianValue: 0,
      confidenceTag: ConfidenceTag.InsufficientData,
      modelsSucceeded: 0,
      modelsFailed: evaluations.length,
      agreementMetric: 0,
      isInsufficient: true,
    };
  }

  const medianValue = roundHalfUp(computeMedian(successfulScores));
  const confidenceTag = deriveConfidenceTag(successfulScores, modelsSucceeded, evaluations.length);

  // Agreement metric: 1 - normalized standard deviation (0 = no agreement, 1 = perfect)
  const mean = successfulScores.reduce((a, b) => a + b, 0) / successfulScores.length;
  const variance =
    successfulScores.reduce((sum, s) => sum + Math.pow(s - mean, 2), 0) / successfulScores.length;
  const stdDev = Math.sqrt(variance);
  const agreementMetric = roundHalfUp(Math.max(0, 1 - stdDev / 5)); // Normalize to 0-1 range (max std dev ~5)

  return {
    medianValue,
    confidenceTag,
    modelsSucceeded,
    modelsFailed,
    agreementMetric,
    isInsufficient: modelsSucceeded < 4,
  };
}

/**
 * Run synthesis for all (tool x dimension) pairs in a cycle.
 * Creates Score and SynthesisRecord entries.
 */
export async function synthesizeCycleScores(cycleId: string) {
  // Get all evaluations for this cycle
  const evaluations = await prisma.modelEvaluation.findMany({
    where: { cycleId },
    include: {
      dimension: true,
      model: true,
    },
  });

  // Group by (toolId, dimensionId)
  const groups = new Map<string, typeof evaluations>();
  for (const eval_ of evaluations) {
    const key = `${eval_.toolId}:${eval_.dimensionId}`;
    const group = groups.get(key) ?? [];
    group.push(eval_);
    groups.set(key, group);
  }

  const results: {
    toolId: string;
    dimensionId: string;
    medianValue: number;
    confidenceTag: ConfidenceTag;
  }[] = [];

  for (const [key, groupEvals] of groups) {
    const [toolId, dimensionId] = key.split(":");

    const synthesis = synthesizeScores(
      groupEvals.map((e) => ({
        modelId: e.modelId,
        parsedScore: e.parsedScore ? Number(e.parsedScore) : null,
        status: e.status,
      }))
    );

    // Create Score record
    const score = await prisma.score.upsert({
      where: {
        cycleId_toolId_dimensionId: {
          cycleId,
          toolId,
          dimensionId,
        },
      },
      update: {
        value: synthesis.medianValue,
        confidenceTag: synthesis.confidenceTag,
      },
      create: {
        cycleId,
        toolId,
        dimensionId,
        value: synthesis.medianValue,
        confidenceTag: synthesis.confidenceTag,
      },
    });

    // Create SynthesisRecord
    await prisma.synthesisRecord.upsert({
      where: { scoreId: score.id },
      update: {
        modelsSucceeded: synthesis.modelsSucceeded,
        modelsFailed: synthesis.modelsFailed,
        medianValue: synthesis.medianValue,
        agreementMetric: synthesis.agreementMetric,
        confidenceTag: synthesis.confidenceTag,
        sourceModelIds: groupEvals.map((e) => e.id),
      },
      create: {
        scoreId: score.id,
        dimensionId,
        modelsSucceeded: synthesis.modelsSucceeded,
        modelsFailed: synthesis.modelsFailed,
        medianValue: synthesis.medianValue,
        agreementMetric: synthesis.agreementMetric,
        confidenceTag: synthesis.confidenceTag,
        sourceModelIds: groupEvals.map((e) => e.id),
      },
    });

    results.push({
      toolId,
      dimensionId,
      medianValue: synthesis.medianValue,
      confidenceTag: synthesis.confidenceTag,
    });
  }

  return results;
}

export { computeMedian, roundHalfUp, deriveConfidenceTag };
