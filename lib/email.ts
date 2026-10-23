/**
 * Transactional email with a small provider abstraction.
 *
 * Provider is picked from env (override with EMAIL_PROVIDER=brevo|resend|console):
 *   - BREVO_API_KEY set  -> Brevo (free 300 emails/day; works with a single verified
 *                           sender address such as a Gmail, no custom domain needed)
 *   - RESEND_API_KEY set -> Resend (needs a verified custom domain to email customers)
 *   - neither            -> "console": the email is logged to the server console instead
 *                           of being sent. Used automatically in local dev; in production
 *                           it is only used when EMAIL_PROVIDER=console is set explicitly.
 *
 * Sender: EMAIL_FROM (address, e.g. yourname@gmail.com — must be the sender verified in
 * Brevo) and EMAIL_FROM_NAME (display name, default "Glimoré Fragrances").
 *
 * sendEmail never throws; it resolves to true when the provider accepted the email.
 * Always `await` it in route handlers — on serverless hosts (Vercel) work started after
 * the response is returned can be frozen before it finishes.
 */

export interface SendEmailParams {
  to: string;
  toName?: string;
  subject: string;
  html: string;
  text?: string;
}

export type EmailProviderName = "brevo" | "resend" | "console" | "none";

interface EmailProvider {
  name: EmailProviderName;
  send(params: SendEmailParams, from: { email: string; name: string }): Promise<boolean>;
}

const BRAND = "Glimoré Fragrances";

function parseFrom(): { email: string; name: string } {
  const raw = (process.env.EMAIL_FROM ?? "").trim();
  const fromName = process.env.EMAIL_FROM_NAME?.trim();
  // Accept either "you@gmail.com" or the older "Name <you@gmail.com>" form.
  const m = raw.match(/^(.*)<([^>]+)>\s*$/);
  if (m) return { email: m[2].trim(), name: fromName || m[1].trim().replace(/^"|"$/g, "") || BRAND };
  return { email: raw || "onboarding@resend.dev", name: fromName || BRAND };
}

const brevoProvider: EmailProvider = {
  name: "brevo",
  async send({ to, toName, subject, html, text }, from) {
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": process.env.BREVO_API_KEY as string,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        sender: { email: from.email, name: from.name },
        to: [{ email: to, ...(toName ? { name: toName } : {}) }],
        subject,
        htmlContent: html,
        ...(text ? { textContent: text } : {}),
      }),
    });
    if (!res.ok) {
      console.error(`[email] Brevo API error (${res.status}): ${await res.text()}`);
      return false;
    }
    return true;
  },
};

const resendProvider: EmailProvider = {
  name: "resend",
  async send({ to, subject, html, text }, from) {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from: `${from.name} <${from.email}>`, to, subject, html, ...(text ? { text } : {}) }),
    });
    if (!res.ok) {
      console.error(`[email] Resend API error (${res.status}): ${await res.text()}`);
      return false;
    }
    return true;
  },
};

const consoleProvider: EmailProvider = {
  name: "console",
  async send({ to, subject, html, text }) {
    console.log(`[email:console] To: ${to} | Subject: ${subject}\n${text ?? stripHtml(html)}`);
    return true;
  },
};

export function getEmailProviderName(): EmailProviderName {
  const forced = process.env.EMAIL_PROVIDER?.trim().toLowerCase();
  if (forced === "brevo" && process.env.BREVO_API_KEY) return "brevo";
  if (forced === "resend" && process.env.RESEND_API_KEY) return "resend";
  if (forced === "console") return "console";
  if (process.env.BREVO_API_KEY) return "brevo";
  if (process.env.RESEND_API_KEY) return "resend";
  return process.env.NODE_ENV === "production" ? "none" : "console";
}

/** True when emails (and therefore OTP codes) can actually reach the user. */
export function isEmailConfigured(): boolean {
  return getEmailProviderName() !== "none";
}

function getProvider(): EmailProvider | null {
  switch (getEmailProviderName()) {
    case "brevo":
      return brevoProvider;
    case "resend":
      return resendProvider;
    case "console":
      return consoleProvider;
    default:
      return null;
  }
}

export async function sendEmail(params: SendEmailParams): Promise<boolean> {
  const provider = getProvider();
  if (!provider) {
    console.warn(
      `[email] No email provider configured (set BREVO_API_KEY + EMAIL_FROM). Not sent: "${params.subject}" to ${params.to}`
    );
    return false;
  }
  try {
    return await provider.send(params, parseFrom());
  } catch (err) {
    console.error(`[email] ${provider.name} send failed:`, err);
    return false;
  }
}

function stripHtml(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function escapeHtml(str: string): string {
  return String(str).replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] as string)
  );
}

export function appUrl(): string {
  const url =
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "") ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "") ||
    "http://localhost:3000";
  return url.replace(/\/$/, "");
}

const rupees = (n: number) => `₹${n.toLocaleString("en-IN")}`;

// ── Branded layout ─────────────────────────────────────────────────────────

