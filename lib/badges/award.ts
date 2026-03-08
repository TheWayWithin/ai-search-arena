import { BadgeTier } from "@prisma/client";
import { prisma } from "@/lib/db";
import { getMostImproved, getPreviousCycle } from "@/lib/db/leaderboard";

/**
 * Award badges for a completed benchmark cycle.
 *
 * Overall badges (segmentId: null composite scores):
 *   Rank 1 → Gold "Overall Leader"
 *   Rank 2 → Silver "Overall Runner-Up"
 *   Rank 3 → Bronze "Overall Top Three"
 *
 * Segment badges (per-segment composite scores):
 *   Rank 1 per segment → Gold "Segment Leader: {Segment Name}"
 *
 * Idempotent via @@unique([cycleId, toolId, badgeType]).
 */
export async function awardCycleBadges(cycleId: string): Promise<number> {
  let badgeCount = 0;

  // ── Overall badges ──────────────────────────────────────────────
  const overallScores = await prisma.compositeScore.findMany({
    where: { cycleId, segmentId: null },
    orderBy: { rank: "asc" },
    take: 3,
    include: { tool: true },
  });

  const overallBadges: {
    rank: number;
    tier: BadgeTier;
    badgeType: string;
    label: string;
    description: string;
  }[] = [
    {
      rank: 1,
      tier: BadgeTier.Gold,
      badgeType: "Overall Leader",
      label: "Overall Leader",
      description: "Ranked #1 overall in this benchmark cycle",
    },
    {
      rank: 2,
      tier: BadgeTier.Silver,
      badgeType: "Overall Runner-Up",
      label: "Overall Runner-Up",
      description: "Ranked #2 overall in this benchmark cycle",
    },
    {
      rank: 3,
      tier: BadgeTier.Bronze,
      badgeType: "Overall Top Three",
      label: "Overall Top Three",
      description: "Ranked #3 overall in this benchmark cycle",
    },
  ];

  for (const def of overallBadges) {
    const cs = overallScores.find((s) => s.rank === def.rank);
    if (!cs) continue;

    await prisma.badge.upsert({
      where: {
        cycleId_toolId_badgeType: {
          cycleId,
          toolId: cs.toolId,
          badgeType: def.badgeType,
        },
      },
      update: {
        tier: def.tier,
        label: def.label,
        description: def.description,
        compositeScoreId: cs.id,
      },
      create: {
        cycleId,
        toolId: cs.toolId,
        compositeScoreId: cs.id,
        tier: def.tier,
        badgeType: def.badgeType,
        label: def.label,
        description: def.description,
      },
    });
    badgeCount++;
  }

  // ── Segment badges ──────────────────────────────────────────────
  const segmentLeaders = await prisma.compositeScore.findMany({
    where: { cycleId, segmentId: { not: null }, rank: 1 },
    include: {
      tool: true,
      segment: true,
    },
  });

  for (const cs of segmentLeaders) {
    if (!cs.segment) continue;

    const badgeType = `Segment Leader: ${cs.segment.name}`;

    await prisma.badge.upsert({
      where: {
        cycleId_toolId_badgeType: {
          cycleId,
          toolId: cs.toolId,
          badgeType,
        },
      },
      update: {
        tier: BadgeTier.Gold,
        label: badgeType,
        description: `Ranked #1 in ${cs.segment.name} segment`,
        compositeScoreId: cs.id,
      },
      create: {
        cycleId,
        toolId: cs.toolId,
        compositeScoreId: cs.id,
        tier: BadgeTier.Gold,
        badgeType,
        label: badgeType,
        description: `Ranked #1 in ${cs.segment.name} segment`,
      },
    });
    badgeCount++;
  }

  // ── Most Improved badge ────────────────────────────────────────
  const mostImproved = await getMostImproved(cycleId);
  if (mostImproved) {
    const toolComposite = overallScores.find((s) => s.toolId === mostImproved.toolId);
    await prisma.badge.upsert({
      where: {
        cycleId_toolId_badgeType: {
          cycleId,
          toolId: mostImproved.toolId,
          badgeType: "Most Improved",
        },
      },
      update: {
        tier: BadgeTier.Gold,
        label: "Most Improved",
        description: `Improved by +${mostImproved.delta.toFixed(1)} points from previous cycle`,
        compositeScoreId: toolComposite?.id ?? null,
      },
      create: {
        cycleId,
        toolId: mostImproved.toolId,
        compositeScoreId: toolComposite?.id ?? null,
        tier: BadgeTier.Gold,
        badgeType: "Most Improved",
        label: "Most Improved",
        description: `Improved by +${mostImproved.delta.toFixed(1)} points from previous cycle`,
      },
    });
    badgeCount++;
  }

  // ── New to Arena badges ──────────────────────────────────────────
  const previousCycle = await getPreviousCycle(cycleId);
  if (previousCycle) {
    // Only award "New to Arena" when there IS a previous cycle
    const previousToolIds = await prisma.compositeScore.findMany({
      where: { cycleId: previousCycle.id, segmentId: null },
      select: { toolId: true },
    });
    const prevToolSet = new Set(previousToolIds.map((s) => s.toolId));

    const currentScores = await prisma.compositeScore.findMany({
      where: { cycleId, segmentId: null },
      include: { tool: true },
    });

    for (const cs of currentScores) {
      if (prevToolSet.has(cs.toolId)) continue;

      await prisma.badge.upsert({
        where: {
          cycleId_toolId_badgeType: {
            cycleId,
            toolId: cs.toolId,
            badgeType: "New to Arena",
          },
        },
        update: {
          tier: BadgeTier.Bronze,
          label: "New to Arena",
          description: `First appearance in the benchmark`,
          compositeScoreId: cs.id,
        },
        create: {
          cycleId,
          toolId: cs.toolId,
          compositeScoreId: cs.id,
          tier: BadgeTier.Bronze,
          badgeType: "New to Arena",
          label: "New to Arena",
          description: `First appearance in the benchmark`,
        },
      });
      badgeCount++;
    }
  }

  return badgeCount;
}

/**
 * Fetch all badges for a cycle.
 */
export async function getBadgesForCycle(cycleId: string) {
  return prisma.badge.findMany({
    where: { cycleId },
    include: { tool: true },
    orderBy: [{ tier: "asc" }, { badgeType: "asc" }],
  });
}

/**
 * Fetch badges for a specific tool in a cycle.
 */
export async function getBadgesForTool(toolId: string, cycleId: string) {
  return prisma.badge.findMany({
    where: { toolId, cycleId },
    orderBy: [{ tier: "asc" }, { badgeType: "asc" }],
  });
}
