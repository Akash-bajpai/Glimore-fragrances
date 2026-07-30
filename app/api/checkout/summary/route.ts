import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { calculateOrderPricing, validatePincode, estimatedDeliveryDate } from "@/lib/pricing";
import { ok, fail, unauthorized, fromZodError, serverError } from "@/lib/api-response";

const schema = z.object({
  pincode: z.string().optional(),
  couponCode: z.string().trim().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return unauthorized();

    const body = await request.json().catch(() => ({}));
    const parsed = schema.safeParse(body);
    if (!parsed.success) return fromZodError(parsed.error);

    const cartItems = await prisma.cartItem.findMany({
      where: { userId: session.userId },
      include: { product: true },
    });

    if (cartItems.length === 0) return fail("Your cart is empty.", 400);

    const unavailable = cartItems.filter((c) => !c.product.isActive || c.product.stock < c.quantity);
    if (unavailable.length > 0) {
      return fail(
        `Some items in your cart are no longer available in the requested quantity: ${unavailable
          .map((u) => u.product.name)
          .join(", ")}`,
        409
      );
    }

    let coupon = null;
    if (parsed.data.couponCode) {
      coupon = await prisma.coupon.findUnique({
        where: { code: parsed.data.couponCode.toUpperCase() },
      });
    }

    let serviceable = true;
    let estimatedDelivery: Date | null = null;
    if (parsed.data.pincode) {
      const pin = validatePincode(parsed.data.pincode);
      if (!pin.valid) return fail("Enter a valid 6-digit PIN code.", 422);
      serviceable = pin.serviceable;
      estimatedDelivery = serviceable ? estimatedDeliveryDate(parsed.data.pincode) : null;
    }

    const lines = cartItems.map((c) => ({
      productId: c.productId,
      name: c.product.name,
      image: c.product.image,
      price: c.product.price,
      quantity: c.quantity,
    }));

    const pricing = calculateOrderPricing(lines, coupon, serviceable);

    return ok({
      items: lines,
      pricing,
      serviceable,
      estimatedDelivery,
      couponApplied: coupon ? coupon.code : null,
    });
  } catch (err) {
    return serverError(err);
  }
}
