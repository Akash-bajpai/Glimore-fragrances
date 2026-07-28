"use client";

import { ProductCard } from "@/components/ui/ProductCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { useUI } from "@/components/providers/UIProvider";
import { products } from "@/data/products";

export function BestSellers() {
  const { openQuickView } = useUI();

  return (
    <section id="best-sellers" className="section-px mx-auto max-w-content py-24 sm:py-32">
      <SectionHeading
        eyebrow="Most Loved"
        title="Best Sellers"
        description="The five fragrances our community reaches for again and again."
        className="mb-14 sm:mb-20"
      />

      <div className="grid grid-cols-1 gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product, i) => (
          <ProductCard key={product.id} product={product} onQuickView={openQuickView} index={i} />
        ))}
      </div>
    </section>
  );
}
