import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { ok, unauthorized, fromZodError, serverError } from "@/lib/api-response";

export async function GET() {
  const session = await getSession();
  if (!session) return unauthorized();

  const items = await prisma.wishlistItem.findMany({
    where: { userId: session.userId },
    include: { product: true },
    orderBy: { createdAt: "desc" },
  });

  return ok(items.map((i) => i.product));
}

const schema = z.object({ productId: z.string().min(1) });

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return unauthorized();

    const body = await request.json().catch(() => null);
    const parsed = schema.safeParse(body);
    if (!parsed.success) return fromZodError(parsed.error);

    const existing = await prisma.wishlistItem.findUnique({
      where: { userId_productId: { userId: session.userId, productId: parsed.data.productId } },
    });

    if (existing) {
      await prisma.wishlistItem.delete({ where: { id: existing.id } });
      return ok({ wishlisted: false });
    }

    await prisma.wishlistItem.create({
      data: { userId: session.userId, productId: parsed.data.productId },
    });
    return ok({ wishlisted: true });
  } catch (err) {
    return serverError(err);
  }
}
