"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { Heart, Eye, ShoppingBag, Check } from "lucide-react";
import { Product } from "@/types";
import { useCart } from "@/components/providers/CartProvider";
import { StarRating } from "./StarRating";
import { formatINR, cn } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
  index?: number;
}

export function ProductCard({ product, onQuickView, index = 0 }: ProductCardProps) {
  const { addToCart, toggleWishlist, isWishlisted } = useCart();
  const [justAdded, setJustAdded] = useState(false);
  const wishlisted = isWishlisted(product.id);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product.id, 1);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1600);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onQuickView) onQuickView(product);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.6, delay: (index % 4) * 0.08, ease: [0.16, 1, 0.3, 1] }}
      className="group relative flex flex-col"
    >
      <div className="relative aspect-[4/5] overflow-hidden rounded-sm bg-surface">
        {/* Badges */}
        <div className="absolute left-3 top-3 z-10 flex flex-col gap-1.5">
          {product.badge && (
            <span className="rounded-full bg-ink/85 px-3 py-1 font-body text-[10px] font-medium uppercase tracking-widest text-gold backdrop-blur-sm shadow-sm">
              {product.badge}
            </span>
          )}
          {product.capacity && (
            <span className="rounded-full bg-bg/85 px-2.5 py-0.5 font-body text-[9px] uppercase tracking-wider text-fg/75 backdrop-blur-sm">
              {product.capacity}
            </span>
          )}
        </div>

        {/* Wishlist button */}
        <button
          onClick={handleWishlist}
          aria-label={wishlisted ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
          className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-ink/60 text-cream backdrop-blur-sm transition-transform duration-300 hover:scale-110 hover:bg-ink/90"
        >
          <Heart
            size={16}
            className={wishlisted ? "fill-gold text-gold" : "text-cream"}
            strokeWidth={1.75}
          />
        </button>

        {/* Product Image Link to Detail Page */}
        <Link
          href={`/products/${product.slug}`}
          className="img-hover-zoom relative block h-full w-full"
          aria-label={`View ${product.name} details`}
        >
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 90vw, (max-width: 1200px) 40vw, 25vw"
            className="object-cover"
          />
          {onQuickView && (
            <button
              onClick={handleQuickView}
              className="absolute inset-x-0 bottom-0 flex translate-y-full items-center justify-center gap-2 bg-ink/80 py-3 font-body text-xs uppercase tracking-widest text-cream backdrop-blur-sm transition-transform duration-500 ease-luxury group-hover:translate-y-0 hover:bg-gold hover:text-ink"
            >
              <Eye size={14} /> Quick View
            </button>
          )}
        </Link>
      </div>

      {/* Info Section */}
      <div className="mt-4 flex flex-1 flex-col justify-between gap-1.5">
        <div>
          <div className="flex items-center justify-between gap-2">
            <span className="font-body text-[11px] uppercase tracking-widest text-gold/90">
              {product.collection || product.category}
            </span>
            {product.burnTime && (
              <span className="font-body text-[10px] text-fg/45">
                {product.burnTime}
              </span>
            )}
          </div>
          <Link
            href={`/products/${product.slug}`}
            className="font-display text-lg leading-snug text-fg transition-colors hover:text-gold line-clamp-1 mt-0.5"
          >
            {product.name}
          </Link>
          <div className="mt-1">
            <StarRating rating={product.rating} reviewCount={product.reviewCount} />
          </div>
          {product.tagline && (
            <p className="mt-1 line-clamp-1 font-body text-xs text-fg/55">{product.tagline}</p>
          )}
        </div>

        {/* Pricing & Add Button */}
        <div className="mt-3 flex items-center justify-between gap-3 border-t border-edge/10 pt-3">
          <div className="flex items-baseline gap-2">
            <span className="sr-only">Sale price:</span>
            <span className="font-display text-lg text-fg">{formatINR(product.price)}</span>
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <>
                <span className="sr-only">Original price:</span>
                <span className="font-body text-xs text-fg/40 line-through">
                  {formatINR(product.compareAtPrice)}
                </span>
              </>
            )}
          </div>
          <button
            onClick={handleAdd}
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-all duration-300",
              justAdded
                ? "border-gold bg-gold text-ink scale-110"
                : "border-edge/25 text-fg hover:border-gold hover:bg-gold hover:text-ink hover:scale-105"
            )}
            aria-label={`Add ${product.name} to shopping bag`}
          >
            {justAdded ? <Check size={16} strokeWidth={2.5} /> : <ShoppingBag size={15} strokeWidth={1.75} />}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
