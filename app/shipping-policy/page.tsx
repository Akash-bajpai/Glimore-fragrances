import { Metadata } from "next";
import { siteConfig } from "@/data/content";

export const metadata: Metadata = {
  title: "Shipping Policy",
  description: `Shipping timelines, charges, and delivery information for ${siteConfig.fullName} orders.`,
};

export default function ShippingPolicyPage() {
  return (
    <div className="min-h-screen bg-bg py-16 sm:py-24">
      <div className="section-px mx-auto max-w-3xl">
        <h1 className="font-display text-4xl sm:text-5xl">Shipping Policy</h1>
        <p className="mt-2 font-body text-xs text-fg/50">Last updated: August 2026</p>

        <div className="mt-10 flex flex-col gap-8 font-body text-sm leading-relaxed text-fg/75">
          <section>
            <h2 className="font-display text-xl text-fg mb-2">Processing Time</h2>
            <p>
              All Glimoré orders are handcrafted and quality-checked before dispatch. Orders are
              processed within 1–2 business days of payment confirmation. During festive seasons
              or sale events, processing may take up to 3 business days.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-fg mb-2">Delivery Timelines</h2>
            <p>
              Standard delivery across India takes 3–7 business days after dispatch. Metro cities
              (Delhi NCR, Mumbai, Bengaluru, Chennai, Hyderabad, Kolkata, Pune) typically receive
              orders in 2–4 business days. Tier-2 and Tier-3 cities may take up to 7 business days.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-fg mb-2">Shipping Charges</h2>
            <p>
              Standard shipping is ₹99 for all orders. Orders above{" "}
              <strong>₹1,999 qualify for free standard shipping</strong>. We do not currently offer
              express or overnight shipping.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-fg mb-2">Packaging</h2>
            <p>
              Every Glimoré order is carefully packed with protective inner packaging to ensure
              your candles, sachets, and diffuser kits arrive intact and gift-ready. We use minimal,
              sustainable outer packaging.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-fg mb-2">Tracking</h2>
            <p>
              Once your order is dispatched, you will receive a shipping confirmation with a tracking
              number via email or SMS. You can track your order directly on the courier partner&rsquo;s website.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-fg mb-2">Contact Us</h2>
            <p>
              For shipping queries, please contact us at{" "}
              <a href={`mailto:${siteConfig.email}`} className="text-gold underline">
                {siteConfig.email}
              </a>{" "}
              or WhatsApp us at {siteConfig.phoneDisplay}.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
