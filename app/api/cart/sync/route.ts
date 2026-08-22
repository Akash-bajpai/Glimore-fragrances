import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { ok, unauthorized, fromZodError, serverError } from "@/lib/api-response";

const schema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.number().int().min(1).max(20),
        fragrance: z.string().optional().nullable(),
        color: z.string().optional().nullable(),
        variant: z.string().optional().nullable(),
      })
    )
    .max(50),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return unauthorized();

    const body = await request.json().catch(() => null);
    const parsed = schema.safeParse(body);
    if (!parsed.success) return fromZodError(parsed.error);

    const productIds = parsed.data.items.map((i) => i.productId);
    const validProducts = await prisma.product.findMany({
      where: { id: { in: productIds }, isActive: true },
      select: { id: true },
    });
    const validIds = new Set(validProducts.map((p) => p.id));

    await prisma.$transaction([
      prisma.cartItem.deleteMany({ where: { userId: session.userId } }),
      prisma.cartItem.createMany({
        data: parsed.data.items
          .filter((i) => validIds.has(i.productId))
          .map((i) => ({
            userId: session.userId,
            productId: i.productId,
            quantity: i.quantity,
            fragrance: i.fragrance || null,
            color: i.color || null,
            variant: i.variant || null,
          })),
      }),
    ]);

    return ok({ synced: true });
  } catch (err) {
    return serverError(err);
  }
}
