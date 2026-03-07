import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCycleById } from "@/lib/db/cycles";
import { getEnrollments, getEnrollmentCountsByTrack } from "@/lib/db/enrollments";
import { getTools } from "@/lib/db/vendors";
import { StateBadge } from "@/components/admin/state-badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EnrollmentList } from "./enrollment-list";

export const metadata: Metadata = {
  title: "Enrollment | Admin",
  robots: { index: false, follow: false },
};

export default async function EnrollmentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const cycle = await getCycleById(id);

  if (!cycle) {
    notFound();
  }

  // Only allow enrollment management in Draft or Planning
  if (cycle.state !== "Draft" && cycle.state !== "Planning") {
    redirect(`/admin/cycles/${id}`);
  }

  const [enrollments, allTools, trackCounts] = await Promise.all([
    getEnrollments(cycle.id),
    getTools(),
    getEnrollmentCountsByTrack(cycle.id),
  ]);

  const enrolledToolIds = new Set(enrollments.map((e) => e.toolId));

  // Group all tools by track for display
  const trackMap = new Map<string, { trackName: string; tools: typeof allTools }>();
  for (const tool of allTools) {
    for (const tm of tool.trackMappings) {
      const existing = trackMap.get(tm.trackId);
      if (existing) {
        existing.tools.push(tool);
      } else {
        trackMap.set(tm.trackId, {
          trackName: tm.track.name,
          tools: [tool],
        });
      }
    }
  }

  // Serialize for client component
  const tracks = Array.from(trackMap.entries())
    .map(([trackId, { trackName, tools }]) => ({
      trackId,
      trackName,
      count: trackCounts[trackId]?.count ?? 0,
      tools: tools.map((t) => ({
        id: t.id,
        name: t.name,
        vendorName: t.vendor.companyName,
        isEnrolled: enrolledToolIds.has(t.id),
      })),
    }))
    .sort((a, b) => a.trackName.localeCompare(b.trackName));

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">
              Tool Enrollment
            </h1>
            <StateBadge state={cycle.state} />
          </div>
          <p className="mt-1 text-muted-foreground">
            {cycle.displayName} ({cycle.cycleIdentifier})
          </p>
        </div>
        <Link href={`/admin/cycles/${cycle.id}`}>
          <Button variant="outline" size="sm">
            Back to Cycle
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Enrollment Summary</CardTitle>
          <CardDescription>
            {enrollments.length} tool{enrollments.length !== 1 ? "s" : ""}{" "}
            enrolled. Minimum 5 per track required for Evaluation (BR-T03).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 sm:grid-cols-3">
            {Object.entries(trackCounts).map(
              ([trackId, { trackName, count }]) => (
                <div
                  key={trackId}
                  className={`rounded-md border px-3 py-2 text-sm ${count >= 5 ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}
                >
                  <span className="font-medium">{trackName}</span>:{" "}
                  <span className="font-semibold">{count}</span>/5
                </div>
              )
            )}
          </div>
        </CardContent>
      </Card>

      <EnrollmentList cycleId={cycle.id} tracks={tracks} />
    </div>
  );
}
