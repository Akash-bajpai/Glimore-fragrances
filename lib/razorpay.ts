import Razorpay from "razorpay";
import crypto from "crypto";

/**
 * Amounts here are in PAISE (smallest currency unit) because that is what the
 * Razorpay API requires. Every other part of this app works in whole rupees —
 * conversion happens only at this boundary. Get this multiplication wrong and
 * you either overcharge customers 100x or undercharge 100x, so it's isolated
 * and named explicitly (rupeesToPaise / paiseToRupees) rather than left implicit.
 */
export function rupeesToPaise(rupees: number): number {
  return Math.round(rupees * 100);
}

export function paiseToRupees(paise: number): number {
  return Math.round(paise / 100);
}

let client: Razorpay | null = null;

export function getRazorpayClient(): Razorpay {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    throw new Error(
      "RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET are not set. Add your Razorpay dashboard keys to .env (see .env.example)."
    );
  }
  if (!client) {
    client = new Razorpay({ key_id: keyId, key_secret: keySecret });
  }
  return client;
}

export async function createRazorpayOrder(params: {
  amountRupees: number;
  receipt: string;
  notes?: Record<string, string>;
}) {
  const razorpay = getRazorpayClient();
  return razorpay.orders.create({
    amount: rupeesToPaise(params.amountRupees),
    currency: "INR",
    receipt: params.receipt,
    notes: params.notes,
  });
}

/**
 * Verifies the signature Razorpay's client-side Checkout returns after a
 * successful payment. This proves the payment_id/order_id pair was genuinely
 * signed by Razorpay with YOUR key_secret — a forged client-side "success"
 * callback cannot pass this check. Order status must only ever be flipped to
 * PAID after this returns true (or after the webhook, see below).
 */
export function verifyPaymentSignature(params: {
  orderId: string;
  paymentId: string;
  signature: string;
}): boolean {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) throw new Error("RAZORPAY_KEY_SECRET is not set.");

  const expected = crypto
    .createHmac("sha256", secret)
    .update(`${params.orderId}|${params.paymentId}`)
    .digest("hex");

  return timingSafeEqualHex(expected, params.signature);
}

/**
 * Verifies the `X-Razorpay-Signature` header on incoming webhook requests
 * against the RAW request body. Webhooks are the source of truth — the
 * client-side redirect can be closed, dropped, or never fire, so the webhook
 * is what actually confirms payment for orders that didn't get a client-side
 * confirmation (network drop, browser closed mid-payment, etc).
 */
export function verifyWebhookSignature(rawBody: string, signature: string): boolean {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) throw new Error("RAZORPAY_WEBHOOK_SECRET is not set.");

  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  return timingSafeEqualHex(expected, signature);
}

function timingSafeEqualHex(a: string, b: string): boolean {
  const bufA = Buffer.from(a, "hex");
  const bufB = Buffer.from(b, "hex");
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}
