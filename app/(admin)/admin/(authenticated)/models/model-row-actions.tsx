"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toggleModelActiveAction, updateModelTimeoutAction } from "@/app/actions/admin/models";

const initialState = { ok: true, message: "" };

export function ModelRowActions({
  model,
}: {
  model: {
    id: string;
    provider: string;
    displayName: string;
    modelIdentifier: string;
    timeoutMs: number;
    isActive: boolean;
  };
}) {
  const [toggleState, toggleAction, togglePending] = useActionState(
    toggleModelActiveAction,
    initialState
  );
  const [timeoutState, timeoutAction, timeoutPending] = useActionState(
    updateModelTimeoutAction,
    initialState
  );
  const [editing, setEditing] = useState(false);
  const [timeoutValue, setTimeoutValue] = useState(String(model.timeoutMs));

  return (
    <>
      <td className="px-4 py-3">
        <form action={toggleAction}>
          <input type="hidden" name="modelId" value={model.id} />
          <input type="hidden" name="isActive" value={model.isActive ? "false" : "true"} />
          <button type="submit" disabled={togglePending} className="focus:outline-none">
            <Badge
              variant="outline"
              className={
                model.isActive
                  ? "cursor-pointer border-green-300 bg-green-100 text-green-800 hover:bg-green-200"
                  : "cursor-pointer bg-gray-100 text-gray-600 hover:bg-gray-200"
              }
            >
              {model.isActive ? "Active" : "Inactive"}
            </Badge>
          </button>
        </form>
        {!toggleState.ok && <p className="mt-1 text-xs text-red-600">{toggleState.message}</p>}
      </td>

      <td className="px-4 py-3">
        {editing ? (
          <form
            action={timeoutAction}
            onSubmit={() => setEditing(false)}
            className="flex items-center gap-2"
          >
            <input type="hidden" name="modelId" value={model.id} />
            <Input
              name="timeoutMs"
              type="number"
              min={5000}
              max={120000}
              step={1000}
              value={timeoutValue}
              onChange={(e) => setTimeoutValue(e.target.value)}
              className="h-7 w-28 text-sm"
              autoFocus
            />
            <Button type="submit" size="sm" disabled={timeoutPending}>
              Save
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => {
                setEditing(false);
                setTimeoutValue(String(model.timeoutMs));
              }}
            >
              Cancel
            </Button>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="text-sm tabular-nums hover:underline focus:outline-none"
          >
            {model.timeoutMs.toLocaleString()} ms
          </button>
        )}
        {!timeoutState.ok && <p className="mt-1 text-xs text-red-600">{timeoutState.message}</p>}
      </td>
    </>
  );
}
