import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCycleById } from "@/lib/db/cycles";
import { getValidTransitions } from "@/lib/state-machine/cycle";
import { getEnrollmentCountsByTrack } from "@/lib/db/enrollments";
import { StateBadge } from "@/components/admin/state-badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TransitionControls } from "./transition-controls";

export const metadata: Metadata = {
  title: "Cycle Detail | Admin",
  robots: { index: false, follow: false },
};

export default async function CycleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cycle = await getCycleById(id);

  if (!cycle) {
    notFound();
  }

  const validTransitions = getValidTransitions(cycle.state);
  const trackCounts = await getEnrollmentCountsByTrack(cycle.id);
  const enrolledTools = cycle.enrollments.length;

  const canManageEnrollment = cycle.state === "Draft" || cycle.state === "Planning";

  const daysSinceStart = cycle.startDate
    ? Math.floor((Date.now() - new Date(cycle.startDate).getTime()) / 86_400_000)
    : null;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">{cycle.displayName}</h1>
            <StateBadge state={cycle.state} size="lg" />
          </div>
          <p className="text-muted-foreground mt-1">
            {cycle.cycleIdentifier}
            {cycle.methodologyVersion &&
              ` · Methodology v${cycle.methodologyVersion.versionNumber}`}
          </p>
        </div>
        <Link href="/admin/cycles">
          <Button variant="outline" size="sm">
            Back to Cycles
          </Button>
        </Link>
      </div>

      {/* Cycle Info */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Start Date</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">
              {new Date(cycle.startDate).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
            {daysSinceStart !== null && daysSinceStart >= 0 && (
              <p className="text-muted-foreground text-sm">
                {daysSinceStart} day{daysSinceStart !== 1 ? "s" : ""} ago
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Enrolled Tools</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">{enrolledTools}</p>
            <p className="text-muted-foreground text-sm">
              across {Object.keys(trackCounts).length} track
              {Object.keys(trackCounts).length !== 1 ? "s" : ""}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>End Date</CardDescription>
          </CardHeader>
          <CardContent>
            {cycle.endDate ? (
              <p className="text-lg font-semibold">
                {new Date(cycle.endDate).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            ) : (
              <p className="text-muted-foreground text-lg">In progress</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* State Machine Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">State Transitions</CardTitle>
          <CardDescription>
            {validTransitions.length > 0
              ? `${validTransitions.length} transition${validTransitions.length !== 1 ? "s" : ""} available from ${cycle.state}.`
              : `${cycle.state} is a terminal state — no transitions available.`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TransitionControls
            cycleId={cycle.id}
            currentState={cycle.state}
            validTransitions={validTransitions}
          />
        </CardContent>
      </Card>

      {/* Enrollment Summary by Track */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Enrollment by Track</CardTitle>
              <CardDescription>
                Minimum 5 tools per track required before advancing to Evaluation (BR-T03).
              </CardDescription>
            </div>
            {canManageEnrollment && (
              <Link href={`/admin/cycles/${cycle.id}/enrollment`}>
                <Button size="sm">Manage Enrollment</Button>
              </Link>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {Object.keys(trackCounts).length === 0 ? (
            <p className="text-muted-foreground text-sm">
              No tools enrolled yet.
              {canManageEnrollment && " Use Manage Enrollment to add tools."}
            </p>
          ) : (
            <div className="space-y-3">
              {Object.entries(trackCounts).map(([trackId, { trackName, count }]) => (
                <div
                  key={trackId}
                  className="flex items-center justify-between rounded-md border px-4 py-2"
                >
                  <span className="font-medium">{trackName}</span>
                  <span
                    className={`text-sm font-semibold ${count >= 5 ? "text-green-600" : "text-red-600"}`}
                  >
                    {count} tool{count !== 1 ? "s" : ""}
                    {count < 5 && (
                      <span className="ml-1 font-normal text-red-500">(need {5 - count} more)</span>
                    )}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Enrolled Tools List */}
      {enrolledTools > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Enrolled Tools ({enrolledTools})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {cycle.enrollments.map((enrollment) => (
                <div key={enrollment.id} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <p className="font-medium">{enrollment.tool.name}</p>
                    <p className="text-muted-foreground text-sm">
                      {enrollment.tool.vendor.companyName}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    {enrollment.tool.trackMappings.map((tm) => (
                      <span key={tm.trackId} className="bg-muted rounded px-1.5 py-0.5 text-xs">
                        {tm.track.name}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
