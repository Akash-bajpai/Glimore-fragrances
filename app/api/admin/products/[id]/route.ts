import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdminSession } from "@/lib/auth";
import { ok, forbidden, notFound, fromZodError, serverError } from "@/lib/api-response";

const updateSchema = z.object({
  name: z.string().trim().min(2).max(150).optional(),
  tagline: z.string().trim().max(200).optional(),
  description: z.string().trim().min(10).optional(),
  price: z.number().int().positive().optional(),
  compareAtPrice: z.number().int().positive().nullable().optional(),
  categoryId: z.string().nullable().optional(),
  collection: z.string().trim().max(100).optional(),
  badge: z.string().trim().max(40).nullable().optional(),
  image: z.string().trim().min(1).optional(),
  gallery: z.array(z.string()).optional(),
  notesTop: z.array(z.string()).optional(),
  notesHeart: z.array(z.string()).optional(),
  notesBase: z.array(z.string()).optional(),
  burnTime: z.string().trim().max(50).optional(),
  weight: z.string().trim().max(50).optional(),
  vessel: z.string().trim().max(100).optional(),
  stock: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireAdminSession();
    if (!session) return forbidden("Admin access required.");

    const existing = await prisma.product.findUnique({ where: { id: params.id } });
    if (!existing) return notFound("Product not found.");

    const body = await request.json().catch(() => null);
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) return fromZodError(parsed.error);

    const updated = await prisma.product.update({ where: { id: params.id }, data: parsed.data });
    return ok(updated);
  } catch (err) {
    return serverError(err);
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireAdminSession();
    if (!session) return forbidden("Admin access required.");

    const existing = await prisma.product.findUnique({ where: { id: params.id } });
    if (!existing) return notFound("Product not found.");

    // Soft-delete: keep historical OrderItem snapshots intact rather than
    // cascading a hard delete through past orders.
    await prisma.product.update({ where: { id: params.id }, data: { isActive: false } });
    return ok({ deactivated: true });
  } catch (err) {
    return serverError(err);
  }
}
