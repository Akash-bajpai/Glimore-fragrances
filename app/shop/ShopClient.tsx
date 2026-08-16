"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  SlidersHorizontal,
  X,
  Search,
  Check,
  ArrowUpDown,
  Sparkles,
} from "lucide-react";

import { Product, FragranceItem } from "@/types";
import { ProductCard } from "@/components/ui/ProductCard";
import { useUI } from "@/components/providers/UIProvider";
import { cn } from "@/lib/utils";

interface Props {
  initialProducts: Product[];
  categories: { name: string; slug: string }[];
  fragrances: FragranceItem[];
  preselectedCategory?: string;
}

type SortOption = "featured" | "price-asc" | "price-desc" | "rating" | "newest";

export function ShopClient({
  initialProducts,
  categories,
  fragrances,
  preselectedCategory,
}: Props) {
  const { openQuickView } = useUI();

  // Filters State
  const [selectedCategory, setSelectedCategory] = useState<string>(preselectedCategory || "All");
  const [selectedFamily, setSelectedFamily] = useState<string>("All");
  const [selectedMood, setSelectedMood] = useState<string>("All");
  const [priceRange, setPriceRange] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("featured");
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Scent mood options from catalog
  const moods = [
    "All",
    "Sensual, luxurious & soothing",
    "Romantic, serene & enchanting",
    "Peaceful, pure & refreshing",
    "Festive, uplifting & joyful",
    "Calm, relaxing & tranquil",
    "Cheerful, uplifting & energising",
    "Warm, luxurious & comforting",
    "Bold, mysterious & opulent",
  ];

  // Families
  const families = ["All", "Floral", "Citrus", "Woody", "Fresh", "Gourmand"];

  // Filter products
  const filteredProducts = useMemo(() => {
    return initialProducts.filter((p) => {
      // Category filter
      if (selectedCategory !== "All") {
        if (p.category.toLowerCase() !== selectedCategory.toLowerCase()) {
          return false;
        }
      }

      // Fragrance family filter
      if (selectedFamily !== "All") {
        const matchesFamily =
          p.fragranceProfile?.toLowerCase().includes(selectedFamily.toLowerCase()) ||
          p.collection?.toLowerCase().includes(selectedFamily.toLowerCase()) ||
          (p.notes &&
            [...p.notes.top, ...p.notes.heart, ...p.notes.base].some((n) =>
              n.toLowerCase().includes(selectedFamily.toLowerCase())
            ));
        if (!matchesFamily) return false;
      }

      // Mood filter
      if (selectedMood !== "All") {
        if (!p.mood?.toLowerCase().includes(selectedMood.toLowerCase().split(",")[0])) {
          return false;
        }
      }

      // Price filter
      if (priceRange === "under-250" && p.price >= 250) return false;
      if (priceRange === "250-350" && (p.price < 250 || p.price > 350)) return false;
      if (priceRange === "350-500" && (p.price < 350 || p.price > 500)) return false;
      if (priceRange === "above-500" && p.price <= 500) return false;

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesQuery =
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          (p.collection && p.collection.toLowerCase().includes(q)) ||
          p.description.toLowerCase().includes(q) ||
          (p.fragrance && p.fragrance.toLowerCase().includes(q)) ||
          (p.notes &&
            [...p.notes.top, ...p.notes.heart, ...p.notes.base].some((n) =>
              n.toLowerCase().includes(q)
            ));
        if (!matchesQuery) return false;
      }

      return true;
    });
  }, [initialProducts, selectedCategory, selectedFamily, selectedMood, priceRange, searchQuery]);

  // Sort products
  const sortedProducts = useMemo(() => {
    const list = [...filteredProducts];
    switch (sortBy) {
      case "price-asc":
        return list.sort((a, b) => a.price - b.price);
      case "price-desc":
        return list.sort((a, b) => b.price - a.price);
      case "rating":
        return list.sort((a, b) => b.rating - a.rating);
      case "newest":
        return list.sort((a, b) => (b.badge === "New" ? 1 : 0) - (a.badge === "New" ? 1 : 0));
      case "featured":
      default:
        return list.sort((a, b) => (b.badge === "Bestseller" ? 1 : 0) - (a.badge === "Bestseller" ? 1 : 0));
    }
  }, [filteredProducts, sortBy]);

  const activeFiltersCount =
    (selectedCategory !== "All" ? 1 : 0) +
    (selectedFamily !== "All" ? 1 : 0) +
    (selectedMood !== "All" ? 1 : 0) +
    (priceRange !== "all" ? 1 : 0) +
    (searchQuery.trim() ? 1 : 0);

  const clearAllFilters = () => {
    setSelectedCategory("All");
    setSelectedFamily("All");
    setSelectedMood("All");
    setPriceRange("all");
    setSearchQuery("");
  };

  return (
    <div className="min-h-screen bg-bg text-fg pb-24">
      {/* Header Banner */}
      <div className="border-b border-edge/10 bg-surface-2/60 py-12 sm:py-16">
        <div className="section-px mx-auto max-w-content text-center">
          <span className="font-body text-xs uppercase tracking-widest text-gold">The Glimoré Fragrances Edit</span>
          <h1 className="mt-2 font-display text-4xl sm:text-5xl">Curated Collection</h1>
          <p className="mx-auto mt-3 max-w-xl font-body text-sm text-fg/60">
            Handcrafted soy candles, hanging car perfumes, wardrobe sachets, and home aroma rituals poured in small batches.
          </p>
        </div>
      </div>

      <div className="section-px mx-auto max-w-content py-8 sm:py-12">
        {/* Controls Bar: Search + Category Pills + Sort */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between border-b border-edge/10 pb-6">
          {/* Category Pills (Desktop) */}
          <div className="hidden lg:flex flex-wrap items-center gap-2">
            <button
              onClick={() => setSelectedCategory("All")}
              className={cn(
                "rounded-full px-4 py-2 font-body text-xs uppercase tracking-wider transition-all",
                selectedCategory === "All"
                  ? "bg-gold text-ink font-semibold shadow-gold/20"
                  : "border border-edge/15 text-fg/70 hover:border-gold/50"
              )}
            >
              All Pieces ({initialProducts.length})
            </button>
            {categories.map((c) => (
              <button
                key={c.slug}
                onClick={() => setSelectedCategory(c.name)}
                className={cn(
                  "rounded-full px-4 py-2 font-body text-xs uppercase tracking-wider transition-all",
                  selectedCategory.toLowerCase() === c.name.toLowerCase()
                    ? "bg-gold text-ink font-semibold shadow-gold/20"
                    : "border border-edge/15 text-fg/70 hover:border-gold/50"
                )}
              >
                {c.name}
              </button>
            ))}
          </div>

          {/* Search and Filters Trigger */}
          <div className="flex items-center gap-3 w-full lg:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 lg:w-64">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-fg/40" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search scent, jar, note..."
                className="w-full rounded-full border border-edge/20 bg-surface pl-9 pr-4 py-2 font-body text-xs text-fg placeholder:text-fg/40 focus:border-gold focus:outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-fg/40 hover:text-gold"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Mobile Filter Button */}
            <button
              onClick={() => setMobileFilterOpen(true)}
              className="lg:hidden flex items-center gap-2 rounded-full border border-edge/20 bg-surface px-4 py-2 font-body text-xs text-fg"
            >
              <SlidersHorizontal size={14} className="text-gold" />
              <span>Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}</span>
            </button>

            {/* Sort Select */}
            <div className="relative shrink-0">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                aria-label="Sort products"
                className="appearance-none rounded-full border border-edge/20 bg-surface pl-4 pr-9 py-2 font-body text-xs text-fg focus:border-gold focus:outline-none cursor-pointer"
              >
                <option value="featured">Sort: Featured</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="newest">New Arrivals</option>
              </select>
              <ArrowUpDown size={13} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-fg/45" />
            </div>
          </div>
        </div>

        {/* Active Filters Bar */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-4">
            <span className="font-body text-xs text-fg/50">Active Filters:</span>
            {selectedCategory !== "All" && (
              <span className="flex items-center gap-1.5 rounded-full bg-gold/15 px-3 py-1 font-body text-xs text-gold">
                Category: {selectedCategory}
                <button onClick={() => setSelectedCategory("All")}><X size={12} /></button>
              </span>
            )}
            {selectedFamily !== "All" && (
              <span className="flex items-center gap-1.5 rounded-full bg-gold/15 px-3 py-1 font-body text-xs text-gold">
                Family: {selectedFamily}
                <button onClick={() => setSelectedFamily("All")}><X size={12} /></button>
              </span>
            )}
            {priceRange !== "all" && (
              <span className="flex items-center gap-1.5 rounded-full bg-gold/15 px-3 py-1 font-body text-xs text-gold">
                Price: {priceRange.replace("-", " to ")}
                <button onClick={() => setPriceRange("all")}><X size={12} /></button>
              </span>
            )}
            {searchQuery && (
              <span className="flex items-center gap-1.5 rounded-full bg-gold/15 px-3 py-1 font-body text-xs text-gold">
                &ldquo;{searchQuery}&rdquo;
                <button onClick={() => setSearchQuery("")}><X size={12} /></button>
              </span>
            )}
            <button
              onClick={clearAllFilters}
              className="font-body text-xs text-fg/50 underline hover:text-gold ml-2"
            >
              Reset all
            </button>
          </div>
        )}

        {/* Main Shop Grid Area */}
        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[240px_1fr]">
          {/* Desktop Left Sidebar Filters */}
          <aside className="hidden lg:flex flex-col gap-6">
            {/* Fragrance Family Filter */}
            <div className="border-b border-edge/10 pb-5">
              <h3 className="font-display text-sm font-semibold uppercase tracking-widest text-gold mb-3">
                Fragrance Family
              </h3>
              <div className="flex flex-col gap-2 font-body text-xs">
                {families.map((fam) => (
                  <button
                    key={fam}
                    onClick={() => setSelectedFamily(fam)}
                    className={cn(
                      "flex items-center justify-between text-left py-1 transition-colors",
                      selectedFamily === fam ? "font-semibold text-gold" : "text-fg/65 hover:text-fg"
                    )}
                  >
                    <span>{fam}</span>
                    {selectedFamily === fam && <Check size={14} className="text-gold" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Filter */}
            <div className="border-b border-edge/10 pb-5">
              <h3 className="font-display text-sm font-semibold uppercase tracking-widest text-gold mb-3">
                Price Range
              </h3>
              <div className="flex flex-col gap-2 font-body text-xs">
                {[
                  { id: "all", label: "All Prices" },
                  { id: "under-250", label: "Under ₹250" },
                  { id: "250-350", label: "₹250 to ₹350" },
                  { id: "350-500", label: "₹350 to ₹500" },
                  { id: "above-500", label: "Above ₹500" },
                ].map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setPriceRange(p.id)}
                    className={cn(
                      "flex items-center justify-between text-left py-1 transition-colors",
                      priceRange === p.id ? "font-semibold text-gold" : "text-fg/65 hover:text-fg"
                    )}
                  >
                    <span>{p.label}</span>
                    {priceRange === p.id && <Check size={14} className="text-gold" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Fragrance Finder Promotion Widget */}
            <div className="rounded-sm border border-gold/30 bg-gold/5 p-5 text-center">
              <Sparkles size={20} className="mx-auto text-gold mb-2" />
              <h4 className="font-display text-sm text-fg font-medium">Unsure which fragrance fits?</h4>
              <p className="mt-1 font-body text-xs text-fg/60">
                Take our 30-second scent quiz to find your signature match.
              </p>
              <a
                href="/fragrance-finder"
                className="btn-gold mt-3 block w-full py-2 text-[11px] uppercase tracking-widest"
              >
                Fragrance Finder
              </a>
            </div>
          </aside>

          {/* Product Results */}
          <main>
            <div className="mb-4 flex items-center justify-between font-body text-xs text-fg/50">
              <span>Showing {sortedProducts.length} pieces</span>
            </div>

            {sortedProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-sm border border-edge/10 bg-surface py-20 text-center">
                <Search size={36} className="text-gold/50 mb-3" />
                <h3 className="font-display text-xl text-fg">No pieces match your filters</h3>
                <p className="mt-1 font-body text-xs text-fg/55 max-w-sm">
                  Try adjusting your search keywords, price range, or category filter to discover other fragrances.
                </p>
                <button
                  onClick={clearAllFilters}
                  className="btn-outline mt-5 px-6 py-2.5 text-xs uppercase tracking-widest"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
                {sortedProducts.map((product, i) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onQuickView={openQuickView}
                    index={i}
                  />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Filters Drawer */}
      <AnimatePresence>
        {mobileFilterOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex justify-end bg-ink/70 backdrop-blur-sm lg:hidden"
          >
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="flex h-full w-full max-w-xs flex-col bg-surface p-6 overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-edge/10 pb-4">
                <h3 className="font-display text-lg">Filter &amp; Refine</h3>
                <button onClick={() => setMobileFilterOpen(false)}>
                  <X size={20} />
                </button>
              </div>

              <div className="flex flex-col gap-6 py-6">
                {/* Categories */}
                <div>
                  <h4 className="font-display text-xs uppercase tracking-widest text-gold mb-2">Category</h4>
                  <div className="flex flex-col gap-1.5 font-body text-xs">
                    <button
                      onClick={() => setSelectedCategory("All")}
                      className={cn("text-left py-1", selectedCategory === "All" ? "font-semibold text-gold" : "text-fg/70")}
                    >
                      All Categories
                    </button>
                    {categories.map((c) => (
                      <button
                        key={c.slug}
                        onClick={() => setSelectedCategory(c.name)}
                        className={cn("text-left py-1", selectedCategory === c.name ? "font-semibold text-gold" : "text-fg/70")}
                      >
                        {c.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price */}
                <div>
                  <h4 className="font-display text-xs uppercase tracking-widest text-gold mb-2">Price</h4>
                  <div className="flex flex-col gap-1.5 font-body text-xs">
                    {[
                      { id: "all", label: "All Prices" },
                      { id: "under-250", label: "Under ₹250" },
                      { id: "250-350", label: "₹250 to ₹350" },
                      { id: "350-500", label: "₹350 to ₹500" },
                      { id: "above-500", label: "Above ₹500" },
                    ].map((p) => (
                      <button
                        key={p.id}
                        onClick={() => setPriceRange(p.id)}
                        className={cn("text-left py-1", priceRange === p.id ? "font-semibold text-gold" : "text-fg/70")}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Fragrance Family */}
                <div>
                  <h4 className="font-display text-xs uppercase tracking-widest text-gold mb-2">Fragrance Family</h4>
                  <div className="flex flex-col gap-1.5 font-body text-xs">
                    {families.map((fam) => (
                      <button
                        key={fam}
                        onClick={() => setSelectedFamily(fam)}
                        className={cn("text-left py-1", selectedFamily === fam ? "font-semibold text-gold" : "text-fg/70")}
                      >
                        {fam}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-auto border-t border-edge/10 pt-4 flex gap-2">
                <button
                  onClick={clearAllFilters}
                  className="btn-outline flex-1 py-2.5 text-xs uppercase tracking-widest"
                >
                  Reset
                </button>
                <button
                  onClick={() => setMobileFilterOpen(false)}
                  className="btn-gold flex-1 py-2.5 text-xs uppercase tracking-widest"
                >
                  Show Results
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
