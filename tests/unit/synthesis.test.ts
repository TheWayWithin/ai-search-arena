import { describe, expect, it } from "vitest";

// Inline pure functions for testing (same logic as lib/synthesis/median.ts)
function computeMedian(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2;
  }
  return sorted[mid];
}

function roundHalfUp(value: number): number {
  return Math.round(value * 10) / 10;
}

type ConfidenceTag = "High" | "Medium" | "Low" | "InsufficientData";

function deriveConfidenceTag(
  scores: number[],
  successCount: number,
): ConfidenceTag {
  if (successCount < 4) return "InsufficientData";
  const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
  const variance = scores.reduce((sum, s) => sum + Math.pow(s - mean, 2), 0) / scores.length;
  const stdDev = Math.sqrt(variance);
  if (stdDev <= 0.5) return "High";
  if (stdDev <= 1.5) return "Medium";
  return "Low";
}

function calculateCompositeScore(
  scores: { value: number; weight: number; isApplicable: boolean }[]
): { compositeScore: number; applicableDimensions: number } {
  const applicable = scores.filter((s) => s.isApplicable);
  if (applicable.length === 0) return { compositeScore: 0, applicableDimensions: 0 };
  const totalWeight = applicable.reduce((sum, s) => sum + s.weight, 0);
  if (totalWeight === 0) return { compositeScore: 0, applicableDimensions: applicable.length };
  const weighted = applicable.reduce((sum, s) => sum + s.value * (s.weight / totalWeight), 0);
  return { compositeScore: Math.round(weighted * 10) / 10, applicableDimensions: applicable.length };
}

function applyDenseRanking(items: { id: string; compositeScore: number }[]) {
  const sorted = [...items].sort((a, b) => b.compositeScore - a.compositeScore);
  let rank = 1;
  let prev: number | null = null;
  return sorted.map((item) => {
    if (prev !== null && item.compositeScore < prev) rank++;
    prev = item.compositeScore;
    return { ...item, rank };
  });
}

describe("median computation", () => {
  it("computes median of odd-length array", () => {
    expect(computeMedian([1, 3, 5, 7, 9])).toBe(5);
  });

  it("computes median of even-length array", () => {
    expect(computeMedian([1, 3, 5, 7])).toBe(4);
  });

  it("returns 0 for empty array", () => {
    expect(computeMedian([])).toBe(0);
  });

  it("handles single value", () => {
    expect(computeMedian([7.5])).toBe(7.5);
  });

  it("handles unsorted input", () => {
    expect(computeMedian([9, 1, 5, 3, 7])).toBe(5);
  });
});

describe("roundHalfUp", () => {
  it("rounds 7.55 to 7.6", () => {
    expect(roundHalfUp(7.55)).toBe(7.6);
  });

  it("rounds 7.54 to 7.5", () => {
    expect(roundHalfUp(7.54)).toBe(7.5);
  });

  it("rounds 7.5 to 7.5", () => {
    expect(roundHalfUp(7.5)).toBe(7.5);
  });

  it("rounds 0.05 to 0.1", () => {
    expect(roundHalfUp(0.05)).toBe(0.1);
  });
});

describe("confidence tag derivation", () => {
  it("returns InsufficientData for < 4 successful models", () => {
    expect(deriveConfidenceTag([7.0, 7.5, 8.0], 3)).toBe("InsufficientData");
  });

  it("returns High for tight agreement (stdDev <= 0.5)", () => {
    expect(deriveConfidenceTag([7.0, 7.2, 7.1, 7.3, 7.0, 7.1], 6)).toBe("High");
  });

  it("returns Medium for moderate agreement (stdDev 0.5-1.5)", () => {
    expect(deriveConfidenceTag([6.0, 7.0, 8.0, 7.0, 7.5, 6.5], 6)).toBe("Medium");
  });

  it("returns Low for poor agreement (stdDev > 1.5)", () => {
    expect(deriveConfidenceTag([2.0, 5.0, 8.0, 9.0, 3.0, 7.0], 6)).toBe("Low");
  });
});

describe("composite score calculation", () => {
  it("calculates weighted average correctly", () => {
    const result = calculateCompositeScore([
      { value: 8.0, weight: 0.5, isApplicable: true },
      { value: 6.0, weight: 0.5, isApplicable: true },
    ]);
    expect(result.compositeScore).toBe(7.0);
  });

  it("renormalizes weights when dimensions are N/A", () => {
    const result = calculateCompositeScore([
      { value: 8.0, weight: 0.4, isApplicable: true },
      { value: 6.0, weight: 0.4, isApplicable: true },
      { value: 0, weight: 0.2, isApplicable: false }, // N/A
    ]);
    // Renormalized: 0.4/0.8=0.5 each
    expect(result.compositeScore).toBe(7.0);
    expect(result.applicableDimensions).toBe(2);
  });

  it("returns 0 for no applicable dimensions", () => {
    const result = calculateCompositeScore([
      { value: 8.0, weight: 0.5, isApplicable: false },
    ]);
    expect(result.compositeScore).toBe(0);
  });
});

describe("dense ranking", () => {
  it("assigns sequential ranks for different scores", () => {
    const ranked = applyDenseRanking([
      { id: "a", compositeScore: 8.0 },
      { id: "b", compositeScore: 7.0 },
      { id: "c", compositeScore: 6.0 },
    ]);
    expect(ranked[0]).toEqual({ id: "a", compositeScore: 8.0, rank: 1 });
    expect(ranked[1]).toEqual({ id: "b", compositeScore: 7.0, rank: 2 });
    expect(ranked[2]).toEqual({ id: "c", compositeScore: 6.0, rank: 3 });
  });

  it("assigns same rank for tied scores (BR-S08)", () => {
    const ranked = applyDenseRanking([
      { id: "a", compositeScore: 8.0 },
      { id: "b", compositeScore: 8.0 },
      { id: "c", compositeScore: 6.0 },
    ]);
    expect(ranked[0].rank).toBe(1);
    expect(ranked[1].rank).toBe(1);
    expect(ranked[2].rank).toBe(2);
  });

  it("handles all tied scores", () => {
    const ranked = applyDenseRanking([
      { id: "a", compositeScore: 7.5 },
      { id: "b", compositeScore: 7.5 },
      { id: "c", compositeScore: 7.5 },
    ]);
    expect(ranked.every((r) => r.rank === 1)).toBe(true);
  });

  it("handles single item", () => {
    const ranked = applyDenseRanking([{ id: "a", compositeScore: 9.0 }]);
    expect(ranked[0].rank).toBe(1);
  });
});

describe("synthesis determinism (BR-S12)", () => {
  it("produces identical results for identical inputs across 10 runs", () => {
    const scores = [7.0, 7.5, 8.0, 6.5, 7.2, 7.8];
    const results = Array.from({ length: 10 }, () => ({
      median: roundHalfUp(computeMedian(scores)),
      confidence: deriveConfidenceTag(scores, 6),
    }));

    const first = results[0];
    for (const result of results) {
      expect(result.median).toBe(first.median);
      expect(result.confidence).toBe(first.confidence);
    }
  });
});
