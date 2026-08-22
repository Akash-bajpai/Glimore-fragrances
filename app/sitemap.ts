import { MetadataRoute } from "next";
import { siteConfig } from "@/data/content";
import { products } from "@/data/products";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    "",
    "/shop",
    "/fragrance-finder",
    "/privacy-policy",
    "/terms-of-service",
    "/shipping-policy",
    "/refund-policy",
    "/collections/luxury-candles",
    "/collections/car-perfumes",
    "/collections/wardrobe-sachets",
    "/collections/home-diffusers",
    "/collections/fragrance-oils",
  ].map((route) => ({
    url: `${siteConfig.url}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: route === "" ? 1.0 : route.startsWith("/collections") || route === "/shop" ? 0.8 : 0.5,
  }));

  const productRoutes = products.map((p) => ({
    url: `${siteConfig.url}/products/${p.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [...routes, ...productRoutes];
}

