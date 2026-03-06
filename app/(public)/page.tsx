import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { TierBadge } from "@/components/tier-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NewsletterSignup } from "@/components/newsletter-signup";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "AI Search Arena — Independent AI Search Tool Benchmarks",
  description:
    "Monthly independent benchmarks evaluating 27+ AI search optimization (GEO/AEO) tools against 50+ standardized metrics using 6-model AI consensus methodology.",
};

function confidenceColor(tag: string) {
  switch (tag) {
    case "High":
      return "bg-confidence-green/10 text-confidence-green border-confidence-green/20";
    case "Medium":
      return "bg-caution-amber/10 text-caution-amber border-caution-amber/20";
    default:
      return "bg-neutral-grey/10 text-neutral-grey border-neutral-grey/20";
  }
}

export default async function HomePage() {
  // Check if there is a published cycle
  const latestCycle = await prisma.benchmarkCycle.findFirst({
    where: { publishedAt: { not: null } },
    include: { methodologyVersion: true },
    orderBy: { publishedAt: "desc" },
  });

  // Published state: show cycle highlights + top 5
  if (latestCycle) {
    const topTools = await prisma.compositeScore.findMany({
      where: { cycleId: latestCycle.id, segmentId: null },
      include: {
        tool: {
          include: {
            vendor: true,
            badges: { where: { cycleId: latestCycle.id } },
          },
        },
      },
      orderBy: { rank: "asc" },
      take: 5,
    });

    const totalTools = await prisma.compositeScore.count({
      where: { cycleId: latestCycle.id, segmentId: null },
    });

    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "AI Search Arena",
              url: "https://aisearcharena.com",
              description:
                "Independent monthly benchmarks for AI search optimization tools.",
            }),
          }}
        />
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          {/* Hero */}
          <section className="py-16 text-center">
            <h1 className="text-4xl font-bold tracking-tight text-arena-slate sm:text-5xl">
              AI Search Arena
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-lg text-arena-slate-light">
              Independent monthly benchmarks for AI search optimization tools.
              {totalTools} tools evaluated against 50+ standardized metrics.
            </p>
            <div className="mt-6 flex items-center justify-center gap-4">
              <Link
                href="/leaderboard"
                className="rounded-md bg-arena-slate px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-arena-slate/90"
              >
                View Full Rankings
              </Link>
              <Link
                href="/methodology"
                className="rounded-md border border-arena-slate-pale px-6 py-2.5 text-sm font-medium text-arena-slate transition-colors hover:bg-pale-grey"
              >
                Our Methodology
              </Link>
            </div>
          </section>

          {/* Latest Cycle Summary */}
          <section className="pb-16">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
              <h2 className="text-xl font-semibold text-arena-slate">
                {latestCycle.displayName} — Top 5
              </h2>
              <span className="text-sm text-arena-slate-light">
                Published{" "}
                {latestCycle.publishedAt?.toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>

            <div className="mt-4 grid gap-3">
              {topTools.map((cs) => (
                <Link
                  key={cs.id}
                  href={`/tools/${cs.tool.slug}`}
                  className="group flex items-center rounded-lg border border-border p-4 transition-colors hover:bg-pale-grey"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-arena-slate text-sm font-bold text-white">
                    {cs.rank}
                  </span>
                  <div className="ml-4 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="font-medium text-arena-slate group-hover:text-mastery-blue">
                        {cs.tool.name}
                      </span>
                      {cs.tool.badges
                        .filter((b) => b.badgeType.startsWith("Overall"))
                        .map((b) => (
                          <TierBadge
                            key={b.id}
                            tier={b.tier as "Gold" | "Silver" | "Bronze"}
                            label={b.label}
                          />
                        ))}
                    </div>
                    <span className="text-sm text-arena-slate-light">
                      by {cs.tool.vendor?.companyName}
                    </span>
                  </div>
                  <div className="ml-3 flex shrink-0 items-center gap-2">
                    <Badge
                      variant="outline"
                      className={`hidden sm:inline-flex ${confidenceColor(cs.confidenceTag)}`}
                    >
                      {cs.confidenceTag === "InsufficientData"
                        ? "Insufficient"
                        : cs.confidenceTag}
                    </Badge>
                    <span className="text-xl font-bold text-arena-slate">
                      {Number(cs.value).toFixed(1)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>

            <div className="mt-4 text-center">
              <Link
                href="/leaderboard"
                className="text-sm text-mastery-blue hover:underline"
              >
                View all {totalTools} tools &rarr;
              </Link>
            </div>
          </section>
        </div>
      </>
    );
  }

  // Pre-launch state: no published cycle
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "AI Search Arena",
            url: "https://aisearcharena.com",
            description:
              "Independent monthly benchmarks for AI search optimization tools.",
          }),
        }}
      />
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <section className="py-20 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-arena-slate sm:text-5xl">
            AI Search Arena
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-arena-slate-light">
            Independent monthly benchmarks evaluating 27+ AI search optimization
            tools against 50+ standardized metrics using 6-model AI consensus
            methodology.
          </p>
          <p className="mt-2 text-sm text-neutral-grey">
            First benchmark cycle: March 2026
          </p>

          <NewsletterSignup variant="hero" />

          <div className="mx-auto mt-12 grid max-w-3xl gap-4 sm:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg text-arena-slate">
                  50+ Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-arena-slate-light">
                  Standardized scoring dimensions across AI visibility, content
                  optimization, technical implementation, and more.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg text-arena-slate">
                  6-Model Consensus
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-arena-slate-light">
                  Each tool evaluated by 6 independent AI models. Median-based
                  synthesis eliminates individual model bias.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg text-arena-slate">
                  Full Transparency
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-arena-slate-light">
                  Complete methodology published. SHA-256 audit packages.
                  Vendor review window. Evidence artifacts.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="mt-12 flex items-center justify-center gap-4">
            <Link
              href="/methodology"
              className="rounded-md bg-arena-slate px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-arena-slate/90"
            >
              View Methodology
            </Link>
            <Link
              href="/disclosure"
              className="rounded-md border border-arena-slate-pale px-6 py-2.5 text-sm font-medium text-arena-slate transition-colors hover:bg-pale-grey"
            >
              Read Our Disclosure
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
