"use server";

const BUTTONDOWN_USERNAME = process.env.NEXT_PUBLIC_BUTTONDOWN_USERNAME ?? "watters";

export async function subscribe(
  _prev: { ok: boolean; message: string },
  formData: FormData
): Promise<{ ok: boolean; message: string }> {
  const email = formData.get("email");

  if (!email || typeof email !== "string") {
    return { ok: false, message: "Please enter a valid email address." };
  }

  try {
    const res = await fetch(
      `https://buttondown.com/api/emails/embed-subscribe/${BUTTONDOWN_USERNAME}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ email }).toString(),
      }
    );

    if (res.ok || res.status === 201) {
      return { ok: true, message: "Check your inbox to confirm your subscription." };
    }

    return { ok: false, message: "Something went wrong. Please try again." };
  } catch {
    return { ok: false, message: "Network error. Please try again." };
  }
}
