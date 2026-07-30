import { prisma } from "@/lib/db";
import { requireAdminSession } from "@/lib/auth";
import { ok, forbidden } from "@/lib/api-response";

const PAID_STATUSES = ["CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"] as const;

export async function GET() {
  const session = await requireAdminSession();
  if (!session) return forbidden("Admin access required.");

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [revenueAgg, orderCount, customerCount, pendingCount, lowStock, recentOrders, statusCounts, dailyOrders] =
    await Promise.all([
      prisma.order.aggregate({
        where: { status: { in: [...PAID_STATUSES] } },
        _sum: { total: true },
      }),
      prisma.order.count(),
      prisma.user.count({ where: { role: "CUSTOMER" } }),
      prisma.order.count({ where: { status: "PENDING" } }),
      prisma.product.findMany({
        where: { isActive: true, stock: { lte: 10 } },
        select: { id: true, name: true, stock: true },
        orderBy: { stock: "asc" },
        take: 5,
      }),
      prisma.order.findMany({
        take: 8,
        orderBy: { createdAt: "desc" },
        include: { user: { select: { name: true } } },
      }),
      prisma.order.groupBy({ by: ["status"], _count: { _all: true } }),
      prisma.order.findMany({
        where: { createdAt: { gte: thirtyDaysAgo }, status: { in: [...PAID_STATUSES] } },
        select: { createdAt: true, total: true },
      }),
    ]);

  // Bucket revenue by day for a simple trend chart.
  const revenueByDay = new Map<string, number>();
  for (const order of dailyOrders) {
    const key = order.createdAt.toISOString().slice(0, 10);
    revenueByDay.set(key, (revenueByDay.get(key) ?? 0) + order.total);
  }

  const topProducts = await prisma.orderItem.groupBy({
    by: ["productId", "name"],
    _sum: { quantity: true, price: true },
    orderBy: { _sum: { quantity: "desc" } },
    take: 5,
  });

  return ok({
    totalRevenue: revenueAgg._sum.total ?? 0,
    orderCount,
    customerCount,
    pendingCount,
    lowStock,
    recentOrders,
    statusCounts: statusCounts.map((s) => ({ status: s.status, count: s._count._all })),
    revenueTrend: Array.from(revenueByDay.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, total]) => ({ date, total })),
    topProducts: topProducts.map((p) => ({
      productId: p.productId,
      name: p.name,
      unitsSold: p._sum.quantity ?? 0,
    })),
  });
}
