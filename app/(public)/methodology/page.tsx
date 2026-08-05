import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Methodology",
  description:
    "Complete scoring methodology for AI Search Arena benchmarks. 50+ dimensions, 6-model consensus, weighted composite scores, and confidence tags.",
  alternates: { canonical: "/methodology" },
};

export default async function MethodologyPage() {
  // Get the latest methodology version with dimensions
  const methodology = await prisma.methodologyVersion.findFirst({
    include: {
      scoringDimensions: {
        where: { isActive: true },
        orderBy: [{ category: "asc" }, { name: "asc" }],
      },
    },
    orderBy: { effectiveDate: "desc" },
  });

  // Group dimensions by category
  const dimensionsByCategory = new Map<
    string,
    NonNullable<typeof methodology>["scoringDimensions"]
  >();
  if (methodology) {
    for (const dim of methodology.scoringDimensions) {
      const cat = dim.category ?? "Other";
      const group = dimensionsByCategory.get(cat) ?? [];
      group.push(dim);
      dimensionsByCategory.set(cat, group);
    }
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "AI Search Arena Methodology",
    description:
      "Complete scoring methodology and dimension definitions for AI search tool benchmarks.",
    url: "https://aisearcharena.com/methodology",
    isPartOf: {
      "@type": "WebSite",
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
        <h1 className="text-arena-slate text-3xl font-bold tracking-tight">Methodology</h1>
        <p className="text-arena-slate-light mt-2 max-w-2xl">
          Our benchmark methodology is designed for rigor, transparency, and reproducibility. Every
          tool is evaluated identically using the same prompts, the same AI models, and the same
          scoring rubric.
        </p>

        {methodology && (
          <p className="text-neutral-grey mt-1 text-sm">
            Version {methodology.versionNumber} &middot; Effective{" "}
            {methodology.effectiveDate.toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        )}

        {/* Process Overview */}
        <section className="mt-10">
          <h2 className="text-arena-slate text-xl font-semibold">Evaluation Process</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                step: "1",
                title: "Standardized Prompts",
                desc: "Each tool is evaluated using identical prompts per scoring dimension. Prompts are version-controlled and locked before each cycle begins.",
              },
              {
                step: "2",
                title: "6-Model Consensus",
                desc: "Six independent AI models from different providers evaluate each tool. This eliminates single-model bias and produces robust scores.",
              },
              {
                step: "3",
                title: "Median Synthesis",
                desc: "Raw model scores are aggregated using the median (not mean) to reduce outlier influence. Minimum 4/6 models required for valid scores.",
              },
              {
                step: "4",
                title: "Weighted Composite",
                desc: "Dimension scores are combined into a composite score using category weights. N/A dimensions are excluded with weight renormalization.",
              },
            ].map((item) => (
              <Card key={item.step}>
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <span className="bg-arena-slate flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white">
                      {item.step}
                    </span>
                    <CardTitle className="text-arena-slate text-sm">{item.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-arena-slate-light text-sm">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Confidence Tags */}
        <section className="mt-10">
          <h2 className="text-arena-slate text-xl font-semibold">Confidence Tags</h2>
          <p className="text-arena-slate-light mt-2 text-sm">
            Each score includes a confidence tag based on inter-model agreement (standard deviation
            of model scores).
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                tag: "High",
                color: "text-confidence-green border-confidence-green/20 bg-confidence-green/10",
                desc: "Strong agreement (stdDev \u2264 0.5). Models closely agree on the score.",
              },
              {
                tag: "Medium",
                color: "text-caution-amber border-caution-amber/20 bg-caution-amber/10",
                desc: "Moderate agreement (stdDev 0.5\u20131.5). Some variation between model assessments.",
              },
              {
                tag: "Low",
                color: "text-insufficient-red border-insufficient-red/20 bg-insufficient-red/10",
                desc: "Poor agreement (stdDev > 1.5). Models significantly disagree.",
              },
              {
                tag: "Insufficient Data",
                color: "text-neutral-grey border-neutral-grey/20 bg-neutral-grey/10",
                desc: "Fewer than 4 of 6 models returned valid scores. Flagged for review.",
              },
            ].map((item) => (
              <div key={item.tag} className="border-border rounded-lg border p-4">
                <Badge variant="outline" className={item.color}>
                  {item.tag}
                </Badge>
                <p className="text-arena-slate-light mt-2 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Scoring Dimensions */}
        {methodology && dimensionsByCategory.size > 0 && (
          <section className="mt-10">
            <h2 className="text-arena-slate text-xl font-semibold">
              Scoring Dimensions ({methodology.scoringDimensions.length})
            </h2>
            <p className="text-arena-slate-light mt-2 text-sm">
              Each tool is scored on the following dimensions. Weights determine the contribution to
              the composite score. Within each category, weights are renormalized if any dimension
              is marked N/A for a specific tool.
            </p>

            <div className="mt-6 space-y-6">
              {[...dimensionsByCategory.entries()].map(([category, dimensions]) => {
                const categoryWeight = dimensions.reduce((sum, d) => sum + Number(d.weight), 0);
                return (
                  <div key={category}>
                    <div className="flex items-baseline justify-between">
                      <h3 className="text-arena-slate-light text-sm font-semibold tracking-wider uppercase">
                        {category}
                      </h3>
                      <span className="text-neutral-grey text-xs">
                        Category weight: {(categoryWeight * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="border-border mt-2 overflow-hidden rounded-lg border">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-pale-grey">
                            <TableHead>Dimension</TableHead>
                            <TableHead className="w-64">Description</TableHead>
                            <TableHead className="w-20 text-center">Weight</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {dimensions.map((dim) => (
                            <TableRow key={dim.id}>
                              <TableCell className="text-arena-slate font-medium">
                                {dim.name}
                              </TableCell>
                              <TableCell className="text-arena-slate-light text-sm">
                                {dim.description}
                              </TableCell>
                              <TableCell className="text-arena-slate text-center text-sm">
                                {(Number(dim.weight) * 100).toFixed(1)}%
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Composite Score Calculation */}
        <section className="mt-10 pb-8">
          <h2 className="text-arena-slate text-xl font-semibold">Composite Score Calculation</h2>
          <div className="border-border bg-pale-grey mt-4 rounded-lg border p-6">
            <p className="text-arena-slate text-sm">
              The composite score is a weighted average of all applicable dimension scores:
            </p>
            <div className="text-arena-slate mt-4 rounded bg-white p-4 font-mono text-sm">
              Composite = &Sigma; (dimension_score &times; weight / total_applicable_weight)
            </div>
            <ul className="text-arena-slate-light mt-4 space-y-2 text-sm">
              <li>
                <strong>Scale:</strong> 0.0 to 10.0, rounded to one decimal place (round half up)
              </li>
              <li>
                <strong>N/A handling:</strong> If a dimension is not applicable to a tool, it is
                excluded and remaining weights are renormalized to sum to 1.0
              </li>
              <li>
                <strong>Ranking:</strong> Dense ranking — tied composite scores receive the same
                rank
              </li>
              <li>
                <strong>Minimum models:</strong> At least 4 of 6 AI models must return valid scores
                for a dimension to be considered sufficient
              </li>
            </ul>
          </div>
        </section>
      </div>
    </>
  );
}
