import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Vendors",
  robots: { index: false, follow: false },
};

export default function AdminVendorsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Vendors</h1>
      <p className="mt-2 text-gray-600">Manage vendor profiles.</p>
    </div>
  );
}
