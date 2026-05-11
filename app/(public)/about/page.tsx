import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description:
    "AI Search Arena is an independent monthly benchmark evaluating AI search optimization tools with transparent methodology and rigorous scoring.",
  openGraph: {
    title: "About AI Search Arena",
    description:
      "Independent monthly benchmarks for AI search optimization tools. Built on transparency, rigor, and practitioner-first values.",
  },
  alternates: { canonical: "/about" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "AI Search Arena",
  url: "https://aisearcharena.com",
  description:
    "Independent monthly benchmark evaluating AI search optimization (GEO/AEO) tools against 50+ standardized metrics using 6-model AI consensus methodology.",
  founder: {
    "@type": "Person",
    name: "Jamie Watters",
  },
  parentOrganization: {
    "@type": "Organization",
    name: "AI Search Mastery",
    url: "https://aisearchmastery.com",
    sameAs: [
      "https://aisearcharena.com",
      "https://llmtxtmastery.com",
      "https://aimpactscanner.com",
    ],
  },
};

export default function AboutPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="text-arena-slate text-3xl font-bold tracking-tight sm:text-4xl">
          About AI Search Arena
        </h1>

        <section className="mt-8 space-y-4 text-base leading-relaxed text-gray-700">
          <p>
            AI Search Arena is an independent monthly benchmark that evaluates AI search
            optimization (GEO/AEO) tools against 50+ standardized metrics. Every tool is scored
            using the same methodology, by the same AI models, against the same criteria.
          </p>
          <p>
            The benchmark exists because the GEO/AEO tool market has grown to 27+ tools across 7
            market segments with no independent, structured comparison. Practitioners choose tools
            based on vendor marketing, peer anecdotes, and limited trials — leading to wasted
            budgets, poor fits, and high switching costs.
          </p>
        </section>

        <section className="mt-12">
          <h2 className="text-arena-slate text-2xl font-semibold">How It Works</h2>
          <div className="mt-6 space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900">6-Model AI Consensus</h3>
              <p className="mt-1 text-gray-700">
                Every tool is evaluated by 6 independent AI models. Scores are synthesized using
                median-based aggregation. A minimum of 4 out of 6 models must succeed for a score to
                be published.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">50+ Scoring Dimensions</h3>
              <p className="mt-1 text-gray-700">
                Tools are measured across categories including AI Search Visibility, Content
                Optimization, Technical Implementation, Analytics, User Experience, and Market
                Value. Every dimension weight is published.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Transparent Methodology</h3>
              <p className="mt-1 text-gray-700">
                The complete scoring methodology, dimension weights, and confidence definitions are
                published. Methodology versions are locked per cycle and cannot be changed
                retroactively.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Vendor Review Window</h3>
              <p className="mt-1 text-gray-700">
                Before publication, every vendor receives a 5 business day window to review their
                scores and submit factual corrections with evidence. Corrections are reviewed and
                documented.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Audit Packages</h3>
              <p className="mt-1 text-gray-700">
                Every benchmark cycle produces a sealed audit package containing all evaluation
                data, methodology snapshots, and scoring records with SHA-256 integrity
                verification.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-arena-slate text-2xl font-semibold">Operator</h2>
          <p className="mt-4 text-gray-700">
            AI Search Arena is operated by Jamie Watters as part of the{" "}
            <a
              href="https://aisearchmastery.com"
              className="text-arena-slate underline underline-offset-2"
              rel="noopener noreferrer"
            >
              AI Search Mastery
            </a>{" "}
            ecosystem. For full disclosure of this relationship and how editorial independence is
            maintained, see the{" "}
            <a href="/disclosure" className="text-arena-slate underline underline-offset-2">
              Disclosure page
            </a>
            .
          </p>
        </section>

        <footer className="text-neutral-grey mt-16 border-t border-gray-200 pt-6 text-sm">
          Part of{" "}
          <a
            href="https://aisearchmastery.com"
            className="underline underline-offset-2"
            rel="noopener noreferrer"
          >
            AI Search Mastery
          </a>
        </footer>
      </main>
    </>
  );
}
