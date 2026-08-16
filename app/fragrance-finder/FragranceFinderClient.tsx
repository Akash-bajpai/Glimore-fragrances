"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  RotateCcw,
  Flame,
  Car,
  Home,
} from "lucide-react";
import { products } from "@/data/products";
import { ProductCard } from "@/components/ui/ProductCard";
import { useUI } from "@/components/providers/UIProvider";
import { cn } from "@/lib/utils";

type MoodKey =
  | "Relaxing"
  | "Romantic"
  | "Fresh"
  | "Luxury"
  | "Woody"
  | "Sweet"
  | "Festive"
  | "Energising";

type SpaceKey = "Living & Bedroom" | "Car & Journey" | "Wardrobes & Drawers" | "Home Ritual";

interface MoodOption {
  key: MoodKey;
  label: string;
  desc: string;
  fragranceKeywords: string[];
}

const moods: MoodOption[] = [
  {
    key: "Relaxing",
    label: "Relaxing & Tranquil",
    desc: "Lavender Twilight, Sandal Elysse, Misty Musk",
    fragranceKeywords: ["lavender", "sandal", "misty", "calm", "relaxing", "tranquil"],
  },
  {
    key: "Romantic",
    label: "Romantic & Sensual",
    desc: "Royal Rose Bloom, Moonlit Jasmine, Blush Petals",
    fragranceKeywords: ["rose", "jasmine", "petals", "romantic", "sensual", "bloom"],
  },
  {
    key: "Fresh",
    label: "Fresh & Aquatic",
    desc: "Azure Breeze, Pacific Serenity, Ocean Whisper",
    fragranceKeywords: ["azure", "ocean", "sea salt", "aquatic", "fresh", "breeze"],
  },
  {
    key: "Luxury",
    label: "Luxury & Opulent",
    desc: "Oudwood Reserve, Velvet Ylang, Royal Oudh",
    fragranceKeywords: ["oud", "velvet", "royal", "gold", "luxury", "opulent"],
  },
  {
    key: "Woody",
    label: "Woody & Earthy",
    desc: "Oud Smiss, Frankincense, Loban, Black Oud",
    fragranceKeywords: ["oud", "wood", "frankincense", "loban", "drakker", "cedar"],
  },
  {
    key: "Sweet",
    label: "Sweet & Gourmand",
    desc: "Vanilla Velvet, Cocoa Noir, Mandarine",
    fragranceKeywords: ["vanilla", "cocoa", "chocolate", "mandarine", "sweet"],
  },
  {
    key: "Festive",
    label: "Festive & Radiant",
    desc: "Golden Marigold Aura, Orange Cinnamon, Urli",
    fragranceKeywords: ["marigold", "cinnamon", "festive", "urli", "rangriti", "orange"],
  },
  {
    key: "Energising",
    label: "Energising & Zesty",
    desc: "Lime, Orange, Citrus Tango, Lemongrass",
    fragranceKeywords: ["lime", "orange", "tango", "lemongrass", "citrus", "zesty"],
  },
];

const spaces: { key: SpaceKey; label: string; desc: string; icon: any }[] = [
  {
    key: "Living & Bedroom",
    label: "Living Room & Bedroom",
    desc: "Long-burning luxury soy candles in glass & wood jars",
    icon: Flame,
  },
  {
    key: "Car & Journey",
    label: "Car & Drive",
    desc: "Hanging wooden-cap diffusers & 10 mL refill combo packs",
    icon: Car,
  },
  {
    key: "Wardrobes & Drawers",
    label: "Wardrobes, Closets & Drawers",
    desc: "Botanical soy wax wardrobe tablets dressed with flowers",
    icon: Sparkles,
  },
  {
    key: "Home Ritual",
    label: "Home Aroma & Meditation",
    desc: "Ceramic diffuser kits & concentrated fragrance oils",
    icon: Home,
  },
];

