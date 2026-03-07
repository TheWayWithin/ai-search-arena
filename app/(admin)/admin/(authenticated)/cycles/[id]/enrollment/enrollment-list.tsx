"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import {
  enrollToolAction,
  withdrawToolAction,
  enrollAllInTrackAction,
} from "@/app/actions/admin/enrollments";

const initialState = { ok: true, message: "" };

type Track = {
  trackId: string;
  trackName: string;
  count: number;
  tools: {
    id: string;
    name: string;
    vendorName: string;
    isEnrolled: boolean;
  }[];
};

export function EnrollmentList({
  cycleId,
  tracks,
}: {
  cycleId: string;
  tracks: Track[];
}) {
  return (
    <div className="space-y-4">
      {tracks.map((track) => (
        <TrackSection key={track.trackId} cycleId={cycleId} track={track} />
      ))}
    </div>
  );
}

function TrackSection({
  cycleId,
  track,
}: {
  cycleId: string;
  track: Track;
}) {
  const [enrollAllState, enrollAllAction, enrollAllPending] = useActionState(
    enrollAllInTrackAction,
    initialState
  );

  const enrolled = track.tools.filter((t) => t.isEnrolled);
  const unenrolled = track.tools.filter((t) => !t.isEnrolled);

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">
            {track.trackName}
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              ({track.count} enrolled, need 5)
            </span>
          </CardTitle>
          {unenrolled.length > 0 && (
            <form action={enrollAllAction}>
              <input type="hidden" name="cycleId" value={cycleId} />
              <input type="hidden" name="trackId" value={track.trackId} />
              <Button
                type="submit"
                variant="outline"
                size="sm"
                disabled={enrollAllPending}
              >
                {enrollAllPending ? "Enrolling..." : `Enroll All (${unenrolled.length})`}
              </Button>
            </form>
          )}
        </div>
        {!enrollAllState.ok && (
          <p className="text-xs text-red-600">{enrollAllState.message}</p>
        )}
        {enrollAllState.ok && enrollAllState.message && (
          <p className="text-xs text-green-600">{enrollAllState.message}</p>
        )}
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y">
          {track.tools.map((tool) => (
            <ToolRow
              key={tool.id}
              cycleId={cycleId}
              tool={tool}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function ToolRow({
  cycleId,
  tool,
}: {
  cycleId: string;
  tool: Track["tools"][number];
}) {
  const [enrollState, enrollAction, enrollPending] = useActionState(
    enrollToolAction,
    initialState
  );
  const [withdrawState, withdrawAction, withdrawPending] = useActionState(
    withdrawToolAction,
    initialState
  );
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [reason, setReason] = useState("");

  const pending = enrollPending || withdrawPending;

  return (
    <div className="px-4 py-3">
      <div className="flex items-center justify-between">
        <div>
          <span className="font-medium">{tool.name}</span>
          <span className="ml-2 text-sm text-muted-foreground">
            {tool.vendorName}
          </span>
        </div>

        {tool.isEnrolled ? (
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-green-600">Enrolled</span>
            {!showWithdraw && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-red-600 hover:text-red-700"
                onClick={() => setShowWithdraw(true)}
                disabled={pending}
              >
                Withdraw
              </Button>
            )}
          </div>
        ) : (
          <form action={enrollAction}>
            <input type="hidden" name="cycleId" value={cycleId} />
            <input type="hidden" name="toolId" value={tool.id} />
            <Button
              type="submit"
              variant="outline"
              size="sm"
              disabled={pending}
            >
              {enrollPending ? "..." : "Enroll"}
            </Button>
          </form>
        )}
      </div>

      {showWithdraw && (
        <form action={withdrawAction} className="mt-2 flex items-center gap-2">
          <input type="hidden" name="cycleId" value={cycleId} />
          <input type="hidden" name="toolId" value={tool.id} />
          <input
            name="reason"
            type="text"
            placeholder="Withdrawal reason (required)"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="flex-1 rounded-md border px-2 py-1 text-sm"
            required
          />
          <Button type="submit" variant="destructive" size="sm" disabled={withdrawPending || !reason.trim()}>
            {withdrawPending ? "..." : "Confirm"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              setShowWithdraw(false);
              setReason("");
            }}
          >
            Cancel
          </Button>
        </form>
      )}

      {!enrollState.ok && (
        <p className="mt-1 text-xs text-red-600">{enrollState.message}</p>
      )}
      {!withdrawState.ok && (
        <p className="mt-1 text-xs text-red-600">{withdrawState.message}</p>
      )}
    </div>
  );
}
