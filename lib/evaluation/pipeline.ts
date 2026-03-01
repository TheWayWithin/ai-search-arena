import { EvaluationStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { evaluateToolDimension } from "./openrouter";

/**
 * Run the evaluation pipeline for a single tool against all dimensions.
 * Creates ModelEvaluation records for each (tool x dimension x model).
 *
 * AC-007-01: Dispatches prompts to all 6 models via OpenRouter in parallel.
 * AC-007-02: Retry with exponential backoff on failure.
 * AC-007-03: Flags insufficient if <4/6 succeed.
 */
export async function evaluateTool(
  cycleId: string,
  toolId: string
) {
  // Get active AI models
  const models = await prisma.aIModel.findMany({
    where: { isActive: true },
    orderBy: { provider: "asc" },
  });

  if (models.length === 0) {
    throw new Error("No active AI models configured");
  }

  // Get the cycle with its methodology and dimensions
  const cycle = await prisma.benchmarkCycle.findUniqueOrThrow({
    where: { id: cycleId },
    include: {
      methodologyVersion: {
        include: {
          scoringDimensions: {
            where: { isActive: true },
            orderBy: { displayOrder: "asc" },
            include: {
              promptSets: true,
            },
          },
        },
      },
    },
  });

  if (!cycle.methodologyVersion) {
    throw new Error("Cycle has no methodology version assigned");
  }

  // Get tool info for prompt context
  const tool = await prisma.tool.findUniqueOrThrow({
    where: { id: toolId },
    include: { vendor: true },
  });

  const results: {
    dimensionId: string;
    dimensionName: string;
    successCount: number;
    failureCount: number;
    isInsufficient: boolean;
  }[] = [];

  // Evaluate each dimension
  for (const dimension of cycle.methodologyVersion.scoringDimensions) {
    // Find prompt set for this dimension in this methodology version
    const promptSet = dimension.promptSets.find(
      (ps) => ps.methodologyVersionId === cycle.methodologyVersionId
    );

    // Build prompts
    const systemPrompt = buildSystemPrompt(dimension.name, dimension.category ?? "");
    const userPrompt = promptSet
      ? buildUserPromptFromSet(tool.name, tool.description ?? "", promptSet.prompts)
      : buildDefaultUserPrompt(tool.name, tool.description ?? "", dimension.name);

    // Evaluate across all models in parallel
    const evaluation = await evaluateToolDimension(
      models.map((m) => ({
        modelIdentifier: m.modelIdentifier,
        timeoutMs: m.timeoutMs,
      })),
      systemPrompt,
      userPrompt
    );

    // Save ModelEvaluation records
    for (const result of evaluation.results) {
      const model = models.find((m) => m.modelIdentifier === result.modelIdentifier);
      if (!model) continue;

      const status = result.success
        ? EvaluationStatus.Success
        : result.error?.includes("Timeout")
          ? EvaluationStatus.Timeout
          : EvaluationStatus.Failed;

      await prisma.modelEvaluation.create({
        data: {
          cycleId,
          toolId,
          dimensionId: dimension.id,
          modelId: model.id,
          promptSetId: promptSet?.id ?? dimension.promptSets[0]?.id ?? "",
          status,
          parsedScore: result.parsedScore,
          rawResponse: result.rawResponse,
          responseTimeMs: result.responseTimeMs,
          evaluatedAt: new Date(),
        },
      });
    }

    results.push({
      dimensionId: dimension.id,
      dimensionName: dimension.name,
      successCount: evaluation.successCount,
      failureCount: evaluation.failureCount,
      isInsufficient: evaluation.isInsufficient,
    });
  }

  return {
    toolId,
    toolName: tool.name,
    dimensionsEvaluated: results.length,
    insufficientDimensions: results.filter((r) => r.isInsufficient).length,
    results,
  };
}

function buildSystemPrompt(dimensionName: string, category: string): string {
  return `You are an expert evaluator for AI search optimization (GEO/AEO) tools. You are evaluating tools on the dimension "${dimensionName}" in the category "${category}".

Provide a score from 0 to 10 (one decimal place) based on your assessment.
- 0-2: Poor/Missing - Feature barely exists or is fundamentally broken
- 3-4: Below Average - Basic functionality with significant gaps
- 5-6: Average - Functional but nothing exceptional
- 7-8: Good - Strong capability with minor gaps
- 9-10: Excellent - Best-in-class implementation

Format your response as:
Score: X.X
Rationale: [Brief justification]`;
}

function buildUserPromptFromSet(
  toolName: string,
  toolDescription: string,
  prompts: unknown
): string {
  const promptArray = Array.isArray(prompts) ? prompts : [];
  const selectedPrompt = promptArray.length > 0
    ? String(promptArray[Math.floor(Math.random() * promptArray.length)])
    : "";

  return `Evaluate the tool "${toolName}" (${toolDescription}).

${selectedPrompt}

Provide your score and rationale.`;
}

function buildDefaultUserPrompt(
  toolName: string,
  toolDescription: string,
  dimensionName: string
): string {
  return `Evaluate the tool "${toolName}" (${toolDescription}) on the dimension "${dimensionName}".

Consider:
- How well does this tool address this specific dimension?
- What is the quality of implementation compared to market alternatives?
- Are there notable strengths or weaknesses?

Provide your score and rationale.`;
}
