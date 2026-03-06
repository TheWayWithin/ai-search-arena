import { prisma } from "@/lib/db";

/**
 * Get all prompt sets for a methodology version.
 */
export async function getPromptSetsForMethodology(methodologyVersionId: string) {
  return prisma.promptSet.findMany({
    where: { methodologyVersionId },
    include: {
      dimension: true,
    },
    orderBy: { dimension: { displayOrder: "asc" } },
  });
}

/**
 * Get a prompt set by ID with its related dimension and methodology version.
 */
export async function getPromptSetById(promptSetId: string) {
  return prisma.promptSet.findUnique({
    where: { id: promptSetId },
    include: {
      dimension: true,
      methodologyVersion: true,
    },
  });
}

/**
 * Create a prompt set linked to a scoring dimension and methodology version.
 * Validates that the dimension belongs to the specified methodology version.
 */
export async function createPromptSet(data: {
  name: string;
  dimensionId: string;
  methodologyVersionId: string;
  prompts: unknown[];
  isRotating?: boolean;
  version?: string;
}) {
  // Validate dimension belongs to methodology version
  const dimension = await prisma.scoringDimension.findFirst({
    where: {
      id: data.dimensionId,
      methodologyVersionId: data.methodologyVersionId,
      isActive: true,
    },
  });

  if (!dimension) {
    throw new Error(
      "Scoring dimension not found or does not belong to the specified methodology version"
    );
  }

  // Check immutability constraint (AC-008-02)
  const isLocked = await isMethodologyLockedToActiveCycle(data.methodologyVersionId);
  if (isLocked) {
    throw new Error("Cannot create prompt set: methodology version is locked to an active cycle");
  }

  return prisma.promptSet.create({
    data: {
      name: data.name,
      dimensionId: data.dimensionId,
      methodologyVersionId: data.methodologyVersionId,
      prompts: data.prompts as Parameters<typeof prisma.promptSet.create>[0]["data"]["prompts"],
      isRotating: data.isRotating ?? false,
      version: data.version ?? "1.0",
    },
    include: {
      dimension: true,
    },
  });
}

/**
 * Check if a methodology version is locked to an active (non-terminal) cycle (AC-008-02).
 * Prompt sets are immutable once their linked methodology version is locked to an active cycle.
 */
async function isMethodologyLockedToActiveCycle(methodologyVersionId: string): Promise<boolean> {
  const activeCycle = await prisma.benchmarkCycle.findFirst({
    where: {
      methodologyVersionId,
      state: {
        notIn: ["Draft", "Completed", "Cancelled"],
      },
    },
  });

  return activeCycle !== null;
}

/**
 * Update a prompt set's prompts (only if methodology is not locked to active cycle).
 */
export async function updatePromptSetPrompts(promptSetId: string, prompts: unknown[]) {
  const promptSet = await prisma.promptSet.findUnique({
    where: { id: promptSetId },
  });

  if (!promptSet) {
    throw new Error("Prompt set not found");
  }

  // Check immutability constraint (AC-008-02)
  const isLocked = await isMethodologyLockedToActiveCycle(promptSet.methodologyVersionId);
  if (isLocked) {
    throw new Error("Cannot modify prompt set: methodology version is locked to an active cycle");
  }

  return prisma.promptSet.update({
    where: { id: promptSetId },
    data: {
      prompts: prompts as Parameters<typeof prisma.promptSet.update>[0]["data"]["prompts"],
    },
    include: {
      dimension: true,
    },
  });
}

/**
 * Toggle the rotation flag on a prompt set (AC-008: 70/30 rotation support).
 */
export async function togglePromptSetRotation(promptSetId: string, isRotating: boolean) {
  const promptSet = await prisma.promptSet.findUnique({
    where: { id: promptSetId },
  });

  if (!promptSet) {
    throw new Error("Prompt set not found");
  }

  const isLocked = await isMethodologyLockedToActiveCycle(promptSet.methodologyVersionId);
  if (isLocked) {
    throw new Error("Cannot modify prompt set: methodology version is locked to an active cycle");
  }

  return prisma.promptSet.update({
    where: { id: promptSetId },
    data: { isRotating },
  });
}

/**
 * Get prompt sets for a specific dimension within a methodology version.
 */
export async function getPromptSetsForDimension(methodologyVersionId: string, dimensionId: string) {
  return prisma.promptSet.findMany({
    where: {
      methodologyVersionId,
      dimensionId,
    },
    include: {
      dimension: true,
    },
  });
}
