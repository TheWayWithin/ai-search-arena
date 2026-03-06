import Link from "next/link";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { logoutAction } from "@/app/actions/auth";

const navLinks = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/cycles", label: "Cycles" },
  { href: "/admin/tools", label: "Tools" },
  { href: "/admin/models", label: "Models" },
  { href: "/admin/vendors", label: "Vendors" },
  { href: "/admin/methodology", label: "Methodology" },
];

export default async function AuthenticatedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="border-b bg-white">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <span className="text-sm font-bold text-gray-900">
              Arena Admin
            </span>
            <div className="flex items-center gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          <form action={logoutAction}>
            <button
              type="submit"
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Sign out
            </button>
          </form>
        </div>
      </nav>
      <main className="mx-auto max-w-7xl px-4 py-8">{children}</main>
    </div>
  );
}
