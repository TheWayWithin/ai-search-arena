import { prisma } from "@/lib/db";

/**
 * Get all active AI model configurations.
 */
export async function getActiveModels() {
  return prisma.aIModel.findMany({
    where: { isActive: true },
    orderBy: { provider: "asc" },
  });
}

/**
 * Toggle a model's active status.
 * Prevents deactivation if the model is linked to active evaluations (AC-009-02).
 */
export async function toggleModelActive(modelId: string, isActive: boolean) {
  if (!isActive) {
    const activeEvaluationCount = await prisma.modelEvaluation.count({
      where: {
        modelId,
        cycle: {
          state: {
            notIn: ["Completed", "Cancelled"],
          },
        },
      },
    });

    if (activeEvaluationCount > 0) {
      throw new Error(
        `Cannot deactivate model: ${activeEvaluationCount} active evaluations reference this model`
      );
    }
  }

  return prisma.aIModel.update({
    where: { id: modelId },
    data: { isActive },
  });
}

/**
 * Update timeout settings for a model.
 */
export async function updateModelTimeout(modelId: string, timeoutMs: number) {
  if (timeoutMs < 5000 || timeoutMs > 120000) {
    throw new Error("Timeout must be between 5000ms and 120000ms");
  }

  return prisma.aIModel.update({
    where: { id: modelId },
    data: { timeoutMs },
  });
}

/**
 * Get model by OpenRouter identifier.
 */
export async function getModelByIdentifier(modelIdentifier: string) {
  return prisma.aIModel.findUnique({
    where: { modelIdentifier },
  });
}
