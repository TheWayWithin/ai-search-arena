"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createCycle } from "@/lib/db/cycles";

export type CycleActionState = {
  ok: boolean;
  message: string;
};

export async function createCycleAction(
  prevState: CycleActionState,
  formData: FormData
): Promise<CycleActionState> {
  const cycleIdentifier = formData.get("cycleIdentifier") as string;
  const displayName = formData.get("displayName") as string;
  const startDate = formData.get("startDate") as string;
  const methodologyVersionId = formData.get("methodologyVersionId") as string;

  if (!cycleIdentifier || !displayName || !startDate || !methodologyVersionId) {
    return { ok: false, message: "All fields are required." };
  }

  try {
    const cycle = await createCycle({
      cycleIdentifier,
      displayName,
      startDate: new Date(startDate),
      methodologyVersionId,
    });

    revalidatePath("/admin/cycles");
    redirect(`/admin/cycles/${cycle.id}`);
  } catch (error) {
    if (error instanceof Error && error.message === "NEXT_REDIRECT") throw error;
    const message = error instanceof Error ? error.message : "Failed to create cycle.";
    return { ok: false, message };
  }
}
