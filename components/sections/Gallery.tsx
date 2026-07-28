"use client";

import Image from "next/image";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Play } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";

type GalleryItem =
  | { type: "image"; src: string; alt: string; span?: "tall" | "short" }
  | { type: "video"; src: string; poster: string; alt: string; span?: "tall" | "short" };

const items: GalleryItem[] = [
  { type: "image", src: "/images/products/royal-rose-bloom-flower.jpg", alt: "Royal Rose Bloom, lit", span: "tall" },
  { type: "image", src: "/images/products/velvet-ylang-b.jpg", alt: "Velvet Ylang close-up", span: "tall" },
  { type: "video", src: "/videos/gallery-loop.mp4", poster: "/images/lifestyle/gallery-poster.jpg", alt: "Glimoré candles, in motion", span: "short" },
  { type: "image", src: "/images/products/oudwood-reserve.jpg", alt: "Oudwood Reserve", span: "short" },
  { type: "image", src: "/images/lifestyle/lifestyle-scene.jpg", alt: "Glimoré, styled at home", span: "tall" },
  { type: "image", src: "/images/products/azure-breeze.jpg", alt: "Azure Breeze mandala tin", span: "short" },
  { type: "image", src: "/images/products/vanilla-velvet.jpg", alt: "Vanilla Velvet", span: "tall" },
  { type: "image", src: "/images/products/royal-rose-bloom-pearl.jpg", alt: "Royal Rose Bloom, pearl edition", span: "short" },
];

export function Gallery() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const close = () => setActiveIndex(null);
  const prev = () => setActiveIndex((i) => (i === null ? null : (i - 1 + items.length) % items.length));
  const next = () => setActiveIndex((i) => (i === null ? null : (i + 1) % items.length));

  return (
    <section id="gallery" className="section-px mx-auto max-w-content py-24 sm:py-32">
      <SectionHeading
        eyebrow="In The Wild"
        title="Gallery"
        description="Real light, real rooms — candles from our studio, our exhibitions, and your homes."
        className="mb-14 sm:mb-16"
      />

      <div className="columns-2 gap-4 sm:columns-3 lg:columns-4 [&>*]:mb-4">
        {items.map((item, i) => (
          <motion.button
            key={i}
            onClick={() => setActiveIndex(i)}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.6, delay: (i % 4) * 0.08 }}
            className={`group relative block w-full overflow-hidden rounded-sm ${
              item.span === "tall" ? "aspect-[3/4]" : "aspect-square"
            }`}
          >
            {item.type === "image" ? (
              <Image
                src={item.src}
                alt={item.alt}
                fill
                sizes="(max-width: 768px) 45vw, 25vw"
                className="object-cover transition-transform duration-700 ease-luxury group-hover:scale-[1.08]"
              />
            ) : (
              <>
                <Image src={item.poster} alt={item.alt} fill sizes="25vw" className="object-cover" />
                <span className="absolute inset-0 flex items-center justify-center bg-ink/30">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-cream/90 text-ink">
                    <Play size={16} className="ml-0.5" fill="currentColor" />
                  </span>
                </span>
              </>
            )}
            <span className="absolute inset-0 bg-ink/0 transition-colors duration-300 group-hover:bg-ink/10" />
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {activeIndex !== null && (
          <motion.div
            className="fixed inset-0 z-[90] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="absolute inset-0 bg-ink/90 backdrop-blur-md"
              onClick={close}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            <button
              onClick={close}
              aria-label="Close"
              className="absolute right-6 top-6 z-10 text-cream/70 hover:text-gold"
            >
              <X size={26} />
            </button>
            <button
              onClick={prev}
              aria-label="Previous"
              className="absolute left-4 z-10 text-cream/60 hover:text-gold sm:left-8"
            >
              <ChevronLeft size={30} />
            </button>
            <button
              onClick={next}
              aria-label="Next"
              className="absolute right-4 z-10 text-cream/60 hover:text-gold sm:right-8"
            >
              <ChevronRight size={30} />
            </button>

            <motion.div
              key={activeIndex}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="relative max-h-[85vh] w-full max-w-2xl"
            >
              {items[activeIndex].type === "image" ? (
                <div className="relative aspect-[4/5] w-full">
                  <Image
                    src={items[activeIndex].src}
                    alt={items[activeIndex].alt}
                    fill
                    sizes="90vw"
                    className="object-contain"
                  />
                </div>
              ) : (
                <video
                  src={items[activeIndex].src}
                  className="max-h-[85vh] w-full rounded-sm"
                  controls
                  autoPlay
                  loop
                  playsInline
                />
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
