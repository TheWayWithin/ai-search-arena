/**
 * Award badges for the latest completed benchmark cycle.
 *
 * Usage:
 *   npx tsx scripts/award-badges.ts
 */

import { PrismaClient } from "@prisma/client";
import { awardCycleBadges } from "../lib/badges/award";

const prisma = new PrismaClient();

async function main() {
  const cycle = await prisma.benchmarkCycle.findFirst({
    where: { state: "Completed" },
    orderBy: { publishedAt: "desc" },
  });

  if (!cycle) {
    console.log("No completed cycle found.");
    return;
  }

  console.log(`Awarding badges for cycle: ${cycle.displayName} (${cycle.id})`);
  const count = await awardCycleBadges(cycle.id);
  console.log(`Awarded ${count} badges.`);

  // Show what was awarded
  const badges = await prisma.badge.findMany({
    where: { cycleId: cycle.id },
    include: { tool: { select: { name: true } } },
    orderBy: [{ tier: "asc" }, { badgeType: "asc" }],
  });

  for (const b of badges) {
    console.log(`  ${b.tier.padEnd(6)} | ${b.tool.name.padEnd(30)} | ${b.label}`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
