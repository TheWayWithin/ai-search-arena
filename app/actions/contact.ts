"use server";

import { sendContactEmail } from "@/lib/email/contact-emails";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function submitContact(
  _prev: { ok: boolean; message: string },
  formData: FormData
): Promise<{ ok: boolean; message: string }> {
  const name = formData.get("name");
  const email = formData.get("email");
  const message = formData.get("message");

  if (!name || typeof name !== "string" || !name.trim()) {
    return { ok: false, message: "Please enter your name." };
  }

  if (!email || typeof email !== "string" || !EMAIL_RE.test(email)) {
    return { ok: false, message: "Please enter a valid email address." };
  }

  if (!message || typeof message !== "string" || !message.trim()) {
    return { ok: false, message: "Please enter a message." };
  }

  const result = await sendContactEmail({
    name: name.trim(),
    email: email.trim(),
    message: message.trim(),
  });

  if (result.success) {
    return { ok: true, message: "Message sent! We'll get back to you soon." };
  }

  return { ok: false, message: "Something went wrong. Please try again." };
}
