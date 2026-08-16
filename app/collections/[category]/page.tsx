import { Metadata } from "next";
import { notFound } from "next/navigation";
import { siteConfig } from "@/data/content";
import { products, categories, fragranceCatalog } from "@/data/products";
import { ShopClient } from "@/app/shop/ShopClient";

interface Props {
  params: { category: string };
}

export async function generateStaticParams() {
  return [
    { category: "luxury-candles" },
    { category: "car-perfumes" },
    { category: "wardrobe-sachets" },
    { category: "home-diffusers" },
    { category: "fragrance-oils" },
  ];
}

const slugToNameMap: Record<string, string> = {
  "luxury-candles": "Luxury Candles",
  "car-perfumes": "Car Perfumes",
  "wardrobe-sachets": "Soy Wax Sachets",
  "home-diffusers": "Home Diffusers",
  "fragrance-oils": "Fragrance Oils",
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const categoryName = slugToNameMap[params.category] || params.category;
  const title = `${categoryName} — Handcrafted Collection | ${siteConfig.name}`;
  const description = `Explore Glimoré's handcrafted ${categoryName} — rare fragrance oils, small-batch pours, and gift-ready luxury packaging.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${siteConfig.url}/collections/${params.category}`,
    },
  };
}

export default function CollectionPage({ params }: Props) {
  const categoryName = slugToNameMap[params.category];
  if (!categoryName) notFound();

  return (
    <ShopClient
      initialProducts={products}
      categories={categories}
      fragrances={fragranceCatalog}
      preselectedCategory={categoryName}
    />
  );
}
