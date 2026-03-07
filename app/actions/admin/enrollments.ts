"use server";

import { revalidatePath } from "next/cache";
import { enrollTool, withdrawTool } from "@/lib/db/enrollments";
import { prisma } from "@/lib/db";

export async function enrollToolAction(
  prevState: { ok: boolean; message: string },
  formData: FormData
): Promise<{ ok: boolean; message: string }> {
  const cycleId = formData.get("cycleId") as string;
  const toolId = formData.get("toolId") as string;

  if (!cycleId || !toolId) {
    return { ok: false, message: "Missing cycle or tool ID." };
  }

  try {
    await enrollTool({ cycleId, toolId });
    revalidatePath(`/admin/cycles/${cycleId}/enrollment`);
    revalidatePath(`/admin/cycles/${cycleId}`);
    return { ok: true, message: "Tool enrolled." };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Failed to enroll tool.",
    };
  }
}

export async function withdrawToolAction(
  prevState: { ok: boolean; message: string },
  formData: FormData
): Promise<{ ok: boolean; message: string }> {
  const cycleId = formData.get("cycleId") as string;
  const toolId = formData.get("toolId") as string;
  const reason = formData.get("reason") as string;

  if (!cycleId || !toolId) {
    return { ok: false, message: "Missing cycle or tool ID." };
  }
  if (!reason?.trim()) {
    return { ok: false, message: "Withdrawal reason is required." };
  }

  try {
    await withdrawTool({ cycleId, toolId, reason: reason.trim() });
    revalidatePath(`/admin/cycles/${cycleId}/enrollment`);
    revalidatePath(`/admin/cycles/${cycleId}`);
    return { ok: true, message: "Tool withdrawn." };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error ? error.message : "Failed to withdraw tool.",
    };
  }
}

export async function enrollAllInTrackAction(
  prevState: { ok: boolean; message: string },
  formData: FormData
): Promise<{ ok: boolean; message: string }> {
  const cycleId = formData.get("cycleId") as string;
  const trackId = formData.get("trackId") as string;

  if (!cycleId || !trackId) {
    return { ok: false, message: "Missing cycle or track ID." };
  }

  try {
    const tools = await prisma.tool.findMany({
      where: {
        isArchived: false,
        trackMappings: { some: { trackId } },
      },
      select: { id: true },
    });

    const existingEnrollments = await prisma.cycleToolEnrollment.findMany({
      where: { cycleId, withdrawnAt: null },
      select: { toolId: true },
    });
    const enrolledIds = new Set(existingEnrollments.map((e) => e.toolId));

    let enrolled = 0;
    for (const tool of tools) {
      if (!enrolledIds.has(tool.id)) {
        try {
          await enrollTool({ cycleId, toolId: tool.id });
          enrolled++;
        } catch {
          // Skip tools that fail (e.g., no track mapping)
        }
      }
    }

    revalidatePath(`/admin/cycles/${cycleId}/enrollment`);
    revalidatePath(`/admin/cycles/${cycleId}`);
    return { ok: true, message: `Enrolled ${enrolled} tool(s).` };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error ? error.message : "Failed to enroll tools.",
    };
  }
}
