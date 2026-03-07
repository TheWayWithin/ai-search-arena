import { resend } from "./resend";

const FROM_ADDRESS = "AI Search Arena <noreply@aisearcharena.com>";
const SUPPORT_EMAIL = "support@aisearcharena.com";

/**
 * Send a contact form submission to the support inbox.
 * Never throws — returns success/error status.
 */
export async function sendContactEmail({
  name,
  email,
  message,
}: {
  name: string;
  email: string;
  message: string;
}): Promise<{ success: boolean; error?: string }> {
  const escapedName = escapeHtml(name);
  const escapedMessage = escapeHtml(message).replace(/\n/g, "<br>");

  try {
    await resend.emails.send({
      from: FROM_ADDRESS,
      to: SUPPORT_EMAIL,
      replyTo: email,
      subject: `Contact form: ${name}`,
      html: `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f9fafb;">
  <div style="max-width:560px;margin:40px auto;background:#ffffff;border-radius:8px;border:1px solid #e5e7eb;overflow:hidden;">
    <div style="background:#111827;padding:24px 32px;">
      <h1 style="margin:0;color:#ffffff;font-size:20px;font-weight:600;">AI Search Arena</h1>
    </div>
    <div style="padding:32px;">
      <p style="margin:0 0 16px;color:#374151;font-size:15px;line-height:1.6;">
        New message from the contact form:
      </p>
      <table style="width:100%;border-collapse:collapse;margin:0 0 24px;">
        <tr>
          <td style="padding:8px 12px;color:#6b7280;font-size:13px;font-weight:600;vertical-align:top;width:80px;">Name</td>
          <td style="padding:8px 12px;color:#374151;font-size:14px;">${escapedName}</td>
        </tr>
        <tr>
          <td style="padding:8px 12px;color:#6b7280;font-size:13px;font-weight:600;vertical-align:top;">Email</td>
          <td style="padding:8px 12px;color:#374151;font-size:14px;">
            <a href="mailto:${email}" style="color:#2563eb;text-decoration:none;">${escapeHtml(email)}</a>
          </td>
        </tr>
      </table>
      <div style="background:#f3f4f6;border-radius:6px;padding:16px;margin:0;">
        <p style="margin:0 0 4px;color:#6b7280;font-size:13px;font-weight:600;">Message</p>
        <p style="margin:0;color:#374151;font-size:14px;line-height:1.6;">${escapedMessage}</p>
      </div>
    </div>
    <div style="padding:16px 32px;background:#f9fafb;border-top:1px solid #e5e7eb;">
      <p style="margin:0;color:#9ca3af;font-size:12px;">
        Reply directly to this email to respond to ${escapedName}.
      </p>
    </div>
  </div>
</body>
</html>`,
    });
    return { success: true };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : String(err);
    console.error("[email] Failed to send contact email:", message);
    return { success: false, error: message };
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
