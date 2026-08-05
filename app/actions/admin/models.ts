"use server";

import { revalidatePath } from "next/cache";
import { toggleModelActive, updateModelTimeout } from "@/lib/db/ai-models";

export async function toggleModelActiveAction(
  prevState: { ok: boolean; message: string },
  formData: FormData
): Promise<{ ok: boolean; message: string }> {
  const modelId = formData.get("modelId") as string;
  const isActive = formData.get("isActive") === "true";

  if (!modelId) {
    return { ok: false, message: "Missing model ID." };
  }

  try {
    await toggleModelActive(modelId, isActive);
    revalidatePath("/admin/models");
    return {
      ok: true,
      message: `Model ${isActive ? "activated" : "deactivated"}.`,
    };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Failed to update model status.",
    };
  }
}

export async function updateModelTimeoutAction(
  prevState: { ok: boolean; message: string },
  formData: FormData
): Promise<{ ok: boolean; message: string }> {
  const modelId = formData.get("modelId") as string;
  const timeoutMs = parseInt(formData.get("timeoutMs") as string, 10);

  if (!modelId) {
    return { ok: false, message: "Missing model ID." };
  }
  if (isNaN(timeoutMs)) {
    return { ok: false, message: "Invalid timeout value." };
  }

  try {
    await updateModelTimeout(modelId, timeoutMs);
    revalidatePath("/admin/models");
    return { ok: true, message: "Timeout updated." };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Failed to update timeout.",
    };
  }
}
