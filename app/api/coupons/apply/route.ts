import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { calculateSubtotal, calculateDiscount } from "@/lib/pricing";
import { ok, fail, unauthorized, fromZodError, serverError, tooManyRequests } from "@/lib/api-response";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

const schema = z.object({ code: z.string().trim().min(1).max(40) });

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return unauthorized();

    const ip = getClientIp(request);
    const limit = rateLimit(`coupon-apply:${ip}`, 20, 10 * 60 * 1000);
    if (!limit.success) return tooManyRequests();

    const body = await request.json().catch(() => null);
    const parsed = schema.safeParse(body);
    if (!parsed.success) return fromZodError(parsed.error);

    const coupon = await prisma.coupon.findUnique({
      where: { code: parsed.data.code.toUpperCase() },
    });

    if (!coupon || !coupon.isActive) return fail("This coupon code is invalid.", 404);
    if (coupon.expiresAt && coupon.expiresAt.getTime() < Date.now()) {
      return fail("This coupon has expired.", 400);
    }
    if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
      return fail("This coupon has reached its usage limit.", 400);
    }

    const cartItems = await prisma.cartItem.findMany({
      where: { userId: session.userId },
      include: { product: true },
    });

    if (cartItems.length === 0) return fail("Your cart is empty.", 400);

    const subtotal = calculateSubtotal(
      cartItems.map((c) => ({
        productId: c.productId,
        name: c.product.name,
        image: c.product.image,
        price: c.product.price,
        quantity: c.quantity,
      }))
    );

    if (subtotal < coupon.minOrderValue) {
      return fail(`This coupon requires a minimum order of ₹${coupon.minOrderValue}.`, 400);
    }

    const discountAmount = calculateDiscount(subtotal, coupon);

    return ok({
      code: coupon.code,
      discountAmount,
      description: coupon.description,
    });
  } catch (err) {
    return serverError(err);
  }
}
