"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { ChevronDown } from "lucide-react";
import { FlameMark } from "@/components/ui/FlameMark";

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "35%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);

  const embers = Array.from({ length: 14 });

  return (
    <section id="top" ref={ref} className="relative flex h-[100svh] w-full items-center justify-center overflow-hidden bg-ink">
      <motion.div style={{ y, scale }} className="absolute inset-0">
        <video
          className="h-full w-full object-cover"
          src="/videos/hero-loop.mp4"
          poster="/images/lifestyle/hero-poster.jpg"
          autoPlay
          muted
          loop
          playsInline
        />
      </motion.div>

      <div className="absolute inset-0 bg-gradient-to-b from-ink/70 via-ink/45 to-ink" />
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-ink/30" />

      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        {embers.map((_, i) => (
          <span
            key={i}
            className="absolute bottom-0 block h-1 w-1 rounded-full bg-gold/70"
            style={
              {
                left: `${8 + i * 6.5}%`,
                animation: `ember ${6 + (i % 5)}s ease-in ${i * 0.6}s infinite`,
                "--drift": `${(i % 2 === 0 ? 1 : -1) * (10 + i)}px`,
              } as React.CSSProperties
            }
          />
        ))}
      </div>

      <motion.div style={{ opacity }} className="section-px relative z-10 flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        >
          <FlameMark className="mx-auto mb-6 h-9 w-auto" />
        </motion.div>

        <motion.span
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="font-body text-xs uppercase tracking-widest2 text-gold sm:text-sm"
        >
          Hand-Poured in Sohna, Gurgaon
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="balance mt-5 max-w-4xl font-display text-5xl font-normal leading-[1.05] text-cream sm:text-7xl lg:text-8xl"
        >
          Illuminate Every Moment
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.95, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="balance mt-6 max-w-lg font-body text-base leading-relaxed text-cream/70 sm:text-lg"
        >
          Small-batch soy candles, poured by hand with rare fragrance oils — for the
          moments that deserve more than ordinary light.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="mt-10 flex flex-wrap items-center justify-center gap-4"
        >
          <a href="#best-sellers" className="btn-gold">
            Shop Now
          </a>
          <a
            href="#collections"
            className="inline-flex items-center gap-2 rounded-full border border-cream/25 px-8 py-3.5 font-body text-sm font-medium tracking-wide text-cream transition-all duration-500 ease-luxury hover:border-gold hover:text-gold"
          >
            Explore Collection
          </a>
        </motion.div>
      </motion.div>

      <motion.a
        href="#collections"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6, duration: 1 }}
        className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2 text-cream/60"
        aria-label="Scroll down"
      >
        <span className="font-body text-[10px] uppercase tracking-widest2">Scroll</span>
        <motion.span animate={{ y: [0, 6, 0] }} transition={{ duration: 1.8, repeat: Infinity }}>
          <ChevronDown size={18} />
        </motion.span>
      </motion.a>
    </section>
  );
}
