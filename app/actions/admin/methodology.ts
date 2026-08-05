"use server";

import { revalidatePath } from "next/cache";
import { lockMethodologyVersion } from "@/lib/db/methodology";

export async function lockMethodologyAction(
  prevState: { ok: boolean; message: string },
  formData: FormData
): Promise<{ ok: boolean; message: string }> {
  const versionId = formData.get("versionId") as string;

  if (!versionId) {
    return { ok: false, message: "Missing version ID." };
  }

  try {
    await lockMethodologyVersion(versionId);
    revalidatePath("/admin/methodology");
    return { ok: true, message: "Methodology version locked." };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Failed to lock methodology version.",
    };
  }
}
