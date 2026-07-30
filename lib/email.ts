/**
 * Transactional email via Resend (https://resend.com — generous free tier,
 * a single REST call, no SDK dependency needed).
 *
 * If RESEND_API_KEY isn't set, or the send fails, we log the content to the
 * server console instead of throwing — so signup/reset flows stay fully
 * testable in local dev without an email provider configured, while sending
 * real mail the moment a real key is added. This is a deliberate fallback,
 * not a stand-in for the real implementation above it.
 */

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailParams): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM ?? "Glimoré Fragrances <onboarding@resend.dev>";

  if (!apiKey) {
    console.log(`[email:dev-fallback] To: ${to} | Subject: ${subject}\n${stripHtml(html)}`);
    return;
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to, subject, html }),
    });

    if (!res.ok) {
      const body = await res.text();
      console.error(`[email] Resend API error (${res.status}): ${body}`);
      console.log(`[email:dev-fallback] To: ${to} | Subject: ${subject}\n${stripHtml(html)}`);
    }
  } catch (err) {
    console.error("[email] Failed to send:", err);
    console.log(`[email:dev-fallback] To: ${to} | Subject: ${subject}\n${stripHtml(html)}`);
  }
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

export function passwordResetEmailHtml(name: string, resetLink: string): string {
  return `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;color:#1c1c1c">
      <h2 style="font-weight:600">Reset your password</h2>
      <p>Hi ${escapeHtml(name)}, we received a request to reset your Glimoré Fragrances password.</p>
      <p><a href="${resetLink}" style="display:inline-block;background:#c8a96a;color:#0f0f0f;padding:12px 24px;border-radius:999px;text-decoration:none;font-weight:600">Reset Password</a></p>
      <p style="color:#777;font-size:13px">This link expires in 1 hour. If you didn't request this, you can safely ignore this email.</p>
    </div>`;
}

export function orderConfirmationEmailHtml(params: {
  name: string;
  orderNumber: string;
  total: number;
}): string {
  return `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;color:#1c1c1c">
      <h2 style="font-weight:600">Thank you for your order, ${escapeHtml(params.name)}</h2>
      <p>Your order <strong>${escapeHtml(params.orderNumber)}</strong> has been confirmed.</p>
      <p style="font-size:20px">Total: ₹${params.total.toLocaleString("en-IN")}</p>
      <p style="color:#777;font-size:13px">We'll notify you again once your candles ship.</p>
    </div>`;
}

function escapeHtml(str: string): string {
  return str.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] as string));
}
