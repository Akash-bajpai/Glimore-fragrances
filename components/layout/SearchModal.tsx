"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Search, X } from "lucide-react";
import { products } from "@/data/products";
import { formatINR } from "@/lib/utils";

interface SearchModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (productId: string) => void;
}

export function SearchModal({ open, onClose, onSelect }: SearchModalProps) {
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const results = useMemo(() => {
    if (!query.trim()) return products;
    const q = query.toLowerCase();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.collection.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        [...p.notes.top, ...p.notes.heart, ...p.notes.base].some((n) =>
          n.toLowerCase().includes(q)
        )
    );
  }, [query]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[85] flex items-start justify-center px-4 pt-24 sm:pt-32"
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
            initial={{ opacity: 0, y: -16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.98 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-xl overflow-hidden rounded-sm bg-surface shadow-soft"
          >
            <div className="flex items-center gap-3 border-b border-edge/10 px-5 py-4">
              <Search size={18} className="text-fg/40" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search candles, notes, collections..."
                className="flex-1 bg-transparent font-body text-sm text-fg placeholder:text-fg/35 focus:outline-none"
              />
              <button onClick={onClose} aria-label="Close search" className="text-fg/40 hover:text-gold">
                <X size={18} />
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto p-2">
              {results.length === 0 ? (
                <p className="px-4 py-10 text-center font-body text-sm text-fg/40">
                  No candles found for &quot;{query}&quot;
                </p>
              ) : (
                results.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      onSelect(p.id);
                      onClose();
                    }}
                    className="flex w-full items-center gap-4 rounded-sm px-3 py-3 text-left transition-colors hover:bg-bg"
                  >
                    <div className="relative h-14 w-12 shrink-0 overflow-hidden rounded-sm">
                      <Image src={p.image} alt={p.name} fill className="object-cover" />
                    </div>
                    <div className="flex-1">
                      <p className="font-display text-base">{p.name}</p>
                      <p className="font-body text-xs text-fg/45">{p.collection}</p>
                    </div>
                    <span className="font-body text-sm text-fg/70">{formatINR(p.price)}</span>
                  </button>
                ))
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
