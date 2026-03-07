import { resend } from "./resend";

const FROM_ADDRESS = "AI Search Arena <noreply@aisearcharena.com>";

function getSiteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "https://aisearcharena.com";
}

interface Vendor {
  companyName: string;
  contactName: string | null;
  contactEmail: string | null;
}

interface ReviewWithCycle {
  accessToken: string | null;
  windowClosesAt: Date;
  operatorNotes: string | null;
  cycle: { displayName: string };
}

/**
 * Send "review window opened" email to a vendor.
 * Never throws — email failures must not block the workflow.
 */
export async function sendReviewWindowOpenedEmail(
  vendor: Vendor,
  review: ReviewWithCycle
): Promise<{ success: boolean; error?: string }> {
  if (!vendor.contactEmail || !review.accessToken) {
    return { success: false, error: "Missing contactEmail or accessToken" };
  }

  const reviewUrl = `${getSiteUrl()}/review/${review.accessToken}`;
  const deadline = review.windowClosesAt.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const greeting = vendor.contactName ?? vendor.companyName;

  try {
    await resend.emails.send({
      from: FROM_ADDRESS,
      to: vendor.contactEmail,
      subject: `Your scores are ready for review — ${review.cycle.displayName}`,
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
        Hi ${greeting},
      </p>
      <p style="margin:0 0 16px;color:#374151;font-size:15px;line-height:1.6;">
        The benchmark scores for <strong>${review.cycle.displayName}</strong> are ready for your review.
        You have until <strong>${deadline}</strong> to review your scores and submit any factual corrections.
      </p>
      <div style="text-align:center;margin:28px 0;">
        <a href="${reviewUrl}" style="display:inline-block;background:#2563eb;color:#ffffff;padding:12px 28px;border-radius:6px;text-decoration:none;font-size:15px;font-weight:500;">
          Review Your Scores
        </a>
      </div>
      <div style="background:#fef3c7;border:1px solid #fcd34d;border-radius:6px;padding:16px;margin:24px 0 0;">
        <p style="margin:0;color:#92400e;font-size:13px;line-height:1.5;">
          <strong>Confidentiality Notice:</strong> This link is unique to your organization.
          The scores and review page are confidential until the benchmark is published.
          Please do not share this link.
        </p>
      </div>
    </div>
    <div style="padding:16px 32px;background:#f9fafb;border-top:1px solid #e5e7eb;">
      <p style="margin:0;color:#9ca3af;font-size:12px;">
        AI Search Arena — Independent AI Search Benchmarks
      </p>
    </div>
  </div>
</body>
</html>`,
    });
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[email] Failed to send review-opened email to ${vendor.contactEmail}:`, message);
    return { success: false, error: message };
  }
}

/**
 * Send "correction accepted" email to a vendor.
 * Never throws — email failures must not block the workflow.
 */
export async function sendCorrectionAcceptedEmail(
  vendor: Vendor,
  review: ReviewWithCycle
): Promise<{ success: boolean; error?: string }> {
  if (!vendor.contactEmail) {
    return { success: false, error: "Missing contactEmail" };
  }

  const greeting = vendor.contactName ?? vendor.companyName;
  const notes = review.operatorNotes?.replace(/^ACCEPTED:\s*/i, "") ?? "";

  try {
    await resend.emails.send({
      from: FROM_ADDRESS,
      to: vendor.contactEmail,
      subject: `Correction accepted — ${review.cycle.displayName}`,
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
        Hi ${greeting},
      </p>
      <p style="margin:0 0 16px;color:#374151;font-size:15px;line-height:1.6;">
        Your correction for <strong>${review.cycle.displayName}</strong> has been reviewed and <strong>accepted</strong>.
        The scores will be updated to reflect your correction before publication.
      </p>
      ${
        notes
          ? `<div style="background:#ecfdf5;border:1px solid #6ee7b7;border-radius:6px;padding:16px;margin:24px 0 0;">
        <p style="margin:0 0 4px;color:#065f46;font-size:13px;font-weight:600;">Operator Notes</p>
        <p style="margin:0;color:#065f46;font-size:14px;line-height:1.5;">${notes}</p>
      </div>`
          : ""
      }
    </div>
    <div style="padding:16px 32px;background:#f9fafb;border-top:1px solid #e5e7eb;">
      <p style="margin:0;color:#9ca3af;font-size:12px;">
        AI Search Arena — Independent AI Search Benchmarks
      </p>
    </div>
  </div>
</body>
</html>`,
    });
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[email] Failed to send correction-accepted email to ${vendor.contactEmail}:`, message);
    return { success: false, error: message };
  }
}

/**
 * Send "correction rejected" email to a vendor.
 * Never throws — email failures must not block the workflow.
 */
export async function sendCorrectionRejectedEmail(
  vendor: Vendor,
  review: ReviewWithCycle
): Promise<{ success: boolean; error?: string }> {
  if (!vendor.contactEmail) {
    return { success: false, error: "Missing contactEmail" };
  }

  const greeting = vendor.contactName ?? vendor.companyName;
  const reason = review.operatorNotes?.replace(/^REJECTED:\s*/i, "") ?? "";

  try {
    await resend.emails.send({
      from: FROM_ADDRESS,
      to: vendor.contactEmail,
      subject: `Correction not accepted — ${review.cycle.displayName}`,
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
        Hi ${greeting},
      </p>
      <p style="margin:0 0 16px;color:#374151;font-size:15px;line-height:1.6;">
        Your correction for <strong>${review.cycle.displayName}</strong> has been reviewed
        and was <strong>not accepted</strong> at this time.
      </p>
      ${
        reason
          ? `<div style="background:#fef2f2;border:1px solid #fca5a5;border-radius:6px;padding:16px;margin:24px 0 0;">
        <p style="margin:0 0 4px;color:#991b1b;font-size:13px;font-weight:600;">Reason</p>
        <p style="margin:0;color:#991b1b;font-size:14px;line-height:1.5;">${reason}</p>
      </div>`
          : ""
      }
      <p style="margin:24px 0 0;color:#6b7280;font-size:13px;line-height:1.5;">
        If you have additional evidence to support your correction, you may submit a new correction
        before the review window closes.
      </p>
    </div>
    <div style="padding:16px 32px;background:#f9fafb;border-top:1px solid #e5e7eb;">
      <p style="margin:0;color:#9ca3af;font-size:12px;">
        AI Search Arena — Independent AI Search Benchmarks
      </p>
    </div>
  </div>
</body>
</html>`,
    });
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[email] Failed to send correction-rejected email to ${vendor.contactEmail}:`, message);
    return { success: false, error: message };
  }
}
