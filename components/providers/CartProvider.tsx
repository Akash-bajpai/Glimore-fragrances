"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  ReactNode,
  useCallback,
} from "react";
import { products } from "@/data/products";
import { CartLine } from "@/types";

type DrawerTab = "cart" | "wishlist";

export const FREE_SHIPPING_THRESHOLD = 1999;

interface CartContextValue {
  lines: CartLine[];
  addToCart: (
    productId: string,
    quantity?: number,
    options?: { fragrance?: string; color?: string; variant?: string }
  ) => void;
  removeFromCart: (lineKey: string) => void;
  updateQuantity: (lineKey: string, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
  freeShippingThreshold: number;
  freeShippingRemaining: number;
  freeShippingProgress: number;

  wishlist: string[];
  toggleWishlist: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;

  recentlyViewed: string[];
  addRecentlyViewed: (productId: string) => void;

  isDrawerOpen: boolean;
  drawerTab: DrawerTab;
  openDrawer: (tab?: DrawerTab) => void;
  closeDrawer: () => void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

function readStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function getLineKey(line: { productId: string; fragrance?: string; color?: string; variant?: string }): string {
  return `${line.productId}::${line.fragrance || ""}::${line.color || ""}::${line.variant || ""}`;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<string[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerTab, setDrawerTab] = useState<DrawerTab>("cart");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setLines(readStorage("glimore-cart", []));
    setWishlist(readStorage("glimore-wishlist", []));
    setRecentlyViewed(readStorage("glimore-recent", []));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) window.localStorage.setItem("glimore-cart", JSON.stringify(lines));
  }, [lines, hydrated]);

  useEffect(() => {
    if (hydrated) window.localStorage.setItem("glimore-wishlist", JSON.stringify(wishlist));
  }, [wishlist, hydrated]);

  useEffect(() => {
    if (hydrated) window.localStorage.setItem("glimore-recent", JSON.stringify(recentlyViewed));
  }, [recentlyViewed, hydrated]);

  const addToCart = useCallback(
    (
      productId: string,
      quantity = 1,
      options?: { fragrance?: string; color?: string; variant?: string }
    ) => {
      const newLine: CartLine = {
        productId,
        quantity,
        fragrance: options?.fragrance,
        color: options?.color,
        variant: options?.variant,
      };
      const newKey = getLineKey(newLine);

      setLines((prev) => {
        const existingIdx = prev.findIndex((l) => getLineKey(l) === newKey);
        if (existingIdx >= 0) {
          const updated = [...prev];
          updated[existingIdx] = {
            ...updated[existingIdx],
            quantity: updated[existingIdx].quantity + quantity,
          };
          return updated;
        }
        return [...prev, newLine];
      });

      setIsDrawerOpen(true);
      setDrawerTab("cart");
    },
    []
  );

  const removeFromCart = useCallback((lineKey: string) => {
    setLines((prev) => prev.filter((l) => getLineKey(l) !== lineKey));
  }, []);

  const updateQuantity = useCallback((lineKey: string, quantity: number) => {
    setLines((prev) => {
      if (quantity <= 0) return prev.filter((l) => getLineKey(l) !== lineKey);
      return prev.map((l) => (getLineKey(l) === lineKey ? { ...l, quantity } : l));
    });
  }, []);

  const clearCart = useCallback(() => {
    setLines([]);
  }, []);

  const toggleWishlist = useCallback((productId: string) => {
    setWishlist((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
    // Best effort sync for authenticated users
    fetch("/api/wishlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId }),
    }).catch(() => {});
  }, []);

  const isWishlisted = useCallback(
    (productId: string) => wishlist.includes(productId),
    [wishlist]
  );

  const addRecentlyViewed = useCallback((productId: string) => {
    setRecentlyViewed((prev) => {
      const next = [productId, ...prev.filter((id) => id !== productId)];
      return next.slice(0, 8);
    });
  }, []);

  const openDrawer = useCallback((tab: DrawerTab = "cart") => {
    setDrawerTab(tab);
    setIsDrawerOpen(true);
  }, []);
  const closeDrawer = useCallback(() => setIsDrawerOpen(false), []);

  const cartCount = useMemo(
    () => lines.reduce((sum, l) => sum + l.quantity, 0),
    [lines]
  );

  const cartTotal = useMemo(
    () =>
      lines.reduce((sum, l) => {
        const product = products.find((p) => p.id === l.productId);
        return sum + (product ? product.price * l.quantity : 0);
      }, 0),
    [lines]
  );

  const freeShippingRemaining = Math.max(0, FREE_SHIPPING_THRESHOLD - cartTotal);
  const freeShippingProgress = Math.min(100, (cartTotal / FREE_SHIPPING_THRESHOLD) * 100);

  const value: CartContextValue = {
    lines,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartCount,
    cartTotal,
    freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
    freeShippingRemaining,
    freeShippingProgress,
    wishlist,
    toggleWishlist,
    isWishlisted,
    recentlyViewed,
    addRecentlyViewed,
    isDrawerOpen,
    drawerTab,
    openDrawer,
    closeDrawer,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
