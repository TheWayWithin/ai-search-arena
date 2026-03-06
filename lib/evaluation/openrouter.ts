/**
 * OpenRouter API client for multi-model evaluation.
 * All AI model calls go through OpenRouter as a unified gateway.
 */

interface OpenRouterRequest {
  model: string;
  messages: { role: "system" | "user" | "assistant"; content: string }[];
  temperature?: number;
  max_tokens?: number;
}

interface OpenRouterResponse {
  id: string;
  model: string;
  choices: {
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

interface EvaluationResult {
  success: boolean;
  modelIdentifier: string;
  rawResponse: string;
  parsedScore: number | null;
  responseTimeMs: number;
  tokensUsed: number;
  error?: string;
}

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

/**
 * Call a single model via OpenRouter.
 */
async function callModel(
  modelIdentifier: string,
  systemPrompt: string,
  userPrompt: string,
  timeoutMs: number
): Promise<EvaluationResult> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY environment variable is not set");
  }

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
        temperature: 0.1, // Low temperature for consistency
        max_tokens: 2000,
      } satisfies OpenRouterRequest),
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

    const data = (await response.json()) as OpenRouterResponse;
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

    const isTimeout = error instanceof DOMException && error.name === "AbortError";
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

/**
 * Parse a numeric score (0-10) from a model's response text.
 * Looks for patterns like "Score: 7.5" or "7.5/10".
 */
function parseScoreFromResponse(response: string): number | null {
  // Try "Score: X.X" pattern
  const scoreMatch = response.match(/(?:score|rating)[:\s]*(\d+(?:\.\d+)?)/i);
  if (scoreMatch) {
    const val = parseFloat(scoreMatch[1]);
    if (val >= 0 && val <= 10) return Math.round(val * 10) / 10;
  }

  // Try "X.X/10" pattern
  const outOfTenMatch = response.match(/(\d+(?:\.\d+)?)\s*\/\s*10/);
  if (outOfTenMatch) {
    const val = parseFloat(outOfTenMatch[1]);
    if (val >= 0 && val <= 10) return Math.round(val * 10) / 10;
  }

  // Try standalone number at start/end
  const standaloneMatch = response.match(/^(\d+(?:\.\d+)?)\b/m);
  if (standaloneMatch) {
    const val = parseFloat(standaloneMatch[1]);
    if (val >= 0 && val <= 10) return Math.round(val * 10) / 10;
  }

  return null;
}

/**
 * Call a model with exponential backoff retry.
 * AC-007-02: Retry with 1s, 4s, 16s delays.
 */
async function callModelWithRetry(
  modelIdentifier: string,
  systemPrompt: string,
  userPrompt: string,
  timeoutMs: number,
  maxRetries: number = 3
): Promise<EvaluationResult> {
  const backoffDelays = [1000, 4000, 16000];

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const result = await callModel(modelIdentifier, systemPrompt, userPrompt, timeoutMs);

    if (result.success) {
      return result;
    }

    // Don't retry on the last attempt
    if (attempt < maxRetries) {
      const delay = backoffDelays[attempt] ?? 16000;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  // Final attempt failed — return the last error result
  return callModel(modelIdentifier, systemPrompt, userPrompt, timeoutMs);
}

/**
 * Evaluate a single (tool × dimension) across all active models in parallel.
 * AC-007-01: Dispatches to all 6 models via OpenRouter in parallel.
 * AC-007-03: Flags as insufficient if <4/6 models succeed.
 */
export async function evaluateToolDimension(
  models: { modelIdentifier: string; timeoutMs: number }[],
  systemPrompt: string,
  userPrompt: string
): Promise<{
  results: EvaluationResult[];
  successCount: number;
  failureCount: number;
  isInsufficient: boolean;
}> {
  const results = await Promise.all(
    models.map((m) => callModelWithRetry(m.modelIdentifier, systemPrompt, userPrompt, m.timeoutMs))
  );

  const successCount = results.filter((r) => r.success && r.parsedScore !== null).length;
  const failureCount = results.length - successCount;

  return {
    results,
    successCount,
    failureCount,
    isInsufficient: successCount < 4, // BR-S07
  };
}

export { parseScoreFromResponse };
export type { EvaluationResult };
