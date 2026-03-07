"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { transitionCycleAction } from "@/app/actions/admin/cycle-transitions";

const initialState = { ok: true, message: "" };

const transitionLabels: Record<string, { label: string; variant: "default" | "destructive" }> = {
  Planning: { label: "Move to Planning", variant: "default" },
  Evaluation: { label: "Start Evaluation", variant: "default" },
  Synthesis: { label: "Begin Synthesis", variant: "default" },
  Review: { label: "Send to Review", variant: "default" },
  VendorReview: { label: "Open Vendor Review", variant: "default" },
  Publication: { label: "Publish", variant: "default" },
  Completed: { label: "Mark Completed", variant: "default" },
  Suspended: { label: "Suspend", variant: "destructive" },
  Cancelled: { label: "Cancel Cycle", variant: "destructive" },
  Draft: { label: "Resume as Draft", variant: "default" },
};

export function TransitionControls({
  cycleId,
  currentState,
  validTransitions,
}: {
  cycleId: string;
  currentState: string;
  validTransitions: string[];
}) {
  const [state, formAction, pending] = useActionState(
    transitionCycleAction,
    initialState
  );
  const [confirmTarget, setConfirmTarget] = useState<string | null>(null);
  const [formRef, setFormRef] = useState<HTMLFormElement | null>(null);
  const [hiddenTarget, setHiddenTarget] = useState("");

  if (validTransitions.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No transitions available from {currentState}.
      </p>
    );
  }

  function handleConfirm() {
    setConfirmTarget(null);
    formRef?.requestSubmit();
  }

  return (
    <div className="space-y-3">
      <form action={formAction} ref={setFormRef}>
        <input type="hidden" name="cycleId" value={cycleId} />
        <input type="hidden" name="targetState" value={hiddenTarget} />
      </form>

      <div className="flex flex-wrap gap-2">
        {validTransitions.map((target) => {
          const config = transitionLabels[target] ?? {
            label: target,
            variant: "default" as const,
          };
          return (
            <Button
              key={target}
              type="button"
              variant={config.variant}
              size="sm"
              disabled={pending}
              onClick={() => {
                setHiddenTarget(target);
                setConfirmTarget(target);
              }}
            >
              {pending && hiddenTarget === target
                ? "Transitioning..."
                : config.label}
            </Button>
          );
        })}
      </div>

      {!state.ok && state.message && (
        <p className="text-sm text-red-600">{state.message}</p>
      )}
      {state.ok && state.message && (
        <p className="text-sm text-green-600">{state.message}</p>
      )}

      <ConfirmDialog
        open={confirmTarget !== null}
        onConfirm={handleConfirm}
        onCancel={() => setConfirmTarget(null)}
        title={`Transition to ${confirmTarget}?`}
        description={`This will move the cycle from ${currentState} to ${confirmTarget}. State transition guards will be checked before proceeding.`}
        confirmLabel="Confirm Transition"
        variant={
          transitionLabels[confirmTarget ?? ""]?.variant === "destructive"
            ? "destructive"
            : "default"
        }
        pending={pending}
      />
    </div>
  );
}
