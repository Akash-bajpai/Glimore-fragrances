import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { verifyPaymentSignature } from "@/lib/razorpay";
import { sendEmail, orderConfirmationEmailHtml } from "@/lib/email";
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
      await prisma.payment.update({
        where: { orderId: order.id },
        data: { status: "FAILED", failureReason: "Signature verification failed" },
      });
      return fail("Payment verification failed. If you were charged, contact support.", 400);
    }

    const updatedOrder = await prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { orderId: order.id },
        data: {
          status: "PAID",
          providerPaymentId: razorpay_payment_id,
        },
      });

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

      await tx.cartItem.deleteMany({ where: { userId: session.userId } });

      return confirmed;
    });

    sendEmail({
      to: order.user.email,
      subject: `Order confirmed — ${order.orderNumber}`,
      html: orderConfirmationEmailHtml({
        name: order.user.name,
        orderNumber: order.orderNumber,
        total: order.total,
      }),
    }).catch(() => {});

    return ok({ order: updatedOrder });
  } catch (err) {
    return serverError(err);
  }
}
