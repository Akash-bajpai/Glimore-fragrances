"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { X, Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useCart } from "@/components/providers/CartProvider";
import { products } from "@/data/products";
import { formatINR, cn } from "@/lib/utils";

export function CartDrawer() {
  const {
    isDrawerOpen,
    closeDrawer,
    drawerTab,
    lines,
    updateQuantity,
    removeFromCart,
    cartTotal,
    wishlist,
    toggleWishlist,
    addToCart,
    openDrawer,
  } = useCart();

  const lineItems = lines
    .map((l) => ({ line: l, product: products.find((p) => p.id === l.productId) }))
    .filter((x) => x.product);

  const wishlistItems = wishlist
    .map((id) => products.find((p) => p.id === id))
    .filter(Boolean);

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
            className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-surface"
          >
            <div className="flex items-center justify-between border-b border-edge/10 px-6 py-5 sm:px-8">
              <div className="flex gap-6">
                <button
                  onClick={() => openDrawer("cart")}
                  className={cn(
                    "font-display text-lg transition-colors",
                    drawerTab === "cart" ? "text-gold" : "text-fg/40"
                  )}
                >
                  Bag ({lineItems.length})
                </button>
                <button
                  onClick={() => openDrawer("wishlist")}
                  className={cn(
                    "font-display text-lg transition-colors",
                    drawerTab === "wishlist" ? "text-gold" : "text-fg/40"
                  )}
                >
                  Wishlist ({wishlistItems.length})
                </button>
              </div>
              <button
                onClick={closeDrawer}
                aria-label="Close"
                className="flex h-9 w-9 items-center justify-center rounded-full text-fg/70 hover:text-gold"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-6 sm:px-8">
              {drawerTab === "cart" ? (
                lineItems.length === 0 ? (
                  <EmptyState
                    icon={<ShoppingBag size={28} strokeWidth={1.2} />}
                    text="Your bag is quiet, for now."
                  />
                ) : (
                  <ul className="flex flex-col gap-6">
                    {lineItems.map(({ line, product }) => (
                      <li key={line.productId} className="flex gap-4">
                        <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-sm bg-bg">
                          <Image src={product!.image} alt={product!.name} fill className="object-cover" />
                        </div>
                        <div className="flex flex-1 flex-col justify-between">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="font-display text-base leading-tight">{product!.name}</p>
                              <p className="mt-1 font-body text-xs text-fg/50">{product!.collection}</p>
                            </div>
                            <button
                              onClick={() => removeFromCart(line.productId)}
                              aria-label="Remove"
                              className="text-fg/40 hover:text-gold"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center rounded-full border border-edge/20">
                              <button
                                onClick={() => updateQuantity(line.productId, line.quantity - 1)}
                                className="flex h-7 w-7 items-center justify-center text-fg/70 hover:text-gold"
                                aria-label="Decrease"
                              >
                                <Minus size={12} />
                              </button>
                              <span className="w-6 text-center font-body text-xs">{line.quantity}</span>
                              <button
                                onClick={() => updateQuantity(line.productId, line.quantity + 1)}
                                className="flex h-7 w-7 items-center justify-center text-fg/70 hover:text-gold"
                                aria-label="Increase"
                              >
                                <Plus size={12} />
                              </button>
                            </div>
                            <span className="font-body text-sm">
                              {formatINR(product!.price * line.quantity)}
                            </span>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )
              ) : wishlistItems.length === 0 ? (
                <EmptyState icon={<ShoppingBag size={28} strokeWidth={1.2} />} text="Nothing saved yet." />
              ) : (
                <ul className="flex flex-col gap-6">
                  {wishlistItems.map((product) => (
                    <li key={product!.id} className="flex gap-4">
                      <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-sm bg-bg">
                        <Image src={product!.image} alt={product!.name} fill className="object-cover" />
                      </div>
                      <div className="flex flex-1 flex-col justify-between">
                        <div>
                          <p className="font-display text-base leading-tight">{product!.name}</p>
                          <p className="mt-1 font-body text-xs text-fg/50">{formatINR(product!.price)}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => addToCart(product!.id, 1)}
                            className="font-body text-xs uppercase tracking-widest text-gold hover:underline"
                          >
                            Add to Bag
                          </button>
                          <button
                            onClick={() => toggleWishlist(product!.id)}
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

            {drawerTab === "cart" && lineItems.length > 0 && (
              <div className="border-t border-edge/10 px-6 py-6 sm:px-8">
                <div className="mb-4 flex items-center justify-between font-body text-sm">
                  <span className="text-fg/60">Subtotal</span>
                  <span className="font-display text-lg">{formatINR(cartTotal)}</span>
                </div>
                <button className="btn-gold w-full">Proceed to Checkout</button>
                <p className="mt-3 text-center font-body text-[11px] text-fg/40">
                  Shipping and taxes calculated at checkout.
                </p>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function EmptyState({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 py-20 text-center">
      <div className="text-gold/60">{icon}</div>
      <p className="font-body text-sm text-fg/50">{text}</p>
    </div>
  );
}
