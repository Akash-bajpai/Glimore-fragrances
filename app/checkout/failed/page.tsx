"use client";

import { Suspense, useState } from "react";
import Script from "next/script";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { X, Loader2 } from "lucide-react";
import { FlameMark } from "@/components/ui/FlameMark";

declare global {
  interface Window {
    Razorpay: any;
  }
}

function FailedContent() {
  const orderId = useSearchParams().get("orderId");
  const router = useRouter();
  const [retrying, setRetrying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function retryPayment() {
    if (!orderId) return;
    setRetrying(true);
    setError(null);

    try {
      const res = await fetch(`/api/orders/${orderId}`);
      const data = await res.json();
      if (!data.success) {
        setError("Could not find this order.");
        return;
      }
      const order = data.data;

      // Already paid (e.g. the webhook confirmed it) — nothing to retry.
      if (order.payment?.status === "PAID") {
        router.push(`/checkout/success?orderId=${order.id}`);
        return;
      }
      if (order.paymentMethod === "COD" || !order.payment?.providerOrderId || order.status === "CANCELLED") {
        setError("This order can't be retried. Please place it again from your bag.");
        return;
      }
      if (typeof window.Razorpay !== "function") {
        setError("Secure payment could not load. Please refresh and try again.");
        return;
      }

      // Re-create a fresh Razorpay order for the same total via the same
      // create-order endpoint's underlying pricing logic would double the
      // order — instead, retrying simply re-opens Checkout against the
      // existing pending payment record's provider order, which Razorpay
      // allows retrying against as long as it hasn't expired.
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.total * 100,
        currency: "INR",
        name: "Glimoré Fragrances",
        description: `Order ${order.orderNumber}`,
        order_id: order.payment?.providerOrderId,
        theme: { color: "#C8A96A" },
        handler: async function (response: any) {
          try {
            const verifyRes = await fetch("/api/payment/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                orderId: order.id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });
            if (verifyRes.ok) router.push(`/checkout/success?orderId=${order.id}`);
            else setError("Payment could not be verified. Please contact support.");
          } catch {
            router.push(`/account/orders/${order.id}`);
          }
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setRetrying(false);
    }
  }

  return (
    <>
    {/* Load Checkout here too: this page can be opened directly or refreshed,
        in which case the script from /checkout is not on the page. */}
    <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />
    <div className="section-px flex min-h-[85vh] flex-col items-center justify-center py-24 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col items-center gap-6"
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 text-red-400">
          <X size={28} />
        </div>
        <FlameMark className="h-8 w-auto" animated={false} />
        <h1 className="font-display text-3xl sm:text-4xl">Payment Didn&rsquo;t Go Through</h1>
        <p className="max-w-md font-body text-sm leading-relaxed text-fg/60">
          Your order wasn&rsquo;t charged. You can retry the payment, or head back to your
          bag and try a different method.
        </p>

        {error && <p className="font-body text-sm text-red-400">{error}</p>}

        <div className="mt-4 flex gap-4">
          <button onClick={retryPayment} disabled={retrying} className="btn-gold disabled:opacity-60">
            {retrying && <Loader2 size={16} className="animate-spin" />}
            Retry Payment
          </button>
          <Link href="/checkout" className="btn-outline">
            Back to Checkout
          </Link>
        </div>
      </motion.div>
    </div>
    </>
  );
}

export default function CheckoutFailedPage() {
  return (
    <Suspense fallback={null}>
      <FailedContent />
    </Suspense>
  );
}
