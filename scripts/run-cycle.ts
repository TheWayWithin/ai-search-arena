/**
 * Benchmark Cycle Runner
 *
 * Orchestrates a full benchmark cycle from Draft → Completed using the
 * existing library functions. Designed to be resumable — if interrupted,
 * re-running will skip tools that already have evaluations.
 *
 * Usage:
 *   npx tsx scripts/run-cycle.ts                 # Full run (all 28 tools)
 *   npx tsx scripts/run-cycle.ts --dry-run       # Create cycle + enroll, stop before evals
 *   npx tsx scripts/run-cycle.ts --limit 2       # Evaluate only first 2 tools
 *
 * Stages:
 *   1. Create cycle (March 2026, Draft)
 *   2. Enroll all active tools
 *   3. Transition → Planning (locks methodology)
 *   4. Transition → Evaluation (guard: ≥5 tools/track)
 *   5. Evaluate each tool (51 dims × 6 models per tool)
 *   6. Transition → Synthesis
 *   7. Synthesize scores (median aggregation + confidence tags)
 *   8. Calculate composite scores + rankings
 *   9. Transition → Review
 *  10. Transition → VendorReview (skip vendor window for cycle 1)
 *  11. Transition → Publication
 *  12. Generate audit package + seal
 *  13. Generate report + publish
 *  14. Transition → Completed
 */

import { ConfidenceTag, CycleState, Prisma, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL
    ? `${process.env.DATABASE_URL}&connection_limit=5&pool_timeout=60`
    : undefined,
});

// Loose type for the cycle variable — we only need id, state, and methodologyVersionId
type CycleRef = {
  id: string;
  state: CycleState;
  cycleIdentifier: string;
  methodologyVersionId: string | null;
};

// ── Argument parsing ────────────────────────────────────────────

const args = process.argv.slice(2);
const DRY_RUN = args.includes("--dry-run");
const limitIdx = args.indexOf("--limit");
const LIMIT = limitIdx !== -1 ? parseInt(args[limitIdx + 1], 10) : Infinity;

if (limitIdx !== -1 && isNaN(LIMIT)) {
  console.error("--limit requires a numeric argument");
  process.exit(1);
}

// ── Helpers ─────────────────────────────────────────────────────

function log(stage: string, message: string) {
  const ts = new Date().toISOString().slice(11, 19);
  console.log(`[${ts}] [${stage}] ${message}`);
}

