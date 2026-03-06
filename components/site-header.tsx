"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/cycles", label: "Cycles" },
  { href: "/vendors", label: "Vendors" },
  { href: "/methodology", label: "Methodology" },
  { href: "/about", label: "About" },
  { href: "/disclosure", label: "Disclosure" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="border-border border-b bg-white">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-arena-slate text-lg font-bold tracking-tight">AI Search Arena</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 text-sm md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`hover:text-arena-slate transition-colors ${
                pathname.startsWith(link.href)
                  ? "text-arena-slate font-medium"
                  : "text-arena-slate-light"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Mobile hamburger button */}
        <button
          onClick={() => setOpen(!open)}
          className="text-arena-slate-light hover:bg-pale-grey hover:text-arena-slate flex h-9 w-9 items-center justify-center rounded-md transition-colors md:hidden"
          aria-label="Toggle navigation"
          aria-expanded={open}
        >
          {open ? (
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          ) : (
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile nav dropdown */}
      {open && (
        <nav className="border-border border-t bg-white px-4 pt-2 pb-4 md:hidden">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className={`hover:bg-pale-grey block rounded-md px-3 py-2 text-sm transition-colors ${
                pathname.startsWith(link.href)
                  ? "text-arena-slate font-medium"
                  : "text-arena-slate-light hover:text-arena-slate"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
