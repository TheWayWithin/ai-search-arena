import { CycleState } from "@prisma/client";
import { prisma } from "@/lib/db";

/**
 * Create a new benchmark cycle.
 * AC-005-04: Only one non-terminal cycle allowed at any time.
 */
export async function createCycle(data: {
  cycleIdentifier: string;
  displayName: string;
  startDate: Date;
  methodologyVersionId: string;
}) {
  // Check for existing non-terminal cycles
  const activeCycle = await prisma.benchmarkCycle.findFirst({
    where: {
      state: {
        notIn: [CycleState.Completed, CycleState.Cancelled],
      },
    },
  });

  if (activeCycle) {
    throw new Error(
      `Cannot create cycle: an active cycle already exists (${activeCycle.cycleIdentifier} in state ${activeCycle.state})`
    );
  }

  // Validate methodology version exists
  const methodology = await prisma.methodologyVersion.findUnique({
    where: { id: data.methodologyVersionId },
  });

  if (!methodology) {
    throw new Error("Methodology version not found");
  }

  return prisma.benchmarkCycle.create({
    data: {
      cycleIdentifier: data.cycleIdentifier,
      displayName: data.displayName,
      startDate: data.startDate,
      methodologyVersionId: data.methodologyVersionId,
      state: CycleState.Draft,
    },
    include: {
      methodologyVersion: true,
    },
  });
}

/**
 * Get a cycle by ID with related data.
 */
export async function getCycleById(cycleId: string) {
  return prisma.benchmarkCycle.findUnique({
    where: { id: cycleId },
    include: {
      methodologyVersion: true,
      enrollments: {
        where: { withdrawnAt: null },
        include: {
          tool: {
            include: {
              vendor: true,
              trackMappings: { include: { track: true } },
            },
          },
        },
      },
    },
  });
}

/**
 * Get a cycle by its identifier (e.g., "2026-03").
 */
export async function getCycleByIdentifier(cycleIdentifier: string) {
  return prisma.benchmarkCycle.findUnique({
    where: { cycleIdentifier },
    include: {
      methodologyVersion: true,
    },
  });
}

/**
 * List all cycles ordered by start date.
 */
export async function listCycles() {
  return prisma.benchmarkCycle.findMany({
    include: {
      methodologyVersion: true,
      _count: {
        select: {
          enrollments: true,
        },
      },
    },
    orderBy: { startDate: "desc" },
  });
}

/**
 * Get the current active (non-terminal) cycle, if any.
 */
export async function getActiveCycle() {
  return prisma.benchmarkCycle.findFirst({
    where: {
      state: {
        notIn: [CycleState.Completed, CycleState.Cancelled],
      },
    },
    include: {
      methodologyVersion: true,
      enrollments: {
        where: { withdrawnAt: null },
        include: {
          tool: { include: { vendor: true } },
        },
      },
    },
  });
}

/**
 * Get the latest published cycle for public display.
 */
export async function getLatestPublishedCycle() {
  return prisma.benchmarkCycle.findFirst({
    where: {
      state: CycleState.Completed,
    },
    include: {
      methodologyVersion: true,
      report: true,
    },
    orderBy: { endDate: "desc" },
  });
}
