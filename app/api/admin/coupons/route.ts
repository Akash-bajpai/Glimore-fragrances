import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdminSession } from "@/lib/auth";
import { ok, forbidden, fromZodError, serverError, fail } from "@/lib/api-response";

const couponSchema = z.object({
  code: z.string().trim().toUpperCase().min(3).max(30),
  description: z.string().trim().max(200).optional(),
  discountType: z.enum(["PERCENT", "FLAT"]),
  discountValue: z.number().int().positive(),
  minOrderValue: z.number().int().min(0).default(0),
  maxDiscount: z.number().int().positive().optional().nullable(),
  usageLimit: z.number().int().positive().optional().nullable(),
  isActive: z.boolean().default(true),
  expiresAt: z.string().datetime().optional().nullable(),
});

export async function GET() {
  const session = await requireAdminSession();
  if (!session) return forbidden("Admin access required.");

  const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });
  return ok(coupons);
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAdminSession();
    if (!session) return forbidden("Admin access required.");

    const body = await request.json().catch(() => null);
    const parsed = couponSchema.safeParse(body);
    if (!parsed.success) return fromZodError(parsed.error);

    const existing = await prisma.coupon.findUnique({ where: { code: parsed.data.code } });
    if (existing) return fail("A coupon with this code already exists.", 409);

    const coupon = await prisma.coupon.create({
      data: {
        ...parsed.data,
        expiresAt: parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : null,
      },
    });
    return ok(coupon, 201);
  } catch (err) {
    return serverError(err);
  }
}
