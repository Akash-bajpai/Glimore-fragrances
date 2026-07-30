import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { ok, unauthorized } from "@/lib/api-response";

export async function GET() {
  const session = await getSession();
  if (!session) return unauthorized();

  const orders = await prisma.order.findMany({
    where: { userId: session.userId },
    include: { items: true, payment: true },
    orderBy: { createdAt: "desc" },
  });

  return ok(orders);
}
