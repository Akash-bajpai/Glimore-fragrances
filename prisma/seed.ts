import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { products, categories, fragranceCatalog } from "../data/products";

/*
 * Seeding is idempotent and never deletes anything.
 *
 *   npm run db:seed              -> upsert catalog (categories, products, coupons) + ensure admin
 *   tsx prisma/seed.ts --if-empty -> only seed the catalog when the Product table is empty
 *                                   (used automatically by `npm run vercel-build`), + ensure admin
 *
 * Admin account: created ONLY when SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD are both set.
 * An existing user with that email is never modified (password and role are left alone).
 */

const prisma = new PrismaClient();

async function seedCatalog() {
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

  console.log(`Catalog seeded: ${products.length} products, ${categories.length} categories, 3 coupons.`);
}

async function ensureAdmin() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL?.trim().toLowerCase();
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    console.log("[seed] SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD not set - skipping admin account.");
    return;
  }
  if (adminPassword.length < 10 || !/[a-zA-Z]/.test(adminPassword) || !/[0-9]/.test(adminPassword)) {
    console.warn("[seed] SEED_ADMIN_PASSWORD is too weak (need 10+ chars with letters and numbers) - skipping admin account.");
    return;
  }

  const existing = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (existing) {
    if (existing.role !== "ADMIN") {
      console.warn(`[seed] ${adminEmail} already exists as a customer account - not changing it. Use a different SEED_ADMIN_EMAIL.`);
    } else {
      console.log(`[seed] Admin ${adminEmail} already exists - left unchanged.`);
    }
    return;
  }

  await prisma.user.create({
    data: {
      name: "Glimoré Admin",
      email: adminEmail,
      passwordHash: await bcrypt.hash(adminPassword, 12),
      role: "ADMIN",
      emailVerifiedAt: new Date(),
    },
  });
  console.log(`[seed] Admin account created for ${adminEmail}.`);
}

async function main() {
  const ifEmpty = process.argv.includes("--if-empty");

  if (ifEmpty) {
    const productCount = await prisma.product.count();
    if (productCount > 0) {
      console.log(`[seed] Database already has ${productCount} products - catalog seed skipped (existing data untouched).`);
    } else {
      console.log("[seed] Empty database detected - seeding catalog...");
      await seedCatalog();
    }
  } else {
    await seedCatalog();
  }

  await ensureAdmin();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
