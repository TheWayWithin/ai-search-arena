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
  alternates: { canonical: "/" },
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
              description: "Independent monthly benchmarks for AI search optimization tools.",
            }),
          }}
        />
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          {/* Hero */}
          <section className="py-16 text-center">
            <h1 className="text-arena-slate text-4xl font-bold tracking-tight sm:text-5xl">
              AI Search Arena
            </h1>
            <p className="text-arena-slate-light mx-auto mt-4 max-w-xl text-lg">
              Independent monthly benchmarks for AI search optimization tools.
              {totalTools} tools evaluated against 50+ standardized metrics.
            </p>
            <div className="mt-6 flex items-center justify-center gap-4">
              <Link
                href="/leaderboard"
                className="bg-arena-slate hover:bg-arena-slate/90 rounded-md px-6 py-2.5 text-sm font-medium text-white transition-colors"
              >
                View Full Rankings
              </Link>
              <Link
                href="/methodology"
                className="border-arena-slate-pale text-arena-slate hover:bg-pale-grey rounded-md border px-6 py-2.5 text-sm font-medium transition-colors"
              >
                Our Methodology
              </Link>
            </div>
          </section>

          {/* Latest Cycle Summary */}
          <section className="pb-16">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
              <h2 className="text-arena-slate text-xl font-semibold">
                {latestCycle.displayName} — Top 5
              </h2>
              <span className="text-arena-slate-light text-sm">
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
                  className="group border-border hover:bg-pale-grey flex items-center rounded-lg border p-4 transition-colors"
                >
                  <span className="bg-arena-slate flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white">
                    {cs.rank}
                  </span>
                  <div className="ml-4 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-arena-slate group-hover:text-mastery-blue font-medium">
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
                    <span className="text-arena-slate-light text-sm">
                      by {cs.tool.vendor?.companyName}
                    </span>
                  </div>
                  <div className="ml-3 flex shrink-0 items-center gap-2">
                    <Badge
                      variant="outline"
                      className={`hidden sm:inline-flex ${confidenceColor(cs.confidenceTag)}`}
                    >
                      {cs.confidenceTag === "InsufficientData" ? "Insufficient" : cs.confidenceTag}
                    </Badge>
                    <span className="text-arena-slate text-xl font-bold">
                      {Number(cs.value).toFixed(1)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>

            <div className="mt-4 text-center">
              <Link href="/leaderboard" className="text-mastery-blue text-sm hover:underline">
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
            description: "Independent monthly benchmarks for AI search optimization tools.",
          }),
        }}
      />
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <section className="py-20 text-center">
          <h1 className="text-arena-slate text-4xl font-bold tracking-tight sm:text-5xl">
            AI Search Arena
          </h1>
          <p className="text-arena-slate-light mx-auto mt-4 max-w-xl text-lg">
            Independent monthly benchmarks evaluating 27+ AI search optimization tools against 50+
            standardized metrics using 6-model AI consensus methodology.
          </p>
          <p className="text-neutral-grey mt-2 text-sm">First benchmark cycle: March 2026</p>

          <NewsletterSignup variant="hero" />

          <div className="mx-auto mt-12 grid max-w-3xl gap-4 sm:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-arena-slate text-lg">50+ Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-arena-slate-light text-sm">
                  Standardized scoring dimensions across AI visibility, content optimization,
                  technical implementation, and more.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-arena-slate text-lg">6-Model Consensus</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-arena-slate-light text-sm">
                  Each tool evaluated by 6 independent AI models. Median-based synthesis eliminates
                  individual model bias.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-arena-slate text-lg">Full Transparency</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-arena-slate-light text-sm">
                  Complete methodology published. SHA-256 audit packages. Vendor review window.
                  Evidence artifacts.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="mt-12 flex items-center justify-center gap-4">
            <Link
              href="/methodology"
              className="bg-arena-slate hover:bg-arena-slate/90 rounded-md px-6 py-2.5 text-sm font-medium text-white transition-colors"
            >
              View Methodology
            </Link>
            <Link
              href="/disclosure"
              className="border-arena-slate-pale text-arena-slate hover:bg-pale-grey rounded-md border px-6 py-2.5 text-sm font-medium transition-colors"
            >
              Read Our Disclosure
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
