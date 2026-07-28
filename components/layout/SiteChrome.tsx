"use client";

import { ReactNode } from "react";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { CartProvider, useCart } from "@/components/providers/CartProvider";
import { UIProvider, useUI } from "@/components/providers/UIProvider";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { CartDrawer } from "./CartDrawer";
import { SearchModal } from "./SearchModal";
import { ScrollProgress } from "./ScrollProgress";
import { BackToTop } from "./BackToTop";
import { WhatsAppButton } from "./WhatsAppButton";
import { PageLoader } from "./PageLoader";
import { QuickViewModal } from "@/components/ui/QuickViewModal";
import { products } from "@/data/products";

function ChromeInner({ children }: { children: ReactNode }) {
  const { quickViewProduct, closeQuickView, searchOpen, closeSearch, openQuickView } = useUI();
  const { addRecentlyViewed } = useCart();

  return (
    <>
      <PageLoader />
      <ScrollProgress />
      <Navbar />
      <main>{children}</main>
      <Footer />
      <CartDrawer />
      <BackToTop />
      <WhatsAppButton />
      <div aria-hidden className="grain-overlay" />
      <QuickViewModal product={quickViewProduct} onClose={closeQuickView} />
      <SearchModal
        open={searchOpen}
        onClose={closeSearch}
        onSelect={(id) => {
          const product = products.find((p) => p.id === id);
          if (product) {
            addRecentlyViewed(id);
            openQuickView(product);
          }
        }}
      />
    </>
  );
}

export function SiteChrome({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <CartProvider>
        <UIProvider>
          <ChromeInner>{children}</ChromeInner>
        </UIProvider>
      </CartProvider>
    </ThemeProvider>
  );
}
