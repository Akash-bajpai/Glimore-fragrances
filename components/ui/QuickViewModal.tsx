"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Minus, Plus, Heart } from "lucide-react";
import { Product } from "@/types";
import { useCart } from "@/components/providers/CartProvider";
import { StarRating } from "./StarRating";
import { formatINR, cn } from "@/lib/utils";

interface QuickViewModalProps {
  product: Product | null;
  onClose: () => void;
}

export function QuickViewModal({ product, onClose }: QuickViewModalProps) {
  const { addToCart, toggleWishlist, isWishlisted, addRecentlyViewed } = useCart();
  const [qty, setQty] = useState(1);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    if (product) {
      setQty(1);
      setActiveImage(0);
      addRecentlyViewed(product.id);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!product) return null;
  const wishlisted = isWishlisted(product.id);

  return (
    <AnimatePresence>
      {product && (
        <motion.div
          className="fixed inset-0 z-[80] flex items-center justify-center p-4 sm:p-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-0 bg-ink/80 backdrop-blur-sm"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="relative grid max-h-[88vh] w-full max-w-4xl grid-cols-1 overflow-y-auto rounded-sm bg-surface shadow-soft sm:grid-cols-2"
          >
            <button
              onClick={onClose}
              aria-label="Close quick view"
              className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-ink/70 text-cream transition-transform hover:scale-110"
            >
              <X size={16} />
            </button>

            <div className="relative aspect-[4/5] sm:aspect-auto">
              <Image
                src={product.gallery[activeImage] ?? product.image}
                alt={product.name}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
                priority
              />
              {product.gallery.length > 1 && (
                <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
                  {product.gallery.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImage(i)}
                      aria-label={`View image ${i + 1}`}
                      className={cn(
                        "h-1.5 w-6 rounded-full transition-all",
                        activeImage === i ? "bg-gold" : "bg-cream/40"
                      )}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-4 p-6 sm:p-10">
              <span className="font-body text-xs uppercase tracking-widest text-gold">
                {product.collection}
              </span>
              <h3 className="font-display text-3xl leading-tight">{product.name}</h3>
              <StarRating rating={product.rating} reviewCount={product.reviewCount} />

              <div className="flex items-baseline gap-3">
                <span className="font-display text-2xl">{formatINR(product.price)}</span>
                {product.compareAtPrice && (
                  <span className="font-body text-sm text-fg/40 line-through">
                    {formatINR(product.compareAtPrice)}
                  </span>
                )}
              </div>

              <p className="font-body text-sm leading-relaxed text-fg/70">
                {product.description}
              </p>

              <div className="grid grid-cols-3 gap-3 border-y border-edge/10 py-4 font-body text-xs">
                <div>
                  <p className="text-fg/45">Burn Time</p>
                  <p className="mt-1 text-fg">{product.burnTime}</p>
                </div>
                <div>
                  <p className="text-fg/45">Weight</p>
                  <p className="mt-1 text-fg">{product.weight}</p>
                </div>
                <div>
                  <p className="text-fg/45">Vessel</p>
                  <p className="mt-1 text-fg">{product.vessel}</p>
                </div>
              </div>

              {product.notes && (
                <div className="grid grid-cols-3 gap-3 font-body text-xs">
                  <NoteColumn label="Top" notes={product.notes.top} />
                  <NoteColumn label="Heart" notes={product.notes.heart} />
                  <NoteColumn label="Base" notes={product.notes.base} />
                </div>
              )}

              <div className="mt-2 flex items-center gap-3">
                <div className="flex items-center rounded-full border border-edge/25">
                  <button
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    className="flex h-10 w-10 items-center justify-center text-fg/70 hover:text-gold"
                    aria-label="Decrease quantity"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-8 text-center font-body text-sm">{qty}</span>
                  <button
                    onClick={() => setQty((q) => q + 1)}
                    className="flex h-10 w-10 items-center justify-center text-fg/70 hover:text-gold"
                    aria-label="Increase quantity"
                  >
                    <Plus size={14} />
                  </button>
                </div>

                <button
                  onClick={() => {
                    addToCart(product.id, qty);
                    onClose();
                  }}
                  className="btn-gold flex-1"
                >
                  Add to Cart
                </button>

                <button
                  onClick={() => toggleWishlist(product.id)}
                  aria-label="Toggle wishlist"
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-edge/25 hover:border-gold"
                >
                  <Heart size={16} className={wishlisted ? "fill-gold text-gold" : "text-fg"} />
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function NoteColumn({ label, notes }: { label: string; notes: string[] }) {
  return (
    <div>
      <p className="mb-1.5 uppercase tracking-widest text-gold/80">{label}</p>
      <ul className="space-y-0.5 text-fg/60">
        {notes.map((n) => (
          <li key={n}>{n}</li>
        ))}
      </ul>
    </div>
  );
}
