"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Package } from "lucide-react";
import { formatINR } from "@/lib/utils";

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  createdAt: string;
  items: { name: string; quantity: number }[];
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: "text-fg/50",
  CONFIRMED: "text-gold",
  PROCESSING: "text-gold",
  SHIPPED: "text-blue-400",
  DELIVERED: "text-green-400",
  CANCELLED: "text-red-400",
  REFUNDED: "text-red-400",
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[] | null>(null);

  useEffect(() => {
    fetch("/api/orders")
      .then((r) => r.json())
      .then((d) => setOrders(d.success ? d.data : []));
  }, []);

  if (!orders) return <div className="py-10 text-fg/40">Loading...</div>;

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-sm border border-edge/10 bg-surface py-16 text-center">
        <Package size={28} className="text-fg/30" />
        <p className="font-body text-sm text-fg/50">You haven&rsquo;t placed any orders yet.</p>
        <Link href="/#best-sellers" className="btn-gold">
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {orders.map((order) => (
        <Link
          key={order.id}
          href={`/account/orders/${order.id}`}
          className="flex flex-col gap-3 rounded-sm border border-edge/10 bg-surface p-5 transition-colors hover:border-gold/30 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <p className="font-display text-lg">{order.orderNumber}</p>
            <p className="mt-1 font-body text-xs text-fg/45">
              {order.items.map((i) => `${i.name} × ${i.quantity}`).join(", ")}
            </p>
            <p className="mt-1 font-body text-xs text-fg/35">
              {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
            </p>
          </div>
          <div className="flex items-center gap-4 sm:flex-col sm:items-end sm:gap-1">
            <span className={`font-body text-xs uppercase tracking-widest ${STATUS_COLORS[order.status] ?? "text-fg/50"}`}>
              {order.status}
            </span>
            <span className="font-display text-lg">{formatINR(order.total)}</span>
          </div>
        </Link>
      ))}
    </div>
  );
}
