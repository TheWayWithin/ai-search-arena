import { CycleState } from "@prisma/client";
import { prisma } from "@/lib/db";

/**
 * Enroll a tool in a benchmark cycle.
 * AC-006-01: Only in Draft or Planning state.
 * Track assignment validated against tool's ToolTrackMapping.
 */
export async function enrollTool(data: {
  cycleId: string;
  toolId: string;
}) {
  // Verify cycle state allows enrollment
  const cycle = await prisma.benchmarkCycle.findUniqueOrThrow({
    where: { id: data.cycleId },
  });

  if (cycle.state !== CycleState.Draft && cycle.state !== CycleState.Planning) {
    throw new Error(
      `Cannot enroll tools: cycle is in ${cycle.state} state (only Draft or Planning allowed)`
    );
  }

  // Verify tool exists and has at least one track mapping
  const tool = await prisma.tool.findUniqueOrThrow({
    where: { id: data.toolId },
    include: { trackMappings: true },
  });

  if (tool.trackMappings.length === 0) {
    throw new Error("Tool has no track mappings — cannot enroll without a track assignment");
  }

  // Check for duplicate enrollment
  const existing = await prisma.cycleToolEnrollment.findUnique({
    where: {
      cycleId_toolId: {
        cycleId: data.cycleId,
        toolId: data.toolId,
      },
    },
  });

  if (existing && !existing.withdrawnAt) {
    throw new Error("Tool is already enrolled in this cycle");
  }

  // If previously withdrawn, re-enroll by clearing withdrawal
  if (existing?.withdrawnAt) {
    return prisma.cycleToolEnrollment.update({
      where: { id: existing.id },
      data: {
        withdrawnAt: null,
        withdrawalReason: null,
      },
      include: {
        tool: { include: { vendor: true, trackMappings: { include: { track: true } } } },
      },
    });
  }

  return prisma.cycleToolEnrollment.create({
    data: {
      cycleId: data.cycleId,
      toolId: data.toolId,
    },
    include: {
      tool: { include: { vendor: true, trackMappings: { include: { track: true } } } },
    },
  });
}

/**
 * Withdraw a tool from a benchmark cycle.
 * AC-006-03: Preserves all data; sets withdrawn_at + requires withdrawal_reason.
 */
export async function withdrawTool(data: {
  cycleId: string;
  toolId: string;
  reason: string;
}) {
  if (!data.reason.trim()) {
    throw new Error("Withdrawal reason is required");
  }

  const cycle = await prisma.benchmarkCycle.findUniqueOrThrow({
    where: { id: data.cycleId },
  });

  // Cannot withdraw after Evaluation starts
  if (
    cycle.state !== CycleState.Draft &&
    cycle.state !== CycleState.Planning
  ) {
    throw new Error(
      `Cannot withdraw tools: cycle is in ${cycle.state} state (enrolled tools locked after Planning)`
    );
  }

  const enrollment = await prisma.cycleToolEnrollment.findUnique({
    where: {
      cycleId_toolId: {
        cycleId: data.cycleId,
        toolId: data.toolId,
      },
    },
  });

  if (!enrollment) {
    throw new Error("Tool is not enrolled in this cycle");
  }

  if (enrollment.withdrawnAt) {
    throw new Error("Tool is already withdrawn");
  }

  return prisma.cycleToolEnrollment.update({
    where: { id: enrollment.id },
    data: {
      withdrawnAt: new Date(),
      withdrawalReason: data.reason,
    },
    include: {
      tool: { include: { vendor: true } },
    },
  });
}

/**
 * Get all active (non-withdrawn) enrollments for a cycle.
 */
export async function getEnrollments(cycleId: string) {
  return prisma.cycleToolEnrollment.findMany({
    where: {
      cycleId,
      withdrawnAt: null,
    },
    include: {
      tool: {
        include: {
          vendor: true,
          trackMappings: { include: { track: true } },
          segmentMappings: { include: { segment: true } },
        },
      },
    },
    orderBy: { tool: { name: "asc" } },
  });
}

/**
 * Get enrollment counts per track for a cycle.
 * Used by Planning->Evaluation guard (minimum 5 per track per BR-T03).
 */
export async function getEnrollmentCountsByTrack(cycleId: string) {
  const enrollments = await prisma.cycleToolEnrollment.findMany({
    where: {
      cycleId,
      withdrawnAt: null,
    },
    include: {
      tool: {
        include: {
          trackMappings: { include: { track: true } },
        },
      },
    },
  });

  const counts = new Map<string, { trackName: string; count: number }>();
  for (const e of enrollments) {
    for (const tm of e.tool.trackMappings) {
      const existing = counts.get(tm.trackId);
      if (existing) {
        existing.count++;
      } else {
        counts.set(tm.trackId, { trackName: tm.track.name, count: 1 });
      }
    }
  }

  return Object.fromEntries(counts);
}
