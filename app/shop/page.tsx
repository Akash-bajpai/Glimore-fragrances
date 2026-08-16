import { Metadata } from "next";
import { siteConfig } from "@/data/content";
import { products, categories, fragranceCatalog } from "@/data/products";
import { ShopClient } from "./ShopClient";

export const metadata: Metadata = {
  title: "Shop All Luxury Fragrances & Candles",
  description:
    "Explore Glimoré Fragrances full collection of handcrafted soy candles, hanging car perfumes, botanical wardrobe sachets, and ceramic diffuser kits.",
  openGraph: {
    title: "Shop All Luxury Fragrances & Candles — Glimoré Fragrances",
    description:
      "Explore Glimoré Fragrances full collection of handcrafted soy candles, hanging car perfumes, botanical wardrobe sachets, and ceramic diffuser kits.",
    url: `${siteConfig.url}/shop`,
  },
};

export default function ShopPage() {
  return (
    <ShopClient
      initialProducts={products}
      categories={categories}
      fragrances={fragranceCatalog}
    />
  );
}
