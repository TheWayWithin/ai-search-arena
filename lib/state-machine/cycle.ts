import { CycleState } from "@prisma/client";
import { prisma } from "@/lib/db";

/**
 * Valid state transitions for the BenchmarkCycle state machine.
 * 10 states, 14 transitions. Completed and Cancelled are terminal.
 */
const VALID_CYCLE_TRANSITIONS: Record<CycleState, CycleState[]> = {
  Draft: [CycleState.Planning, CycleState.Suspended, CycleState.Cancelled],
  Planning: [CycleState.Evaluation, CycleState.Suspended, CycleState.Cancelled],
  Evaluation: [CycleState.Synthesis, CycleState.Suspended],
  Synthesis: [CycleState.Review],
  Review: [CycleState.VendorReview],
  VendorReview: [CycleState.Publication],
  Publication: [CycleState.Completed],
  Completed: [], // terminal
  Suspended: [CycleState.Draft, CycleState.Cancelled],
  Cancelled: [], // terminal
};

type TransitionGuard = (cycleId: string) => Promise<{ valid: boolean; reason?: string }>;

/**
 * Guards run before specific transitions to enforce business rules.
 */
const TRANSITION_GUARDS: Record<string, TransitionGuard> = {
  "Draft->Planning": async (cycleId) => {
    const cycle = await prisma.benchmarkCycle.findUnique({
      where: { id: cycleId },
      include: { methodologyVersion: true },
    });
    if (!cycle?.methodologyVersionId) {
      return { valid: false, reason: "No methodology version assigned" };
    }
    return { valid: true };
  },

  "Planning->Evaluation": async (cycleId) => {
    // BR-T03: Minimum 5 enrolled (non-withdrawn) tools per track
    const enrollments = await prisma.cycleToolEnrollment.findMany({
      where: { cycleId, withdrawnAt: null },
      include: { tool: { include: { trackMappings: true } } },
    });

    const cycle = await prisma.benchmarkCycle.findUnique({
      where: { id: cycleId },
      include: {
        methodologyVersion: {
          include: {
            scoringDimensions: {
              where: { isActive: true },
              select: { trackId: true },
            },
          },
        },
      },
    });

    if (!cycle?.methodologyVersion) {
      return { valid: false, reason: "No methodology version assigned" };
    }

    // Get unique tracks used in the methodology
    const requiredTrackIds = [
      ...new Set(cycle.methodologyVersion.scoringDimensions.map((d) => d.trackId)),
    ];

    for (const trackId of requiredTrackIds) {
      const toolsInTrack = enrollments.filter((e) =>
        e.tool.trackMappings.some((tm) => tm.trackId === trackId)
      );
      if (toolsInTrack.length < 5) {
        return {
          valid: false,
          reason: `Track ${trackId} has only ${toolsInTrack.length} enrolled tools (minimum 5 per BR-T03)`,
        };
      }
    }

    return { valid: true };
  },
};

type TransitionSideEffect = (cycleId: string) => Promise<void>;

/**
 * Side effects executed after successful transitions.
 */
const TRANSITION_SIDE_EFFECTS: Record<string, TransitionSideEffect> = {
  "Draft->Planning": async (cycleId) => {
    // BR-SYN02: Lock methodology version on Draft → Planning
    const cycle = await prisma.benchmarkCycle.findUnique({
      where: { id: cycleId },
    });
    if (cycle?.methodologyVersionId) {
      await prisma.methodologyVersion.update({
        where: { id: cycle.methodologyVersionId },
        data: { isLocked: true, lockedAt: new Date() },
      });
    }
  },
};

/**
 * Get valid target states for a given current state.
 */
export function getValidTransitions(currentState: CycleState): CycleState[] {
  return VALID_CYCLE_TRANSITIONS[currentState];
}

/**
 * Check if a transition is valid without executing it.
 */
export function isValidTransition(from: CycleState, to: CycleState): boolean {
  return VALID_CYCLE_TRANSITIONS[from].includes(to);
}

/**
 * Transition a benchmark cycle to a new state.
 * Validates transition rules, runs guards, executes side effects.
 *
 * AC-005-05: Invalid transitions rejected with current state preserved.
 */
export async function transitionCycle(cycleId: string, newState: CycleState) {
  const cycle = await prisma.benchmarkCycle.findUniqueOrThrow({
    where: { id: cycleId },
  });

  // Validate transition
  const validTargets = VALID_CYCLE_TRANSITIONS[cycle.state];
  if (!validTargets.includes(newState)) {
    throw new Error(
      `Invalid transition: ${cycle.state} -> ${newState}. Valid targets: ${validTargets.join(", ")}`
    );
  }

  // Run guard if exists
  const guardKey = `${cycle.state}->${newState}`;
  const guard = TRANSITION_GUARDS[guardKey];
  if (guard) {
    const result = await guard(cycleId);
    if (!result.valid) {
      throw new Error(`Guard failed for ${guardKey}: ${result.reason}`);
    }
  }

  // Execute transition
  const updated = await prisma.benchmarkCycle.update({
    where: { id: cycleId },
    data: {
      state: newState,
      ...(newState === CycleState.Completed ? { endDate: new Date() } : {}),
    },
  });

  // Run side effects
  const sideEffect = TRANSITION_SIDE_EFFECTS[guardKey];
  if (sideEffect) {
    await sideEffect(cycleId);
  }

  return updated;
}
