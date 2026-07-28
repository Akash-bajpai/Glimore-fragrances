"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Heart, ShoppingBag, Menu, Sun, Moon, ChevronDown } from "lucide-react";
import { FlameMark } from "@/components/ui/FlameMark";
import { useCart } from "@/components/providers/CartProvider";
import { useTheme } from "@/components/providers/ThemeProvider";
import { useUI } from "@/components/providers/UIProvider";
import { navLinks, siteConfig } from "@/data/content";
import { collections } from "@/data/products";
import { cn } from "@/lib/utils";
import { MobileMenu } from "./MobileMenu";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [collectionsOpen, setCollectionsOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { cartCount, wishlist, openDrawer } = useCart();
  const { theme, toggleTheme } = useTheme();
  const { openSearch } = useUI();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-all duration-500 ease-luxury",
          scrolled
            ? "border-b border-edge/10 bg-bg/85 py-3 backdrop-blur-md"
            : "border-b border-transparent bg-transparent py-6"
        )}
      >
        <nav className="section-px mx-auto flex max-w-content items-center justify-between">
          <Link href="#top" className="flex items-center gap-2.5">
            <FlameMark className="h-7 w-auto" />
            <span className="font-display text-2xl leading-none tracking-wide text-fg">
              {siteConfig.name}
            </span>
          </Link>

          <div className="hidden items-center gap-9 lg:flex">
            {navLinks.map((link) =>
              link.label === "Collections" ? (
                <div
                  key={link.href}
                  className="relative"
                  onMouseEnter={() => setCollectionsOpen(true)}
                  onMouseLeave={() => setCollectionsOpen(false)}
                >
                  <button className="link-underline flex items-center gap-1 font-body text-[13px] uppercase tracking-widest text-fg/80 transition-colors hover:text-gold">
                    {link.label}
                    <ChevronDown size={13} />
                  </button>
                  <AnimatePresence>
                    {collectionsOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        transition={{ duration: 0.25 }}
                        className="absolute left-1/2 top-full grid w-[560px] -translate-x-1/2 grid-cols-4 gap-4 rounded-sm border border-edge/10 bg-surface p-5 shadow-soft"
                      >
                        {collections.map((c) => (
                          <a
                            key={c.name}
                            href="#best-sellers"
                            className="group flex flex-col gap-2"
                          >
                            <div className="relative aspect-square overflow-hidden rounded-sm">
                              <Image
                                src={c.image}
                                alt={c.name}
                                fill
                                sizes="120px"
                                className="object-cover transition-transform duration-700 ease-luxury group-hover:scale-110"
                              />
                            </div>
                            <span className="font-body text-xs text-fg/80 group-hover:text-gold">
                              {c.name}
                            </span>
                          </a>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <a
                  key={link.href}
                  href={link.href}
                  className="link-underline font-body text-[13px] uppercase tracking-widest text-fg/80 transition-colors hover:text-gold"
                >
                  {link.label}
                </a>
              )
            )}
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            <IconButton onClick={openSearch} label="Search">
              <Search size={18} strokeWidth={1.5} />
            </IconButton>
            <IconButton onClick={toggleTheme} label="Toggle theme">
              {theme === "dark" ? (
                <Sun size={18} strokeWidth={1.5} />
              ) : (
                <Moon size={18} strokeWidth={1.5} />
              )}
            </IconButton>
            <IconButton onClick={() => openDrawer("wishlist")} label="Wishlist" count={wishlist.length}>
              <Heart size={18} strokeWidth={1.5} />
            </IconButton>
            <IconButton onClick={() => openDrawer("cart")} label="Cart" count={cartCount}>
              <ShoppingBag size={18} strokeWidth={1.5} />
            </IconButton>
            <IconButton onClick={() => setMobileOpen(true)} label="Menu" className="lg:hidden">
              <Menu size={18} strokeWidth={1.5} />
            </IconButton>
          </div>
        </nav>
      </header>

      <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
}

function IconButton({
  children,
  onClick,
  label,
  count,
  className,
}: {
  children: React.ReactNode;
  onClick: () => void;
  label: string;
  count?: number;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className={cn(
        "relative flex h-9 w-9 items-center justify-center rounded-full text-fg/80 transition-colors hover:text-gold sm:h-10 sm:w-10",
        className
      )}
    >
      {children}
      {!!count && (
        <span className="absolute right-0 top-0 flex h-4 w-4 items-center justify-center rounded-full bg-gold font-body text-[9px] font-semibold text-ink">
          {count > 9 ? "9+" : count}
        </span>
      )}
    </button>
  );
}
