"use client";

import { useState, FormEvent } from "react";
import { motion } from "framer-motion";
import { Send, Check } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { FlameMark } from "@/components/ui/FlameMark";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus("error");
      return;
    }
    setStatus("success");
    setEmail("");
  };

  return (
    <section className="relative overflow-hidden bg-ink py-24 text-cream sm:py-28">
      <div aria-hidden className="pointer-events-none absolute inset-0 opacity-30">
        <div className="absolute -left-20 top-0 h-72 w-72 animate-float-slow rounded-full bg-gold/20 blur-[100px]" />
        <div className="absolute -right-20 bottom-0 h-72 w-72 animate-float rounded-full bg-gold/10 blur-[100px]" />
      </div>

      <div className="section-px relative mx-auto flex max-w-2xl flex-col items-center text-center">
        <Reveal>
          <FlameMark className="mb-6 h-8 w-auto" />
        </Reveal>
        <Reveal delay={0.08}>
          <h2 className="balance font-display text-3xl leading-tight sm:text-4xl">
            Join the Glimoré Circle
          </h2>
        </Reveal>
        <Reveal delay={0.16}>
          <p className="mt-4 max-w-md font-body text-sm text-cream/60">
            New fragrances, early access to limited editions, and 10% off your first order.
          </p>
        </Reveal>

        <Reveal delay={0.24} className="mt-8 w-full max-w-md">
          <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (status !== "idle") setStatus("idle");
              }}
              placeholder="Your email address"
              className="flex-1 rounded-full border border-cream/20 bg-transparent px-5 py-3.5 font-body text-sm text-cream placeholder:text-cream/35 focus:border-gold focus:outline-none"
            />
            <motion.button whileTap={{ scale: 0.97 }} type="submit" className="btn-gold shrink-0">
              {status === "success" ? <Check size={16} /> : <Send size={15} />}
              {status === "success" ? "Subscribed" : "Subscribe"}
            </motion.button>
          </form>
          {status === "error" && (
            <p className="mt-2 font-body text-xs text-red-300/80">Please enter a valid email.</p>
          )}
        </Reveal>
      </div>
    </section>
  );
}
