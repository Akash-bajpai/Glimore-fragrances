import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdminSession } from "@/lib/auth";
import { ok, forbidden, notFound, fromZodError, serverError } from "@/lib/api-response";

const updateSchema = z.object({
  description: z.string().trim().max(200).optional(),
  discountType: z.enum(["PERCENT", "FLAT"]).optional(),
  discountValue: z.number().int().positive().optional(),
  minOrderValue: z.number().int().min(0).optional(),
  maxDiscount: z.number().int().positive().nullable().optional(),
  usageLimit: z.number().int().positive().nullable().optional(),
  isActive: z.boolean().optional(),
  expiresAt: z.string().datetime().nullable().optional(),
});

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireAdminSession();
    if (!session) return forbidden("Admin access required.");

    const existing = await prisma.coupon.findUnique({ where: { id: params.id } });
    if (!existing) return notFound("Coupon not found.");

    const body = await request.json().catch(() => null);
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) return fromZodError(parsed.error);

    const updated = await prisma.coupon.update({
      where: { id: params.id },
      data: {
        ...parsed.data,
        expiresAt: parsed.data.expiresAt !== undefined
          ? (parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : null)
          : undefined,
      },
    });
    return ok(updated);
  } catch (err) {
    return serverError(err);
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireAdminSession();
  if (!session) return forbidden("Admin access required.");

  const existing = await prisma.coupon.findUnique({ where: { id: params.id } });
  if (!existing) return notFound("Coupon not found.");

  await prisma.coupon.delete({ where: { id: params.id } });
  return ok({ deleted: true });
}
