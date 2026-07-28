"use client";

import Image from "next/image";
import { Reveal, StaggerGroup, staggerItem } from "@/components/ui/Reveal";
import { motion } from "framer-motion";

const process = [
  {
    n: "01",
    title: "Weigh & Melt",
    text: "Natural soy wax is weighed by hand and slow-melted in small batches — never rushed, never mass-produced.",
  },
  {
    n: "02",
    title: "Blend & Pour",
    text: "Rare fragrance oils are blended to our house formulas, then poured into each vessel at the precise temperature for a clean set.",
  },
  {
    n: "03",
    title: "Cure",
    text: "Every candle rests for 7 days undisturbed, allowing the fragrance to bind fully with the wax for a stronger, truer scent throw.",
  },
  {
    n: "04",
    title: "Wick & Finish",
    text: "Cotton wicks are trimmed and centred by hand, then each jar is labelled, boxed, and inspected before it leaves Sohna.",
  },
];

export function About() {
  return (
    <section id="about" className="relative overflow-hidden bg-surface-2 py-24 sm:py-32">
      <div className="section-px mx-auto grid max-w-content grid-cols-1 items-center gap-16 lg:grid-cols-2 lg:gap-20">
        <div className="relative order-2 aspect-[4/5] overflow-hidden rounded-sm lg:order-1">
          <Reveal y={0} className="h-full w-full">
            <motion.div
              initial={{ scale: 1.08 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
              className="relative h-full w-full"
            >
              <Image
                src="/images/lifestyle/lifestyle-scene.jpg"
                alt="A Glimoré candle burning beside dried flowers and books"
                fill
                sizes="(max-width: 1024px) 90vw, 45vw"
                className="object-cover"
              />
            </motion.div>
          </Reveal>
          <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-cream/10" />
        </div>

        <div className="order-1 flex flex-col gap-6 lg:order-2">
          <Reveal>
            <span className="eyebrow">Our Story</span>
          </Reveal>
          <Reveal delay={0.08}>
            <h2 className="balance font-display text-4xl leading-[1.1] sm:text-5xl">
              A world of calm, warmth, and beautiful fragrance
            </h2>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="font-body text-base leading-relaxed text-fg/65">
              Glimoré began in Sohna with one belief — that light and fragrance can
              transform an ordinary evening into something worth remembering. Every
              candle is hand-poured in natural soy wax with premium fragrance oils,
              built to burn long, clean, and true. No shortcuts, no paraffin, no
              rushed batches — just a small studio doing one thing carefully.
            </p>
          </Reveal>

          <Reveal delay={0.24}>
            <div className="gold-divider my-2" />
          </Reveal>

          <StaggerGroup className="flex flex-col gap-6">
            {process.map((step) => (
              <motion.div key={step.n} variants={staggerItem} className="flex gap-5">
                <span className="font-display text-2xl text-gold/70">{step.n}</span>
                <div>
                  <h3 className="font-display text-lg">{step.title}</h3>
                  <p className="mt-1 font-body text-sm leading-relaxed text-fg/55">
                    {step.text}
                  </p>
                </div>
              </motion.div>
            ))}
          </StaggerGroup>
        </div>
      </div>
    </section>
  );
}
