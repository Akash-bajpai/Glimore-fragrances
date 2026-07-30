import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { ok, unauthorized, notFound } from "@/lib/api-response";

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return unauthorized();

  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: {
      items: true,
      payment: true,
      shippingAddress: true,
      billingAddress: true,
      coupon: true,
    },
  });

  if (!order) return notFound("Order not found.");
  if (order.userId !== session.userId && session.role !== "ADMIN") {
    return notFound("Order not found.");
  }

  return ok(order);
}
