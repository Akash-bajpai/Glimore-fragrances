import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdminSession } from "@/lib/auth";
import { ok, forbidden, fromZodError, serverError, fail } from "@/lib/api-response";

const productSchema = z.object({
  name: z.string().trim().min(2).max(150),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers and hyphens."),
  tagline: z.string().trim().max(200).optional(),
  description: z.string().trim().min(10),
  price: z.number().int().positive(),
  compareAtPrice: z.number().int().positive().optional().nullable(),
  categoryId: z.string().optional().nullable(),
  collection: z.string().trim().max(100).optional(),
  badge: z.string().trim().max(40).optional(),
  image: z.string().trim().min(1),
  gallery: z.array(z.string()).default([]),
  notesTop: z.array(z.string()).default([]),
  notesHeart: z.array(z.string()).default([]),
  notesBase: z.array(z.string()).default([]),
  burnTime: z.string().trim().max(50).optional(),
  weight: z.string().trim().max(50).optional(),
  vessel: z.string().trim().max(100).optional(),
  stock: z.number().int().min(0),
  isActive: z.boolean().default(true),
});

export async function GET(request: NextRequest) {
  const session = await requireAdminSession();
  if (!session) return forbidden("Admin access required.");

  const search = request.nextUrl.searchParams.get("q");

  const products = await prisma.product.findMany({
    where: search
      ? { name: { contains: search, mode: "insensitive" } }
      : undefined,
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });

  return ok(products);
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAdminSession();
    if (!session) return forbidden("Admin access required.");

    const body = await request.json().catch(() => null);
    const parsed = productSchema.safeParse(body);
    if (!parsed.success) return fromZodError(parsed.error);

    const slugTaken = await prisma.product.findUnique({ where: { slug: parsed.data.slug } });
    if (slugTaken) return fail("A product with this slug already exists.", 409);

    const product = await prisma.product.create({ data: parsed.data });
    return ok(product, 201);
  } catch (err) {
    return serverError(err);
  }
}
