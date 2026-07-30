import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { ok, unauthorized } from "@/lib/api-response";

export async function GET() {
  const session = await getSession();
  if (!session) return unauthorized();

  const items = await prisma.cartItem.findMany({
    where: { userId: session.userId },
    include: { product: true },
    orderBy: { createdAt: "asc" },
  });

  return ok(
    items.map((i) => ({
      productId: i.productId,
      quantity: i.quantity,
      product: {
        id: i.product.id,
        name: i.product.name,
        slug: i.product.slug,
        price: i.product.price,
        image: i.product.image,
        stock: i.product.stock,
        isActive: i.product.isActive,
      },
    }))
  );
}
