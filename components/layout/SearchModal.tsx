"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, ArrowRight, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { products } from "@/data/products";
import { formatINR, cn } from "@/lib/utils";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchModal({ isOpen, onClose }: Props) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
    }
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  // Live product search
  const results = useMemo(() => {
    if (!query.trim() || query.trim().length < 2) return [];
    const q = query.toLowerCase().trim();
    return products
      .filter((p) => {
        const text = [
          p.name,
          p.category,
          p.collection || "",
          p.fragrance || "",
          p.fragranceProfile || "",
          p.description,
          ...(p.notes?.top || []),
          ...(p.notes?.heart || []),
          ...(p.notes?.base || []),
        ]
          .join(" ")
          .toLowerCase();
        return text.includes(q);
      })
      .slice(0, 8);
  }, [query]);

  const popularSearches = [
    "Oudwood Reserve",
    "Royal Rose Bloom",
    "Azure Breeze",
    "Car Perfume",
    "Lavender Twilight",
    "Home Diffuser Kit",
  ];

  const quickCategories = [
    { label: "Luxury Candles", href: "/collections/luxury-candles" },
    { label: "Car Perfumes", href: "/collections/car-perfumes" },
    { label: "Wardrobe Sachets", href: "/collections/wardrobe-sachets" },
    { label: "Home Diffusers", href: "/collections/home-diffusers" },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-start pt-16 sm:pt-24 bg-ink/80 backdrop-blur-md px-4"
          onClick={(e) => e.target === e.currentTarget && onClose()}
          role="dialog"
          aria-modal="true"
          aria-label="Search"
        >
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-2xl"
          >
            {/* Search Input */}
            <div className="flex items-center gap-3 rounded-sm border border-edge/20 bg-surface px-5 py-4 shadow-2xl">
              <Search size={20} className="shrink-0 text-gold" aria-hidden="true" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search fragrances, candles, sachets…"
                aria-label="Search products"
                className="flex-1 bg-transparent font-body text-base text-fg placeholder:text-fg/35 focus:outline-none"
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  aria-label="Clear search"
                  className="shrink-0 text-fg/40 hover:text-gold transition-colors"
                >
                  <X size={18} />
                </button>
              )}
              <button
                onClick={onClose}
                aria-label="Close search"
                className="shrink-0 font-body text-xs uppercase tracking-wider text-fg/45 hover:text-gold transition-colors"
              >
                Esc
              </button>
            </div>

            {/* Results Panel */}
            <div className="mt-2 rounded-sm border border-edge/15 bg-surface shadow-2xl overflow-hidden">
              {/* Live results */}
              {query.trim().length >= 2 ? (
                results.length > 0 ? (
                  <div className="divide-y divide-edge/10">
                    {results.map((product) => (
                      <Link
                        key={product.id}
                        href={`/products/${product.slug}`}
                        onClick={onClose}
                        className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-gold/5 group"
                      >
                        <div className="relative h-12 w-10 shrink-0 overflow-hidden rounded-sm bg-bg">
                          <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            className="object-cover"
                            sizes="40px"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-body text-sm font-medium text-fg group-hover:text-gold transition-colors truncate">
                            {product.name}
                          </p>
                          <p className="font-body text-xs text-fg/45 truncate">
                            {product.category}
                            {product.fragrance ? ` · ${product.fragrance}` : ""}
                          </p>
                        </div>
                        <span className="font-body text-sm text-fg/70 shrink-0">
                          {formatINR(product.price)}
                        </span>
                        <ArrowRight
                          size={14}
                          className="text-fg/30 group-hover:text-gold transition-colors shrink-0"
                          aria-hidden="true"
                        />
                      </Link>
                    ))}
                    <Link
                      href={`/shop?q=${encodeURIComponent(query)}`}
                      onClick={onClose}
                      className="flex items-center justify-center gap-2 px-5 py-3 font-body text-xs uppercase tracking-widest text-gold hover:bg-gold/5 transition-colors"
                    >
                      View all results for &ldquo;{query}&rdquo;{" "}
                      <ArrowRight size={13} aria-hidden="true" />
                    </Link>
                  </div>
                ) : (
                  <div className="px-5 py-10 text-center">
                    <p className="font-body text-sm text-fg/50">
                      No results for &ldquo;{query}&rdquo;
                    </p>
                    <p className="mt-1 font-body text-xs text-fg/35">
                      Try a fragrance name, mood, or category.
                    </p>
                  </div>
                )
              ) : (
                /* Default state — popular searches + quick categories */
                <div className="px-5 py-5 flex flex-col gap-5">
                  <div>
                    <h3 className="font-body text-xs uppercase tracking-widest text-fg/40 mb-3">
                      Popular Searches
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {popularSearches.map((s) => (
                        <button
                          key={s}
                          onClick={() => setQuery(s)}
                          className="rounded-full border border-edge/15 px-3 py-1.5 font-body text-xs text-fg/70 hover:border-gold hover:text-gold transition-colors"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-body text-xs uppercase tracking-widest text-fg/40 mb-3">
                      Browse Categories
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      {quickCategories.map((c) => (
                        <Link
                          key={c.href}
                          href={c.href}
                          onClick={onClose}
                          className="flex items-center gap-2 rounded-sm border border-edge/10 bg-bg px-4 py-2.5 font-body text-xs text-fg/65 hover:border-gold hover:text-gold transition-colors"
                        >
                          <Sparkles size={12} className="text-gold/60" aria-hidden="true" />
                          {c.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
