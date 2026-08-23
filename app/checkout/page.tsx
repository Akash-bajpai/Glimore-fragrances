"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Check, MapPin, Tag, CreditCard, Truck } from "lucide-react";
import { useCart } from "@/components/providers/CartProvider";
import { formatINR } from "@/lib/utils";

type Step = "address" | "review" | "payment";

interface Address {
  id: string;
  fullName: string;
  phone: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

interface Summary {
  items: { productId: string; name: string; image: string; price: number; quantity: number }[];
  pricing: { subtotal: number; discountAmount: number; shippingCharge: number; taxAmount: number; total: number };
  serviceable: boolean;
  estimatedDelivery: string | null;
  couponApplied: string | null;
}

const PAYMENT_METHODS: { id: string; label: string; hint: string }[] = [
  { id: "UPI", label: "UPI", hint: "GPay, PhonePe, Paytm & more" },
  { id: "CARD", label: "Credit / Debit Card", hint: "Visa, Mastercard, RuPay" },
  { id: "NETBANKING", label: "Net Banking", hint: "All major Indian banks" },
  { id: "WALLET", label: "Wallet", hint: "Paytm, Amazon Pay & more" },
  { id: "COD", label: "Cash on Delivery", hint: "Pay when it arrives" },
];

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function CheckoutPage() {
  const router = useRouter();
  const { lines, cartCount } = useCart();

  const [step, setStep] = useState<Step>("address");
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [shippingId, setShippingId] = useState<string | null>(null);
  const [billingSameAsShipping, setBillingSameAsShipping] = useState(true);
  const [billingId, setBillingId] = useState<string | null>(null);
  const [showAddressForm, setShowAddressForm] = useState(false);

  const [couponInput, setCouponInput] = useState("");
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<string>("UPI");

  const [summary, setSummary] = useState<Summary | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [razorpayReady, setRazorpayReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [synced, setSynced] = useState(false);

  const selectedShipping = addresses.find((a) => a.id === shippingId) ?? null;

  // 1. Push the local (localStorage) cart to the server the moment checkout loads.
  useEffect(() => {
    async function syncCart() {
      if (lines.length === 0) {
        setSynced(true);
        return;
      }
      await fetch("/api/cart/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: lines }),
      });
      setSynced(true);
    }
    syncCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 2. Load saved addresses once synced.
  useEffect(() => {
    if (!synced) return;
    fetch("/api/addresses")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setAddresses(d.data);
          const def = d.data.find((a: Address) => a.isDefault) ?? d.data[0];
          if (def) {
            setShippingId(def.id);
            setBillingId(def.id);
          } else {
            setShowAddressForm(true);
          }
        }
      });
  }, [synced]);

  // 3. Fetch the authoritative summary whenever pincode or coupon changes.
  useEffect(() => {
    if (!synced || !selectedShipping) return;
    setLoadingSummary(true);
    setError(null);
    fetch("/api/checkout/summary", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pincode: selectedShipping.pincode,
        couponCode: summary?.couponApplied || undefined,
      }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setSummary(d.data);
        else setError(d.error);
      })
      .finally(() => setLoadingSummary(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [synced, selectedShipping?.pincode]);

  async function handleAddAddress(formData: FormData) {
    const payload = {
      fullName: String(formData.get("fullName") || ""),
      phone: String(formData.get("phone") || ""),
      line1: String(formData.get("line1") || ""),
      line2: String(formData.get("line2") || "") || undefined,
      city: String(formData.get("city") || ""),
      state: String(formData.get("state") || ""),
      pincode: String(formData.get("pincode") || ""),
      isDefault: addresses.length === 0,
    };
    const res = await fetch("/api/addresses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Could not save address.");
      return;
    }
    setAddresses((prev) => [data.data, ...prev]);
    setShippingId(data.data.id);
    setBillingId(data.data.id);
    setShowAddressForm(false);
  }

