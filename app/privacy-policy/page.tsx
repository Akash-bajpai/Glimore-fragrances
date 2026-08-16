import { Metadata } from "next";
import { siteConfig } from "@/data/content";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `Privacy policy and data protection practices of ${siteConfig.fullName}.`,
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-bg py-16 sm:py-24">
      <div className="section-px mx-auto max-w-3xl">
        <h1 className="font-display text-4xl sm:text-5xl">Privacy Policy</h1>
        <p className="mt-2 font-body text-xs text-fg/50">Last updated: August 2026</p>

        <div className="mt-10 flex flex-col gap-8 font-body text-sm leading-relaxed text-fg/75">
          <section>
            <h2 className="font-display text-xl text-fg mb-2">1. Information We Collect</h2>
            <p>
              When you visit Glimoré Fragrances or make a purchase, we collect necessary personal information including your name, billing address, shipping address, payment information, email address, and phone number.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-fg mb-2">2. How We Use Your Information</h2>
            <p>
              We use order information to fulfill purchases (processing payments via Razorpay, arranging shipping, and sending invoices/order confirmations), communicate with you, screen for potential risk or fraud, and provide customer support.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-fg mb-2">3. Payment Security</h2>
            <p>
              We do not store your full payment card details or UPI credentials on our servers. All online transactions are securely encrypted and processed by Razorpay in compliance with RBI standards and PCI-DSS Level 1 certification.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-fg mb-2">4. Contact Us</h2>
            <p>
              If you have questions regarding your personal data or wish to exercise your data privacy rights, contact us at:
              <br />
              <strong>Email:</strong> {siteConfig.email}
              <br />
              <strong>Phone:</strong> {siteConfig.phone}
              <br />
              <strong>Studio Address:</strong> {siteConfig.address.line}, {siteConfig.address.pin}, India
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
