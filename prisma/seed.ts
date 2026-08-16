import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { products, categories, fragranceCatalog } from "../data/products";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding categories...");
  const createdCategories = await Promise.all(
    categories.map((c) =>
      prisma.category.upsert({
        where: { slug: c.slug },
        update: { name: c.name },
        create: { name: c.name, slug: c.slug },
      })
    )
  );

  const getCategoryId = (categoryName: string) => {
    const found = createdCategories.find(
      (c) => c.name.toLowerCase() === categoryName.toLowerCase()
    );
    return found ? found.id : createdCategories[0].id;
  };

  console.log(`Seeding ${products.length} catalog products...`);
  for (const p of products) {
    const categoryId = getCategoryId(p.category);
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {
        name: p.name,
        tagline: p.tagline ?? null,
        description: p.description,
        price: p.price,
        compareAtPrice: p.compareAtPrice ?? null,
        sku: p.sku ?? null,
        categoryId,
        collection: p.collection ?? null,
        subcategory: p.subcategory ?? null,
        badge: p.badge ?? null,
        image: p.image,
        gallery: p.gallery,
        fragrance: p.fragrance ?? null,
        fragranceProfile: p.fragranceProfile ?? null,
        mood: p.mood ?? null,
        capacity: p.capacity ?? null,
        burnTime: p.burnTime ?? null,
        containerType: p.containerType ?? null,
        weight: p.weight ?? null,
        vessel: p.vessel ?? null,
        colors: p.colors ?? [],
        careInstructions: p.careInstructions ?? null,
        usageInstructions: p.usageInstructions ?? null,
        kitIncludes: p.kitIncludes ?? null,
        stock: p.stock ?? 50,
        isActive: true,
        rating: p.rating,
        reviewCount: p.reviewCount,
        notesTop: p.notes?.top ?? [],
        notesHeart: p.notes?.heart ?? [],
        notesBase: p.notes?.base ?? [],
      },
      create: {
        name: p.name,
        slug: p.slug,
        tagline: p.tagline ?? null,
        description: p.description,
        price: p.price,
        compareAtPrice: p.compareAtPrice ?? null,
        sku: p.sku ?? null,
        categoryId,
        collection: p.collection ?? null,
        subcategory: p.subcategory ?? null,
        badge: p.badge ?? null,
        image: p.image,
        gallery: p.gallery,
        fragrance: p.fragrance ?? null,
        fragranceProfile: p.fragranceProfile ?? null,
        mood: p.mood ?? null,
        capacity: p.capacity ?? null,
        burnTime: p.burnTime ?? null,
        containerType: p.containerType ?? null,
        weight: p.weight ?? null,
        vessel: p.vessel ?? null,
        colors: p.colors ?? [],
        careInstructions: p.careInstructions ?? null,
        usageInstructions: p.usageInstructions ?? null,
        kitIncludes: p.kitIncludes ?? null,
        stock: p.stock ?? 50,
        isActive: true,
        rating: p.rating,
        reviewCount: p.reviewCount,
        notesTop: p.notes?.top ?? [],
        notesHeart: p.notes?.heart ?? [],
        notesBase: p.notes?.base ?? [],
      },
    });
  }

  console.log("Seeding promotional coupons...");
  await prisma.coupon.upsert({
    where: { code: "WELCOME10" },
    update: {},
    create: {
      code: "WELCOME10",
      description: "10% off your first luxury fragrance order",
      discountType: "PERCENT",
      discountValue: 10,
      minOrderValue: 0,
      maxDiscount: 500,
      usageLimit: null,
    },
  });

  await prisma.coupon.upsert({
    where: { code: "GLIMORE200" },
    update: {},
    create: {
      code: "GLIMORE200",
      description: "Flat ₹200 off on orders above ₹1,499",
      discountType: "FLAT",
      discountValue: 200,
      minOrderValue: 1499,
      usageLimit: 1000,
    },
  });

  await prisma.coupon.upsert({
    where: { code: "FESTIVE15" },
    update: {},
    create: {
      code: "FESTIVE15",
      description: "15% off festive gift collections",
      discountType: "PERCENT",
      discountValue: 15,
      minOrderValue: 1999,
      maxDiscount: 800,
      usageLimit: 500,
    },
  });

  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "admin@glimorefragrances.com";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "ChangeMe123!";

  console.log(`Seeding admin account (${adminEmail})...`);
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      name: "Glimoré Admin",
      email: adminEmail,
      passwordHash: await bcrypt.hash(adminPassword, 12),
      role: "ADMIN",
    },
  });

  console.log(`Seed complete: ${products.length} products, 5 categories, 3 coupons seeded.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
