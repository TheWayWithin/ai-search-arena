"use client";

import { useActionState } from "react";
import { archiveToolAction } from "@/app/actions/admin/tools";
import { Button } from "@/components/ui/button";

const initialState = { ok: true, message: "" };

export function ArchiveToolButton({
  toolId,
  toolName,
}: {
  toolId: string;
  toolName: string;
}) {
  const [, formAction, isPending] = useActionState(
    archiveToolAction,
    initialState
  );

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    if (
      !confirm(`Archive "${toolName}"? This will hide it from benchmarks.`)
    ) {
      e.preventDefault();
    }
  }

  return (
    <form action={formAction} onSubmit={handleSubmit}>
      <input type="hidden" name="toolId" value={toolId} />
      <Button
        type="submit"
        variant="ghost"
        size="sm"
        disabled={isPending}
        className="text-destructive hover:text-destructive"
      >
        {isPending ? "..." : "Archive"}
      </Button>
    </form>
  );
}
