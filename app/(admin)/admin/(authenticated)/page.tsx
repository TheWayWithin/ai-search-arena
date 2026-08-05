import type { Metadata } from "next";
import Link from "next/link";
import { getActiveCycle, listCycles } from "@/lib/db/cycles";
import { getTools } from "@/lib/db/vendors";
import { getActiveModels } from "@/lib/db/ai-models";
import { getValidTransitions } from "@/lib/state-machine/cycle";
import { StateBadge } from "@/components/admin/state-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Dashboard | Admin",
  robots: { index: false, follow: false },
};

function daysSince(date: Date): number {
  return Math.floor((Date.now() - new Date(date).getTime()) / 86_400_000);
}

export default async function AdminDashboardPage() {
  const [activeCycle, allCycles, tools, activeModels] = await Promise.all([
    getActiveCycle(),
    listCycles(),
    getTools(),
    getActiveModels(),
  ]);

  const recentCycles = allCycles.slice(0, 3);
  const vendorCount = new Set(tools.map((t) => t.vendorId)).size;
  const validTransitions = activeCycle ? getValidTransitions(activeCycle.state) : [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Overview of evaluation cycles and platform status.
        </p>
      </div>

      {activeCycle ? (
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle className="text-xl">{activeCycle.displayName}</CardTitle>
                <CardDescription className="mt-1 font-mono text-xs">
                  {activeCycle.cycleIdentifier}
                </CardDescription>
              </div>
              <StateBadge state={activeCycle.state} size="lg" />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <div>
                <p className="text-muted-foreground text-xs tracking-wide uppercase">
                  Days in current state
                </p>
                <p className="mt-1 text-2xl font-semibold">{daysSince(activeCycle.updatedAt)}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs tracking-wide uppercase">
                  Enrolled tools
                </p>
                <p className="mt-1 text-2xl font-semibold">{activeCycle.enrollments.length}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs tracking-wide uppercase">Start date</p>
                <p className="mt-1 text-sm font-medium">
                  {new Date(activeCycle.startDate).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>

            {validTransitions.length > 0 && (
              <div>
                <p className="text-muted-foreground mb-2 text-xs tracking-wide uppercase">
                  Next valid transitions
                </p>
                <div className="flex flex-wrap gap-2">
                  {validTransitions.map((t) => (
                    <Badge key={t} variant="outline">
                      {t}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-2">
              <Button asChild size="sm" variant="outline">
                <Link href={`/admin/cycles/${activeCycle.id}`}>Manage cycle</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center gap-4 py-12 text-center">
            <div>
              <p className="text-lg font-semibold">No active evaluation cycle</p>
              <p className="text-muted-foreground mt-1 text-sm">
                Create a new cycle to begin evaluating AI search tools.
              </p>
            </div>
            <Button asChild>
              <Link href="/admin/cycles">Start New Cycle</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Tools</CardDescription>
            <CardTitle className="text-3xl">{tools.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Vendors</CardDescription>
            <CardTitle className="text-3xl">{vendorCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Active AI Models</CardDescription>
            <CardTitle className="text-3xl">{activeModels.length}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {recentCycles.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">Recent Cycles</h2>
            <Button asChild variant="ghost" size="sm">
              <Link href="/admin/cycles">View all</Link>
            </Button>
          </div>
          <div className="space-y-2">
            {recentCycles.map((cycle) => (
              <Link
                key={cycle.id}
                href={`/admin/cycles/${cycle.id}`}
                className="hover:bg-muted/50 flex items-center justify-between rounded-lg border px-4 py-3 transition-colors"
              >
                <div>
                  <p className="text-sm font-medium">{cycle.displayName}</p>
                  <p className="text-muted-foreground font-mono text-xs">{cycle.cycleIdentifier}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-muted-foreground text-xs">
                    {cycle._count.enrollments} tools
                  </span>
                  <StateBadge state={cycle.state} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
