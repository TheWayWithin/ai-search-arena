import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getPublishedCycles, getToolDetail, getToolScoreHistory } from "@/lib/db/leaderboard";
import { Badge } from "@/components/ui/badge";
import { TierBadge } from "@/components/tier-badge";
import { CycleSelector } from "@/components/cycle-selector";
import { ScoreHistoryChart } from "@/components/score-history-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ cycle?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const tool = await prisma.tool.findUnique({
    where: { slug },
    select: { name: true, description: true },
  });

  if (!tool) return { title: "Tool Not Found" };

  return {
    title: `${tool.name} — Benchmark Scores`,
    description: `Independent benchmark evaluation of ${tool.name}. ${tool.description}`,
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

export default async function ToolDetailPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { cycle: cycleParam } = await searchParams;

  const tool = await prisma.tool.findUnique({
    where: { slug },
    include: {
      vendor: true,
      segmentMappings: { include: { segment: true } },
      trackMappings: { include: { track: true } },
    },
  });

  if (!tool) notFound();

  // Resolve cycle from param
  const publishedCycles = await getPublishedCycles();
  const activeCycle = cycleParam
    ? (publishedCycles.find((c) => c.cycleIdentifier === cycleParam) ?? publishedCycles[0])
    : publishedCycles[0];
  const resolvedCycleId = activeCycle?.id;

  const detail = resolvedCycleId ? await getToolDetail(slug, resolvedCycleId) : null;

  const scores = detail?.scores ?? [];
  const compositeScore = detail?.compositeScore ?? null;
  const cycle = detail?.cycle ?? null;
  const badges = detail?.badges ?? [];

  // Fetch score history for chart (all cycles)
  const scoreHistory = await getToolScoreHistory(slug);

  // Group scores by category
  const scoresByCategory = new Map<string, typeof scores>();
  for (const score of scores) {
    const cat = score.dimension.category ?? "Other";
    const group = scoresByCategory.get(cat) ?? [];
    group.push(score);
    scoresByCategory.set(cat, group);
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: tool.name,
    description: tool.description,
    url: tool.websiteUrl,
    applicationCategory: "AI Search Optimization",
    offers: {
      "@type": "Offer",
      seller: {
        "@type": "Organization",
        name: tool.vendor?.companyName,
      },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {/* Header */}
        <div>
          <Link
            href="/leaderboard"
            className="text-arena-slate-light hover:text-arena-slate text-sm"
          >
            &larr; Back to Leaderboard
          </Link>
          <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-arena-slate text-3xl font-bold tracking-tight">{tool.name}</h1>
              <p className="text-arena-slate-light mt-1 text-sm">
                by{" "}
                {tool.vendor ? (
                  <Link
                    href={`/vendors/${tool.vendor.slug}`}
                    className="text-mastery-blue underline underline-offset-2"
                  >
                    {tool.vendor.companyName}
                  </Link>
                ) : (
                  "Unknown"
                )}
                {tool.websiteUrl && (
                  <>
                    {" "}
                    &middot;{" "}
                    <a
                      href={tool.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-mastery-blue underline underline-offset-2"
                    >
                      Website
                    </a>
                  </>
                )}
              </p>
              <p className="text-arena-slate-light mt-2 max-w-2xl text-sm">{tool.description}</p>
              <Link
                href={`/compare?tools=${tool.slug}`}
                className="text-mastery-blue mt-2 inline-block text-sm hover:underline"
              >
                Compare with other tools &rarr;
              </Link>
            </div>
            {compositeScore && (
              <Card className="min-w-[140px] text-center">
                <CardHeader className="pt-4 pb-1">
                  <CardTitle className="text-arena-slate-light text-sm font-normal">
                    Composite Score
                  </CardTitle>
                </CardHeader>
                <CardContent className="pb-4">
                  <div className="text-arena-slate text-3xl font-bold">
                    {Number(compositeScore.value).toFixed(1)}
                  </div>
                  <div className="text-arena-slate-light text-xs">Rank #{compositeScore.rank}</div>
                  <Badge
                    variant="outline"
                    className={`mt-1 ${confidenceColor(compositeScore.confidenceTag)}`}
                  >
                    {confidenceLabel(compositeScore.confidenceTag)}
                  </Badge>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Badges */}
        {badges.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {badges.map((b) => (
              <TierBadge key={b.id} tier={b.tier as "Gold" | "Silver" | "Bronze"} label={b.label} />
            ))}
          </div>
        )}

        {/* Segments */}
        {tool.segmentMappings.length > 0 && (
          <div className="mt-4 flex gap-2">
            {tool.segmentMappings.map((m) => (
              <Badge key={m.segmentId} variant="secondary" className="text-xs">
                {m.segment.name}
              </Badge>
            ))}
          </div>
        )}

        {/* Score History Chart */}
        {scoreHistory.length >= 2 && (
          <Card className="mt-6">
            <CardHeader className="pb-2">
              <CardTitle className="text-arena-slate text-lg font-semibold">
                Score History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScoreHistoryChart data={scoreHistory} />
            </CardContent>
          </Card>
        )}

        {/* Pre-launch state */}
        {!cycle && (
          <div className="border-border bg-pale-grey mt-8 rounded-lg border p-8 text-center">
            <p className="text-arena-slate">
              Benchmark scores will be available after the first evaluation cycle is published.
            </p>
          </div>
        )}

        {/* Dimension Scores by Category */}
        {cycle && scores.length > 0 && (
          <div className="mt-8 space-y-6">
            <div className="flex items-baseline justify-between">
              <h2 className="text-arena-slate text-xl font-semibold">
                Dimension Scores — {cycle.displayName}
              </h2>
              {publishedCycles.length > 1 && (
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

            {[...scoresByCategory.entries()].map(([category, catScores]) => (
              <div key={category}>
                <h3 className="text-arena-slate-light mb-2 text-sm font-semibold tracking-wider uppercase">
                  {category}
                </h3>
                <div className="border-border overflow-x-auto rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-pale-grey">
                        <TableHead>Dimension</TableHead>
                        <TableHead className="w-20 text-center">Score</TableHead>
                        <TableHead className="w-28 text-center">Confidence</TableHead>
                        <TableHead className="w-24 text-center">Models</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {catScores.map((score) => (
                        <TableRow key={score.id}>
                          <TableCell>
                            <span className="text-arena-slate font-medium">
                              {score.dimension.name}
                            </span>
                            {!score.isApplicable && (
                              <Badge variant="outline" className="text-neutral-grey ml-2 text-xs">
                                N/A
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            {score.isApplicable ? (
                              <span className="text-arena-slate font-semibold">
                                {Number(score.value).toFixed(1)}
                              </span>
                            ) : (
                              <span className="text-neutral-grey">&mdash;</span>
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge
                              variant="outline"
                              className={confidenceColor(score.confidenceTag)}
                            >
                              {confidenceLabel(score.confidenceTag)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-arena-slate-light text-center text-sm">
                            {score.synthesis
                              ? `${score.synthesis.modelsSucceeded}/${score.synthesis.modelsSucceeded + score.synthesis.modelsFailed}`
                              : "—"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            ))}
          </div>
        )}

        {cycle && scores.length === 0 && (
          <div className="border-border bg-pale-grey mt-8 rounded-lg border p-8 text-center">
            <p className="text-arena-slate-light">
              No scores available for this tool in the current cycle.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
