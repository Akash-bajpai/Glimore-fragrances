"use client";

import { motion } from "framer-motion";
import { Flame, Gift, Home, Sparkle, Star } from "lucide-react";
import { categories } from "@/data/products";
import { SectionHeading } from "@/components/ui/SectionHeading";

const icons = [Flame, Gift, Home, Sparkle, Star];

export function Categories() {
  return (
    <section className="section-px mx-auto max-w-content py-24 sm:py-32">
      <SectionHeading
        eyebrow="Shop By"
        title="Categories"
        className="mb-14 sm:mb-16"
      />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {categories.map((c, i) => {
          const Icon = icons[i % icons.length];
          return (
            <motion.a
              href="#best-sellers"
              key={c.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.6, delay: i * 0.08 }}
              whileHover={{ y: -4 }}
              className="group flex flex-col items-center gap-4 rounded-sm border border-edge/10 bg-surface px-6 py-10 text-center transition-colors hover:border-gold/40"
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-full border border-gold/30 text-gold transition-transform duration-500 group-hover:scale-110">
                <Icon size={22} strokeWidth={1.4} />
              </span>
              <div>
                <h3 className="font-display text-base">{c.name}</h3>
                <p className="mt-1 font-body text-xs text-fg/45">{c.count} pieces</p>
              </div>
            </motion.a>
          );
        })}
      </div>
    </section>
  );
}
