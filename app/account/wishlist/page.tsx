"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Heart, ShoppingBag } from "lucide-react";
import { useCart } from "@/components/providers/CartProvider";
import { formatINR } from "@/lib/utils";

interface WishlistProduct {
  id: string;
  name: string;
  image: string;
  price: number;
  collection: string | null;
}

export default function WishlistPage() {
  const { addToCart } = useCart();
  const [items, setItems] = useState<WishlistProduct[] | null>(null);

  useEffect(() => {
    fetch("/api/wishlist")
      .then((r) => r.json())
      .then((d) => setItems(d.success ? d.data : []));
  }, []);

  async function remove(productId: string) {
    await fetch("/api/wishlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId }),
    });
    setItems((prev) => prev?.filter((i) => i.id !== productId) ?? null);
  }

  if (!items) return <div className="py-10 text-fg/40">Loading...</div>;

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-sm border border-edge/10 bg-surface py-16 text-center">
        <Heart size={28} className="text-fg/30" />
        <p className="font-body text-sm text-fg/50">Nothing saved yet.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {items.map((item) => (
        <div key={item.id} className="flex gap-4 rounded-sm border border-edge/10 bg-surface p-4">
          <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-sm">
            <Image src={item.image} alt={item.name} fill className="object-cover" />
          </div>
          <div className="flex flex-1 flex-col justify-between">
            <div>
              <p className="font-display text-base">{item.name}</p>
              <p className="mt-1 font-body text-xs text-fg/45">{formatINR(item.price)}</p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => addToCart(item.id, 1)}
                className="flex items-center gap-1.5 font-body text-xs uppercase tracking-widest text-gold link-underline"
              >
                <ShoppingBag size={13} /> Add to Bag
              </button>
              <button
                onClick={() => remove(item.id)}
                className="font-body text-xs uppercase tracking-widest text-fg/40 hover:text-fg/70"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