function layout(opts: { preheader: string; heading: string; body: string }): string {
  const site = appUrl();
  return `<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(opts.heading)}</title></head>
<body style="margin:0;padding:0;background:#f6f3ee;">
<span style="display:none;max-height:0;overflow:hidden;opacity:0">${escapeHtml(opts.preheader)}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f6f3ee;padding:32px 12px;">
<tr><td align="center">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:14px;overflow:hidden;font-family:Helvetica,Arial,sans-serif;color:#1c1c1c;">
    <tr><td style="background:#0f0f0f;padding:26px 32px;text-align:center;">
      <div style="font-family:Georgia,'Times New Roman',serif;font-size:24px;letter-spacing:4px;color:#c8a96a;">GLIMORÉ</div>
      <div style="font-size:10px;letter-spacing:5px;color:#b9b2a6;margin-top:4px;">FRAGRANCES</div>
    </td></tr>
    <tr><td style="padding:34px 32px 10px;">
      <h1 style="margin:0 0 16px;font-family:Georgia,'Times New Roman',serif;font-weight:normal;font-size:24px;color:#0f0f0f;">${escapeHtml(opts.heading)}</h1>
      ${opts.body}
    </td></tr>
    <tr><td style="padding:22px 32px 30px;border-top:1px solid #eee;font-size:12px;line-height:18px;color:#8a8a8a;text-align:center;">
      ${BRAND} · <a href="${site}" style="color:#8a8a8a;">${escapeHtml(site.replace(/^https?:\/\//, ""))}</a><br>
      You received this email because of activity on your ${BRAND} account.
    </td></tr>
  </table>
</td></tr></table>
</body></html>`;
}

const p = (html: string) => `<p style="margin:0 0 16px;font-size:15px;line-height:23px;color:#3a3a3a;">${html}</p>`;
const button = (href: string, label: string) =>
  `<p style="margin:24px 0;"><a href="${href}" style="display:inline-block;background:#c8a96a;color:#0f0f0f;padding:13px 28px;border-radius:999px;text-decoration:none;font-weight:bold;font-size:14px;letter-spacing:.5px;">${escapeHtml(label)}</a></p>`;

// ── Templates ──────────────────────────────────────────────────────────────

export function otpEmail(name: string, code: string, minutes: number) {
  const html = layout({
    preheader: `Your verification code is ${code}`,
    heading: "Verify your email",
    body:
      p(`Hi ${escapeHtml(name)}, use this code to verify your email and activate your account:`) +
      `<div style="margin:22px 0;padding:18px;text-align:center;background:#f6f3ee;border-radius:10px;font-family:'Courier New',monospace;font-size:34px;letter-spacing:10px;font-weight:bold;color:#0f0f0f;">${escapeHtml(code)}</div>` +
      p(`This code expires in ${minutes} minutes. Never share it with anyone — ${BRAND} will never ask you for it.`) +
      p(`<span style="color:#8a8a8a;font-size:13px;">Didn't sign up? You can safely ignore this email.</span>`),
  });
  const text = `Hi ${name}, your ${BRAND} verification code is ${code}. It expires in ${minutes} minutes. Never share it with anyone.`;
  return { subject: `${code} is your ${BRAND} verification code`, html, text };
}

export function welcomeEmail(name: string) {
  const html = layout({
    preheader: "Your account is ready.",
    heading: `Welcome, ${name}`,
    body:
      p(`Your email is verified and your ${BRAND} account is ready.`) +
      p("Explore our hand-poured candles and fragrances, save favourites to your wishlist, and track every order from your account.") +
      button(`${appUrl()}/shop`, "Start shopping"),
  });
  return { subject: `Welcome to ${BRAND}`, html, text: `Hi ${name}, your ${BRAND} account is ready. Shop at ${appUrl()}/shop` };
}

export function passwordResetEmailHtml(name: string, resetLink: string): string {
  return layout({
    preheader: "Reset your password",
    heading: "Reset your password",
    body:
      p(`Hi ${escapeHtml(name)}, we received a request to reset your ${BRAND} password.`) +
      button(resetLink, "Reset password") +
      p(`<span style="color:#8a8a8a;font-size:13px;">This link expires in 1 hour. If you didn't request this, you can safely ignore this email — your password won't change.</span>`),
  });
}

export interface OrderEmailItem {
  name: string;
  quantity: number;
  price: number;
}

export function orderConfirmationEmailHtml(params: {
  name: string;
  orderNumber: string;
  total: number;
  items?: OrderEmailItem[];
  subtotal?: number;
  shippingCharge?: number;
  taxAmount?: number;
  discountAmount?: number;
  paymentLabel?: string;
  address?: string;
}): string {
  const row = (label: string, value: string, bold = false) =>
    `<tr><td style="padding:6px 0;font-size:14px;color:${bold ? "#0f0f0f" : "#5a5a5a"};${bold ? "font-weight:bold;" : ""}">${label}</td><td align="right" style="padding:6px 0;font-size:14px;color:#0f0f0f;${bold ? "font-weight:bold;" : ""}">${value}</td></tr>`;
  const items = (params.items ?? [])
    .map((i) => row(`${escapeHtml(i.name)} × ${i.quantity}`, rupees(i.price * i.quantity)))
    .join("");
  const totals =
    (params.subtotal !== undefined ? row("Subtotal", rupees(params.subtotal)) : "") +
    (params.discountAmount ? row("Discount", `−${rupees(params.discountAmount)}`) : "") +
    (params.shippingCharge !== undefined ? row("Shipping", params.shippingCharge ? rupees(params.shippingCharge) : "Free") : "") +
    (params.taxAmount ? row("Tax", rupees(params.taxAmount)) : "") +
    row("Total", rupees(params.total), true);
  return layout({
    preheader: `Order ${params.orderNumber} confirmed`,
    heading: "Thank you for your order",
    body:
      p(`Hi ${escapeHtml(params.name)}, your order <strong>${escapeHtml(params.orderNumber)}</strong> is confirmed${params.paymentLabel ? ` (${escapeHtml(params.paymentLabel)})` : ""}.`) +
      `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 18px;border-top:1px solid #eee;border-bottom:1px solid #eee;">${items}</table>` +
      `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 18px;">${totals}</table>` +
      (params.address ? p(`<strong>Delivering to</strong><br>${escapeHtml(params.address)}`) : "") +
      button(`${appUrl()}/account/orders`, "View your order") +
      p(`<span style="color:#8a8a8a;font-size:13px;">We'll email you again when your order ships.</span>`),
  });
}