function elapsed(start: number): string {
  const ms = Date.now() - start;
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${(ms / 60000).toFixed(1)}m`;
}

// ── State machine transitions (inline to avoid @/ import issues) ─

const VALID_TRANSITIONS: Record<string, string[]> = {
  Draft: ["Planning", "Suspended", "Cancelled"],
  Planning: ["Evaluation", "Suspended", "Cancelled"],
  Evaluation: ["Synthesis", "Suspended"],
  Synthesis: ["Review"],
  Review: ["VendorReview"],
  VendorReview: ["Publication"],
  Publication: ["Completed"],
  Completed: [],
  Suspended: ["Draft", "Cancelled"],
  Cancelled: [],
};

async function transitionCycle(cycleId: string, newState: CycleState): Promise<CycleRef> {
  const cycle = await prisma.benchmarkCycle.findUniqueOrThrow({
    where: { id: cycleId },
  });

  const validTargets = VALID_TRANSITIONS[cycle.state] ?? [];
  if (!validTargets.includes(newState)) {
    throw new Error(
      `Invalid transition: ${cycle.state} → ${newState}. Valid: ${validTargets.join(", ")}`
    );
  }

  // Guard: Draft → Planning requires methodology
  if (cycle.state === "Draft" && newState === "Planning") {
    if (!cycle.methodologyVersionId) {
      throw new Error("Guard failed: No methodology version assigned");
    }
  }

  // Guard: Planning → Evaluation requires ≥5 tools per track
  if (cycle.state === "Planning" && newState === "Evaluation") {
    const enrollments = await prisma.cycleToolEnrollment.findMany({
      where: { cycleId, withdrawnAt: null },
      include: { tool: { include: { trackMappings: true } } },
    });

    const cycleData = await prisma.benchmarkCycle.findUniqueOrThrow({
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

    const requiredTrackIds = Array.from(
      new Set(
        cycleData.methodologyVersion?.scoringDimensions.map((d) => d.trackId) ?? []
      )
    );

    for (const trackId of requiredTrackIds) {
      const count = enrollments.filter((e) =>
        e.tool.trackMappings.some((tm) => tm.trackId === trackId)
      ).length;
      if (count < 5) {
        throw new Error(
          `Guard failed: Track ${trackId} has only ${count} tools (minimum 5)`
        );
      }
    }
  }

  // Execute transition
  const updated = await prisma.benchmarkCycle.update({
    where: { id: cycleId },
    data: {
      state: newState,
      ...(newState === "Completed" ? { endDate: new Date() } : {}),
    },
  });

  // Side effect: Draft → Planning locks methodology
  if (cycle.state === "Draft" && newState === "Planning") {
    if (cycle.methodologyVersionId) {
      await prisma.methodologyVersion.update({
        where: { id: cycle.methodologyVersionId },
        data: { isLocked: true, lockedAt: new Date() },
      });
    }
  }

  return updated;
}

// ── Evaluation pipeline (inline to avoid @/ import issues) ──────

interface EvaluationResult {
  success: boolean;
  modelIdentifier: string;
  rawResponse: string;
  parsedScore: number | null;
  responseTimeMs: number;
  tokensUsed: number;
  error?: string;
}

function parseScoreFromResponse(response: string): number | null {
  const scoreMatch = response.match(/(?:score|rating)[:\s]*(\d+(?:\.\d+)?)/i);
  if (scoreMatch) {
    const val = parseFloat(scoreMatch[1]);
    if (val >= 0 && val <= 10) return Math.round(val * 10) / 10;
  }
  const outOfTenMatch = response.match(/(\d+(?:\.\d+)?)\s*\/\s*10/);
  if (outOfTenMatch) {
    const val = parseFloat(outOfTenMatch[1]);
    if (val >= 0 && val <= 10) return Math.round(val * 10) / 10;
  }
  const standaloneMatch = response.match(/^(\d+(?:\.\d+)?)\b/m);
  if (standaloneMatch) {
    const val = parseFloat(standaloneMatch[1]);
    if (val >= 0 && val <= 10) return Math.round(val * 10) / 10;
  }
  return null;
}

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

async function callModel(
  modelIdentifier: string,
  systemPrompt: string,
  userPrompt: string,
  timeoutMs: number
): Promise<EvaluationResult> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error("OPENROUTER_API_KEY not set");

  const startTime = Date.now();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.SITE_URL ?? "https://aisearcharena.com",
        "X-Title": "AI Search Arena Benchmark",
      },
      body: JSON.stringify({
        model: modelIdentifier,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.1,
        max_tokens: 2000,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);
    const responseTimeMs = Date.now() - startTime;

    if (!response.ok) {
      const errorText = await response.text();
      return {
        success: false,
        modelIdentifier,
        rawResponse: errorText,
        parsedScore: null,
        responseTimeMs,
        tokensUsed: 0,
        error: `HTTP ${response.status}: ${errorText}`,
      };
    }

    const data = (await response.json()) as {
      choices: { message: { content: string } }[];
      usage?: { total_tokens: number };
    };
    const content = data.choices[0]?.message?.content ?? "";
    const parsedScore = parseScoreFromResponse(content);

    return {
      success: true,
      modelIdentifier,
      rawResponse: content,
      parsedScore,
      responseTimeMs,
      tokensUsed: data.usage?.total_tokens ?? 0,
    };
  } catch (error) {
    clearTimeout(timeout);
    const responseTimeMs = Date.now() - startTime;
    const isTimeout =
      error instanceof DOMException && error.name === "AbortError";
    return {
      success: false,
      modelIdentifier,
      rawResponse: "",
      parsedScore: null,
      responseTimeMs,
      tokensUsed: 0,
      error: isTimeout ? `Timeout after ${timeoutMs}ms` : String(error),
    };
  }
}

async function callModelWithRetry(
  modelIdentifier: string,
  systemPrompt: string,
  userPrompt: string,
  timeoutMs: number
): Promise<EvaluationResult> {
  const backoffDelays = [1000, 4000, 16000];
  for (let attempt = 0; attempt <= 3; attempt++) {
    const result = await callModel(
      modelIdentifier,
      systemPrompt,
      userPrompt,
      timeoutMs
    );
    if (result.success) return result;
    if (attempt < 3) {
      const delay = backoffDelays[attempt] ?? 16000;
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  return callModel(modelIdentifier, systemPrompt, userPrompt, timeoutMs);
}

// ── Synthesis (inline) ──────────────────────────────────────────

function computeMedian(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}

function roundHalfUp(value: number): number {
  return Math.round(value * 10) / 10;
}

// ── Main ────────────────────────────────────────────────────────

async function main() {
  const globalStart = Date.now();

  console.log("╔══════════════════════════════════════════╗");
  console.log("║  AI Search Arena — Benchmark Cycle Runner ║");
  console.log("╚══════════════════════════════════════════╝");
  console.log();

  if (DRY_RUN) log("CONFIG", "Mode: DRY RUN (stop before evaluations)");
  if (LIMIT < Infinity) log("CONFIG", `Limit: ${LIMIT} tools`);

  // ── Stage 1: Create or resume cycle ─────────────────────────

  log("CYCLE", "Checking for existing cycle...");

  let cycle: CycleRef;

  const existingCycle = await prisma.benchmarkCycle.findFirst({
    where: {
      state: { notIn: [CycleState.Completed, CycleState.Cancelled] },
    },
  });

  if (existingCycle) {
    cycle = existingCycle;
    log("CYCLE", `Resuming cycle "${cycle.cycleIdentifier}" (state: ${cycle.state})`);
  } else {
    const methodology = await prisma.methodologyVersion.findFirst({
      where: { versionNumber: "1.0.0" },
    });
    if (!methodology) throw new Error("Methodology v1.0.0 not found — run db:seed first");

    cycle = await prisma.benchmarkCycle.create({
      data: {
        cycleIdentifier: "2026-03",
        displayName: "March 2026 Benchmark",
        startDate: new Date("2026-03-01"),
        methodologyVersionId: methodology.id,
        state: CycleState.Draft,
      },
    });
    log("CYCLE", `Created cycle "${cycle.cycleIdentifier}" (id: ${cycle.id})`);
  }

  const cycleId = cycle.id;

  // ── Stage 2: Enroll tools ───────────────────────────────────

  if (cycle.state === CycleState.Draft) {
    log("ENROLL", "Enrolling all active tools...");

    const tools = await prisma.tool.findMany({
      where: { isArchived: false },
      include: { trackMappings: true },
      orderBy: { name: "asc" },
    });

    let enrolled = 0;
    for (const tool of tools) {
      if (tool.trackMappings.length === 0) {
        log("ENROLL", `  Skipping ${tool.name} (no track mapping)`);
        continue;
      }

      const existing = await prisma.cycleToolEnrollment.findUnique({
        where: { cycleId_toolId: { cycleId, toolId: tool.id } },
      });

      if (existing && !existing.withdrawnAt) {
        enrolled++;
        continue;
      }

      if (existing?.withdrawnAt) {
        await prisma.cycleToolEnrollment.update({
          where: { id: existing.id },
          data: { withdrawnAt: null, withdrawalReason: null },
        });
      } else {
        await prisma.cycleToolEnrollment.create({
          data: { cycleId, toolId: tool.id },
        });
      }
      enrolled++;
    }

    log("ENROLL", `${enrolled} tools enrolled`);

    // ── Stage 3: Draft → Planning ──────────────────────────────

    log("STATE", "Transitioning Draft → Planning...");
    cycle = await transitionCycle(cycleId, CycleState.Planning);
    log("STATE", "✓ Planning (methodology locked)");
  }

  // ── Stage 4: Planning → Evaluation ────────────────────────────

  if (cycle.state === CycleState.Planning) {
    log("STATE", "Transitioning Planning → Evaluation...");
    cycle = await transitionCycle(cycleId, CycleState.Evaluation);
    log("STATE", "✓ Evaluation");
  }

  if (DRY_RUN) {
    log("DRY-RUN", "Stopping before evaluations (--dry-run)");

    const enrollments = await prisma.cycleToolEnrollment.count({
      where: { cycleId, withdrawnAt: null },
    });
    const dims = await prisma.scoringDimension.count({
      where: {
        methodologyVersionId: cycle.methodologyVersionId!,
        isActive: true,
      },
    });
    const models = await prisma.aIModel.count({ where: { isActive: true } });

    console.log();
    console.log("Cycle summary:");
    console.log(`  State: ${cycle.state}`);
    console.log(`  Tools enrolled: ${enrollments}`);
    console.log(`  Dimensions: ${dims}`);
    console.log(`  Models: ${models}`);
    console.log(`  Total API calls needed: ${enrollments * dims * models}`);
    console.log(`  Elapsed: ${elapsed(globalStart)}`);
    return;
  }

  // ── Stage 5: Evaluate tools ───────────────────────────────────

  if (cycle.state === CycleState.Evaluation) {
    log("EVAL", "Starting evaluations...");

    const models = await prisma.aIModel.findMany({
      where: { isActive: true },
      orderBy: { provider: "asc" },
    });

    const dimensions = await prisma.scoringDimension.findMany({
      where: {
        methodologyVersionId: cycle.methodologyVersionId!,
        isActive: true,
      },
      orderBy: { displayOrder: "asc" },
      include: { promptSets: true },
    });

    const enrollments = await prisma.cycleToolEnrollment.findMany({
      where: { cycleId, withdrawnAt: null },
      include: {
        tool: { include: { vendor: true } },
      },
      orderBy: { tool: { name: "asc" } },
    });

    const toolsToEvaluate = enrollments.slice(0, LIMIT);
    let totalCalls = 0;
    let totalTokens = 0;

    log(
      "EVAL",
      `${toolsToEvaluate.length} tools × ${dimensions.length} dims × ${models.length} models = ${toolsToEvaluate.length * dimensions.length * models.length} API calls`
    );

    for (let ti = 0; ti < toolsToEvaluate.length; ti++) {
      const tool = toolsToEvaluate[ti].tool;
      const toolStart = Date.now();

      // Check how many evaluations already exist for this tool
      const existingCount = await prisma.modelEvaluation.count({
        where: { cycleId, toolId: tool.id },
      });

      const expectedCount = dimensions.length * models.length;
      if (existingCount >= expectedCount) {
        log(
          "EVAL",
          `[${ti + 1}/${toolsToEvaluate.length}] ${tool.name} — already evaluated (${existingCount} records), skipping`
        );
        continue;
      }

      log(
        "EVAL",
        `[${ti + 1}/${toolsToEvaluate.length}] ${tool.name} — evaluating...`
      );

      let dimSuccesses = 0;
      let dimInsufficient = 0;

      for (let di = 0; di < dimensions.length; di++) {
        const dimension = dimensions[di];

        // Skip dimensions already evaluated for this tool
        const dimEvalCount = await prisma.modelEvaluation.count({
          where: { cycleId, toolId: tool.id, dimensionId: dimension.id },
        });
        if (dimEvalCount >= models.length) continue;

        // Find prompt set
        const promptSet = dimension.promptSets.find(
          (ps) => ps.methodologyVersionId === cycle.methodologyVersionId
        );

        // Build prompts
        const systemPrompt = `You are an expert evaluator for AI search optimization (GEO/AEO) tools. You are evaluating tools on the dimension "${dimension.name}" in the category "${dimension.category ?? ""}".

Provide a score from 0 to 10 (one decimal place) based on your assessment.
- 0-2: Poor/Missing - Feature barely exists or is fundamentally broken
- 3-4: Below Average - Basic functionality with significant gaps
- 5-6: Average - Functional but nothing exceptional
- 7-8: Good - Strong capability with minor gaps
- 9-10: Excellent - Best-in-class implementation

Format your response as:
Score: X.X
Rationale: [Brief justification]`;

        let userPrompt: string;
        if (promptSet) {
          const promptArray = Array.isArray(promptSet.prompts)
            ? promptSet.prompts
            : [];
          const selected =
            promptArray.length > 0
              ? String(
                  promptArray[Math.floor(Math.random() * promptArray.length)]
                )
              : "";
          userPrompt = `Evaluate the tool "${tool.name}" (${tool.description ?? ""}).

${selected}

Provide your score and rationale.`;
        } else {
          userPrompt = `Evaluate the tool "${tool.name}" (${tool.description ?? ""}) on the dimension "${dimension.name}".

Consider:
- How well does this tool address this specific dimension?
- What is the quality of implementation compared to market alternatives?
- Are there notable strengths or weaknesses?

Provide your score and rationale.`;
        }

        // Dispatch to all models in parallel
        const results = await Promise.all(
          models.map((m) =>
            callModelWithRetry(
              m.modelIdentifier,
              systemPrompt,
              userPrompt,
              m.timeoutMs
            )
          )
        );

        // Save ModelEvaluation records (batched to avoid pool exhaustion)
        const promptSetId = promptSet?.id ?? "";
        const evalData: Prisma.ModelEvaluationCreateManyInput[] = [];
        for (const result of results) {
          const model = models.find(
            (m) => m.modelIdentifier === result.modelIdentifier
          );
          if (!model) continue;

          const status = result.success
            ? "Success"
            : result.error?.includes("Timeout")
              ? "Timeout"
              : "Failed";

          evalData.push({
            cycleId,
            toolId: tool.id,
            dimensionId: dimension.id,
            modelId: model.id,
            promptSetId: promptSetId,
            status: status as "Success" | "Failed" | "Timeout",
            parsedScore: result.parsedScore,
            rawResponse: result.rawResponse,
            responseTimeMs: result.responseTimeMs,
            evaluatedAt: new Date(),
          });

          totalTokens += result.tokensUsed;
        }

        if (evalData.length > 0) {
          // Retry DB write with backoff to handle pool exhaustion on long runs
          for (let attempt = 0; attempt < 3; attempt++) {
            try {
              await prisma.modelEvaluation.createMany({ data: evalData });
              break;
            } catch (e: unknown) {
              const msg = e instanceof Error ? e.message : String(e);
              if (attempt < 2 && msg.includes("connection pool")) {
                log("EVAL", `  Pool timeout, retrying in ${(attempt + 1) * 5}s...`);
                await new Promise((r) => setTimeout(r, (attempt + 1) * 5000));
              } else {
                throw e;
              }
            }
          }
        }

        totalCalls += results.length;
        const successCount = results.filter(
          (r) => r.success && r.parsedScore !== null
        ).length;
        if (successCount >= 4) dimSuccesses++;
        else dimInsufficient++;

        // Progress every 10 dimensions
        if ((di + 1) % 10 === 0 || di === dimensions.length - 1) {
          log(
            "EVAL",
            `  ${tool.name} dim ${di + 1}/${dimensions.length} — ${totalCalls} calls, ~${(totalTokens / 1000).toFixed(0)}k tokens`
          );
        }
      }

      log(
        "EVAL",
        `  ✓ ${tool.name} done (${dimSuccesses} OK, ${dimInsufficient} insufficient) [${elapsed(toolStart)}]`
      );
    }

    log("EVAL", `Evaluations complete: ${totalCalls} API calls, ~${(totalTokens / 1000).toFixed(0)}k tokens`);

    // ── Stage 6: Evaluation → Synthesis ──────────────────────────

    log("STATE", "Transitioning Evaluation → Synthesis...");
    cycle = await transitionCycle(cycleId, CycleState.Synthesis);
    log("STATE", "✓ Synthesis");
  }

  // ── Stage 7: Synthesize scores ──────────────────────────────────

  if (cycle.state === CycleState.Synthesis) {
    log("SYNTH", "Synthesizing scores (median aggregation)...");

    const evaluations = await prisma.modelEvaluation.findMany({
      where: { cycleId },
    });

    // Group by (toolId, dimensionId)
    const groups = new Map<
      string,
      { modelId: string; parsedScore: number | null; status: string; id: string }[]
    >();
    for (const e of evaluations) {
      const key = `${e.toolId}:${e.dimensionId}`;
      const group = groups.get(key) ?? [];
      group.push({
        modelId: e.modelId,
        parsedScore: e.parsedScore ? Number(e.parsedScore) : null,
        status: e.status,
        id: e.id,
      });
      groups.set(key, group);
    }

    let scoreCount = 0;
    const groupEntries = Array.from(groups.entries());
    for (const [key, groupEvals] of groupEntries) {
      const [toolId, dimensionId] = key.split(":");

      const successfulScores = groupEvals
        .filter((e) => e.status === "Success" && e.parsedScore !== null)
        .map((e) => e.parsedScore as number);

      const modelsSucceeded = successfulScores.length;
      const modelsFailed = groupEvals.length - modelsSucceeded;

      let medianValue = 0;
      let confidenceTag: ConfidenceTag = ConfidenceTag.InsufficientData;
      let agreementMetric = 0;

      if (modelsSucceeded > 0) {
        medianValue = roundHalfUp(computeMedian(successfulScores));

        // Standard deviation for confidence
        const mean =
          successfulScores.reduce((a, b) => a + b, 0) / successfulScores.length;
        const variance =
          successfulScores.reduce((sum, s) => sum + Math.pow(s - mean, 2), 0) /
          successfulScores.length;
        const stdDev = Math.sqrt(variance);

        if (modelsSucceeded < 4) {
          confidenceTag = ConfidenceTag.InsufficientData;
        } else if (stdDev <= 0.5) {
          confidenceTag = ConfidenceTag.High;
        } else if (stdDev <= 1.5) {
          confidenceTag = ConfidenceTag.Medium;
        } else {
          confidenceTag = ConfidenceTag.Low;
        }

        agreementMetric = roundHalfUp(Math.max(0, 1 - stdDev / 5));
      }

      // Upsert Score
      const score = await prisma.score.upsert({
        where: {
          cycleId_toolId_dimensionId: { cycleId, toolId, dimensionId },
        },
        update: { value: medianValue, confidenceTag },
        create: { cycleId, toolId, dimensionId, value: medianValue, confidenceTag },
      });

      // Upsert SynthesisRecord
      await prisma.synthesisRecord.upsert({
        where: { scoreId: score.id },
        update: {
          modelsSucceeded,
          modelsFailed,
          medianValue,
          agreementMetric,
          confidenceTag,
          sourceModelIds: groupEvals.map((e) => e.id),
        },
        create: {
          scoreId: score.id,
          dimensionId,
          modelsSucceeded,
          modelsFailed,
          medianValue,
          agreementMetric,
          confidenceTag,
          sourceModelIds: groupEvals.map((e) => e.id),
        },
      });

      scoreCount++;
    }

    log("SYNTH", `✓ ${scoreCount} scores synthesized`);

    // ── Stage 8: Composite scores + rankings ──────────────────────

    log("SCORE", "Calculating composite scores...");

    const activeDimensions = await prisma.scoringDimension.findMany({
      where: {
        methodologyVersionId: cycle.methodologyVersionId!,
        isActive: true,
      },
    });
    const weightMap = new Map(
      activeDimensions.map((d) => [d.id, Number(d.weight)])
    );

    const scores = await prisma.score.findMany({ where: { cycleId } });
    const toolScoreMap = new Map<
      string,
      { value: number; weight: number; isApplicable: boolean; confidenceTag: ConfidenceTag }[]
    >();
    for (const s of scores) {
      const group = toolScoreMap.get(s.toolId) ?? [];
      group.push({
        value: Number(s.value),
        weight: weightMap.get(s.dimensionId) ?? 0,
        isApplicable: s.isApplicable,
        confidenceTag: s.confidenceTag,
      });
      toolScoreMap.set(s.toolId, group);
    }

    const compositeResults: {
      toolId: string;
      compositeScore: number;
      confidenceTag: ConfidenceTag;
    }[] = [];

    const toolScoreEntries = Array.from(toolScoreMap.entries());
    const priority: ConfidenceTag[] = [
      ConfidenceTag.InsufficientData,
      ConfidenceTag.Low,
      ConfidenceTag.Medium,
      ConfidenceTag.High,
    ];

    for (const [toolId, tScores] of toolScoreEntries) {
      const applicable = tScores.filter((s) => s.isApplicable);
      if (applicable.length === 0) continue;

      const totalWeight = applicable.reduce((sum, s) => sum + s.weight, 0);
      if (totalWeight === 0) continue;

      const weighted = applicable.reduce(
        (sum, s) => sum + s.value * (s.weight / totalWeight),
        0
      );
      const compositeScore = Math.round(weighted * 10) / 10;

      // Most conservative confidence
      let lowestIdx = priority.length - 1;
      for (const s of applicable) {
        const idx = priority.indexOf(s.confidenceTag);
        if (idx < lowestIdx) lowestIdx = idx;
      }
      const confidenceTag = priority[lowestIdx];

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

      compositeResults.push({ toolId, compositeScore, confidenceTag });
    }

    // Dense ranking
    compositeResults.sort((a, b) => b.compositeScore - a.compositeScore);
    let currentRank = 1;
    let prevScore: number | null = null;
    for (const item of compositeResults) {
      if (prevScore !== null && item.compositeScore < prevScore) currentRank++;
      prevScore = item.compositeScore;

      const scoreRecord = await prisma.compositeScore.findFirst({
        where: { cycleId, toolId: item.toolId, segmentId: null },
      });
      if (scoreRecord) {
        await prisma.compositeScore.update({
          where: { id: scoreRecord.id },
          data: { rank: currentRank },
        });
      }
    }

    log("SCORE", `✓ ${compositeResults.length} tools ranked`);

    // Print top 5
    const top5 = compositeResults.slice(0, 5);
    for (const item of top5) {
      const tool = await prisma.tool.findUnique({ where: { id: item.toolId } });
      log(
        "SCORE",
        `  #${currentRank <= 5 ? compositeResults.indexOf(item) + 1 : "?"} ${tool?.name ?? item.toolId}: ${item.compositeScore} (${item.confidenceTag})`
      );
    }

    // ── Stage 8b: Per-segment composite scores + rankings ─────────

    const segments = await prisma.marketSegment.findMany({
      include: { toolMappings: { select: { toolId: true } } },
    });

    if (segments.length > 0) {
      log("SCORE", `Calculating per-segment scores for ${segments.length} segments...`);

      for (const segment of segments) {
        const segmentToolIds = new Set(segment.toolMappings.map((m) => m.toolId));
        if (segmentToolIds.size === 0) continue;

        const segmentResults: {
          toolId: string;
          compositeScore: number;
          confidenceTag: ConfidenceTag;
        }[] = [];

        for (const [toolId, tScores] of toolScoreEntries) {
          if (!segmentToolIds.has(toolId)) continue;

          const applicable = tScores.filter((s) => s.isApplicable);
          if (applicable.length === 0) continue;

          const totalWeight = applicable.reduce((sum, s) => sum + s.weight, 0);
          if (totalWeight === 0) continue;

          const weighted = applicable.reduce(
            (sum, s) => sum + s.value * (s.weight / totalWeight),
            0
          );
          const compositeScore = Math.round(weighted * 10) / 10;

          // Most conservative confidence
          let lowestIdx = priority.length - 1;
          for (const s of applicable) {
            const idx = priority.indexOf(s.confidenceTag);
            if (idx < lowestIdx) lowestIdx = idx;
          }
          const confidenceTag = priority[lowestIdx];

          // Upsert composite score for this segment
          const existing = await prisma.compositeScore.findFirst({
            where: { cycleId, toolId, segmentId: segment.id },
          });
          if (existing) {
            await prisma.compositeScore.update({
              where: { id: existing.id },
              data: { value: compositeScore, confidenceTag },
            });
          } else {
            await prisma.compositeScore.create({
              data: { cycleId, toolId, segmentId: segment.id, value: compositeScore, rank: 0, confidenceTag },
            });
          }

          segmentResults.push({ toolId, compositeScore, confidenceTag });
        }

        // Dense ranking within segment
        segmentResults.sort((a, b) => b.compositeScore - a.compositeScore);
        let segRank = 1;
        let segPrev: number | null = null;
        for (const item of segmentResults) {
          if (segPrev !== null && item.compositeScore < segPrev) segRank++;
          segPrev = item.compositeScore;

          const scoreRecord = await prisma.compositeScore.findFirst({
            where: { cycleId, toolId: item.toolId, segmentId: segment.id },
          });
          if (scoreRecord) {
            await prisma.compositeScore.update({
              where: { id: scoreRecord.id },
              data: { rank: segRank },
            });
          }
        }

        log("SCORE", `  ${segment.name}: ${segmentResults.length} tools ranked`);
      }
    }

    // ── Stage 9: Synthesis → Review ───────────────────────────────

    log("STATE", "Transitioning Synthesis → Review...");
    cycle = await transitionCycle(cycleId, CycleState.Review);
    log("STATE", "✓ Review");
  }

  // ── Stage 10: Review → VendorReview ────────────────────────────

  if (cycle.state === CycleState.Review) {
    log("STATE", "Transitioning Review → VendorReview (skipping vendor window for cycle 1)...");
    cycle = await transitionCycle(cycleId, CycleState.VendorReview);
    log("STATE", "✓ VendorReview");
  }

  // ── Stage 11: VendorReview → Publication ───────────────────────

  if (cycle.state === CycleState.VendorReview) {
    log("STATE", "Transitioning VendorReview → Publication...");
    cycle = await transitionCycle(cycleId, CycleState.Publication);
    log("STATE", "✓ Publication");
  }

  // ── Stage 12: Audit package ────────────────────────────────────

  if (cycle.state === CycleState.Publication) {
    log("AUDIT", "Generating audit package...");

    // Gather all audit data
    const cycleData = await prisma.benchmarkCycle.findUniqueOrThrow({
      where: { id: cycleId },
      include: {
        methodologyVersion: {
          include: { scoringDimensions: { where: { isActive: true } } },
        },
        enrollments: { include: { tool: { include: { vendor: true } } } },
      },
    });

    const evalCount = await prisma.modelEvaluation.count({ where: { cycleId } });
    const scoreCount = await prisma.score.count({ where: { cycleId } });
    const compositeCount = await prisma.compositeScore.count({
      where: { cycleId },
    });

    // Build minimal audit content for hash (full data in DB)
    const auditContent = {
      metadata: {
        cycleIdentifier: cycleData.cycleIdentifier,
        displayName: cycleData.displayName,
        generatedAt: new Date().toISOString(),
        methodologyVersion: cycleData.methodologyVersion?.versionNumber,
      },
      counts: {
        evaluations: evalCount,
        scores: scoreCount,
        compositeScores: compositeCount,
        enrollments: cycleData.enrollments.length,
      },
    };

    const { createHash } = await import("crypto");
    const contentJson = JSON.stringify(auditContent, null, 2);
    const integrityHash = createHash("sha256")
      .update(contentJson)
      .digest("hex");
    const fileUrl = `audit-packages/${cycleId}/${integrityHash}.json`;

    await prisma.cycleAuditPackage.upsert({
      where: { cycleId },
      update: {
        integrityHash,
        fileUrl,
        fileSizeBytes: Buffer.byteLength(contentJson, "utf-8"),
      },
      create: {
        cycleId,
        integrityHash,
        fileUrl,
        fileSizeBytes: Buffer.byteLength(contentJson, "utf-8"),
      },
    });

    // Seal it
    await prisma.cycleAuditPackage.update({
      where: { cycleId },
      data: { isSealed: true, sealedAt: new Date() },
    });

    log("AUDIT", `✓ Audit package sealed (hash: ${integrityHash.slice(0, 12)}...)`);

    // ── Stage 13: Generate report ──────────────────────────────────

    log("REPORT", "Generating benchmark report...");

    const compositeScores = await prisma.compositeScore.findMany({
      where: { cycleId, segmentId: null },
      include: { tool: { include: { vendor: true } } },
      orderBy: { rank: "asc" },
    });

    const reportContent = {
      cycleIdentifier: cycleData.cycleIdentifier,
      displayName: cycleData.displayName,
      methodologyVersion: cycleData.methodologyVersion?.versionNumber,
      toolsEvaluated: compositeScores.length,
      totalScores: scoreCount,
      rankings: compositeScores.map((cs) => ({
        rank: cs.rank,
        toolName: cs.tool.name,
        vendorName: cs.tool.vendor?.companyName,
        compositeScore: Number(cs.value),
        confidenceTag: cs.confidenceTag,
      })),
      generatedAt: new Date().toISOString(),
    };

    const report = await prisma.benchmarkReport.upsert({
      where: { cycleId },
      update: {
        title: "March 2026 AI Search Arena Benchmark",
        slug: "march-2026",
        executiveSummary: `First benchmark cycle evaluating ${compositeScores.length} GEO/AEO tools across 51 dimensions using 6 AI models.`,
        content: reportContent,
      },
      create: {
        cycleId,
        title: "March 2026 AI Search Arena Benchmark",
        slug: "march-2026",
        executiveSummary: `First benchmark cycle evaluating ${compositeScores.length} GEO/AEO tools across 51 dimensions using 6 AI models.`,
        content: reportContent,
      },
    });

    // Publish
    await prisma.benchmarkReport.update({
      where: { id: report.id },
      data: { publishedAt: new Date() },
    });

    log("REPORT", "✓ Report generated and published");

    // ── Stage 14: Publication → Completed ─────────────────────────

    log("STATE", "Transitioning Publication → Completed...");
    cycle = await transitionCycle(cycleId, CycleState.Completed);
    await prisma.benchmarkCycle.update({
      where: { id: cycleId },
      data: { publishedAt: new Date() },
    });
    log("STATE", "✓ Completed (publishedAt set)");
  }

  // ── Final summary ─────────────────────────────────────────────

  console.log();
  console.log("═══════════════════════════════════════════");
  console.log("  Cycle complete!");
  console.log(`  Cycle: ${cycle.cycleIdentifier}`);
  console.log(`  State: ${cycle.state}`);
  console.log(`  Elapsed: ${elapsed(globalStart)}`);
  console.log("═══════════════════════════════════════════");

  // Print final rankings
  const finalRankings = await prisma.compositeScore.findMany({
    where: { cycleId, segmentId: null },
    include: { tool: true },
    orderBy: { rank: "asc" },
    take: 10,
  });

  if (finalRankings.length > 0) {
    console.log();
    console.log("Top 10 Rankings:");
    for (const r of finalRankings) {
      console.log(
        `  #${r.rank} ${r.tool.name}: ${Number(r.value).toFixed(1)} (${r.confidenceTag})`
      );
    }
  }
}

main()
  .catch((e) => {
    console.error("\n✗ Cycle failed:", e.message ?? e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
