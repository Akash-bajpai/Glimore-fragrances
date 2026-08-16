import { Metadata } from "next";
import { siteConfig } from "@/data/content";

export const metadata: Metadata = {
  title: "Refund & Return Policy",
  description: `Return, exchange, and refund policy for ${siteConfig.fullName}.`,
};

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-bg py-16 sm:py-24">
      <div className="section-px mx-auto max-w-3xl">
        <h1 className="font-display text-4xl sm:text-5xl">Refund &amp; Return Policy</h1>
        <p className="mt-2 font-body text-xs text-fg/50">Last updated: August 2026</p>

        <div className="mt-10 flex flex-col gap-8 font-body text-sm leading-relaxed text-fg/75">
          <section>
            <h2 className="font-display text-xl text-fg mb-2">Our Commitment</h2>
            <p>
              We take immense pride in every Glimoré product. If your order arrives damaged or
              defective, we will make it right — no questions asked.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-fg mb-2">Eligibility for Returns</h2>
            <p>We accept return or exchange requests under the following conditions:</p>
            <ul className="mt-2 list-disc pl-5 flex flex-col gap-1">
              <li>Product arrived physically damaged or broken.</li>
              <li>Wrong product or fragrance was delivered.</li>
              <li>Product is defective (e.g., wick does not light, fragrance oil is different).</li>
            </ul>
            <p className="mt-3">
              Requests must be raised within <strong>48 hours</strong> of delivery with clear
              photos or video of the damage sent to our email.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-fg mb-2">Non-Returnable Items</h2>
            <ul className="mt-2 list-disc pl-5 flex flex-col gap-1">
              <li>Used or partially burned candles.</li>
              <li>Opened sachets or fragrance oils.</li>
              <li>
                Items purchased during sale or with discount coupons (exchange only).
              </li>
              <li>
                Natural variation in botanical decorations — this is expected in handcrafted
                products and is not a defect.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl text-fg mb-2">Refund Process</h2>
            <p>
              Once your return request is approved, refunds are processed to the original payment
              method within 5–7 business days. COD orders receive a bank transfer or store credit.
              Shipping charges are non-refundable.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-fg mb-2">Exchanges</h2>
            <p>
              We are happy to exchange a product for a different fragrance variant within the same
              product category, subject to availability. The customer is responsible for return
              shipping charges on exchange requests.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-fg mb-2">Contact Us</h2>
            <p>
              Email:{" "}
              <a href={`mailto:${siteConfig.email}`} className="text-gold underline">
                {siteConfig.email}
              </a>
              <br />
              WhatsApp: {siteConfig.phoneDisplay}
              <br />
              Address: {siteConfig.address.line}, {siteConfig.address.pin}, India
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
