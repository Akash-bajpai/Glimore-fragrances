"use client";

import { motion } from "framer-motion";
import { siteConfig } from "@/data/content";

export function WhatsAppButton() {
  return (
    <motion.a
      href={`https://wa.me/${siteConfig.whatsapp}?text=${encodeURIComponent(
        "Hi Glimoré, I'd like to know more about your candles."
      )}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 1.2, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="fixed bottom-8 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-soft animate-pulse-ring"
    >
      <svg viewBox="0 0 32 32" className="h-7 w-7" fill="currentColor">
        <path d="M16.001 3C9.373 3 4 8.373 4 15c0 2.397.702 4.63 1.912 6.507L4 29l7.702-1.874A11.94 11.94 0 0016 27c6.628 0 12-5.373 12-12S22.629 3 16.001 3zm6.833 17.02c-.29.816-1.434 1.5-2.354 1.694-.626.132-1.444.238-4.2-.902-3.524-1.46-5.79-5.036-5.965-5.27-.174-.234-1.427-1.9-1.427-3.624 0-1.723.905-2.572 1.226-2.924.32-.352.7-.44.933-.44.234 0 .467.002.67.012.216.01.505-.082.79.603.29.7.985 2.423 1.07 2.6.087.176.145.38.028.614-.116.234-.174.38-.348.585-.174.205-.365.457-.522.614-.174.174-.355.363-.153.712.203.35.902 1.489 1.938 2.412 1.332 1.19 2.455 1.558 2.804 1.732.35.174.554.146.758-.088.203-.234.87-1.014 1.103-1.363.233-.35.467-.29.79-.174.32.117 2.037.96 2.386 1.135.35.174.582.262.668.408.087.147.087.848-.203 1.664z" />
      </svg>
    </motion.a>
  );
}