  async function applyCoupon() {
    if (!couponInput.trim()) return;
    setError(null);
    const res = await fetch("/api/coupons/apply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: couponInput.trim() }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Invalid coupon.");
      return;
    }
    setSummary((s) => (s ? { ...s, couponApplied: data.data.code } : s));
    // Re-fetch summary with the coupon applied for authoritative totals.
    if (selectedShipping) {
      const summaryRes = await fetch("/api/checkout/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pincode: selectedShipping.pincode, couponCode: data.data.code }),
      });
      const summaryData = await summaryRes.json();
      if (summaryData.success) setSummary(summaryData.data);
    }
  }

  async function placeOrder() {
    if (!shippingId) return;
    if (paymentMethod !== "COD" && !razorpayReady) {
      setError("Secure payment is still loading. Please wait a moment and try again.");
      return;
    }
    setPlacingOrder(true);
    setError(null);

    const finalBillingId = billingSameAsShipping ? shippingId : billingId;

    try {
      const res = await fetch("/api/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shippingAddressId: shippingId,
          billingAddressId: finalBillingId,
          paymentMethod,
          notes: notes || undefined,
          couponCode: summary?.couponApplied || undefined,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Could not place order.");
        setPlacingOrder(false);
        return;
      }

      const { order, razorpay } = data.data;

      if (!razorpay) {
        // Cash on Delivery — already confirmed server-side.
        router.push(`/checkout/success?orderId=${order.id}`);
        return;
      }

      const options = {
        key: razorpay.keyId,
        amount: razorpay.amount,
        currency: razorpay.currency,
        name: "Glimoré Fragrances",
        description: `Order ${order.orderNumber}`,
        order_id: razorpay.orderId,
        prefill: { name: selectedShipping?.fullName, contact: selectedShipping?.phone },
        theme: { color: "#C8A96A" },
        handler: async function (response: any) {
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
          if (verifyRes.ok) {
            router.push(`/checkout/success?orderId=${order.id}`);
          } else {
            router.push(`/checkout/failed?orderId=${order.id}`);
          }
        },
        modal: {
          ondismiss: function () {
            setPlacingOrder(false);
          },
        },
      };

      if (typeof window.Razorpay !== "function") {
        throw new Error("Razorpay checkout did not load.");
      }
      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function () {
        router.push(`/checkout/failed?orderId=${order.id}`);
      });
      rzp.open();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error. Please try again.");
      setPlacingOrder(false);
    }
  }

  if (cartCount === 0 && synced) {
    return (
      <div className="section-px flex min-h-[70vh] flex-col items-center justify-center gap-4 text-center">
        <h1 className="font-display text-3xl">Your bag is empty</h1>
        <p className="font-body text-sm text-fg/55">Add something beautiful before checking out.</p>
        <a href="/#best-sellers" className="btn-gold mt-2">
          Browse Candles
        </a>
      </div>
    );
  }

  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="lazyOnload"
        onLoad={() => setRazorpayReady(true)}
        onError={() => setError("Secure payment could not load. Please refresh and try again.")}
      />

      <div className="section-px mx-auto max-w-6xl py-16 sm:py-24">
        <h1 className="mb-10 font-display text-3xl sm:text-4xl">Checkout</h1>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_380px]">
          <div className="flex flex-col gap-6">
            <StepHeader icon={<MapPin size={16} />} title="Delivery Address" active={step === "address"} done={!!shippingId && step !== "address"} onClick={() => setStep("address")} />

            {step === "address" && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-4 rounded-sm border border-edge/10 bg-surface p-6">
                {addresses.length > 0 && (
                  <div className="flex flex-col gap-3">
                    {addresses.map((addr) => (
                      <label
                        key={addr.id}
                        className={`flex cursor-pointer flex-col gap-1 rounded-sm border p-4 transition-colors ${
                          shippingId === addr.id ? "border-gold bg-gold/5" : "border-edge/15"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <input
                            type="radio"
                            name="shipping"
                            checked={shippingId === addr.id}
                            onChange={() => {
                              setShippingId(addr.id);
                              if (billingSameAsShipping) setBillingId(addr.id);
                            }}
                            className="mt-1 accent-[#C8A96A]"
                          />
                          <div>
                            <p className="font-body text-sm font-medium">{addr.fullName} — {addr.phone}</p>
                            <p className="mt-1 font-body text-xs text-fg/55">
                              {addr.line1}{addr.line2 ? `, ${addr.line2}` : ""}, {addr.city}, {addr.state} - {addr.pincode}
                            </p>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                )}

                {!showAddressForm ? (
                  <button
                    onClick={() => setShowAddressForm(true)}
                    className="self-start font-body text-xs uppercase tracking-widest text-gold link-underline"
                  >
                    + Add a new address
                  </button>
                ) : (
                  <form
                    action={(fd) => handleAddAddress(fd)}
                    className="grid grid-cols-1 gap-4 border-t border-edge/10 pt-4 sm:grid-cols-2"
                  >
                    <Input name="fullName" label="Full Name" required />
                    <Input name="phone" label="Phone Number" required />
                    <Input name="line1" label="Address Line 1" required className="sm:col-span-2" />
                    <Input name="line2" label="Address Line 2 (optional)" className="sm:col-span-2" />
                    <Input name="city" label="City" required />
                    <Input name="state" label="State" required />
                    <Input name="pincode" label="PIN Code" required pattern="[1-9][0-9]{5}" />
                    <div className="flex items-end sm:col-span-2">
                      <button type="submit" className="btn-gold">
                        Save Address
                      </button>
                    </div>
                  </form>
                )}

                <label className="mt-2 flex items-center gap-2 font-body text-sm text-fg/70">
                  <input
                    type="checkbox"
                    checked={billingSameAsShipping}
                    onChange={(e) => {
                      setBillingSameAsShipping(e.target.checked);
                      if (e.target.checked && shippingId) setBillingId(shippingId);
                    }}
                    className="accent-[#C8A96A]"
                  />
                  Billing address same as shipping
                </label>

                {summary && !summary.serviceable && (
                  <p className="font-body text-xs text-red-400">
                    We currently can&rsquo;t deliver to this PIN code. Please try a different address.
                  </p>
                )}

                <button
                  disabled={!shippingId || (summary ? !summary.serviceable : false)}
                  onClick={() => setStep("review")}
                  className="btn-gold mt-2 self-start disabled:opacity-50"
                >
                  Continue to Review
                </button>
              </motion.div>
            )}

            <StepHeader icon={<Tag size={16} />} title="Review Order" active={step === "review"} done={step === "payment"} onClick={() => shippingId && setStep("review")} />

            {step === "review" && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-5 rounded-sm border border-edge/10 bg-surface p-6">
                <div className="flex flex-col gap-4">
                  {(summary?.items ?? []).map((item) => (
                    <div key={item.productId} className="flex items-center gap-4">
                      <div className="relative h-16 w-14 shrink-0 overflow-hidden rounded-sm bg-bg">
                        <Image src={item.image} alt={item.name} fill className="object-cover" />
                      </div>
                      <div className="flex-1">
                        <p className="font-body text-sm">{item.name}</p>
                        <p className="font-body text-xs text-fg/45">Qty {item.quantity}</p>
                      </div>
                      <span className="font-body text-sm">{formatINR(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 border-t border-edge/10 pt-4">
                  <input
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    placeholder="Coupon code"
                    className="flex-1 rounded-full border border-edge/20 bg-transparent px-4 py-2.5 font-body text-sm focus:border-gold focus:outline-none"
                  />
                  <button onClick={applyCoupon} className="btn-outline px-5 py-2.5 text-xs">
                    Apply
                  </button>
                </div>
                {summary?.couponApplied && (
                  <p className="font-body text-xs text-gold">Coupon {summary.couponApplied} applied.</p>
                )}

                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Order notes (optional) — gift message, delivery instructions..."
                  rows={2}
                  className="rounded-sm border border-edge/20 bg-transparent px-4 py-3 font-body text-sm placeholder:text-fg/35 focus:border-gold focus:outline-none"
                />

                <button onClick={() => setStep("payment")} className="btn-gold self-start">
                  Continue to Payment
                </button>
              </motion.div>
            )}

            <StepHeader icon={<CreditCard size={16} />} title="Payment" active={step === "payment"} done={false} onClick={() => setStep("payment")} />

            {step === "payment" && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-4 rounded-sm border border-edge/10 bg-surface p-6">
                {PAYMENT_METHODS.map((m) => (
                  <label
                    key={m.id}
                    className={`flex cursor-pointer items-center gap-3 rounded-sm border p-4 transition-colors ${
                      paymentMethod === m.id ? "border-gold bg-gold/5" : "border-edge/15"
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === m.id}
                      onChange={() => setPaymentMethod(m.id)}
                      className="accent-[#C8A96A]"
                    />
                    <div>
                      <p className="font-body text-sm font-medium">{m.label}</p>
                      <p className="font-body text-xs text-fg/45">{m.hint}</p>
                    </div>
                  </label>
                ))}

                {error && <p className="font-body text-sm text-red-400">{error}</p>}

                <button
                  onClick={placeOrder}
                  disabled={placingOrder || !summary || (paymentMethod !== "COD" && !razorpayReady)}
                  className="btn-gold mt-2 disabled:opacity-60"
                >
                  {placingOrder && <Loader2 size={16} className="animate-spin" />}
                  {placingOrder
                    ? "Processing"
                    : paymentMethod === "COD"
                    ? "Place Order"
                    : razorpayReady
                    ? `Pay ${summary ? formatINR(summary.pricing.total) : ""}`
                    : "Loading secure payment…"}
                </button>
              </motion.div>
            )}
          </div>

          <OrderSummaryCard summary={summary} loading={loadingSummary} />
        </div>
      </div>
    </>
  );
}

