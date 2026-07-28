"use client";

import Image from "next/image";
import { useState } from "react";
import { motion } from "framer-motion";
import { Heart, Eye, ShoppingBag } from "lucide-react";
import { Product } from "@/types";
import { useCart } from "@/components/providers/CartProvider";
import { StarRating } from "./StarRating";
import { formatINR, cn } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
  onQuickView: (product: Product) => void;
  index?: number;
}

export function ProductCard({ product, onQuickView, index = 0 }: ProductCardProps) {
  const { addToCart, toggleWishlist, isWishlisted } = useCart();
  const [justAdded, setJustAdded] = useState(false);
  const wishlisted = isWishlisted(product.id);

  const handleAdd = () => {
    addToCart(product.id, 1);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1600);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, delay: (index % 3) * 0.1, ease: [0.16, 1, 0.3, 1] }}
      className="group relative flex flex-col"
    >
      <div className="relative aspect-[4/5] overflow-hidden rounded-[2px] bg-surface">
        {product.badge && (
          <span className="absolute left-4 top-4 z-10 rounded-full bg-ink/80 px-3 py-1 font-body text-[10px] font-medium uppercase tracking-widest text-gold backdrop-blur-sm">
            {product.badge}
          </span>
        )}

        <button
          onClick={() => toggleWishlist(product.id)}
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-ink/60 backdrop-blur-sm transition-transform duration-300 hover:scale-110"
        >
          <Heart
            size={16}
            className={wishlisted ? "fill-gold text-gold" : "text-cream"}
            strokeWidth={1.75}
          />
        </button>

        <button
          onClick={() => onQuickView(product)}
          className="img-hover-zoom relative block h-full w-full"
          aria-label={`Quick view ${product.name}`}
        >
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 90vw, (max-width: 1200px) 40vw, 25vw"
            className="object-cover"
          />
          <span className="absolute inset-x-0 bottom-0 flex translate-y-full items-center justify-center gap-2 bg-ink/75 py-3 font-body text-xs uppercase tracking-widest text-cream backdrop-blur-sm transition-transform duration-500 ease-luxury group-hover:translate-y-0">
            <Eye size={14} /> Quick View
          </span>
        </button>
      </div>

      <div className="mt-5 flex flex-1 flex-col gap-2">
        <span className="font-body text-[11px] uppercase tracking-widest text-gold/80">
          {product.collection}
        </span>
        <h3 className="font-display text-xl leading-snug">{product.name}</h3>
        <StarRating rating={product.rating} reviewCount={product.reviewCount} />
        <p className="line-clamp-1 font-body text-sm text-fg/55">{product.tagline}</p>

        <div className="mt-2 flex items-center justify-between gap-3">
          <div className="flex items-baseline gap-2">
            <span className="font-display text-lg">{formatINR(product.price)}</span>
            {product.compareAtPrice && (
              <span className="font-body text-xs text-fg/40 line-through">
                {formatINR(product.compareAtPrice)}
              </span>
            )}
          </div>
          <button
            onClick={handleAdd}
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-all duration-300",
              justAdded
                ? "border-gold bg-gold text-ink"
                : "border-edge/25 text-fg hover:border-gold hover:bg-gold hover:text-ink"
            )}
            aria-label={`Add ${product.name} to cart`}
          >
            <ShoppingBag size={16} strokeWidth={1.75} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
