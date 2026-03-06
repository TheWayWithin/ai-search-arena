import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tools",
  robots: { index: false, follow: false },
};

export default function AdminToolsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Tools</h1>
      <p className="mt-2 text-gray-600">Manage enrolled tools.</p>
    </div>
  );
}
