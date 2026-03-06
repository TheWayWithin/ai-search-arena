import type { Metadata } from "next";
import Link from "next/link";
import { getPublishedCyclesWithStats } from "@/lib/db/leaderboard";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Benchmark Cycles",
  description:
    "Archive of all published AI Search Arena benchmark cycles with evaluation results and methodology versions.",
};

export default async function CyclesPage() {
  const cycles = await getPublishedCyclesWithStats();

  if (cycles.length === 0) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h1 className="text-arena-slate text-3xl font-bold tracking-tight">Benchmark Cycles</h1>
        <div className="border-border bg-pale-grey mt-8 rounded-lg border p-8 text-center">
          <p className="text-arena-slate text-lg">No benchmark cycles have been published yet.</p>
          <p className="text-arena-slate-light mt-2 text-sm">
            The first evaluation cycle is in progress. Check back soon.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <h1 className="text-arena-slate text-3xl font-bold tracking-tight">Benchmark Cycles</h1>
      <p className="text-arena-slate-light mt-1 text-sm">
        {cycles.length} published {cycles.length === 1 ? "cycle" : "cycles"}
      </p>

      <div className="mt-8 space-y-4">
        {cycles.map((cycle) => (
          <Link
            key={cycle.id}
            href={`/leaderboard?cycle=${cycle.cycleIdentifier}`}
            className="border-border hover:border-arena-slate-light hover:bg-pale-grey block rounded-lg border bg-white p-6 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-arena-slate text-lg font-semibold">{cycle.displayName}</h2>
                <div className="text-arena-slate-light mt-1 flex items-center gap-3 text-sm">
                  {cycle.publishedAt && (
                    <span>
                      Published{" "}
                      {new Date(cycle.publishedAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  )}
                  <span>&middot;</span>
                  <span>{cycle.toolCount} tools evaluated</span>
                  {cycle.methodologyVersion && (
                    <>
                      <span>&middot;</span>
                      <span>Methodology v{cycle.methodologyVersion}</span>
                    </>
                  )}
                </div>
              </div>
              <span className="text-arena-slate-light text-sm">View rankings &rarr;</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
