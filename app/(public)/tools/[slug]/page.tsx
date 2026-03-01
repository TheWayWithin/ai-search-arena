import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
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

export default async function ToolDetailPage({ params }: Props) {
  const { slug } = await params;

  const tool = await prisma.tool.findUnique({
    where: { slug },
    include: {
      vendor: true,
      segmentMappings: { include: { segment: true } },
      trackMappings: { include: { track: true } },
    },
  });

  if (!tool) notFound();

  // Get latest published cycle
  const latestCycle = await prisma.benchmarkCycle.findFirst({
    where: { publishedAt: { not: null } },
    include: { methodologyVersion: true },
    orderBy: { publishedAt: "desc" },
  });

  const scoresQuery = latestCycle
    ? await prisma.score.findMany({
        where: { toolId: tool.id, cycleId: latestCycle.id },
        include: {
          dimension: true,
          synthesis: true,
        },
        orderBy: [
          { dimension: { category: "asc" } },
          { dimension: { name: "asc" } },
        ],
      })
    : [];

  const scores = scoresQuery;

  const compositeScore = latestCycle
    ? await prisma.compositeScore.findFirst({
        where: {
          toolId: tool.id,
          cycleId: latestCycle.id,
          segmentId: "overall",
        },
      })
    : null;

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
        <div className="flex items-start justify-between">
          <div>
            <Link
              href="/leaderboard"
              className="text-sm text-arena-slate-light hover:text-arena-slate"
            >
              &larr; Back to Leaderboard
            </Link>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-arena-slate">
              {tool.name}
            </h1>
            <p className="mt-1 text-sm text-arena-slate-light">
              by {tool.vendor?.companyName}
              {tool.websiteUrl && (
                <>
                  {" "}
                  &middot;{" "}
                  <a
                    href={tool.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-mastery-blue hover:underline"
                  >
                    Website
                  </a>
                </>
              )}
            </p>
            <p className="mt-2 max-w-2xl text-sm text-arena-slate-light">
              {tool.description}
            </p>
          </div>
          {compositeScore && (
            <Card className="min-w-[140px] text-center">
              <CardHeader className="pb-1 pt-4">
                <CardTitle className="text-sm font-normal text-arena-slate-light">
                  Composite Score
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-4">
                <div className="text-3xl font-bold text-arena-slate">
                  {Number(compositeScore.value).toFixed(1)}
                </div>
                <div className="text-xs text-arena-slate-light">
                  Rank #{compositeScore.rank}
                </div>
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

        {/* Pre-launch state */}
        {!latestCycle && (
          <div className="mt-8 rounded-lg border border-border bg-pale-grey p-8 text-center">
            <p className="text-arena-slate">
              Benchmark scores will be available after the first evaluation cycle
              is published.
            </p>
          </div>
        )}

        {/* Dimension Scores by Category */}
        {latestCycle && scores.length > 0 && (
          <div className="mt-8 space-y-6">
            <h2 className="text-xl font-semibold text-arena-slate">
              Dimension Scores — {latestCycle.displayName}
            </h2>

            {[...scoresByCategory.entries()].map(([category, catScores]) => (
              <div key={category}>
                <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-arena-slate-light">
                  {category}
                </h3>
                <div className="overflow-hidden rounded-lg border border-border">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-pale-grey">
                        <TableHead>Dimension</TableHead>
                        <TableHead className="w-20 text-center">
                          Score
                        </TableHead>
                        <TableHead className="w-28 text-center">
                          Confidence
                        </TableHead>
                        <TableHead className="w-24 text-center">
                          Models
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {catScores.map((score) => (
                        <TableRow key={score.id}>
                          <TableCell>
                            <span className="font-medium text-arena-slate">
                              {score.dimension.name}
                            </span>
                            {!score.isApplicable && (
                              <Badge
                                variant="outline"
                                className="ml-2 text-xs text-neutral-grey"
                              >
                                N/A
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            {score.isApplicable ? (
                              <span className="font-semibold text-arena-slate">
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
                          <TableCell className="text-center text-sm text-arena-slate-light">
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

        {latestCycle && scores.length === 0 && (
          <div className="mt-8 rounded-lg border border-border bg-pale-grey p-8 text-center">
            <p className="text-arena-slate-light">
              No scores available for this tool in the current cycle.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
