"use server";

import { revalidatePath } from "next/cache";
import { CycleState } from "@prisma/client";
import { transitionCycle } from "@/lib/state-machine/cycle";

export async function transitionCycleAction(
  prevState: { ok: boolean; message: string },
  formData: FormData
): Promise<{ ok: boolean; message: string }> {
  const cycleId = formData.get("cycleId") as string;
  const targetState = formData.get("targetState") as string;

  if (!cycleId || !targetState) {
    return { ok: false, message: "Missing cycle ID or target state." };
  }

  if (!Object.values(CycleState).includes(targetState as CycleState)) {
    return { ok: false, message: `Invalid state: ${targetState}` };
  }

  try {
    await transitionCycle(cycleId, targetState as CycleState);
    revalidatePath(`/admin/cycles/${cycleId}`);
    revalidatePath("/admin/cycles");
    revalidatePath("/admin");
    return { ok: true, message: `Transitioned to ${targetState}.` };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to transition cycle.";
    return { ok: false, message };
  }
}
