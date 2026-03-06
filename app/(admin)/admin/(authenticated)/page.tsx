import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  robots: { index: false, follow: false },
};

export default function AdminDashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      <p className="mt-2 text-gray-600">
        Welcome to the AI Search Arena admin panel.
      </p>
    </div>
  );
}
