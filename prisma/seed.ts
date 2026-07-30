import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const categories = await Promise.all(
    ["Luxury Candles", "Gift Sets", "Home Fragrance", "Seasonal Collection", "New Arrivals"].map(
      (name) =>
        prisma.category.upsert({
          where: { slug: slugify(name) },
          update: {},
          create: { name, slug: slugify(name) },
        })
    )
  );

  const byName = (name: string) => categories.find((c) => c.name === name)!.id;

  const products = [
    {
      name: "Royal Rose Bloom",
      slug: "royal-rose-bloom",
      tagline: "A rose garden, held in glass.",
      description:
        "Petals of Bulgarian rose unfurl over a hush of peony and musk. Poured into a hand-ribbed rose jar and finished with a scattering of pearls.",
      price: 1899,
      compareAtPrice: 2199,
      categoryId: byName("Luxury Candles"),
      collection: "Floral Reverie",
      badge: "Bestseller",
      image: "/images/products/royal-rose-bloom-pearl.jpg",
      gallery: ["/images/products/royal-rose-bloom-pearl.jpg", "/images/products/royal-rose-bloom-flower.jpg"],
      notesTop: ["Bulgarian Rose", "Pink Pepper"],
      notesHeart: ["Peony", "Lily of the Valley"],
      notesBase: ["Soft Musk", "White Amber"],
      burnTime: "40+ hours",
      weight: "220g",
      vessel: "Hand-ribbed rose glass jar",
      stock: 48,
      rating: 4.9,
      reviewCount: 128,
    },
    {
      name: "Velvet Ylang",
      slug: "velvet-ylang",
      tagline: "Warm florals, wrapped in sandalwood.",
      description:
        "Ylang ylang, sun-warmed and heady, settles into sandalwood and a low glow of amber. Gilded with pearls beneath a mango-wood lid.",
      price: 1699,
      categoryId: byName("Luxury Candles"),
      collection: "Golden Warmth",
      badge: "Bestseller",
      image: "/images/products/velvet-ylang-a.jpg",
      gallery: ["/images/products/velvet-ylang-a.jpg", "/images/products/velvet-ylang-b.jpg"],
      notesTop: ["Ylang Ylang", "Bergamot"],
      notesHeart: ["Sandalwood", "Jasmine Petal"],
      notesBase: ["Warm Amber", "Golden Vanilla"],
      burnTime: "45+ hours",
      weight: "210g",
      vessel: "Blown glass jar, mango-wood lid",
      stock: 35,
      rating: 4.8,
      reviewCount: 94,
    },
    {
      name: "Azure Breeze",
      slug: "azure-breeze",
      tagline: "Salt air, pressed into wax.",
      description:
        "A cool wash of sea salt and blue lotus over pale driftwood, poured into a hand-painted mandala tin.",
      price: 1599,
      categoryId: byName("Home Fragrance"),
      collection: "Coastal Calm",
      badge: "New",
      image: "/images/products/azure-breeze.jpg",
      gallery: ["/images/products/azure-breeze.jpg"],
      notesTop: ["Sea Salt", "Bergamot"],
      notesHeart: ["Blue Lotus", "Water Lily"],
      notesBase: ["Driftwood", "White Musk"],
      burnTime: "35+ hours",
      weight: "180g",
      vessel: "Hand-painted mandala tin",
      stock: 22,
      rating: 4.7,
      reviewCount: 61,
    },
    {
      name: "Oudwood Reserve",
      slug: "oudwood-reserve",
      tagline: "Dark wood, low light, long evenings.",
      description:
        "Our most intense pour — rare oud and cedar smoulder into dark amber and leather inside a frosted amber apothecary jar.",
      price: 2199,
      compareAtPrice: 2499,
      categoryId: byName("Luxury Candles"),
      collection: "Woods & Amber",
      badge: "Limited Edition",
      image: "/images/products/oudwood-reserve.jpg",
      gallery: ["/images/products/oudwood-reserve.jpg"],
      notesTop: ["Smoked Cardamom", "Saffron"],
      notesHeart: ["Oud", "Cedarwood"],
      notesBase: ["Dark Amber", "Supple Leather"],
      burnTime: "50+ hours",
      weight: "230g",
      vessel: "Frosted amber jar, brass lid",
      stock: 18,
      rating: 5.0,
      reviewCount: 76,
    },
    {
      name: "Vanilla Velvet",
      slug: "vanilla-velvet",
      tagline: "Whipped vanilla, slow and soft.",
      description:
        "Madagascar vanilla whipped soft with tonka bean and a hush of sandalwood, poured into a smoked-lilac glass jar.",
      price: 1499,
      categoryId: byName("Gift Sets"),
      collection: "Golden Warmth",
      badge: "Bestseller",
      image: "/images/products/vanilla-velvet.jpg",
      gallery: ["/images/products/vanilla-velvet.jpg"],
      notesTop: ["Madagascar Vanilla", "Tonka Bean"],
      notesHeart: ["Whipped Cream Accord", "Heliotrope"],
      notesBase: ["Golden Musk", "Sandalwood"],
      burnTime: "42+ hours",
      weight: "200g",
      vessel: "Smoked lilac glass jar",
      stock: 60,
      rating: 4.8,
      reviewCount: 143,
    },
  ];

  for (const p of products) {
    await prisma.product.upsert({ where: { slug: p.slug }, update: p, create: p });
  }

  await prisma.coupon.upsert({
    where: { code: "WELCOME10" },
    update: {},
    create: {
      code: "WELCOME10",
      description: "10% off your first order",
      discountType: "PERCENT",
      discountValue: 10,
      minOrderValue: 0,
      maxDiscount: 500,
      usageLimit: null,
    },
  });

  await prisma.coupon.upsert({
    where: { code: "FLAT200" },
    update: {},
    create: {
      code: "FLAT200",
      description: "Flat ₹200 off orders above ₹1999",
      discountType: "FLAT",
      discountValue: 200,
      minOrderValue: 1999,
      usageLimit: 500,
    },
  });

  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "admin@glimorefragrances.com";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "ChangeMe123!";

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

  console.log(`Seed complete. Admin login: ${adminEmail} / (see SEED_ADMIN_PASSWORD in your .env)`);
}

function slugify(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
