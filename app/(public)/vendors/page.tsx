import type { Metadata } from "next";
import Link from "next/link";
import { getVendorsWithToolCounts } from "@/lib/db/vendors";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Vendor Directory",
  description:
    "Browse all vendors evaluated in AI Search Arena benchmarks. Independent rankings of AI search optimization tools by vendor.",
  alternates: { canonical: "/vendors" },
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
        <h1 className="text-arena-slate text-3xl font-bold tracking-tight">Vendor Directory</h1>
        <p className="text-arena-slate-light mt-1 text-sm">{vendors.length} vendors evaluated</p>

        {vendors.length === 0 ? (
          <div className="border-border bg-pale-grey mt-8 rounded-lg border p-8 text-center">
            <p className="text-arena-slate text-lg">No vendors have been added yet.</p>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {vendors.map((vendor) => (
              <Link
                key={vendor.id}
                href={`/vendors/${vendor.slug}`}
                className="border-border hover:border-arena-slate-light hover:bg-pale-grey rounded-lg border bg-white p-6 transition-colors"
              >
                <h2 className="text-arena-slate text-lg font-semibold">{vendor.companyName}</h2>
                {vendor.description && (
                  <p className="text-arena-slate-light mt-1 line-clamp-2 text-sm">
                    {vendor.description}
                  </p>
                )}
                <p className="text-arena-slate-light mt-3 text-sm">
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
