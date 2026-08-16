import { Metadata } from "next";
import { siteConfig } from "@/data/content";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: `Terms of Service and Conditions for ${siteConfig.fullName}.`,
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-bg py-16 sm:py-24">
      <div className="section-px mx-auto max-w-3xl">
        <h1 className="font-display text-4xl sm:text-5xl">Terms of Service</h1>
        <p className="mt-2 font-body text-xs text-fg/50">Last updated: August 2026</p>

        <div className="mt-10 flex flex-col gap-8 font-body text-sm leading-relaxed text-fg/75">
          <section>
            <h2 className="font-display text-xl text-fg mb-2">1. Overview</h2>
            <p>
              This website is operated by Glimoré Fragrances. Throughout the site, the terms &ldquo;we&rdquo;, &ldquo;us&rdquo; and &ldquo;our&rdquo; refer to Glimoré Fragrances. By visiting our site or purchasing something from us, you engage in our &ldquo;Service&rdquo; and agree to be bound by the following terms and conditions.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-fg mb-2">2. Handcrafted Variations</h2>
            <p>
              Every Glimoré candle, sachet, and diffuser is handcrafted with care using natural wax blends and botanical toppings. Slight variations in color, frosting, texture, or botanical placement may occur naturally. These variations reflect authentic artisanal craftsmanship and do not impact scent throw or burn quality.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-fg mb-2">3. Pricing &amp; Orders</h2>
            <p>
              Prices for our products are subject to change without notice. We reserve the right at any time to modify or discontinue any product without notice. We reserve the right to refuse any order placed with us.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-fg mb-2">4. Contact Information</h2>
            <p>
              Questions about the Terms of Service should be sent to us at {siteConfig.email}.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
