"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { lockMethodologyAction } from "@/app/actions/admin/methodology";

const initialState = { ok: true, message: "" };

export function LockButton({ versionId }: { versionId: string }) {
  const [state, formAction, pending] = useActionState(
    lockMethodologyAction,
    initialState
  );
  const [open, setOpen] = useState(false);
  const [formRef, setFormRef] = useState<HTMLFormElement | null>(null);

  return (
    <div className="flex flex-col items-start gap-2">
      <form action={formAction} ref={setFormRef}>
        <input type="hidden" name="versionId" value={versionId} />
      </form>

      <Button
        type="button"
        variant="destructive"
        onClick={() => setOpen(true)}
        disabled={pending}
      >
        {pending ? "Locking..." : "Lock Version"}
      </Button>

      {!state.ok && state.message && (
        <p className="text-sm text-red-600">{state.message}</p>
      )}
      {state.ok && state.message && (
        <p className="text-sm text-green-600">{state.message}</p>
      )}

      <ConfirmDialog
        open={open}
        onConfirm={() => {
          setOpen(false);
          formRef?.requestSubmit();
        }}
        onCancel={() => setOpen(false)}
        title="Lock Methodology Version?"
        description="This cannot be undone. The version will be permanently locked and no further changes can be made to its dimensions or weights."
        confirmLabel="Lock"
        variant="destructive"
        pending={pending}
      />
    </div>
  );
}
