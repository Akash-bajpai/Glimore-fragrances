import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdminSession } from "@/lib/auth";
import { ok, forbidden } from "@/lib/api-response";

export async function GET(request: NextRequest) {
  const session = await requireAdminSession();
  if (!session) return forbidden("Admin access required.");

  const search = request.nextUrl.searchParams.get("q");

  const customers = await prisma.user.findMany({
    where: search
      ? { OR: [{ name: { contains: search, mode: "insensitive" } }, { email: { contains: search, mode: "insensitive" } }] }
      : { role: "CUSTOMER" },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      createdAt: true,
      _count: { select: { orders: true } },
      orders: { select: { total: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const withSpend = customers.map((c) => ({
    id: c.id,
    name: c.name,
    email: c.email,
    phone: c.phone,
    createdAt: c.createdAt,
    orderCount: c._count.orders,
    totalSpend: c.orders.reduce((sum: number, o: { total: number }) => sum + o.total, 0),
  }));

  return ok(withSpend);
}
