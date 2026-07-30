import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdminSession } from "@/lib/auth";
import { ok, forbidden } from "@/lib/api-response";
import type { OrderStatus } from "@prisma/client";

export async function GET(request: NextRequest) {
  const session = await requireAdminSession();
  if (!session) return forbidden("Admin access required.");

  const status = request.nextUrl.searchParams.get("status") as OrderStatus | null;
  const page = Math.max(1, Number(request.nextUrl.searchParams.get("page") ?? 1));
  const pageSize = 20;

  const where = status ? { status } : {};

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: { items: true, payment: true, user: { select: { name: true, email: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.order.count({ where }),
  ]);

  return ok({ orders, total, page, pageSize, totalPages: Math.ceil(total / pageSize) });
}
