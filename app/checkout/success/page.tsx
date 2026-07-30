"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Check, Package } from "lucide-react";
import { FlameMark } from "@/components/ui/FlameMark";
import { formatINR } from "@/lib/utils";

interface OrderDetail {
  orderNumber: string;
  total: number;
  status: string;
  estimatedDelivery: string | null;
}

function SuccessContent() {
  const orderId = useSearchParams().get("orderId");
  const [order, setOrder] = useState<OrderDetail | null>(null);

  useEffect(() => {
    if (!orderId) return;
    fetch(`/api/orders/${orderId}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setOrder(d.data);
      });
  }, [orderId]);

  return (
    <div className="section-px flex min-h-[85vh] flex-col items-center justify-center py-24 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col items-center gap-6"
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gold/15 text-gold">
          <Check size={28} />
        </div>
        <FlameMark className="h-8 w-auto" />
        <h1 className="font-display text-3xl sm:text-4xl">Order Confirmed</h1>
        <p className="max-w-md font-body text-sm leading-relaxed text-fg/60">
          Thank you — your candles are being prepared with care. A confirmation email
          is on its way.
        </p>

        {order && (
          <div className="mt-2 flex flex-col items-center gap-2 rounded-sm border border-edge/10 bg-surface px-8 py-6">
            <span className="font-body text-xs uppercase tracking-widest text-fg/45">
              Order Number
            </span>
            <span className="font-display text-xl text-gold">{order.orderNumber}</span>
            <span className="font-body text-sm text-fg/60">Total: {formatINR(order.total)}</span>
            {order.estimatedDelivery && (
              <span className="mt-1 flex items-center gap-1.5 font-body text-xs text-fg/45">
                <Package size={13} /> Arriving by{" "}
                {new Date(order.estimatedDelivery).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                })}
              </span>
            )}
          </div>
        )}

        <div className="mt-4 flex gap-4">
          <Link href="/account/orders" className="btn-gold">
            View Order
          </Link>
          <Link href="/" className="btn-outline">
            Continue Shopping
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={null}>
      <SuccessContent />
    </Suspense>
  );
}
