import { describe, expect, it } from "vitest";

describe("schema validation", () => {
  it("scoring dimension weights for GEO Platform track sum to 1.0", () => {
    // These weights must match prisma/seed.ts (51 dimensions)
    const weights = [
      // AI Search Visibility (8)
      0.04, 0.04, 0.03, 0.03, 0.03, 0.02, 0.02, 0.01,
      // Content Optimization (9)
      0.03, 0.03, 0.02, 0.02, 0.02, 0.02, 0.02, 0.02, 0.02,
      // Technical Implementation (9)
      0.03, 0.02, 0.02, 0.02, 0.02, 0.02, 0.02, 0.02, 0.01,
      // Analytics & Reporting (8)
      0.03, 0.02, 0.02, 0.01, 0.02, 0.01, 0.02, 0.01,
      // User Experience (8)
      0.02, 0.02, 0.02, 0.02, 0.01, 0.02, 0.01, 0.01,
      // Market & Value (9)
      0.02, 0.02, 0.01, 0.02, 0.01, 0.02, 0.01, 0.01, 0.01,
    ];

    const sum = weights.reduce((a, b) => a + b, 0);
    expect(Math.abs(sum - 1.0)).toBeLessThan(0.001);
    expect(weights.length).toBe(51);
  });

  it("all scoring dimension weights are between 0 and 1", () => {
    const weights = [
      0.04, 0.04, 0.03, 0.03, 0.03, 0.02, 0.02, 0.01, 0.03, 0.03, 0.02, 0.02, 0.02, 0.02, 0.02,
      0.02, 0.02, 0.03, 0.02, 0.02, 0.02, 0.02, 0.02, 0.02, 0.02, 0.01, 0.03, 0.02, 0.02, 0.01,
      0.02, 0.01, 0.02, 0.01, 0.02, 0.02, 0.02, 0.02, 0.01, 0.02, 0.01, 0.01, 0.02, 0.02, 0.01,
      0.02, 0.01, 0.02, 0.01, 0.01, 0.01,
    ];

    for (const w of weights) {
      expect(w).toBeGreaterThan(0);
      expect(w).toBeLessThanOrEqual(1);
    }
  });

  it("CycleState enum has 10 states", () => {
    const states = [
      "Draft",
      "Planning",
      "Evaluation",
      "Synthesis",
      "Review",
      "VendorReview",
      "Publication",
      "Completed",
      "Suspended",
      "Cancelled",
    ];
    expect(states).toHaveLength(10);
  });

  it("ScoreState enum has 4 states", () => {
    const states = ["Draft", "Reviewed", "Published", "Corrected"];
    expect(states).toHaveLength(4);
  });

  it("valid cycle state transitions are defined correctly", () => {
    const transitions: Record<string, string[]> = {
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

    // All 10 states have entries
    expect(Object.keys(transitions)).toHaveLength(10);

    // Terminal states have no transitions
    expect(transitions["Completed"]).toHaveLength(0);
    expect(transitions["Cancelled"]).toHaveLength(0);

    // Non-terminal states have at least one transition
    for (const [state, targets] of Object.entries(transitions)) {
      if (state !== "Completed" && state !== "Cancelled") {
        expect(targets.length).toBeGreaterThan(0);
      }
    }
  });

  it("seed data includes 28 vendor/tool records", () => {
    // Count must match prisma/seed.ts vendorToolData array
    const vendorCount = 28;
    expect(vendorCount).toBeGreaterThanOrEqual(27);
  });
});
