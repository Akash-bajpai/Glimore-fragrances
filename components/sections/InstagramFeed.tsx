"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Instagram } from "lucide-react";
import { siteConfig } from "@/data/content";

const feed = [
  "/images/products/royal-rose-bloom-pearl.jpg",
  "/images/products/velvet-ylang-a.jpg",
  "/images/products/oudwood-reserve.jpg",
  "/images/products/azure-breeze.jpg",
  "/images/products/vanilla-velvet.jpg",
  "/images/products/royal-rose-bloom-flower.jpg",
];

export function InstagramFeed() {
  return (
    <section className="section-px mx-auto max-w-content py-24 sm:py-32">
      <div className="mb-12 flex flex-col items-center gap-3 text-center">
        <Instagram size={22} className="text-gold" />
        <h2 className="font-display text-3xl sm:text-4xl">@glimorefragrances</h2>
        <a
          href={siteConfig.instagram}
          target="_blank"
          rel="noopener noreferrer"
          className="link-underline font-body text-xs uppercase tracking-widest text-gold"
        >
          Follow Along
        </a>
      </div>

      <div className="grid grid-cols-3 gap-2 sm:gap-4 lg:grid-cols-6">
        {feed.map((src, i) => (
          <motion.a
            href={siteConfig.instagram}
            target="_blank"
            rel="noopener noreferrer"
            key={src + i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, delay: i * 0.06 }}
            className="group relative aspect-square overflow-hidden rounded-sm"
          >
            <Image
              src={src}
              alt="Glimoré on Instagram"
              fill
              sizes="(max-width: 768px) 33vw, 16vw"
              className="object-cover transition-transform duration-700 ease-luxury group-hover:scale-110"
            />
            <span className="absolute inset-0 flex items-center justify-center bg-ink/0 text-cream opacity-0 transition-all duration-300 group-hover:bg-ink/40 group-hover:opacity-100">
              <Instagram size={20} />
            </span>
          </motion.a>
        ))}
      </div>
    </section>
  );
}
