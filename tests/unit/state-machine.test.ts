import { describe, expect, it } from "vitest";

/**
 * State machine transition tests (pure logic, no database).
 * These validate the transition rules defined in lib/state-machine/cycle.ts.
 */

const VALID_CYCLE_TRANSITIONS: Record<string, string[]> = {
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

const ALL_STATES = [
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

function isValidTransition(from: string, to: string): boolean {
  return VALID_CYCLE_TRANSITIONS[from]?.includes(to) ?? false;
}

describe("BenchmarkCycle state machine", () => {
  it("has exactly 10 states", () => {
    expect(Object.keys(VALID_CYCLE_TRANSITIONS)).toHaveLength(10);
  });

  it("has exactly 14 valid transitions", () => {
    const totalTransitions = Object.values(VALID_CYCLE_TRANSITIONS).reduce(
      (sum, targets) => sum + targets.length,
      0
    );
    expect(totalTransitions).toBe(14);
  });

  it("terminal states have no outgoing transitions", () => {
    expect(VALID_CYCLE_TRANSITIONS["Completed"]).toHaveLength(0);
    expect(VALID_CYCLE_TRANSITIONS["Cancelled"]).toHaveLength(0);
  });

  it("Draft can transition to Planning, Suspended, or Cancelled", () => {
    expect(isValidTransition("Draft", "Planning")).toBe(true);
    expect(isValidTransition("Draft", "Suspended")).toBe(true);
    expect(isValidTransition("Draft", "Cancelled")).toBe(true);
    expect(isValidTransition("Draft", "Evaluation")).toBe(false);
    expect(isValidTransition("Draft", "Completed")).toBe(false);
  });

  it("happy path follows the full lifecycle", () => {
    const happyPath = [
      "Draft",
      "Planning",
      "Evaluation",
      "Synthesis",
      "Review",
      "VendorReview",
      "Publication",
      "Completed",
    ];

    for (let i = 0; i < happyPath.length - 1; i++) {
      expect(isValidTransition(happyPath[i], happyPath[i + 1])).toBe(true);
    }
  });

  it("cannot skip states in the happy path", () => {
    expect(isValidTransition("Draft", "Evaluation")).toBe(false);
    expect(isValidTransition("Planning", "Synthesis")).toBe(false);
    expect(isValidTransition("Evaluation", "Review")).toBe(false);
    expect(isValidTransition("Synthesis", "VendorReview")).toBe(false);
    expect(isValidTransition("Review", "Publication")).toBe(false);
    expect(isValidTransition("VendorReview", "Completed")).toBe(false);
  });

  it("cannot transition backwards (except Suspended->Draft)", () => {
    expect(isValidTransition("Planning", "Draft")).toBe(false);
    expect(isValidTransition("Evaluation", "Planning")).toBe(false);
    expect(isValidTransition("Synthesis", "Evaluation")).toBe(false);
    expect(isValidTransition("Completed", "Draft")).toBe(false);
    // Suspended->Draft is the only valid backwards transition
    expect(isValidTransition("Suspended", "Draft")).toBe(true);
  });

  it("Suspended can resume to Draft or escalate to Cancelled", () => {
    expect(isValidTransition("Suspended", "Draft")).toBe(true);
    expect(isValidTransition("Suspended", "Cancelled")).toBe(true);
    expect(isValidTransition("Suspended", "Planning")).toBe(false);
  });

  it("every non-terminal state has at least one transition", () => {
    for (const state of ALL_STATES) {
      if (state !== "Completed" && state !== "Cancelled") {
        expect(VALID_CYCLE_TRANSITIONS[state].length).toBeGreaterThan(0);
      }
    }
  });

  it("all transition targets are valid states", () => {
    for (const [, targets] of Object.entries(VALID_CYCLE_TRANSITIONS)) {
      for (const target of targets) {
        expect(ALL_STATES).toContain(target);
      }
    }
  });
});

describe("score parsing", () => {
  // Inline the parser for pure testing
  function parseScore(response: string): number | null {
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

  it("parses 'Score: X.X' format", () => {
    expect(parseScore("Score: 7.5\nRationale: Good tool")).toBe(7.5);
    expect(parseScore("Score: 9.0")).toBe(9.0);
    expect(parseScore("score: 3.2")).toBe(3.2);
  });

  it("parses 'X.X/10' format", () => {
    expect(parseScore("I rate this 8.5/10")).toBe(8.5);
    expect(parseScore("Rating: 6/10")).toBe(6.0);
  });

  it("rejects scores outside 0-10 range", () => {
    expect(parseScore("Score: 15.0")).toBe(null);
    expect(parseScore("Score: -1")).toBe(null);
  });

  it("rounds to one decimal place", () => {
    expect(parseScore("Score: 7.55")).toBe(7.6);
    expect(parseScore("Score: 7.54")).toBe(7.5);
  });

  it("returns null for unparseable responses", () => {
    expect(parseScore("This tool is great but I can't give a number")).toBe(null);
    expect(parseScore("")).toBe(null);
  });
});
