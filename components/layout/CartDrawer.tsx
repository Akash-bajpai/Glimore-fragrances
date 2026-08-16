"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { X, Minus, Plus, Trash2, ShoppingBag, Truck, ArrowRight, Heart } from "lucide-react";
import { useCart, getLineKey } from "@/components/providers/CartProvider";
import { products } from "@/data/products";
import { formatINR, cn } from "@/lib/utils";
import { Product } from "@/types";

export function CartDrawer() {
  const {
    isDrawerOpen,
    closeDrawer,
    drawerTab,
    lines,
    updateQuantity,
    removeFromCart,
    cartTotal,
    freeShippingRemaining,
    freeShippingProgress,
    wishlist,
    toggleWishlist,
    addToCart,
    openDrawer,
  } = useCart();

  const lineItems = lines
    .map((l) => {
      const product = products.find((p) => p.id === l.productId);
      return product ? { line: l, product, key: getLineKey(l) } : null;
    })
    .filter((x): x is { line: (typeof lines)[0]; product: Product; key: string } => Boolean(x));

  const wishlistItems = wishlist
    .map((id) => products.find((p) => p.id === id))
    .filter((x): x is Product => Boolean(x));

  return (
    <AnimatePresence>
      {isDrawerOpen && (
        <motion.div className="fixed inset-0 z-[75]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-ink/70 backdrop-blur-sm"
            onClick={closeDrawer}
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-surface shadow-soft"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-edge/10 px-6 py-5 sm:px-8">
              <div className="flex gap-6">
                <button
                  onClick={() => openDrawer("cart")}
                  className={cn(
                    "font-display text-lg transition-colors",
                    drawerTab === "cart" ? "text-gold" : "text-fg/40 hover:text-fg"
                  )}
                >
                  Shopping Bag ({lineItems.reduce((acc, i) => acc + i.line.quantity, 0)})
                </button>
                <button
                  onClick={() => openDrawer("wishlist")}
                  className={cn(
                    "font-display text-lg transition-colors",
                    drawerTab === "wishlist" ? "text-gold" : "text-fg/40 hover:text-fg"
                  )}
                >
                  Wishlist ({wishlistItems.length})
                </button>
              </div>
              <button
                onClick={closeDrawer}
                aria-label="Close drawer"
                className="flex h-9 w-9 items-center justify-center rounded-full text-fg/70 transition-colors hover:text-gold"
              >
                <X size={18} />
              </button>
            </div>

            {/* Free Shipping Progress Bar */}
            {drawerTab === "cart" && lineItems.length > 0 && (
              <div className="border-b border-edge/10 bg-bg/50 px-6 py-3 sm:px-8">
                <div className="flex items-center gap-2 text-xs">
                  <Truck size={14} className="text-gold" />
                  {freeShippingRemaining > 0 ? (
                    <span className="font-body text-fg/70">
                      Add <strong className="text-gold">{formatINR(freeShippingRemaining)}</strong> more for <strong>FREE Pan-India Shipping</strong>
                    </span>
                  ) : (
                    <span className="font-body font-medium text-gold">
                      🎉 You unlocked FREE Pan-India Shipping!
                    </span>
                  )}
                </div>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-edge/15">
                  <div
                    className="h-full rounded-full bg-gold transition-all duration-500"
                    style={{ width: `${freeShippingProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-6 py-6 sm:px-8">
              {drawerTab === "cart" ? (
                lineItems.length === 0 ? (
                  <EmptyState
                    icon={<ShoppingBag size={32} strokeWidth={1.2} />}
                    title="Your shopping bag is empty"
                    text="Explore our luxury candles, refillable car perfumes, and aroma rituals."
                    ctaText="Discover Collections"
                    onCtaClick={closeDrawer}
                  />
                ) : (
                  <ul className="flex flex-col gap-6">
                    {lineItems.map(({ line, product, key }) => (
                      <li key={key} className="flex gap-4 border-b border-edge/10 pb-5">
                        <Link
                          href={`/products/${product.slug}`}
                          onClick={closeDrawer}
                          className="relative h-24 w-20 shrink-0 overflow-hidden rounded-sm bg-bg"
                        >
                          <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            sizes="80px"
                            className="object-cover"
                          />
                        </Link>
                        <div className="flex flex-1 flex-col justify-between">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <Link
                                href={`/products/${product.slug}`}
                                onClick={closeDrawer}
                                className="font-display text-base leading-tight hover:text-gold"
                              >
                                {product.name}
                              </Link>
                              <p className="mt-0.5 font-body text-xs text-fg/50">{product.collection || product.category}</p>
                              {(line.fragrance || line.color) && (
                                <div className="mt-1 flex flex-wrap gap-1">
                                  {line.fragrance && (
                                    <span className="rounded bg-gold/10 px-1.5 py-0.5 font-body text-[10px] text-gold">
                                      {line.fragrance}
                                    </span>
                                  )}
                                  {line.color && (
                                    <span className="rounded bg-edge/10 px-1.5 py-0.5 font-body text-[10px] text-fg/60">
                                      {line.color}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                            <button
                              onClick={() => removeFromCart(key)}
                              aria-label="Remove item"
                              className="text-fg/40 transition-colors hover:text-gold"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                          <div className="mt-3 flex items-center justify-between">
                            <div className="flex items-center rounded-full border border-edge/20">
                              <button
                                onClick={() => updateQuantity(key, line.quantity - 1)}
                                className="flex h-7 w-7 items-center justify-center text-fg/70 hover:text-gold"
                                aria-label="Decrease quantity"
                              >
                                <Minus size={12} />
                              </button>
                              <span className="w-6 text-center font-body text-xs">{line.quantity}</span>
                              <button
                                onClick={() => updateQuantity(key, line.quantity + 1)}
                                className="flex h-7 w-7 items-center justify-center text-fg/70 hover:text-gold"
                                aria-label="Increase quantity"
                              >
                                <Plus size={12} />
                              </button>
                            </div>
                            <span className="font-body text-sm font-semibold text-fg">
                              {formatINR(product.price * line.quantity)}
                            </span>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )
              ) : wishlistItems.length === 0 ? (
                <EmptyState
                  icon={<Heart size={32} strokeWidth={1.2} />}
                  title="Your wishlist is empty"
                  text="Save your favorite fragrances and candles to revisit them anytime."
                  ctaText="Explore Best Sellers"
                  onCtaClick={closeDrawer}
                />
              ) : (
                <ul className="flex flex-col gap-6">
                  {wishlistItems.map((product) => (
                    <li key={product.id} className="flex gap-4 border-b border-edge/10 pb-5">
                      <Link
                        href={`/products/${product.slug}`}
                        onClick={closeDrawer}
                        className="relative h-24 w-20 shrink-0 overflow-hidden rounded-sm bg-bg"
                      >
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          sizes="80px"
                          className="object-cover"
                        />
                      </Link>
                      <div className="flex flex-1 flex-col justify-between">
                        <div>
                          <Link
                            href={`/products/${product.slug}`}
                            onClick={closeDrawer}
                            className="font-display text-base leading-tight hover:text-gold"
                          >
                            {product.name}
                          </Link>
                          <p className="mt-0.5 font-body text-xs text-fg/50">{formatINR(product.price)}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => {
                              addToCart(product.id, 1);
                            }}
                            className="font-body text-xs uppercase tracking-widest text-gold hover:underline"
                          >
                            + Move to Bag
                          </button>
                          <button
                            onClick={() => toggleWishlist(product.id)}
                            className="font-body text-xs uppercase tracking-widest text-fg/40 hover:text-fg/70"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Footer summary */}
            {drawerTab === "cart" && lineItems.length > 0 && (
              <div className="border-t border-edge/10 bg-surface px-6 py-6 sm:px-8">
                <div className="mb-4 flex items-center justify-between font-body text-sm">
                  <span className="text-fg/60">Subtotal</span>
                  <span className="font-display text-xl">{formatINR(cartTotal)}</span>
                </div>
                <Link
                  href="/checkout"
                  onClick={closeDrawer}
                  className="btn-gold flex w-full items-center justify-center gap-2 py-4"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight size={16} />
                </Link>
                <div className="mt-3 flex items-center justify-center gap-2 text-center font-body text-[11px] text-fg/45">
                  <span>🔒 256-Bit SSL Encrypted</span>
                  <span>•</span>
                  <span>UPI, Cards, NetBanking, COD</span>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function EmptyState({
  icon,
  title,
  text,
  ctaText,
  onCtaClick,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
  ctaText: string;
  onCtaClick: () => void;
}) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 py-20 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gold/10 text-gold">
        {icon}
      </div>
      <h3 className="font-display text-xl text-fg">{title}</h3>
      <p className="max-w-xs font-body text-xs leading-relaxed text-fg/55">{text}</p>
      <Link
        href="/shop"
        onClick={onCtaClick}
        className="btn-outline mt-2 px-6 py-2.5 text-xs uppercase tracking-widest"
      >
        {ctaText}
      </Link>
    </div>
  );
}
