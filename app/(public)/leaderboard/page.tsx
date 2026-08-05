import type { Metadata } from "next";
import Link from "next/link";
import {
  getLeaderboardData,
  getMarketSegments,
  getPublishedCycles,
  getRankMovement,
} from "@/lib/db/leaderboard";
import { LeaderboardTable } from "@/components/leaderboard-table";
import { CycleSelector } from "@/components/cycle-selector";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Leaderboard",
  description:
    "Ranked AI search optimization tools by composite score. Independent monthly benchmarks using 6-model AI consensus methodology.",
  alternates: { canonical: "/leaderboard" },
};

type Props = {
  searchParams: Promise<{ segment?: string; cycle?: string }>;
};

export default async function LeaderboardPage({ searchParams }: Props) {
  const { segment, cycle: cycleParam } = await searchParams;

  const publishedCycles = await getPublishedCycles();

  // Pre-launch state: no published cycle yet
  if (publishedCycles.length === 0) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h1 className="text-arena-slate text-3xl font-bold tracking-tight">Leaderboard</h1>
        <div className="border-border bg-pale-grey mt-8 rounded-lg border p-8 text-center">
          <p className="text-arena-slate text-lg">
            The first benchmark cycle is currently in progress.
          </p>
          <p className="text-arena-slate-light mt-2 text-sm">
            Rankings will appear here once the inaugural evaluation cycle is published. Check back
            soon.
          </p>
          <Link
            href="/methodology"
            className="text-mastery-blue mt-4 inline-block text-sm hover:underline"
          >
            Learn about our scoring methodology &rarr;
          </Link>
        </div>
      </div>
    );
  }

  // Resolve active cycle from ?cycle= param or default to latest
  const activeCycle = cycleParam
    ? (publishedCycles.find((c) => c.cycleIdentifier === cycleParam) ?? publishedCycles[0])
    : publishedCycles[0];

  // Fetch segments and resolve the active segment ID
  const segments = await getMarketSegments();
  const activeSegment = segment ? (segments.find((s) => s.slug === segment) ?? null) : null;
  const segmentId = activeSegment?.id ?? null;

  const [compositeScores, trendMap] = await Promise.all([
    getLeaderboardData(activeCycle.id, segmentId),
    getRankMovement(activeCycle.id, segmentId),
  ]);

  // Serialize for client component (Decimal -> string)
  const serializedScores = compositeScores.map((cs) => {
    const trend = trendMap.get(cs.tool.id) ?? null;
    return {
      id: cs.id,
      rank: cs.rank,
      value: cs.value.toString(),
      confidenceTag: cs.confidenceTag,
      trend: trend
        ? {
            previousRank: trend.previousRank,
            rankDelta: trend.rankDelta,
            isNew: trend.isNew,
          }
        : null,
      tool: {
        slug: cs.tool.slug,
        name: cs.tool.name,
        vendor: cs.tool.vendor
          ? { companyName: cs.tool.vendor.companyName, slug: cs.tool.vendor.slug }
          : null,
        badges: cs.tool.badges.map((b) => ({
          tier: b.tier as "Gold" | "Silver" | "Bronze",
          label: b.label,
        })),
      },
    };
  });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: `AI Search Arena — ${activeCycle.displayName} Rankings`,
    description: `Independent benchmark rankings for ${compositeScores.length} AI search optimization tools.`,
    url: "https://aisearcharena.com/leaderboard",
    creator: {
      "@type": "Organization",
      name: "AI Search Arena",
    },
    datePublished: activeCycle.publishedAt?.toISOString(),
  };

  // Build segment link helper that preserves cycle param
  const segmentHref = (segSlug?: string) => {
    const params = new URLSearchParams();
    if (segSlug) params.set("segment", segSlug);
    if (cycleParam) params.set("cycle", cycleParam);
    const qs = params.toString();
    return `/leaderboard${qs ? `?${qs}` : ""}`;
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-baseline sm:justify-between">
          <div>
            <h1 className="text-arena-slate text-3xl font-bold tracking-tight">Leaderboard</h1>
            <p className="text-arena-slate-light mt-1 text-sm">
              {activeCycle.displayName} &middot; {compositeScores.length} tools evaluated
            </p>
          </div>
          <CycleSelector
            cycles={publishedCycles.map((c) => ({
              id: c.id,
              cycleIdentifier: c.cycleIdentifier,
              displayName: c.displayName,
            }))}
            currentCycleId={activeCycle.id}
          />
        </div>

        {/* Segment filter pills */}
        {segments.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href={segmentHref()}
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
                href={segmentHref(seg.slug)}
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

        <div className="mt-6">
          <LeaderboardTable
            compositeScores={serializedScores}
            emptyMessage={`No scores available${activeSegment ? ` for ${activeSegment.name}` : ""} in this cycle.`}
          />
        </div>
      </div>
    </>
  );
}
