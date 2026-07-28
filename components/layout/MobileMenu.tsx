"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { navLinks, siteConfig } from "@/data/content";
import { FlameMark } from "@/components/ui/FlameMark";

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
}

export function MobileMenu({ open, onClose }: MobileMenuProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[70] lg:hidden">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-ink/70 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="absolute right-0 top-0 flex h-full w-[82%] max-w-sm flex-col bg-surface p-8"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FlameMark className="h-6 w-auto" />
                <span className="font-display text-xl">{siteConfig.name}</span>
              </div>
              <button
                onClick={onClose}
                aria-label="Close menu"
                className="flex h-9 w-9 items-center justify-center rounded-full text-fg/70 hover:text-gold"
              >
                <X size={20} />
              </button>
            </div>

            <nav className="mt-12 flex flex-col gap-7">
              {navLinks.map((link, i) => (
                <motion.a
                  key={link.href}
                  href={link.href}
                  onClick={onClose}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + i * 0.06 }}
                  className="font-display text-3xl text-fg transition-colors hover:text-gold"
                >
                  {link.label}
                </motion.a>
              ))}
            </nav>

            <div className="mt-auto flex flex-col gap-2 border-t border-edge/10 pt-6 font-body text-sm text-fg/60">
              <span>{siteConfig.phoneDisplay}</span>
              <span>{siteConfig.email}</span>
              <span>
                {siteConfig.address.line} — {siteConfig.address.pin}
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
