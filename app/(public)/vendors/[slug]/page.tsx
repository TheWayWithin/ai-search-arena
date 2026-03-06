import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { TierBadge } from "@/components/tier-badge";
import { getVendorWithScores } from "@/lib/db/vendors";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const result = await getVendorWithScores(slug);

  if (!result) return { title: "Vendor Not Found" };

  return {
    title: `${result.vendor.companyName} — Vendor Profile`,
    description: result.vendor.description
      ? `${result.vendor.companyName}: ${result.vendor.description}`
      : `View ${result.vendor.companyName}'s AI search tools and benchmark scores on AI Search Arena.`,
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

export default async function VendorProfilePage({ params }: Props) {
  const { slug } = await params;
  const result = await getVendorWithScores(slug);

  if (!result) notFound();

  const { vendor, tools, cycle } = result;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: vendor.companyName,
    description: vendor.description,
    url: vendor.websiteUrl,
  };

  const scoredTools = tools.filter((t) => t.compositeScore);
  const unscoredTools = tools.filter((t) => !t.compositeScore);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <Link
          href="/vendors"
          className="text-sm text-arena-slate-light hover:text-arena-slate"
        >
          &larr; Back to Vendors
        </Link>

        <div className="mt-4">
          <h1 className="text-3xl font-bold tracking-tight text-arena-slate">
            {vendor.companyName}
          </h1>
          {vendor.description && (
            <p className="mt-2 max-w-2xl text-sm text-arena-slate-light">
              {vendor.description}
            </p>
          )}
          {vendor.websiteUrl && (
            <a
              href={vendor.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-block text-sm text-mastery-blue hover:underline"
            >
              Visit website &rarr;
            </a>
          )}
        </div>

        {/* Tools with scores */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-arena-slate">
            Tools
            {cycle && (
              <span className="ml-2 text-sm font-normal text-arena-slate-light">
                {cycle.displayName}
              </span>
            )}
          </h2>

          {tools.length === 0 ? (
            <div className="mt-4 rounded-lg border border-border bg-pale-grey p-8 text-center">
              <p className="text-arena-slate-light">
                No tools found for this vendor.
              </p>
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {/* Scored tools first, sorted by rank */}
              {[...scoredTools]
                .sort(
                  (a, b) =>
                    (a.compositeScore?.rank ?? 999) -
                    (b.compositeScore?.rank ?? 999)
                )
                .map((tool) => (
                  <Link
                    key={tool.id}
                    href={`/tools/${tool.slug}`}
                    className="flex items-center justify-between rounded-lg border border-border bg-white p-4 transition-colors hover:border-arena-slate-light hover:bg-pale-grey"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-arena-slate">
                          {tool.name}
                        </span>
                        {tool.badges.map((b) => (
                          <TierBadge
                            key={b.id}
                            tier={b.tier as "Gold" | "Silver" | "Bronze"}
                            label={b.label}
                          />
                        ))}
                      </div>
                      <p className="mt-0.5 text-sm text-arena-slate-light">
                        {tool.description}
                      </p>
                    </div>
                    {tool.compositeScore && (
                      <div className="ml-4 flex shrink-0 items-center gap-3">
                        <div className="text-right">
                          <div className="text-lg font-bold text-arena-slate">
                            {Number(tool.compositeScore.value).toFixed(1)}
                            <span className="text-sm font-normal text-arena-slate-light">
                              /10
                            </span>
                          </div>
                          <div className="text-xs text-arena-slate-light">
                            Rank #{tool.compositeScore.rank}
                          </div>
                        </div>
                        <Badge
                          variant="outline"
                          className={confidenceColor(
                            tool.compositeScore.confidenceTag
                          )}
                        >
                          {confidenceLabel(tool.compositeScore.confidenceTag)}
                        </Badge>
                      </div>
                    )}
                  </Link>
                ))}

              {/* Unscored tools */}
              {unscoredTools.map((tool) => (
                <Link
                  key={tool.id}
                  href={`/tools/${tool.slug}`}
                  className="flex items-center justify-between rounded-lg border border-border bg-white p-4 transition-colors hover:border-arena-slate-light hover:bg-pale-grey"
                >
                  <div>
                    <span className="font-semibold text-arena-slate">
                      {tool.name}
                    </span>
                    <p className="mt-0.5 text-sm text-arena-slate-light">
                      {tool.description}
                    </p>
                  </div>
                  <span className="ml-4 shrink-0 text-sm text-arena-slate-light">
                    Not yet evaluated
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
