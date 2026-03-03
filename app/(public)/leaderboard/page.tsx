import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  getLatestPublishedCycle,
  getLeaderboardData,
  getMarketSegments,
} from "@/lib/db/leaderboard";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Leaderboard",
  description:
    "Ranked AI search optimization tools by composite score. Independent monthly benchmarks using 6-model AI consensus methodology.",
};

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

type Props = {
  searchParams: Promise<{ segment?: string }>;
};

export default async function LeaderboardPage({ searchParams }: Props) {
  const { segment } = await searchParams;

  const latestCycle = await getLatestPublishedCycle();

  // Pre-launch state: no published cycle yet
  if (!latestCycle) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h1 className="text-3xl font-bold tracking-tight text-arena-slate">
          Leaderboard
        </h1>
        <div className="mt-8 rounded-lg border border-border bg-pale-grey p-8 text-center">
          <p className="text-lg text-arena-slate">
            The first benchmark cycle is currently in progress.
          </p>
          <p className="mt-2 text-sm text-arena-slate-light">
            Rankings will appear here once the inaugural evaluation cycle is
            published. Check back soon.
          </p>
          <Link
            href="/methodology"
            className="mt-4 inline-block text-sm text-mastery-blue hover:underline"
          >
            Learn about our scoring methodology &rarr;
          </Link>
        </div>
      </div>
    );
  }

  // Fetch segments and resolve the active segment ID
  const segments = await getMarketSegments();
  const activeSegment = segment
    ? segments.find((s) => s.slug === segment) ?? null
    : null;
  const segmentId = activeSegment?.id ?? null;

  const compositeScores = await getLeaderboardData(latestCycle.id, segmentId);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: `AI Search Arena — ${latestCycle.displayName} Rankings`,
    description: `Independent benchmark rankings for ${compositeScores.length} AI search optimization tools.`,
    url: "https://aisearcharena.com/leaderboard",
    creator: {
      "@type": "Organization",
      name: "AI Search Arena",
    },
    datePublished: latestCycle.publishedAt?.toISOString(),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="flex items-baseline justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-arena-slate">
              Leaderboard
            </h1>
            <p className="mt-1 text-sm text-arena-slate-light">
              {latestCycle.displayName} &middot;{" "}
              {compositeScores.length} tools evaluated &middot; Methodology v
              {latestCycle.methodologyVersion?.versionNumber}
            </p>
          </div>
        </div>

        {/* Segment filter pills */}
        {segments.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href="/leaderboard"
              className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium transition-colors ${
                !activeSegment
                  ? "border-arena-slate bg-arena-slate text-white"
                  : "border-border text-arena-slate-light hover:bg-pale-grey hover:text-arena-slate"
              }`}
            >
              All
            </Link>
            {segments.map((seg) => (
              <Link
                key={seg.id}
                href={`/leaderboard?segment=${seg.slug}`}
                className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium transition-colors ${
                  activeSegment?.id === seg.id
                    ? "border-arena-slate bg-arena-slate text-white"
                    : "border-border text-arena-slate-light hover:bg-pale-grey hover:text-arena-slate"
                }`}
              >
                {seg.name}
              </Link>
            ))}
          </div>
        )}

        <div className="mt-6 overflow-hidden rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow className="bg-pale-grey">
                <TableHead className="w-16 text-center">Rank</TableHead>
                <TableHead>Tool</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead className="w-28 text-center">Score</TableHead>
                <TableHead className="w-28 text-center">Confidence</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {compositeScores.map((cs) => (
                <TableRow key={cs.id}>
                  <TableCell className="text-center font-semibold text-arena-slate">
                    {cs.rank}
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/tools/${cs.tool.slug}`}
                      className="font-medium text-arena-slate hover:text-mastery-blue hover:underline"
                    >
                      {cs.tool.name}
                    </Link>
                  </TableCell>
                  <TableCell className="text-arena-slate-light">
                    {cs.tool.vendor?.companyName}
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="text-lg font-bold text-arena-slate">
                      {Number(cs.value).toFixed(1)}
                    </span>
                    <span className="text-sm text-arena-slate-light">/10</span>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant="outline"
                      className={confidenceColor(cs.confidenceTag)}
                    >
                      {confidenceLabel(cs.confidenceTag)}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {compositeScores.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="py-8 text-center text-arena-slate-light"
                  >
                    No scores available{activeSegment ? ` for ${activeSegment.name}` : ""} in this cycle.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  );
}
