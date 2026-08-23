import { NextRequest } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { calculateOrderPricing, validatePincode, estimatedDeliveryDate } from "@/lib/pricing";
import { createRazorpayOrder } from "@/lib/razorpay";
import { sendEmail, orderConfirmationEmailHtml } from "@/lib/email";
import { ok, fail, unauthorized, fromZodError, serverError, tooManyRequests } from "@/lib/api-response";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

const schema = z.object({
  shippingAddressId: z.string().min(1),
  billingAddressId: z.string().min(1),
  paymentMethod: z.enum(["CARD", "UPI", "NETBANKING", "WALLET", "COD"]),
  notes: z.string().trim().max(500).optional(),
  couponCode: z.string().trim().optional(),
});

function generateOrderNumber() {
  const date = new Date();
  const stamp = `${date.getFullYear().toString().slice(2)}${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}`;
  const random = crypto.randomBytes(3).toString("hex").toUpperCase();
  return `GLM-${stamp}-${random}`;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return unauthorized();

    const ip = getClientIp(request);
    const limit = rateLimit(`order-create:${session.userId}:${ip}`, 10, 10 * 60 * 1000);
    if (!limit.success) return tooManyRequests("Too many order attempts. Please wait a moment.");

    const body = await request.json().catch(() => null);
    const parsed = schema.safeParse(body);
    if (!parsed.success) return fromZodError(parsed.error);
    const { shippingAddressId, billingAddressId, paymentMethod, notes, couponCode } = parsed.data;

    const [shippingAddress, billingAddress] = await Promise.all([
      prisma.address.findUnique({ where: { id: shippingAddressId } }),
      prisma.address.findUnique({ where: { id: billingAddressId } }),
    ]);

    if (!shippingAddress || shippingAddress.userId !== session.userId) {
      return fail("Shipping address not found.", 404);
    }
    if (!billingAddress || billingAddress.userId !== session.userId) {
      return fail("Billing address not found.", 404);
    }

    const pin = validatePincode(shippingAddress.pincode);
    if (!pin.valid || !pin.serviceable) {
      return fail("We currently can't deliver to this PIN code.", 422);
    }

    const cartItems = await prisma.cartItem.findMany({
      where: { userId: session.userId },
      include: { product: true },
    });
    if (cartItems.length === 0) return fail("Your cart is empty.", 400);

    const unavailable = cartItems.filter((c) => !c.product.isActive || c.product.stock < c.quantity);
    if (unavailable.length > 0) {
      return fail(
        `Some items are no longer available in the requested quantity: ${unavailable
          .map((u) => u.product.name)
          .join(", ")}`,
        409
      );
    }

    let coupon = couponCode
      ? await prisma.coupon.findUnique({ where: { code: couponCode.toUpperCase() } })
      : null;

    const lines = cartItems.map((c) => ({
      productId: c.productId,
      name: c.product.name,
      image: c.product.image,
      price: c.product.price,
      quantity: c.quantity,
    }));

    const pricing = calculateOrderPricing(lines, coupon, pin.serviceable);
    const orderNumber = generateOrderNumber();
    const estimatedDelivery = estimatedDeliveryDate(shippingAddress.pincode);

    const isCod = paymentMethod === "COD";

    if (
      !isCod &&
      (!process.env.RAZORPAY_KEY_ID ||
        !process.env.RAZORPAY_KEY_SECRET ||
        !process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID)
    ) {
      return fail("Online payments are not configured yet. Please choose Cash on Delivery or contact support.", 503);
    }

    const order = await prisma.$transaction(async (tx) => {
      const created = await tx.order.create({
        data: {
          orderNumber,
          userId: session.userId,
          shippingAddressId,
          billingAddressId,
          subtotal: pricing.subtotal,
          shippingCharge: pricing.shippingCharge,
          taxAmount: pricing.taxAmount,
          discountAmount: pricing.discountAmount,
          total: pricing.total,
          couponId: coupon?.id,
          notes,
          status: isCod ? "CONFIRMED" : "PENDING",
          paymentMethod,
          estimatedDelivery,
          items: {
            create: lines.map((l) => ({
              productId: l.productId,
              name: l.name,
              image: l.image,
              price: l.price,
              quantity: l.quantity,
            })),
          },
          payment: {
            create: {
              amount: pricing.total,
              method: paymentMethod,
              status: isCod ? "PENDING" : "PENDING",
            },
          },
        },
        include: { items: true, payment: true },
      });

      if (coupon) {
        await tx.coupon.update({
          where: { id: coupon.id },
          data: { usedCount: { increment: 1 } },
        });
      }

      // COD orders are confirmed immediately — decrement stock now.
      // Online-payment orders decrement stock only once payment is verified
      // (see /api/payment/verify and /api/payment/webhook) so an abandoned
      // checkout doesn't lock up inventory indefinitely.
      if (isCod) {
        for (const line of lines) {
          await tx.product.update({
            where: { id: line.productId },
            data: { stock: { decrement: line.quantity } },
          });
          await tx.inventoryLog.create({
            data: {
              productId: line.productId,
              change: -line.quantity,
              reason: "ORDER_PLACED",
              orderId: created.id,
            },
          });
        }
        await tx.cartItem.deleteMany({ where: { userId: session.userId } });
      }

      return created;
    });

    if (isCod) {
      const user = await prisma.user.findUnique({ where: { id: session.userId } });
      if (user) {
        sendEmail({
          to: user.email,
          subject: `Order confirmed — ${order.orderNumber}`,
          html: orderConfirmationEmailHtml({
            name: user.name,
            orderNumber: order.orderNumber,
            total: order.total,
          }),
        }).catch(() => {});
      }

      return ok({ order, razorpay: null }, 201);
    }

    // Online payment: create the matching Razorpay order and hand the client
    // what it needs to open Razorpay Checkout. Nothing is confirmed yet —
    // /api/payment/verify (or the webhook) is what actually flips this to PAID.
    const razorpayOrder = await createRazorpayOrder({
      amountRupees: pricing.total,
      receipt: order.orderNumber,
      notes: { orderId: order.id, userId: session.userId },
    });

    await prisma.payment.update({
      where: { orderId: order.id },
      data: { providerOrderId: razorpayOrder.id },
    });

    return ok(
      {
        order,
        razorpay: {
          orderId: razorpayOrder.id,
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
          keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        },
      },
      201
    );
  } catch (err) {
    return serverError(err);
  }
}
