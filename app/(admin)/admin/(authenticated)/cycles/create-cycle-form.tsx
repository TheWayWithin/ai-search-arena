"use client";

import { useActionState, useState } from "react";
import { createCycleAction } from "@/app/actions/admin/cycles";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const initialState = { ok: true, message: "" };

export function CreateCycleForm({
  methodologyVersionId,
  methodologyLabel,
}: {
  methodologyVersionId: string;
  methodologyLabel: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(
    createCycleAction,
    initialState
  );

  if (!isOpen) {
    return (
      <Button onClick={() => setIsOpen(true)} variant="default">
        New Cycle
      </Button>
    );
  }

  return (
    <div className="space-y-6 rounded-lg border bg-card p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Create New Cycle</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen(false)}
          type="button"
        >
          Cancel
        </Button>
      </div>

      <form action={formAction} className="space-y-4">
        <input
          type="hidden"
          name="methodologyVersionId"
          value={methodologyVersionId}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <label
              htmlFor="cycleIdentifier"
              className="text-sm font-medium leading-none"
            >
              Cycle Identifier
            </label>
            <Input
              id="cycleIdentifier"
              name="cycleIdentifier"
              placeholder="e.g. 2026-04"
              required
              disabled={isPending}
            />
          </div>

          <div className="space-y-1">
            <label
              htmlFor="displayName"
              className="text-sm font-medium leading-none"
            >
              Display Name
            </label>
            <Input
              id="displayName"
              name="displayName"
              placeholder="e.g. April 2026 Benchmark"
              required
              disabled={isPending}
            />
          </div>

          <div className="space-y-1">
            <label
              htmlFor="startDate"
              className="text-sm font-medium leading-none"
            >
              Start Date
            </label>
            <Input
              id="startDate"
              name="startDate"
              type="date"
              required
              disabled={isPending}
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium leading-none">
              Methodology Version
            </label>
            <div className="flex h-9 items-center rounded-md border bg-muted px-3 text-sm text-muted-foreground">
              {methodologyLabel}
            </div>
          </div>
        </div>

        {!state.ok && state.message && (
          <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {state.message}
          </p>
        )}

        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            type="button"
            onClick={() => setIsOpen(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isPending || !methodologyVersionId}>
            {isPending ? "Creating..." : "Create Cycle"}
          </Button>
        </div>
      </form>
    </div>
  );
}
