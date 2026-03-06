import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  getComparisonData,
  getAllToolsForSelector,
  getPublishedCycles,
} from "@/lib/db/leaderboard";
import { ToolCompareSelector } from "@/components/tool-compare-selector";
import { CycleSelector } from "@/components/cycle-selector";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ tools?: string; cycle?: string }>;
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { tools } = await searchParams;
  const slugs = tools?.split(",").filter(Boolean) ?? [];

  if (slugs.length < 2) {
    return {
      title: "Compare Tools",
      description:
        "Compare AI search optimization tools side-by-side across all benchmark dimensions.",
    };
  }

  const data = await getComparisonData(slugs);
  const toolNames = data.tools.map((t) => t.name);

  return {
    title: `Compare ${toolNames.join(" vs ")}`,
    description: `Side-by-side benchmark comparison of ${toolNames.join(", ")} across all evaluation dimensions.`,
  };
}

function confidenceColor(tag: string) {
  switch (tag) {
    case "High":
      return "bg-confidence-green/10 text-confidence-green border-confidence-green/20";
    case "Medium":
      return "bg-caution-amber/10 text-caution-amber border-caution-amber/20";
    case "Low":
      return "bg-insufficient-red/10 text-insufficient-red border-insufficient-red/20";
    case "InsufficientData":
      return "bg-neutral-grey/10 text-neutral-grey border-neutral-grey/20";
    default:
      return "";
  }
}

function confidenceLabel(tag: string) {
  return tag === "InsufficientData" ? "Insufficient" : tag;
}

