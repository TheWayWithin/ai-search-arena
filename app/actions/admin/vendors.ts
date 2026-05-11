"use server";

import { revalidatePath } from "next/cache";
import { createVendor } from "@/lib/db/vendors";

export async function createVendorAction(
  prevState: { ok: boolean; message: string },
  formData: FormData
): Promise<{ ok: boolean; message: string }> {
  const companyName = formData.get("companyName") as string;
  const websiteUrl = (formData.get("websiteUrl") as string) || undefined;
  const contactName = (formData.get("contactName") as string) || undefined;
  const contactEmail = (formData.get("contactEmail") as string) || undefined;
  const description = (formData.get("description") as string) || undefined;

  if (!companyName?.trim()) {
    return { ok: false, message: "Company name is required." };
  }

  const slug = companyName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  try {
    await createVendor({
      companyName: companyName.trim(),
      slug,
      websiteUrl,
      contactName,
      contactEmail,
      description,
    });
    revalidatePath("/admin/vendors");
    return { ok: true, message: "Vendor created." };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Failed to create vendor.",
    };
  }
}
