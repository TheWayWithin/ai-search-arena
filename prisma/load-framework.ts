/**
 * Framework Loader — Load GEO Benchmark Framework YAML into the database.
 *
 * Reads dimensions.yaml, models.yaml, and track definitions from either:
 *   - A local path (--local ../geo-benchmark-framework)
 *   - GitHub raw URLs (default, reads from TheWayWithin/geo-benchmark-framework)
 *
 * Usage:
 *   npx tsx prisma/load-framework.ts                          # Load from GitHub
 *   npx tsx prisma/load-framework.ts --local ../geo-benchmark-framework  # Load from local clone
 *   npx tsx prisma/load-framework.ts --version 1.0            # Specify version (default: 1.0)
 *   npx tsx prisma/load-framework.ts --dry-run                # Parse and validate only, no DB writes
 */

import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";
import YAML from "yaml";

const prisma = new PrismaClient();

// ── Types ────────────────────────────────────────────────────

interface DimensionEntry {
  slug: string;
  name: string;
  category: string;
  weight: number;
  display_order: number;
  prompts: string[];
}

interface ModelEntry {
  provider: string;
  model_identifier: string;
  display_name: string;
  timeout_ms: number;
  is_active: boolean;
}

interface TrackEntry {
  slug: string;
  name: string;
  description: string;
  methodology_version: string;
  dimension_slugs: string[];
}

// ── File Loading ─────────────────────────────────────────────

async function loadFile(basePath: string, relativePath: string, isLocal: boolean): Promise<string> {
  if (isLocal) {
    const fullPath = path.resolve(basePath, relativePath);
    return fs.readFileSync(fullPath, "utf-8");
  }

  // GitHub raw URL
  const url = `https://raw.githubusercontent.com/TheWayWithin/geo-benchmark-framework/main/${relativePath}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`);
  }
  return res.text();
}

