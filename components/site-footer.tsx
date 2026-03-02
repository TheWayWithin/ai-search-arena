import Link from "next/link";
import { NewsletterSignup } from "@/components/newsletter-signup";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-pale-grey">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <p className="text-sm text-arena-slate-light">
            Monthly benchmark results, delivered to your inbox.
          </p>
          <NewsletterSignup variant="footer" />
        </div>

        <div className="my-6 border-t border-border" />

        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="text-sm text-arena-slate-light">
            &copy; {new Date().getFullYear()} AI Search Arena. An{" "}
            <a
              href="https://aisearchmastery.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-mastery-blue hover:underline"
            >
              AI Search Mastery
            </a>{" "}
            project.
          </div>
          <nav className="flex gap-4 text-sm text-arena-slate-light">
            <Link href="/methodology" className="hover:text-arena-slate">
              Methodology
            </Link>
            <Link href="/disclosure" className="hover:text-arena-slate">
              Disclosure
            </Link>
            <Link href="/about" className="hover:text-arena-slate">
              About
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
