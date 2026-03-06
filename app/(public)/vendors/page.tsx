import type { Metadata } from "next";
import Link from "next/link";
import { getVendorsWithToolCounts } from "@/lib/db/vendors";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Vendor Directory",
  description:
    "Browse all vendors evaluated in AI Search Arena benchmarks. Independent rankings of AI search optimization tools by vendor.",
};

export default async function VendorsPage() {
  const vendors = await getVendorsWithToolCounts();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "AI Search Arena Vendor Directory",
    numberOfItems: vendors.length,
    itemListElement: vendors.map((v, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Organization",
        name: v.companyName,
        url: `https://aisearcharena.com/vendors/${v.slug}`,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <h1 className="text-3xl font-bold tracking-tight text-arena-slate">
          Vendor Directory
        </h1>
        <p className="mt-1 text-sm text-arena-slate-light">
          {vendors.length} vendors evaluated
        </p>

        {vendors.length === 0 ? (
          <div className="mt-8 rounded-lg border border-border bg-pale-grey p-8 text-center">
            <p className="text-lg text-arena-slate">
              No vendors have been added yet.
            </p>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {vendors.map((vendor) => (
              <Link
                key={vendor.id}
                href={`/vendors/${vendor.slug}`}
                className="rounded-lg border border-border bg-white p-6 transition-colors hover:border-arena-slate-light hover:bg-pale-grey"
              >
                <h2 className="text-lg font-semibold text-arena-slate">
                  {vendor.companyName}
                </h2>
                {vendor.description && (
                  <p className="mt-1 line-clamp-2 text-sm text-arena-slate-light">
                    {vendor.description}
                  </p>
                )}
                <p className="mt-3 text-sm text-arena-slate-light">
                  {vendor.toolCount} {vendor.toolCount === 1 ? "tool" : "tools"}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