export default async function ComparePage({ searchParams }: Props) {
  const { tools: toolsParam, cycle: cycleParam } = await searchParams;
  const slugs = toolsParam?.split(",").filter(Boolean) ?? [];
  const allTools = await getAllToolsForSelector();

  // Resolve cycle
  const publishedCycles = await getPublishedCycles();
  const activeCycle = cycleParam
    ? (publishedCycles.find((c) => c.cycleIdentifier === cycleParam) ?? publishedCycles[0])
    : publishedCycles[0];
  const resolvedCycleId = activeCycle?.id;

  // Empty state - no tools selected
  if (slugs.length === 0) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h1 className="text-arena-slate text-3xl font-bold tracking-tight">Compare Tools</h1>
        <div className="border-border bg-pale-grey mt-8 rounded-lg border p-8 text-center">
          <p className="text-arena-slate text-lg">Select tools to compare side-by-side</p>
          <p className="text-arena-slate-light mt-2 text-sm">
            Visit the{" "}
            <Link href="/leaderboard" className="text-mastery-blue hover:underline">
              leaderboard
            </Link>{" "}
            and select tools using the checkboxes, or add tools below.
          </p>
          <div className="mx-auto mt-6 w-64">
            <ToolCompareSelector availableTools={allTools} currentSlugs={[]} />
          </div>
        </div>
      </div>
    );
  }

  const data = await getComparisonData(slugs, resolvedCycleId);
  const { cycle, tools, scores, compositeScores } = data;

  // Build available tools for selector (exclude already-selected)
  const selectedSlugs = new Set(tools.map((t) => t.slug));
  const availableTools = allTools.filter((t) => !selectedSlugs.has(t.slug));

  // Single tool state - show tool + prominent add UI
  if (tools.length < 2) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <Link href="/leaderboard" className="text-arena-slate-light hover:text-arena-slate text-sm">
          &larr; Back to Leaderboard
        </Link>
        <h1 className="text-arena-slate mt-4 text-3xl font-bold tracking-tight">Compare Tools</h1>
        <div className="border-border bg-pale-grey mt-8 rounded-lg border p-8 text-center">
          <p className="text-arena-slate text-lg">
            {tools.length === 1
              ? `Add at least one more tool to compare with ${tools[0].name}`
              : "The selected tools were not found. Try selecting from the dropdown."}
          </p>
          <div className="mx-auto mt-6 w-64">
            <ToolCompareSelector
              availableTools={availableTools}
              currentSlugs={slugs.filter((s) => selectedSlugs.has(s))}
            />
          </div>
        </div>
      </div>
    );
  }

  // Build composite score map: toolId -> compositeScore
  const compositeMap = new Map(compositeScores.map((cs) => [cs.toolId, cs]));

  // Build score map: toolId -> dimensionId -> score
  const scoreMap = new Map<string, Map<string, (typeof scores)[number]>>();
  for (const score of scores) {
    let toolScores = scoreMap.get(score.toolId);
    if (!toolScores) {
      toolScores = new Map();
      scoreMap.set(score.toolId, toolScores);
    }
    toolScores.set(score.dimensionId, score);
  }

  // Collect all unique dimensions, grouped by category
  const dimensionMap = new Map<string, (typeof scores)[number]["dimension"]>();
  for (const score of scores) {
    if (!dimensionMap.has(score.dimensionId)) {
      dimensionMap.set(score.dimensionId, score.dimension);
    }
  }
  const allDimensions = [...dimensionMap.values()].sort((a, b) => {
    const catCmp = (a.category ?? "").localeCompare(b.category ?? "");
    if (catCmp !== 0) return catCmp;
    return a.displayOrder - b.displayOrder;
  });

  // Group by category
  const dimsByCategory = new Map<string, typeof allDimensions>();
  for (const dim of allDimensions) {
    const cat = dim.category ?? "Other";
    const group = dimsByCategory.get(cat) ?? [];
    group.push(dim);
    dimsByCategory.set(cat, group);
  }

  // Maintain tool order consistent with slugs param
  const slugOrder = slugs.filter((s) => selectedSlugs.has(s));
  const orderedTools = slugOrder.map((s) => tools.find((t) => t.slug === s)!).filter(Boolean);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: `Compare ${orderedTools.map((t) => t.name).join(" vs ")}`,
    description: `Side-by-side benchmark comparison of ${orderedTools.map((t) => t.name).join(", ")} across all evaluation dimensions.`,
    url: `https://aisearcharena.com/compare?tools=${slugOrder.join(",")}`,
    creator: {
      "@type": "Organization",
      name: "AI Search Arena",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <Link href="/leaderboard" className="text-arena-slate-light hover:text-arena-slate text-sm">
          &larr; Back to Leaderboard
        </Link>
        <div className="mt-4 flex items-baseline justify-between">
          <h1 className="text-arena-slate text-3xl font-bold tracking-tight">Compare Tools</h1>
          {publishedCycles.length > 1 && activeCycle && (
            <CycleSelector
              cycles={publishedCycles.map((c) => ({
                id: c.id,
                cycleIdentifier: c.cycleIdentifier,
                displayName: c.displayName,
              }))}
              currentCycleId={activeCycle.id}
            />
          )}
        </div>
        {cycle && (
          <p className="text-arena-slate-light mt-1 text-sm">
            {cycle.displayName} &middot; Methodology v{cycle.methodologyVersion?.versionNumber}
          </p>
        )}

        <div className="mt-6 overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            {/* Summary header */}
            <thead>
              <tr className="border-border bg-pale-grey border-b">
                <th className="bg-pale-grey text-arena-slate-light sticky left-0 z-10 px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase">
                  Tool
                </th>
                {orderedTools.map((tool) => {
                  const cs = compositeMap.get(tool.id);
                  const removeSlugs = slugOrder.filter((s) => s !== tool.slug);
                  return (
                    <th key={tool.id} className="min-w-[140px] px-4 py-3 text-center">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <Link
                            href={`/tools/${tool.slug}`}
                            className="text-arena-slate hover:text-mastery-blue font-semibold hover:underline"
                          >
                            {tool.name}
                          </Link>
                          {tool.vendor && (
                            <Link
                              href={`/vendors/${tool.vendor.slug}`}
                              className="text-arena-slate-light hover:text-mastery-blue text-xs font-normal hover:underline"
                            >
                              {tool.vendor.companyName}
                            </Link>
                          )}
                          {cs && (
                            <div className="mt-1">
                              <span className="text-arena-slate text-lg font-bold">
                                {Number(cs.value).toFixed(1)}
                              </span>
                              <span className="text-arena-slate-light text-xs">/10</span>
                              <span className="text-arena-slate-light ml-1 text-xs">
                                #{cs.rank}
                              </span>
                              <div className="mt-0.5">
                                <Badge
                                  variant="outline"
                                  className={`text-xs ${confidenceColor(cs.confidenceTag)}`}
                                >
                                  {confidenceLabel(cs.confidenceTag)}
                                </Badge>
                              </div>
                            </div>
                          )}
                        </div>
                        {orderedTools.length > 2 && (
                          <Link
                            href={`/compare?tools=${removeSlugs.join(",")}`}
                            className="text-arena-slate-light hover:bg-insufficient-red/10 hover:text-insufficient-red ml-1 rounded p-0.5"
                            title={`Remove ${tool.name}`}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <line x1="18" y1="6" x2="6" y2="18" />
                              <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                          </Link>
                        )}
                      </div>
                    </th>
                  );
                })}
                {orderedTools.length < 4 && (
                  <th className="min-w-[140px] px-4 py-3">
                    <ToolCompareSelector availableTools={availableTools} currentSlugs={slugOrder} />
                  </th>
                )}
              </tr>
            </thead>

            {/* Dimension rows grouped by category */}
            <tbody>
              {[...dimsByCategory.entries()].map(([category, dims]) => (
                <>
                  <tr key={`cat-${category}`}>
                    <td
                      colSpan={orderedTools.length + 1 + (orderedTools.length < 4 ? 1 : 0)}
                      className="bg-pale-grey/50 text-arena-slate-light px-4 py-2 text-xs font-semibold tracking-wider uppercase"
                    >
                      {category}
                    </td>
                  </tr>
                  {dims.map((dim) => {
                    // Find best score for this dimension
                    const toolScoreValues = orderedTools.map((tool) => {
                      const s = scoreMap.get(tool.id)?.get(dim.id);
                      if (!s || !s.isApplicable) return null;
                      return Number(s.value);
                    });
                    const applicableValues = toolScoreValues.filter((v): v is number => v !== null);
                    const bestValue =
                      applicableValues.length > 0 ? Math.max(...applicableValues) : null;

                    return (
                      <tr key={dim.id} className="border-border border-b last:border-b-0">
                        <td className="sticky left-0 z-10 bg-white px-4 py-2">
                          <span className="text-arena-slate font-medium">{dim.name}</span>
                          <span className="text-arena-slate-light ml-2 text-xs">
                            {(Number(dim.weight) * 100).toFixed(1)}%
                          </span>
                        </td>
                        {orderedTools.map((tool, i) => {
                          const score = scoreMap.get(tool.id)?.get(dim.id);
                          const val = toolScoreValues[i];
                          const isBest =
                            val !== null &&
                            bestValue !== null &&
                            val === bestValue &&
                            applicableValues.length > 1;

                          if (!score || !score.isApplicable) {
                            return (
                              <td key={tool.id} className="text-neutral-grey px-4 py-2 text-center">
                                N/A
                              </td>
                            );
                          }

                          return (
                            <td
                              key={tool.id}
                              className={`px-4 py-2 text-center ${
                                isBest ? "bg-confidence-green/5" : ""
                              }`}
                            >
                              <span
                                className={`font-semibold ${
                                  isBest ? "text-confidence-green" : "text-arena-slate"
                                }`}
                              >
                                {Number(score.value).toFixed(1)}
                              </span>
                              <Badge
                                variant="outline"
                                className={`ml-1.5 text-xs ${confidenceColor(score.confidenceTag)}`}
                              >
                                {confidenceLabel(score.confidenceTag)}
                              </Badge>
                            </td>
                          );
                        })}
                        {orderedTools.length < 4 && <td />}
                      </tr>
                    );
                  })}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
