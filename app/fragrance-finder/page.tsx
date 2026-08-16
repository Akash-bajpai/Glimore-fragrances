import { Metadata } from "next";
import { siteConfig } from "@/data/content";
import { FragranceFinderClient } from "./FragranceFinderClient";

export const metadata: Metadata = {
  title: "Fragrance Finder — Discover Your Signature Scent",
  description:
    "Take our curated 30-second fragrance quiz. Answer three simple questions to find your signature candle, car perfume, or home aroma match.",
  openGraph: {
    title: "Fragrance Finder — Glimoré Fragrances",
    description: "Discover your personalized signature fragrance based on your mood and space.",
    url: `${siteConfig.url}/fragrance-finder`,
  },
};

export default function FragranceFinderPage() {
  return <FragranceFinderClient />;
}
