import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Disclosure",
  description:
    "Full disclosure of AI Search Arena's relationship with AI Search Mastery and how editorial independence is maintained.",
  openGraph: {
    title: "Disclosure | AI Search Arena",
    description:
      "Transparency about our ownership, methodology, and editorial independence safeguards.",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Disclosure & Editorial Independence",
  url: "https://aisearcharena.com/disclosure",
  description:
    "Full disclosure of AI Search Arena's relationship with AI Search Mastery and how editorial independence is maintained.",
  isPartOf: {
    "@type": "WebSite",
    name: "AI Search Arena",
    url: "https://aisearcharena.com",
  },
  about: {
    "@type": "Organization",
    name: "AI Search Arena",
    parentOrganization: {
      "@type": "Organization",
      name: "AI Search Mastery",
      url: "https://aisearchmastery.com",
    },
  },
};

export default function DisclosurePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-bold tracking-tight text-arena-slate sm:text-4xl">
        Disclosure & Editorial Independence
      </h1>

      <section className="mt-8 space-y-4 text-base leading-relaxed text-gray-700">
        <p>
          AI Search Arena is committed to transparency about its ownership, funding, and editorial
          processes. This page documents the structural safeguards that protect the integrity of our
          benchmark data.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="text-2xl font-semibold text-arena-slate">Ownership</h2>
        <p className="mt-4 text-gray-700">
          AI Search Arena is owned and operated by Jamie Watters as a property within the{" "}
          <a
            href="https://aisearchmastery.com"
            className="text-arena-slate underline underline-offset-2"
            rel="noopener noreferrer"
          >
            AI Search Mastery
          </a>{" "}
          ecosystem. AI Search Mastery also operates products that compete in the market that this
          benchmark evaluates.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="text-2xl font-semibold text-arena-slate">Conflict of Interest</h2>
        <p className="mt-4 text-gray-700">
          AI Search Mastery produces tools and content that may be evaluated by this benchmark. This
          creates a structural conflict of interest that we address through the following safeguards:
        </p>
        <ul className="mt-4 list-disc space-y-2 pl-6 text-gray-700">
          <li>
            AI Search Mastery products are scored using the identical methodology, prompts, and AI
            models as every other evaluated tool.
          </li>
          <li>
            Evaluation methodology is published, versioned, and locked before each cycle begins. It
            cannot be changed retroactively.
          </li>
          <li>
            Score synthesis uses median-based aggregation across 6 independent AI models —
            deterministic and reproducible.
          </li>
          <li>
            All benchmark cycles produce sealed audit packages with SHA-256 integrity hashes for
            independent verification.
          </li>
          <li>
            Every vendor — including AI Search Mastery products — receives the same 5 business day
            review window before publication.
          </li>
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="text-2xl font-semibold text-arena-slate">Editorial Firewall</h2>
        <div className="mt-4 space-y-3 text-gray-700">
          <p>
            The benchmark operates under an editorial firewall policy. Specifically:
          </p>
          <ul className="list-disc space-y-2 pl-6">
            <li>
              Benchmark content uses data-forward language and does not include cross-promotional
              language for AI Search Mastery products.
            </li>
            <li>
              Commercial decisions about AI Search Mastery products do not influence benchmark
              scoring or methodology design.
            </li>
            <li>
              Methodology changes are driven by evaluation quality, not commercial considerations.
            </li>
          </ul>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-2xl font-semibold text-arena-slate">Vendor Disclosure Status</h2>
        <p className="mt-4 text-gray-700">
          On every page where tool scores appear, we display whether the vendor has submitted a
          transparency disclosure. Disclosure is optional and does not affect scores. It indicates
          that the vendor has reviewed their profile information and confirmed its accuracy.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="text-2xl font-semibold text-arena-slate">Corrections Policy</h2>
        <p className="mt-4 text-gray-700">
          Post-publication corrections require dual approval — the person requesting the correction
          and the person approving it must be different. Original scores are preserved alongside
          corrections for full auditability.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="text-2xl font-semibold text-arena-slate">Contact</h2>
        <p className="mt-4 text-gray-700">
          Questions about this disclosure or the benchmark methodology can be directed to the
          benchmark operator via the contact information on the{" "}
          <a href="/about" className="text-arena-slate underline underline-offset-2">
            About page
          </a>
          .
        </p>
      </section>

      <footer className="mt-16 border-t border-gray-200 pt-6 text-sm text-neutral-grey">
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
