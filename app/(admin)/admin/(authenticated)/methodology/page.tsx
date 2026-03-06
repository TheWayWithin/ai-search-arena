import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Methodology",
  robots: { index: false, follow: false },
};

export default function AdminMethodologyPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Methodology</h1>
      <p className="mt-2 text-gray-600">Manage methodology versions and scoring dimensions.</p>
    </div>
  );
}
