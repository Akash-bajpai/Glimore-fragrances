"use client";

import { motion } from "framer-motion";
import { Leaf, Hand, Clock, Gift, Truck, Sparkles } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import { StaggerGroup, staggerItem } from "@/components/ui/Reveal";

const features = [
  { icon: Sparkles, title: "Premium Ingredients", text: "Rare fragrance oils and natural soy wax, sourced for purity and scent depth." },
  { icon: Leaf, title: "Eco-Conscious", text: "Biodegradable soy wax, cotton wicks, and reusable glass and tin vessels." },
  { icon: Hand, title: "Handcrafted", text: "Every candle is poured, wicked, and finished entirely by hand in Sohna." },
  { icon: Clock, title: "Long Lasting", text: "35 to 50+ hour burn times, engineered for an even, tunnel-free melt pool." },
  { icon: Gift, title: "Gift Ready", text: "Presentation boxing on every order — ready to give, no wrapping required." },
  { icon: Truck, title: "Fast Shipping", text: "Dispatched within 24-48 hours, protectively packed for pan-India delivery." },
];

const stats = [
  { value: 5000, suffix: "+", label: "Candles Hand-Poured" },
  { value: 4.9, suffix: "/5", label: "Average Rating", decimal: true },
  { value: 100, suffix: "%", label: "Natural Soy Wax" },
  { value: 48, suffix: "hr", label: "Longest Burn Time" },
];

export function WhyChooseUs() {
  return (
    <section className="section-px mx-auto max-w-content py-24 sm:py-32">
      <SectionHeading
        eyebrow="The Glimoré Difference"
        title="Why Choose Us"
        description="Small studio, big attention to detail — from the wax we melt to the box we ship."
        className="mb-14 sm:mb-20"
      />

      <StaggerGroup className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f) => (
          <motion.div
            key={f.title}
            variants={staggerItem}
            whileHover={{ y: -6 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col gap-4 rounded-sm border border-edge/10 bg-surface p-8"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gold/10 text-gold">
              <f.icon size={20} strokeWidth={1.5} />
            </span>
            <h3 className="font-display text-xl">{f.title}</h3>
            <p className="font-body text-sm leading-relaxed text-fg/55">{f.text}</p>
          </motion.div>
        ))}
      </StaggerGroup>

      <div className="mt-20 grid grid-cols-2 gap-8 border-y border-edge/10 py-12 sm:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="flex flex-col items-center gap-2 text-center">
            <span className="font-display text-4xl text-gold sm:text-5xl">
              {s.decimal ? (
                <>4.9{s.suffix}</>
              ) : (
                <AnimatedCounter value={s.value} suffix={s.suffix} />
              )}
            </span>
            <span className="font-body text-xs uppercase tracking-widest text-fg/50">
              {s.label}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
