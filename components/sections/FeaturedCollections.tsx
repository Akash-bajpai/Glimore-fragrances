"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { collections } from "@/data/products";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function FeaturedCollections() {
  return (
    <section id="collections" className="section-px mx-auto max-w-content py-24 sm:py-32">
      <SectionHeading
        eyebrow="Curated Edits"
        title="Featured Collections"
        description="Four fragrance families, each built around a single mood — from bright florals to smoked woods."
        className="mb-14 sm:mb-20"
      />

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {collections.map((c, i) => (
          <motion.a
            href="#best-sellers"
            key={c.name}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.8, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] }}
            className="group relative flex aspect-[3/4] flex-col justify-end overflow-hidden rounded-sm"
          >
            <Image
              src={c.image}
              alt={c.name}
              fill
              sizes="(max-width: 768px) 90vw, 25vw"
              className="object-cover transition-transform duration-[1400ms] ease-luxury group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/20 to-transparent transition-opacity duration-500 group-hover:from-ink/95" />

            <div className="relative z-10 flex flex-col gap-2 p-6">
              <h3 className="font-display text-2xl text-cream">{c.name}</h3>
              <p className="font-body text-xs text-cream/60">{c.description}</p>
              <span className="mt-2 flex items-center gap-1.5 font-body text-[11px] uppercase tracking-widest text-gold opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                Discover <ArrowUpRight size={13} />
              </span>
            </div>
          </motion.a>
        ))}
      </div>
    </section>
  );
}