export function FragranceFinderClient() {
  const { openQuickView } = useUI();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedMood, setSelectedMood] = useState<MoodKey | null>(null);
  const [selectedSpace, setSelectedSpace] = useState<SpaceKey | null>(null);

  // Recommendations calculation
  const recommendations = useMemo(() => {
    if (!selectedMood) return [];

    const moodObj = moods.find((m) => m.key === selectedMood);
    if (!moodObj) return [];

    let filtered = products.filter((p) => {
      // 1. Space matching
      if (selectedSpace === "Car & Journey" && p.category !== "Car Perfumes") return false;
      if (selectedSpace === "Wardrobes & Drawers" && p.category !== "Soy Wax Sachets") return false;
      if (selectedSpace === "Home Ritual" && p.category !== "Home Diffusers" && p.category !== "Fragrance Oils") return false;
      if (selectedSpace === "Living & Bedroom" && p.category !== "Luxury Candles") return false;

      // 2. Keyword matching
      const targetText = `${p.name} ${p.fragrance || ""} ${p.fragranceProfile || ""} ${p.mood || ""} ${p.description}`.toLowerCase();
      return moodObj.fragranceKeywords.some((k) => targetText.includes(k));
    });

    // Fallback if space filter is too narrow
    if (filtered.length < 2) {
      filtered = products.filter((p) => {
        const targetText = `${p.name} ${p.fragrance || ""} ${p.fragranceProfile || ""} ${p.mood || ""} ${p.description}`.toLowerCase();
        return moodObj.fragranceKeywords.some((k) => targetText.includes(k));
      });
    }

    return filtered.slice(0, 6);
  }, [selectedMood, selectedSpace]);

  const resetQuiz = () => {
    setStep(1);
    setSelectedMood(null);
    setSelectedSpace(null);
  };

  return (
    <div className="min-h-screen bg-bg text-fg pb-24">
      {/* Header */}
      <div className="border-b border-edge/10 bg-surface-2/50 py-16 text-center">
        <div className="section-px mx-auto max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/5 px-4 py-1.5 font-body text-xs uppercase tracking-widest text-gold mb-3">
            <Sparkles size={14} /> Interactive Fragrance Finder
          </div>
          <h1 className="font-display text-4xl sm:text-5xl">Discover Your Signature Scent</h1>
          <p className="mt-3 font-body text-sm text-fg/60 leading-relaxed">
            Answer two quick questions to find the exact candle, car perfume, or aroma ritual curated for your mood.
          </p>

          {/* Progress Indicators */}
          <div className="mt-8 flex items-center justify-center gap-3">
            <span className={cn("h-2 rounded-full transition-all duration-300", step === 1 ? "w-10 bg-gold" : "w-2 bg-edge/20")} />
            <span className={cn("h-2 rounded-full transition-all duration-300", step === 2 ? "w-10 bg-gold" : "w-2 bg-edge/20")} />
            <span className={cn("h-2 rounded-full transition-all duration-300", step === 3 ? "w-10 bg-gold" : "w-2 bg-edge/20")} />
          </div>
        </div>
      </div>

      <div className="section-px mx-auto max-w-4xl py-12">
        <AnimatePresence mode="wait">
          {/* STEP 1: Mood */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col gap-8 text-center"
            >
              <div>
                <span className="font-body text-xs uppercase tracking-widest text-gold">Question 1 of 2</span>
                <h2 className="mt-1 font-display text-3xl">What mood are you looking for?</h2>
                <p className="mt-2 font-body text-xs text-fg/55">Select the feeling you want to create in your environment.</p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {moods.map((m) => (
                  <button
                    key={m.key}
                    onClick={() => {
                      setSelectedMood(m.key);
                      setStep(2);
                    }}
                    className="group flex flex-col items-center justify-center gap-2 rounded-sm border border-edge/10 bg-surface p-6 text-center transition-all duration-300 hover:border-gold hover:bg-gold/5 hover:-translate-y-1"
                  >
                    <span className="font-display text-lg text-fg group-hover:text-gold">{m.label}</span>
                    <span className="font-body text-xs text-fg/45">{m.desc}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* STEP 2: Space */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col gap-8 text-center"
            >
              <div>
                <span className="font-body text-xs uppercase tracking-widest text-gold">Question 2 of 2</span>
                <h2 className="mt-1 font-display text-3xl">Where will this fragrance live?</h2>
                <p className="mt-2 font-body text-xs text-fg/55">Choose the primary space you wish to scent.</p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {spaces.map((s) => (
                  <button
                    key={s.key}
                    onClick={() => {
                      setSelectedSpace(s.key);
                      setStep(3);
                    }}
                    className="group flex items-start gap-4 rounded-sm border border-edge/10 bg-surface p-6 text-left transition-all duration-300 hover:border-gold hover:bg-gold/5 hover:-translate-y-1"
                  >
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gold/10 text-gold group-hover:bg-gold group-hover:text-ink transition-colors">
                      <s.icon size={22} strokeWidth={1.5} />
                    </span>
                    <div>
                      <h3 className="font-display text-lg text-fg group-hover:text-gold">{s.label}</h3>
                      <p className="mt-1 font-body text-xs text-fg/55 leading-relaxed">{s.desc}</p>
                    </div>
                  </button>
                ))}
              </div>

              <button
                onClick={() => setStep(1)}
                className="self-center font-body text-xs text-fg/50 hover:text-gold underline"
              >
                ← Back to Moods
              </button>
            </motion.div>
          )}

          {/* STEP 3: Results */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col gap-10"
            >
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-edge/10 pb-6 text-center sm:text-left">
                <div>
                  <span className="font-body text-xs uppercase tracking-widest text-gold">Your Personalised Edit</span>
                  <h2 className="mt-1 font-display text-3xl">
                    Curated for {selectedMood} Living
                  </h2>
                  <p className="mt-1 font-body text-xs text-fg/55">
                    Designed for <strong>{selectedSpace}</strong> with authentic catalog formulations.
                  </p>
                </div>
                <button
                  onClick={resetQuiz}
                  className="btn-outline flex items-center gap-2 px-5 py-2.5 text-xs uppercase tracking-widest"
                >
                  <RotateCcw size={14} /> Retake Quiz
                </button>
              </div>

              {recommendations.length === 0 ? (
                <div className="py-16 text-center">
                  <p className="font-body text-sm text-fg/60">No specific match found. Showing our bestsellers:</p>
                  <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {products.slice(0, 3).map((p, i) => (
                      <ProductCard key={p.id} product={p} onQuickView={openQuickView} index={i} />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {recommendations.map((product, i) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onQuickView={openQuickView}
                      index={i}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
