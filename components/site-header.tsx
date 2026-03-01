import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="border-b border-border bg-white">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-lg font-bold tracking-tight text-arena-slate">
            AI Search Arena
          </span>
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          <Link
            href="/leaderboard"
            className="text-arena-slate-light transition-colors hover:text-arena-slate"
          >
            Leaderboard
          </Link>
          <Link
            href="/methodology"
            className="text-arena-slate-light transition-colors hover:text-arena-slate"
          >
            Methodology
          </Link>
          <Link
            href="/about"
            className="text-arena-slate-light transition-colors hover:text-arena-slate"
          >
            About
          </Link>
          <Link
            href="/disclosure"
            className="text-arena-slate-light transition-colors hover:text-arena-slate"
          >
            Disclosure
          </Link>
        </nav>
      </div>
    </header>
  );
}
