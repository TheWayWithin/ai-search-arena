import type { Metadata } from "next";
import Link from "next/link";
import {
  getLatestPublishedCycle,
  getLeaderboardData,
  getMarketSegments,
} from "@/lib/db/leaderboard";
import { LeaderboardTable } from "@/components/leaderboard-table";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Leaderboard",
  description:
    "Ranked AI search optimization tools by composite score. Independent monthly benchmarks using 6-model AI consensus methodology.",
};

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

  // Serialize for client component (Decimal -> string)
  const serializedScores = compositeScores.map((cs) => ({
    id: cs.id,
    rank: cs.rank,
    value: cs.value.toString(),
    confidenceTag: cs.confidenceTag,
    tool: {
      slug: cs.tool.slug,
      name: cs.tool.name,
      vendor: cs.tool.vendor
        ? { companyName: cs.tool.vendor.companyName }
        : null,
    },
  }));

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
