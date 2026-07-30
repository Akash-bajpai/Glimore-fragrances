"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { Loader2, Check } from "lucide-react";
import { formatINR } from "@/lib/utils";

const STATUSES = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"];

interface OrderDetail {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  subtotal: number;
  shippingCharge: number;
  taxAmount: number;
  discountAmount: number;
  paymentMethod: string;
  notes: string | null;
  items: { productId: string; name: string; image: string; price: number; quantity: number }[];
  shippingAddress: { fullName: string; phone: string; line1: string; line2: string | null; city: string; state: string; pincode: string };
  payment: { status: string; providerPaymentId: string | null } | null;
}

export default function AdminOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [updating, setUpdating] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch(`/api/orders/${id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setOrder(d.data);
      });
  }, [id]);

  async function updateStatus(status: string) {
    if (!order) return;
    setUpdating(true);
    const res = await fetch(`/api/admin/orders/${order.id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const data = await res.json();
    setUpdating(false);
    if (res.ok) {
      setOrder((o) => (o ? { ...o, status: data.data.status } : o));
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    }
  }

  if (!order) return <div className="py-10 text-fg/40">Loading...</div>;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-3xl">{order.orderNumber}</h1>
        <div className="flex items-center gap-3">
          <select
            value={order.status}
            onChange={(e) => updateStatus(e.target.value)}
            disabled={updating}
            className="rounded-sm border border-edge/20 bg-surface px-4 py-2 font-body text-sm focus:border-gold focus:outline-none"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          {updating && <Loader2 size={16} className="animate-spin text-fg/40" />}
          {saved && <Check size={16} className="text-gold" />}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {order.items.map((item) => (
          <div key={item.productId} className="flex items-center gap-4 rounded-sm border border-edge/10 bg-surface p-4">
            <div className="relative h-14 w-12 shrink-0 overflow-hidden rounded-sm">
              <Image src={item.image} alt={item.name} fill className="object-cover" />
            </div>
            <div className="flex-1 font-body text-sm">{item.name} × {item.quantity}</div>
            <span className="font-body text-sm">{formatINR(item.price * item.quantity)}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="rounded-sm border border-edge/10 bg-surface p-5 font-body text-sm">
          <h3 className="mb-3 text-xs uppercase tracking-widest text-fg/45">Shipping To</h3>
          <p>{order.shippingAddress.fullName} — {order.shippingAddress.phone}</p>
          <p className="mt-1 text-fg/60">
            {order.shippingAddress.line1}{order.shippingAddress.line2 ? `, ${order.shippingAddress.line2}` : ""},{" "}
            {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
          </p>
        </div>
        <div className="rounded-sm border border-edge/10 bg-surface p-5 font-body text-sm">
          <h3 className="mb-3 text-xs uppercase tracking-widest text-fg/45">Payment</h3>
          <p>Method: {order.paymentMethod}</p>
          <p className="mt-1">Status: {order.payment?.status ?? "—"}</p>
          {order.payment?.providerPaymentId && (
            <p className="mt-1 text-xs text-fg/40">Ref: {order.payment.providerPaymentId}</p>
          )}
          <div className="mt-3 border-t border-edge/10 pt-3">
            <p>Subtotal: {formatINR(order.subtotal)}</p>
            {order.discountAmount > 0 && <p>Discount: -{formatINR(order.discountAmount)}</p>}
            <p>Shipping: {formatINR(order.shippingCharge)}</p>
            <p>Tax: {formatINR(order.taxAmount)}</p>
            <p className="font-medium">Total: {formatINR(order.total)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
