import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { verifyPaymentSignature } from "@/lib/razorpay";
import { sendOrderConfirmationEmail } from "@/lib/order-email";
import { ok, fail, unauthorized, notFound, fromZodError, serverError } from "@/lib/api-response";

const schema = z.object({
  orderId: z.string().min(1),
  razorpay_order_id: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return unauthorized();

    const body = await request.json().catch(() => null);
    const parsed = schema.safeParse(body);
    if (!parsed.success) return fromZodError(parsed.error);
    const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = parsed.data;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { payment: true, items: true, user: true },
    });

    if (!order || order.userId !== session.userId) return notFound("Order not found.");
    if (!order.payment || order.payment.providerOrderId !== razorpay_order_id) {
      return fail("This payment doesn't match the order.", 400);
    }

    // Already processed (e.g. the webhook beat us to it) — respond success idempotently.
    if (order.payment.status === "PAID") {
      return ok({ order });
    }

    const signatureValid = verifyPaymentSignature({
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature,
    });

    if (!signatureValid) {
      // Never let a bad signature overwrite a payment that is already PAID.
      await prisma.payment.updateMany({
        where: { orderId: order.id, status: { in: ["PENDING", "FAILED"] } },
        data: { status: "FAILED", failureReason: "Signature verification failed" },
      });
      return fail("Payment verification failed. If you were charged, contact support.", 400);
    }

    const updatedOrder = await prisma.$transaction(async (tx) => {
      const paymentClaim = await tx.payment.updateMany({
        // FAILED is claimable too: Razorpay lets the customer retry on the
        // same order after a failed attempt (e.g. a declined UPI request), and
        // the earlier payment.failed must not block the successful retry.
        where: { id: order.payment!.id, status: { in: ["PENDING", "FAILED"] } },
        data: {
          status: "PAID",
          providerPaymentId: razorpay_payment_id,
          failureReason: null,
        },
      });

      // The webhook may have confirmed the payment between the read above and
      // this transaction. In that case, do not decrement stock a second time.
      if (paymentClaim.count === 0) return null;

      const confirmed = await tx.order.update({
        where: { id: order.id },
        data: { status: "CONFIRMED" },
        include: { items: true },
      });

      for (const item of confirmed.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
        await tx.inventoryLog.create({
          data: {
            productId: item.productId,
            change: -item.quantity,
            reason: "ORDER_PLACED",
            orderId: confirmed.id,
          },
        });
      }

      // Online orders count against a coupon's usage only once actually paid,
      // so abandoned checkouts don't burn limited-use coupons.
      if (confirmed.couponId) {
        await tx.coupon.update({
          where: { id: confirmed.couponId },
          data: { usedCount: { increment: 1 } },
        });
      }

      await tx.cartItem.deleteMany({ where: { userId: session.userId } });

      return confirmed;
    });

    if (!updatedOrder) return ok({ order });

    await sendOrderConfirmationEmail(order.id);

    return ok({ order: updatedOrder });
  } catch (err) {
    return serverError(err);
  }
}
