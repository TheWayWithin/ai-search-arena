"use server";

import { revalidatePath } from "next/cache";
import { createTool, archiveTool } from "@/lib/db/vendors";

export async function createToolAction(
  prevState: { ok: boolean; message: string },
  formData: FormData
): Promise<{ ok: boolean; message: string }> {
  const name = formData.get("name") as string;
  const description = (formData.get("description") as string) || "";
  const websiteUrl = (formData.get("websiteUrl") as string) || "";
  const vendorId = formData.get("vendorId") as string;
  const trackIds = formData.getAll("trackIds") as string[];
  const segmentIds = formData.getAll("segmentIds") as string[];

  if (!name?.trim()) {
    return { ok: false, message: "Tool name is required." };
  }
  if (!vendorId) {
    return { ok: false, message: "Vendor is required." };
  }

  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  try {
    await createTool({
      name: name.trim(),
      slug,
      description,
      websiteUrl,
      vendorId,
      trackIds: trackIds.length > 0 ? trackIds : undefined,
      segmentIds: segmentIds.length > 0 ? segmentIds : undefined,
    });
    revalidatePath("/admin/tools");
    return { ok: true, message: "Tool created." };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Failed to create tool.",
    };
  }
}

export async function archiveToolAction(
  prevState: { ok: boolean; message: string },
  formData: FormData
): Promise<{ ok: boolean; message: string }> {
  const toolId = formData.get("toolId") as string;

  if (!toolId) {
    return { ok: false, message: "Tool ID is required." };
  }

  try {
    await archiveTool(toolId);
    revalidatePath("/admin/tools");
    return { ok: true, message: "Tool archived." };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Failed to archive tool.",
    };
  }
}
