import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cycles",
  robots: { index: false, follow: false },
};

export default function AdminCyclesPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Benchmark Cycles</h1>
      <p className="mt-2 text-gray-600">Manage benchmark cycles.</p>
    </div>
  );
}
