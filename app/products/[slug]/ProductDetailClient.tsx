"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  ShoppingBag,
  Zap,
  Truck,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  ChevronDown,
  ChevronRight,
  Star,
  Minus,
  Plus,
  Flame,
  Check,
  X,
  Share2,
} from "lucide-react";
import { Product } from "@/types";
import { useCart } from "@/components/providers/CartProvider";
import { StarRating } from "@/components/ui/StarRating";
import { ProductCard } from "@/components/ui/ProductCard";
import { fragranceCatalog, diffuserFragrances, diffuserColors } from "@/data/products";
import { formatINR, cn } from "@/lib/utils";

interface Props {
  product: Product;
  relatedProducts: Product[];
}

export function ProductDetailClient({ product, relatedProducts }: Props) {
  const router = useRouter();
  const { addToCart, toggleWishlist, isWishlisted } = useCart();
  const wishlisted = isWishlisted(product.id);

  // States
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedFragrance, setSelectedFragrance] = useState<string>(
    product.fragrance || (product.category === "Home Diffusers" ? diffuserFragrances[0] : "")
  );
  const [selectedColor, setSelectedColor] = useState<string>(
    product.colors && product.colors.length > 0
      ? product.colors[0]
      : product.category === "Home Diffusers"
      ? diffuserColors[0]
      : ""
  );
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Accordion state
  const [openAccordions, setOpenAccordions] = useState<Record<string, boolean>>({
    notes: true,
    specs: true,
    care: false,
    shipping: false,
  });

  const toggleAccordion = (key: string) => {
    setOpenAccordions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const images = product.gallery && product.gallery.length > 0 ? product.gallery : [product.image];

  const handleAddToCart = () => {
    addToCart(product.id, quantity, {
      fragrance: selectedFragrance || undefined,
      color: selectedColor || undefined,
    });
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
  };

  const handleBuyNow = () => {
    addToCart(product.id, quantity, {
      fragrance: selectedFragrance || undefined,
      color: selectedColor || undefined,
    });
    router.push("/checkout");
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: product.tagline || product.description,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  // Matched fragrance details from catalog
  const matchedFragrance = fragranceCatalog.find(
    (f) => f.name.toLowerCase() === (selectedFragrance || product.fragrance || "").toLowerCase()
  );

  const discountPercent =
    product.compareAtPrice && product.compareAtPrice > product.price
      ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
      : 0;

  return (
    <div className="min-h-screen bg-bg text-fg">
      {/* Breadcrumbs */}
      <div className="border-b border-edge/10 bg-surface-2/40">
        <nav className="section-px mx-auto flex max-w-content items-center gap-2 py-3 text-xs text-fg/60">
          <Link href="/" className="transition-colors hover:text-gold">Home</Link>
          <ChevronRight size={12} className="text-fg/30" />
          <Link href="/shop" className="transition-colors hover:text-gold">Shop</Link>
          <ChevronRight size={12} className="text-fg/30" />
          <Link
            href={`/collections/${product.category.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
            className="transition-colors hover:text-gold"
          >
            {product.category}
          </Link>
          <ChevronRight size={12} className="text-fg/30" />
          <span className="truncate text-fg/90">{product.name}</span>
        </nav>
      </div>

      <div className="section-px mx-auto max-w-content py-8 sm:py-16">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
          {/* LEFT: Image Gallery */}
          <div className="flex flex-col gap-4">
            {/* Main Stage Image */}
            <div
              onClick={() => setLightboxOpen(true)}
              className="group relative aspect-[4/5] w-full cursor-zoom-in overflow-hidden rounded-sm bg-surface shadow-soft"
            >
              <Image
                src={images[activeImageIndex]}
                alt={product.name}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover transition-transform duration-700 ease-luxury group-hover:scale-105"
              />

              {product.badge && (
                <span className="absolute left-4 top-4 rounded-full bg-ink/85 px-3.5 py-1.5 font-body text-xs uppercase tracking-widest text-gold backdrop-blur-md">
                  {product.badge}
                </span>
              )}

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleWishlist(product.id);
                }}
                aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
                className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-ink/65 backdrop-blur-md transition-transform hover:scale-110"
              >
                <Heart
                  size={18}
                  className={wishlisted ? "fill-gold text-gold" : "text-cream"}
                  strokeWidth={1.75}
                />
              </button>

              <div className="absolute bottom-4 right-4 rounded-full bg-ink/70 px-3 py-1 font-body text-[11px] text-cream/75 backdrop-blur-sm opacity-0 transition-opacity group-hover:opacity-100">
                Click to expand
              </div>
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImageIndex(i)}
                    className={cn(
                      "relative h-20 w-16 shrink-0 overflow-hidden rounded-sm border-2 transition-all",
                      activeImageIndex === i ? "border-gold shadow-gold/20" : "border-transparent opacity-65 hover:opacity-100"
                    )}
                  >
                    <Image src={img} alt="" fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Highlights Banner */}
            <div className="mt-4 grid grid-cols-3 gap-3 rounded-sm border border-edge/10 bg-surface/60 p-4 text-center">
              <div className="flex flex-col items-center gap-1">
                <Sparkles size={18} className="text-gold" />
                <span className="font-body text-[11px] font-medium text-fg">100% Soy Wax</span>
                <span className="font-body text-[10px] text-fg/45">Pure slow burn</span>
              </div>
              <div className="flex flex-col items-center gap-1 border-x border-edge/10">
                <Flame size={18} className="text-gold" />
                <span className="font-body text-[11px] font-medium text-fg">
                  {product.burnTime || "Long Lasting"}
                </span>
                <span className="font-body text-[10px] text-fg/45">Scented throw</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <Truck size={18} className="text-gold" />
                <span className="font-body text-[11px] font-medium text-fg">Pan-India</span>
                <span className="font-body text-[10px] text-fg/45">Dispatched in 24h</span>
              </div>
            </div>
          </div>

          {/* RIGHT: Product Details */}
          <div className="flex flex-col gap-6">
            <div>
              {product.collection && (
                <span className="font-body text-xs uppercase tracking-widest text-gold">
                  {product.collection}
                </span>
              )}
              <h1 className="mt-1 font-display text-3xl sm:text-4xl text-fg">{product.name}</h1>
              <div className="mt-2.5 flex items-center gap-3">
                <StarRating rating={product.rating} reviewCount={product.reviewCount} />
                <span className="text-xs text-fg/40">•</span>
                <span className="font-body text-xs text-emerald-500 font-medium flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  In Stock & Ready to Ship
                </span>
              </div>
            </div>

            {/* Price Box */}
            <div className="flex items-baseline gap-3 border-y border-edge/10 py-4">
              <span className="font-display text-3xl font-normal text-fg">
                {formatINR(product.price)}
              </span>
              {product.compareAtPrice && product.compareAtPrice > product.price && (
                <>
                  <span className="font-body text-base text-fg/40 line-through">
                    {formatINR(product.compareAtPrice)}
                  </span>
                  <span className="rounded-full bg-gold/15 px-2.5 py-0.5 font-body text-xs font-semibold text-gold">
                    {discountPercent}% OFF
                  </span>
                </>
              )}
              <span className="ml-auto font-body text-xs text-fg/45">Inclusive of all taxes</span>
            </div>

            {/* Tagline & Description */}
            {product.tagline && (
              <p className="font-display text-lg italic text-gold/90">{product.tagline}</p>
            )}
            <p className="font-body text-sm leading-relaxed text-fg/75">{product.description}</p>

            {/* Color / Vessel Selector (if applicable) */}
            {product.colors && product.colors.length > 0 && (
              <div className="flex flex-col gap-2">
                <label className="font-body text-xs uppercase tracking-widest text-fg/55">
                  Available Color / Finish: <strong className="text-fg">{selectedColor}</strong>
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((c) => (
                    <button
                      key={c}
                      onClick={() => setSelectedColor(c)}
                      className={cn(
                        "rounded-full border px-3.5 py-1.5 font-body text-xs transition-all",
                        selectedColor === c
                          ? "border-gold bg-gold/10 text-gold font-medium"
                          : "border-edge/20 text-fg/70 hover:border-gold/50"
                      )}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Fragrance Selector for Diffusers or Custom products */}
            {product.category === "Home Diffusers" || product.category === "Fragrance Oils" ? (
              <div className="flex flex-col gap-2">
                <label className="font-body text-xs uppercase tracking-widest text-fg/55">
                  Select Fragrance: <strong className="text-gold">{selectedFragrance}</strong>
                </label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {diffuserFragrances.map((f) => (
                    <button
                      key={f}
                      onClick={() => setSelectedFragrance(f)}
                      className={cn(
                        "rounded-sm border p-2 text-left font-body text-xs transition-all",
                        selectedFragrance === f
                          ? "border-gold bg-gold/10 text-gold font-medium"
                          : "border-edge/20 text-fg/70 hover:border-gold/50"
                      )}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {/* Quantity and Action Buttons */}
            <div className="flex flex-col gap-3 pt-2">
              <div className="flex items-center gap-3">
                {/* Quantity input */}
                <div className="flex h-12 items-center rounded-full border border-edge/25 bg-surface px-2">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="flex h-8 w-8 items-center justify-center text-fg/70 hover:text-gold"
                    aria-label="Decrease quantity"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-8 text-center font-body text-sm font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                    className="flex h-8 w-8 items-center justify-center text-fg/70 hover:text-gold"
                    aria-label="Increase quantity"
                  >
                    <Plus size={14} />
                  </button>
                </div>

                {/* Add to Cart */}
                <button
                  onClick={handleAddToCart}
                  className="btn-gold flex-1 h-12 text-sm font-medium tracking-wide flex items-center justify-center gap-2"
                >
                  {justAdded ? (
                    <>
                      <Check size={18} /> Added to Bag
                    </>
                  ) : (
                    <>
                      <ShoppingBag size={18} /> Add to Bag • {formatINR(product.price * quantity)}
                    </>
                  )}
                </button>

                {/* Share Button */}
                <button
                  onClick={handleShare}
                  aria-label="Share product"
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-edge/25 text-fg/70 hover:border-gold hover:text-gold transition-colors"
                >
                  <Share2 size={16} />
                </button>
              </div>

              {/* Buy Now Button */}
              <button
                onClick={handleBuyNow}
                className="btn-outline w-full h-12 text-sm font-medium tracking-wide flex items-center justify-center gap-2 hover:bg-gold/10"
              >
                <Zap size={16} className="text-gold" /> Buy Now with 1-Click Checkout
              </button>

              {copiedLink && (
                <p className="text-center font-body text-xs text-gold">Link copied to clipboard!</p>
              )}
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-2 border-t border-edge/10 pt-4 text-center font-body text-[11px] text-fg/60">
              <div className="flex flex-col items-center gap-1">
                <ShieldCheck size={16} className="text-gold" />
                <span>100% Authentic Handcrafted</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <Truck size={16} className="text-gold" />
                <span>Free Shipping &gt; ₹1999</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <RotateCcw size={16} className="text-gold" />
                <span>48-hr Damage Replacement</span>
              </div>
            </div>

            {/* Accordion Tabs */}
            <div className="flex flex-col divide-y divide-edge/10 border-t border-edge/10 pt-2">
              {/* Scent & Fragrance Profile */}
              {(product.notes || product.fragranceProfile || matchedFragrance) && (
                <div className="py-4">
                  <button
                    onClick={() => toggleAccordion("notes")}
                    className="flex w-full items-center justify-between font-display text-base text-fg hover:text-gold"
                  >
                    <span>Fragrance Notes & Scent Mood</span>
                    <ChevronDown
                      size={18}
                      className={cn("transition-transform duration-300", openAccordions.notes ? "rotate-180 text-gold" : "text-fg/40")}
                    />
                  </button>
                  <AnimatePresence initial={false}>
                    {openAccordions.notes && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-3 flex flex-col gap-3 font-body text-xs text-fg/75">
                          {(product.fragranceProfile || matchedFragrance?.profile) && (
                            <p>
                              <strong className="text-gold">Scent Profile:</strong>{" "}
                              {product.fragranceProfile || matchedFragrance?.profile}
                            </p>
                          )}
                          {(product.mood || matchedFragrance?.mood) && (
                            <p>
                              <strong className="text-gold">Mood Experience:</strong>{" "}
                              {product.mood || matchedFragrance?.mood}
                            </p>
                          )}
                          {product.notes && (
                            <div className="mt-2 grid grid-cols-3 gap-3 rounded-sm bg-surface p-3 text-center">
                              <div>
                                <span className="uppercase text-[10px] tracking-widest text-gold">Top Notes</span>
                                <p className="mt-1 text-fg/70 font-medium">{product.notes.top.join(", ")}</p>
                              </div>
                              <div className="border-x border-edge/10">
                                <span className="uppercase text-[10px] tracking-widest text-gold">Heart Notes</span>
                                <p className="mt-1 text-fg/70 font-medium">{product.notes.heart.join(", ")}</p>
                              </div>
                              <div>
                                <span className="uppercase text-[10px] tracking-widest text-gold">Base Notes</span>
                                <p className="mt-1 text-fg/70 font-medium">{product.notes.base.join(", ")}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Specifications */}
              <div className="py-4">
                <button
                  onClick={() => toggleAccordion("specs")}
                  className="flex w-full items-center justify-between font-display text-base text-fg hover:text-gold"
                >
                  <span>Product Specifications</span>
                  <ChevronDown
                    size={18}
                    className={cn("transition-transform duration-300", openAccordions.specs ? "rotate-180 text-gold" : "text-fg/40")}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {openAccordions.specs && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-3 grid grid-cols-2 gap-y-2 gap-x-4 font-body text-xs text-fg/70 sm:grid-cols-2">
                        {product.capacity && (
                          <div className="border-b border-edge/5 pb-1.5">
                            <span className="text-fg/45">Capacity / Volume:</span>
                            <p className="font-medium text-fg">{product.capacity}</p>
                          </div>
                        )}
                        {product.burnTime && (
                          <div className="border-b border-edge/5 pb-1.5">
                            <span className="text-fg/45">Burn / Diffusion Time:</span>
                            <p className="font-medium text-fg">{product.burnTime}</p>
                          </div>
                        )}
                        {product.containerType && (
                          <div className="border-b border-edge/5 pb-1.5">
                            <span className="text-fg/45">Container / Vessel:</span>
                            <p className="font-medium text-fg">{product.containerType}</p>
                          </div>
                        )}
                        {product.weight && (
                          <div className="border-b border-edge/5 pb-1.5">
                            <span className="text-fg/45">Gross Weight:</span>
                            <p className="font-medium text-fg">{product.weight}</p>
                          </div>
                        )}
                        {product.kitIncludes && (
                          <div className="border-b border-edge/5 pb-1.5 col-span-2">
                            <span className="text-fg/45">Kit Contents:</span>
                            <p className="font-medium text-fg">{product.kitIncludes}</p>
                          </div>
                        )}
                        <div className="border-b border-edge/5 pb-1.5">
                          <span className="text-fg/45">Wax / Ingredients:</span>
                          <p className="font-medium text-fg">Natural Soy Wax &amp; Fine Oils</p>
                        </div>
                        <div className="border-b border-edge/5 pb-1.5">
                          <span className="text-fg/45">Origin:</span>
                          <p className="font-medium text-fg">Handcrafted in Sohna, Gurgaon, India</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Usage & Care Instructions */}
              {(product.careInstructions || product.usageInstructions) && (
                <div className="py-4">
                  <button
                    onClick={() => toggleAccordion("care")}
                    className="flex w-full items-center justify-between font-display text-base text-fg hover:text-gold"
                  >
                    <span>Usage Ritual &amp; Care Guide</span>
                    <ChevronDown
                      size={18}
                      className={cn("transition-transform duration-300", openAccordions.care ? "rotate-180 text-gold" : "text-fg/40")}
                    />
                  </button>
                  <AnimatePresence initial={false}>
                    {openAccordions.care && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-3 flex flex-col gap-3 font-body text-xs leading-relaxed text-fg/75">
                          {product.usageInstructions && (
                            <div>
                              <strong className="text-gold uppercase tracking-wider text-[11px] block mb-1">How to Use:</strong>
                              <p>{product.usageInstructions}</p>
                            </div>
                          )}
                          {product.careInstructions && (
                            <div className="mt-2">
                              <strong className="text-gold uppercase tracking-wider text-[11px] block mb-1">Care &amp; Safety:</strong>
                              <p>{product.careInstructions}</p>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Shipping & Gifting */}
              <div className="py-4">
                <button
                  onClick={() => toggleAccordion("shipping")}
                  className="flex w-full items-center justify-between font-display text-base text-fg hover:text-gold"
                >
                  <span>Shipping, Gifting &amp; Delivery</span>
                  <ChevronDown
                    size={18}
                    className={cn("transition-transform duration-300", openAccordions.shipping ? "rotate-180 text-gold" : "text-fg/40")}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {openAccordions.shipping && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-3 flex flex-col gap-2 font-body text-xs leading-relaxed text-fg/75">
                        <p>📦 <strong>Dispatched within 24–48 hours</strong> from our studio in Sohna, Gurgaon.</p>
                        <p>🎁 Every order is packed in our protective, signature presentation box — gift-ready with no extra wrapping needed.</p>
                        <p>🚚 <strong>FREE Pan-India Shipping</strong> on all orders of ₹1,999 and above. Flat ₹99 for orders under ₹1,999.</p>
                        <p>🛡️ <strong>Damage Guarantee:</strong> Report any transit damage within 48 hours of delivery for an immediate free replacement.</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>

        {/* Customer Reviews Section */}
        <section className="mt-20 border-t border-edge/10 pt-16">
          <div className="flex flex-col items-center text-center">
            <span className="font-body text-xs uppercase tracking-widest text-gold">Verified Customer Love</span>
            <h2 className="mt-1 font-display text-3xl">Reviews &amp; Experiences</h2>
            <div className="mt-4 flex items-center gap-3">
              <div className="flex text-gold">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={20} fill="currentColor" />
                ))}
              </div>
              <span className="font-display text-2xl font-semibold">{product.rating}</span>
              <span className="text-xs text-fg/50">Based on {Math.max(12, product.reviewCount)} reviews</span>
            </div>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <ReviewCard
              author="Ananya S."
              location="Gurgaon"
              rating={5}
              title="Exceptional fragrance throw!"
              date="2 weeks ago"
              comment="The scent fill in my master bedroom is incredible. It burns evenly without any tunnelling and the vessel looks so luxurious on my dresser."
            />
            <ReviewCard
              author="Vikram M."
              location="Delhi NCR"
              rating={5}
              title="Worth every single rupee"
              date="1 month ago"
              comment="Bought this along with the car perfume combo pack. Handcrafted quality is top notch. Glimoré is now my permanent candle brand."
            />
            <ReviewCard
              author="Pooja K."
              location="Chandigarh"
              rating={5}
              title="Perfect gift packaging"
              date="3 weeks ago"
              comment="The presentation box was gorgeous and the candle smelled heavenly even before lighting. Received so many compliments from my guests!"
            />
          </div>
        </section>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-24 border-t border-edge/10 pt-16">
            <div className="mb-10 flex items-center justify-between">
              <div>
                <span className="font-body text-xs uppercase tracking-widest text-gold">Handcrafted Pairings</span>
                <h2 className="mt-1 font-display text-3xl">You May Also Admire</h2>
              </div>
              <Link href="/shop" className="link-underline font-body text-xs uppercase tracking-widest text-gold">
                View All
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {relatedProducts.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Sticky Mobile Buy Bar (Shown only on small screens) */}
      <div className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-between border-t border-edge/15 bg-surface/95 px-5 py-3 backdrop-blur-md lg:hidden">
        <div>
          <p className="font-display text-lg leading-none">{formatINR(product.price * quantity)}</p>
          <span className="font-body text-[10px] text-emerald-500 font-medium">In Stock</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleAddToCart}
            className="btn-gold px-5 py-2.5 text-xs uppercase tracking-widest"
          >
            {justAdded ? "Added!" : "+ Add to Bag"}
          </button>
        </div>
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[95] flex items-center justify-center bg-ink/95 p-4 backdrop-blur-md"
            onClick={() => setLightboxOpen(false)}
          >
            <button
              onClick={() => setLightboxOpen(false)}
              className="absolute right-6 top-6 text-cream/70 hover:text-gold"
            >
              <X size={28} />
            </button>
            <div className="relative max-h-[90vh] max-w-4xl aspect-[4/5] w-full">
              <Image
                src={images[activeImageIndex]}
                alt={product.name}
                fill
                sizes="90vw"
                className="object-contain"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ReviewCard({
  author,
  location,
  rating,
  title,
  date,
  comment,
}: {
  author: string;
  location: string;
  rating: number;
  title: string;
  date: string;
  comment: string;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-sm border border-edge/10 bg-surface p-6">
      <div className="flex items-center justify-between">
        <div className="flex text-gold">
          {[...Array(rating)].map((_, i) => (
            <Star key={i} size={14} fill="currentColor" />
          ))}
        </div>
        <span className="font-body text-[10px] text-fg/40">{date}</span>
      </div>
      <div>
        <h4 className="font-display text-base font-medium text-fg">{title}</h4>
        <p className="mt-1 font-body text-xs leading-relaxed text-fg/65">{comment}</p>
      </div>
      <div className="mt-auto flex items-center gap-2 border-t border-edge/10 pt-3">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gold/15 text-[10px] font-medium text-gold">
          {author[0]}
        </span>
        <span className="font-body text-xs font-medium text-fg">{author}</span>
        <span className="font-body text-[10px] text-fg/45">— {location}</span>
        <span className="ml-auto rounded bg-emerald-500/10 px-1.5 py-0.5 font-body text-[9px] text-emerald-500 font-medium">
          Verified Buyer
        </span>
      </div>
    </div>
  );
}