// ── Main ─────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  const localIdx = args.indexOf("--local");
  const versionIdx = args.indexOf("--version");
  const dryRun = args.includes("--dry-run");

  const isLocal = localIdx !== -1;
  const basePath = isLocal ? args[localIdx + 1] : "";
  const version = versionIdx !== -1 ? args[versionIdx + 1] : "1.0";
  const versionDir = `methodology/v${version}`;

  console.log(`GEO Benchmark Framework Loader`);
  console.log(`  Source: ${isLocal ? `local (${path.resolve(basePath)})` : "GitHub (TheWayWithin/geo-benchmark-framework)"}`);
  console.log(`  Version: ${version}`);
  console.log(`  Mode: ${dryRun ? "DRY RUN (no DB writes)" : "LIVE"}`);
  console.log("");

  // ── Load and parse YAML files ──────────────────────────────
  console.log("Loading framework files...");

  const dimensionsRaw = await loadFile(basePath, `${versionDir}/dimensions.yaml`, isLocal);
  const modelsRaw = await loadFile(basePath, `${versionDir}/models.yaml`, isLocal);
  const trackRaw = await loadFile(basePath, `tracks/geo-platform.yaml`, isLocal);

  console.log("  Parsing dimensions.yaml...");
  const dimensionsData = YAML.parse(dimensionsRaw) as DimensionEntry[];
  console.log(`  Found ${dimensionsData.length} dimensions`);

  console.log("  Parsing models.yaml...");
  const modelsData = YAML.parse(modelsRaw) as ModelEntry[];
  console.log(`  Found ${modelsData.length} models`);

  console.log("  Parsing geo-platform.yaml...");
  const track = YAML.parse(trackRaw) as TrackEntry;
  console.log(`  Track: ${track.name} (${(track.dimension_slugs || []).length} dimensions)`);

  // ── Validate ───────────────────────────────────────────────
  console.log("\nValidating...");

  const errors: string[] = [];
  let totalWeight = 0;

  for (const d of dimensionsData) {
    if (!d.slug) errors.push(`Dimension missing slug: ${JSON.stringify(d).slice(0, 100)}`);
    if (!d.name) errors.push(`Dimension ${d.slug} missing name`);
    if (!d.category) errors.push(`Dimension ${d.slug} missing category`);
    if (typeof d.weight !== "number" || d.weight <= 0) errors.push(`Dimension ${d.slug} invalid weight: ${d.weight}`);
    if (!d.prompts || !Array.isArray(d.prompts) || d.prompts.length < 2) {
      errors.push(`Dimension ${d.slug} needs at least 2 prompts (has ${d.prompts?.length || 0})`);
    }
    totalWeight += d.weight || 0;
  }

  if (Math.abs(totalWeight - 1.0) > 0.005) {
    errors.push(`Weights sum to ${totalWeight.toFixed(4)}, expected 1.0000`);
  }

  for (const m of modelsData) {
    if (!m.model_identifier) errors.push(`Model missing model_identifier`);
    if (!m.provider) errors.push(`Model ${m.model_identifier} missing provider`);
  }

  if (errors.length > 0) {
    console.error(`\n${errors.length} validation errors:`);
    for (const e of errors) console.error(`  - ${e}`);
    process.exit(1);
  }

  console.log(`  Weights sum: ${totalWeight.toFixed(4)}`);
  console.log(`  All ${dimensionsData.length} dimensions valid`);
  console.log(`  All ${modelsData.length} models valid`);

  if (dryRun) {
    console.log("\nDRY RUN — no database changes made.");
    console.log("\nDimension summary:");
    const categories = new Map<string, { count: number; weight: number }>();
    for (const d of dimensionsData) {
      const cat = categories.get(d.category) || { count: 0, weight: 0 };
      cat.count++;
      cat.weight += d.weight;
      categories.set(d.category, cat);
    }
    for (const [cat, { count, weight }] of Array.from(categories.entries())) {
      console.log(`  ${cat}: ${count} dimensions, weight ${weight.toFixed(2)}`);
    }
    return;
  }

  // ── Get git SHA for version pinning ────────────────────────
  let gitSha = "unknown";
  if (isLocal) {
    try {
      const { execSync } = await import("child_process");
      gitSha = execSync("git rev-parse HEAD", { cwd: path.resolve(basePath) }).toString().trim();
    } catch {
      // not a git repo — ok
    }
  } else {
    try {
      const res = await fetch("https://api.github.com/repos/TheWayWithin/geo-benchmark-framework/commits/main");
      if (res.ok) {
        const data = (await res.json()) as { sha: string };
        gitSha = data.sha;
      }
    } catch {
      // GitHub API failed — ok
    }
  }

  // ── Upsert MethodologyVersion ──────────────────────────────
  console.log("\nUpserting methodology version...");
  const versionNumber = `${version}.0`;

  const methodology = await prisma.methodologyVersion.upsert({
    where: { versionNumber },
    update: {
      description: `GEO Benchmark Framework v${version}. Loaded from ${isLocal ? "local" : "GitHub"} (SHA: ${gitSha.slice(0, 7)}).`,
    },
    create: {
      versionNumber,
      effectiveDate: new Date(),
      description: `GEO Benchmark Framework v${version}. Loaded from ${isLocal ? "local" : "GitHub"} (SHA: ${gitSha.slice(0, 7)}).`,
    },
  });
  console.log(`  Methodology: ${methodology.versionNumber} (${methodology.id})`);

  // ── Get GEO Platform Track ─────────────────────────────────
  const geoTrack = await prisma.benchmarkTrackDefinition.findUnique({
    where: { slug: "geo-platform" },
  });
  if (!geoTrack) {
    throw new Error("GEO Platform track not found — run db:seed first to create tracks");
  }

  // ── Upsert Scoring Dimensions ──────────────────────────────
  console.log("\nUpserting scoring dimensions...");
  let dimCreated = 0;
  let dimUpdated = 0;

  for (const d of dimensionsData) {
    const existing = await prisma.scoringDimension.findUnique({
      where: {
        methodologyVersionId_slug: {
          methodologyVersionId: methodology.id,
          slug: d.slug,
        },
      },
    });

    if (existing) {
      await prisma.scoringDimension.update({
        where: { id: existing.id },
        data: {
          name: d.name,
          weight: d.weight,
          category: d.category,
          displayOrder: d.display_order,
          isActive: true,
        },
      });
      dimUpdated++;
    } else {
      await prisma.scoringDimension.create({
        data: {
          methodologyVersionId: methodology.id,
          trackId: geoTrack.id,
          name: d.name,
          slug: d.slug,
          weight: d.weight,
          category: d.category,
          displayOrder: d.display_order,
          isActive: true,
        },
      });
      dimCreated++;
    }
  }
  console.log(`  Dimensions: ${dimCreated} created, ${dimUpdated} updated`);

  // ── Upsert PromptSets ──────────────────────────────────────
  console.log("\nUpserting prompt sets...");
  let promptCreated = 0;
  let promptUpdated = 0;

  for (const d of dimensionsData) {
    const dimension = await prisma.scoringDimension.findUnique({
      where: {
        methodologyVersionId_slug: {
          methodologyVersionId: methodology.id,
          slug: d.slug,
        },
      },
    });
    if (!dimension) continue;

    const existing = await prisma.promptSet.findUnique({
      where: {
        methodologyVersionId_dimensionId_version: {
          methodologyVersionId: methodology.id,
          dimensionId: dimension.id,
          version: version,
        },
      },
    });

    if (existing) {
      await prisma.promptSet.update({
        where: { id: existing.id },
        data: {
          name: `${d.name} — v${version} Prompts`,
          prompts: d.prompts,
        },
      });
      promptUpdated++;
    } else {
      await prisma.promptSet.create({
        data: {
          methodologyVersionId: methodology.id,
          dimensionId: dimension.id,
          name: `${d.name} — v${version} Prompts`,
          prompts: d.prompts,
          version: version,
          isRotating: false,
        },
      });
      promptCreated++;
    }
  }
  console.log(`  Prompt sets: ${promptCreated} created, ${promptUpdated} updated`);

  // ── Upsert AI Models ───────────────────────────────────────
  console.log("\nUpserting AI models...");
  let modelCreated = 0;
  let modelUpdated = 0;

  for (const m of modelsData) {
    const existing = await prisma.aIModel.findUnique({
      where: { modelIdentifier: m.model_identifier },
    });

    if (existing) {
      await prisma.aIModel.update({
        where: { id: existing.id },
        data: {
          provider: m.provider,
          displayName: m.display_name,
          timeoutMs: m.timeout_ms,
          isActive: m.is_active,
        },
      });
      modelUpdated++;
    } else {
      await prisma.aIModel.create({
        data: {
          provider: m.provider,
          modelIdentifier: m.model_identifier,
          displayName: m.display_name,
          timeoutMs: m.timeout_ms,
          isActive: m.is_active,
        },
      });
      modelCreated++;
    }
  }
  console.log(`  AI models: ${modelCreated} created, ${modelUpdated} updated`);

  // ── Summary ────────────────────────────────────────────────
  console.log("\n" + "=".repeat(50));
  console.log(`Framework v${version} loaded successfully`);
  console.log(`  Git SHA: ${gitSha.slice(0, 7)}`);
  console.log(`  Dimensions: ${dimCreated + dimUpdated} (${dimCreated} new, ${dimUpdated} updated)`);
  console.log(`  Prompt sets: ${promptCreated + promptUpdated} (${promptCreated} new, ${promptUpdated} updated)`);
  console.log(`  AI models: ${modelCreated + modelUpdated} (${modelCreated} new, ${modelUpdated} updated)`);
  console.log(`  Weights total: ${totalWeight.toFixed(4)}`);
  console.log("=".repeat(50));
}

main()
  .catch((e) => {
    console.error("Framework load failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