function StepHeader({
  icon,
  title,
  active,
  done,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  active: boolean;
  done: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 font-display text-xl transition-opacity ${
        active ? "opacity-100" : "opacity-45"
      }`}
    >
      <span className={`flex h-8 w-8 items-center justify-center rounded-full border ${done ? "border-gold bg-gold text-ink" : "border-edge/25 text-fg"}`}>
        {done ? <Check size={14} /> : icon}
      </span>
      {title}
    </button>
  );
}

function Input({
  name,
  label,
  required,
  pattern,
  className,
}: {
  name: string;
  label: string;
  required?: boolean;
  pattern?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <label htmlFor={name} className="font-body text-xs uppercase tracking-widest text-fg/45">
        {label}
      </label>
      <input
        id={name}
        name={name}
        required={required}
        pattern={pattern}
        className="mt-1 w-full border-b border-edge/20 bg-transparent py-2.5 font-body text-sm focus:border-gold focus:outline-none"
      />
    </div>
  );
}

function OrderSummaryCard({ summary, loading }: { summary: Summary | null; loading: boolean }) {
  return (
    <div className="h-fit rounded-sm border border-edge/10 bg-surface p-6">
      <h2 className="mb-4 font-display text-xl">Order Summary</h2>
      {loading || !summary ? (
        <div className="flex items-center gap-2 py-8 text-fg/45">
          <Loader2 size={16} className="animate-spin" /> Calculating...
        </div>
      ) : (
        <div className="flex flex-col gap-3 font-body text-sm">
          <Row label="Subtotal" value={formatINR(summary.pricing.subtotal)} />
          {summary.pricing.discountAmount > 0 && (
            <Row label="Discount" value={`- ${formatINR(summary.pricing.discountAmount)}`} highlight />
          )}
          <Row
            label="Shipping"
            value={summary.pricing.shippingCharge === 0 ? "Free" : formatINR(summary.pricing.shippingCharge)}
          />
          <Row label="GST (18%)" value={formatINR(summary.pricing.taxAmount)} />
          <div className="my-1 h-px bg-edge/10" />
          <Row label="Total" value={formatINR(summary.pricing.total)} bold />

          {summary.estimatedDelivery && (
            <div className="mt-3 flex items-center gap-2 rounded-sm bg-bg px-3 py-2.5 font-body text-xs text-fg/55">
              <Truck size={14} className="text-gold" />
              Estimated delivery by{" "}
              {new Date(summary.estimatedDelivery).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Row({
  label,
  value,
  bold,
  highlight,
}: {
  label: string;
  value: string;
  bold?: boolean;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className={bold ? "font-display text-base" : "text-fg/60"}>{label}</span>
      <span className={bold ? "font-display text-lg" : highlight ? "text-gold" : "text-fg"}>{value}</span>
    </div>
  );
}
