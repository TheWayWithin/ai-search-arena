import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Models",
  robots: { index: false, follow: false },
};

export default function AdminModelsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">AI Models</h1>
      <p className="mt-2 text-gray-600">Manage evaluation models.</p>
    </div>
  );
}
