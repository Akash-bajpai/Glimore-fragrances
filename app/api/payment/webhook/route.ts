import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyWebhookSignature } from "@/lib/razorpay";
import { sendEmail, orderConfirmationEmailHtml } from "@/lib/email";

/**
 * Razorpay webhook endpoint. This is deliberately NOT behind session auth —
 * Razorpay's servers call this directly, so the ONLY trust boundary is the
 * HMAC signature below. Configure this URL in Razorpay Dashboard → Settings
 * → Webhooks, pointing at {APP_URL}/api/payment/webhook, and select at least
 * the `payment.captured` and `payment.failed` events.
 *
 * This exists because the client-side /api/payment/verify call can simply
 * never happen (tab closed mid-payment, network drop after paying) — the
 * webhook is what guarantees an order eventually reflects reality even then.
 */
export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-razorpay-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let validSignature: boolean;
  try {
    validSignature = verifyWebhookSignature(rawBody, signature);
  } catch (err) {
    console.error("[webhook] signature check errored:", err);
    return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
  }

  if (!validSignature) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  let event: any;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  try {
    if (event.event === "payment.captured" || event.event === "order.paid") {
      const paymentEntity = event.payload?.payment?.entity;
      const razorpayOrderId: string | undefined = paymentEntity?.order_id;
      const razorpayPaymentId: string | undefined = paymentEntity?.id;
      if (!razorpayOrderId) return NextResponse.json({ received: true });

      await confirmPaymentByProviderOrderId(razorpayOrderId, razorpayPaymentId);
    }

    if (event.event === "payment.failed") {
      const paymentEntity = event.payload?.payment?.entity;
      const razorpayOrderId: string | undefined = paymentEntity?.order_id;
      if (razorpayOrderId) {
        await prisma.payment.updateMany({
          where: { providerOrderId: razorpayOrderId, status: "PENDING" },
          data: { status: "FAILED", failureReason: paymentEntity?.error_description ?? "Payment failed" },
        });
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("[webhook] processing error:", err);
    // Still 200 so Razorpay doesn't hammer retries for a bug on our side that
    // a retry won't fix; the error is logged for investigation.
    return NextResponse.json({ received: true, note: "logged for review" });
  }
}

async function confirmPaymentByProviderOrderId(razorpayOrderId: string, razorpayPaymentId?: string) {
  const payment = await prisma.payment.findUnique({
    where: { providerOrderId: razorpayOrderId },
    include: { order: { include: { items: true, user: true } } },
  });

  if (!payment) {
    console.warn(`[webhook] No local payment found for Razorpay order ${razorpayOrderId}`);
    return;
  }

  // Idempotent — if /api/payment/verify already handled this, do nothing.
  if (payment.status === "PAID") return;

  const confirmed = await prisma.$transaction(async (tx) => {
    const paymentClaim = await tx.payment.updateMany({
      where: { id: payment.id, status: "PENDING" },
      data: { status: "PAID", providerPaymentId: razorpayPaymentId },
    });

    // A client verification request may have won the race. Treat the webhook
    // as an idempotent acknowledgement rather than touching stock again.
    if (paymentClaim.count === 0) return false;

    await tx.order.update({ where: { id: payment.orderId }, data: { status: "CONFIRMED" } });

    for (const item of payment.order.items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
      await tx.inventoryLog.create({
        data: {
          productId: item.productId,
          change: -item.quantity,
          reason: "ORDER_PLACED",
          orderId: payment.orderId,
        },
      });
    }

    await tx.cartItem.deleteMany({ where: { userId: payment.order.userId } });
    return true;
  });

  if (!confirmed) return;

  sendEmail({
    to: payment.order.user.email,
    subject: `Order confirmed — ${payment.order.orderNumber}`,
    html: orderConfirmationEmailHtml({
      name: payment.order.user.name,
      orderNumber: payment.order.orderNumber,
      total: payment.order.total,
    }),
  }).catch(() => {});
}
