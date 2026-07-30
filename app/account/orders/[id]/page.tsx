"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { formatINR } from "@/lib/utils";

interface OrderDetail {
  orderNumber: string;
  status: string;
  paymentMethod: string;
  total: number;
  subtotal: number;
  shippingCharge: number;
  taxAmount: number;
  discountAmount: number;
  createdAt: string;
  estimatedDelivery: string | null;
  notes: string | null;
  items: { productId: string; name: string; image: string; price: number; quantity: number }[];
  shippingAddress: { fullName: string; phone: string; line1: string; line2: string | null; city: string; state: string; pincode: string };
  payment: { status: string } | null;
}

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(`/api/orders/${id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setOrder(d.data);
        else setError(true);
      });
  }, [id]);

  if (error) return <p className="py-10 font-body text-sm text-fg/50">Order not found.</p>;
  if (!order) return <div className="py-10 text-fg/40">Loading...</div>;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-1">
        <h2 className="font-display text-2xl">{order.orderNumber}</h2>
        <p className="font-body text-xs uppercase tracking-widest text-gold">{order.status}</p>
      </div>

      <div className="flex flex-col gap-4">
        {order.items.map((item) => (
          <div key={item.productId} className="flex items-center gap-4 rounded-sm border border-edge/10 bg-surface p-4">
            <div className="relative h-16 w-14 shrink-0 overflow-hidden rounded-sm">
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

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="rounded-sm border border-edge/10 bg-surface p-5">
          <h3 className="mb-3 font-body text-xs uppercase tracking-widest text-fg/45">Shipping Address</h3>
          <p className="font-body text-sm">{order.shippingAddress.fullName}</p>
          <p className="mt-1 font-body text-xs text-fg/55">
            {order.shippingAddress.line1}
            {order.shippingAddress.line2 ? `, ${order.shippingAddress.line2}` : ""}, {order.shippingAddress.city},{" "}
            {order.shippingAddress.state} - {order.shippingAddress.pincode}
          </p>
          <p className="mt-1 font-body text-xs text-fg/55">{order.shippingAddress.phone}</p>
        </div>

        <div className="rounded-sm border border-edge/10 bg-surface p-5">
          <h3 className="mb-3 font-body text-xs uppercase tracking-widest text-fg/45">Payment Summary</h3>
          <SummaryRow label="Subtotal" value={formatINR(order.subtotal)} />
          {order.discountAmount > 0 && <SummaryRow label="Discount" value={`- ${formatINR(order.discountAmount)}`} />}
          <SummaryRow label="Shipping" value={order.shippingCharge === 0 ? "Free" : formatINR(order.shippingCharge)} />
          <SummaryRow label="GST" value={formatINR(order.taxAmount)} />
          <SummaryRow label="Total" value={formatINR(order.total)} bold />
          <p className="mt-3 font-body text-xs text-fg/45">
            Paid via {order.paymentMethod} — {order.payment?.status ?? "PENDING"}
          </p>
        </div>
      </div>

      {order.notes && (
        <div className="rounded-sm border border-edge/10 bg-surface p-5">
          <h3 className="mb-2 font-body text-xs uppercase tracking-widest text-fg/45">Order Notes</h3>
          <p className="font-body text-sm text-fg/70">{order.notes}</p>
        </div>
      )}
    </div>
  );
}

function SummaryRow({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between py-1 font-body text-sm">
      <span className={bold ? "font-medium" : "text-fg/55"}>{label}</span>
      <span className={bold ? "font-medium" : ""}>{value}</span>
    </div>
  );
}
