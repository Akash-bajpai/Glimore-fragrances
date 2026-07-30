import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdminSession } from "@/lib/auth";
import { ok, forbidden, notFound, fromZodError, serverError } from "@/lib/api-response";

const schema = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"]),
});

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireAdminSession();
    if (!session) return forbidden("Admin access required.");

    const existing = await prisma.order.findUnique({ where: { id: params.id }, include: { items: true } });
    if (!existing) return notFound("Order not found.");

    const body = await request.json().catch(() => null);
    const parsed = schema.safeParse(body);
    if (!parsed.success) return fromZodError(parsed.error);

    // Restock inventory if an order moves into CANCELLED/REFUNDED from a
    // confirmed state, so cancellations don't silently strand stock as "sold".
    const isReversal =
      ["CANCELLED", "REFUNDED"].includes(parsed.data.status) &&
      !["CANCELLED", "REFUNDED"].includes(existing.status);

    const updated = await prisma.$transaction(async (tx) => {
      const order = await tx.order.update({
        where: { id: params.id },
        data: { status: parsed.data.status },
      });

      if (isReversal) {
        for (const item of existing.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          });
          await tx.inventoryLog.create({
            data: {
              productId: item.productId,
              change: item.quantity,
              reason: "ORDER_CANCELLED",
              orderId: order.id,
            },
          });
        }
      }

      return order;
    });

    return ok(updated);
  } catch (err) {
    return serverError(err);
  }
}
