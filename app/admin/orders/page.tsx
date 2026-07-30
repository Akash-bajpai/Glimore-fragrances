"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatINR } from "@/lib/utils";

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  createdAt: string;
  user: { name: string; email: string };
  payment: { status: string; method: string } | null;
}

const STATUSES = ["", "PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const url = statusFilter ? `/api/admin/orders?status=${statusFilter}` : "/api/admin/orders";
    fetch(url)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setOrders(d.data.orders);
        setLoading(false);
      });
  }, [statusFilter]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl">Orders</h1>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-sm border border-edge/20 bg-surface px-4 py-2 font-body text-sm focus:border-gold focus:outline-none"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s || "All Statuses"}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto rounded-sm border border-edge/10 bg-surface">
        <table className="w-full font-body text-sm">
          <thead>
            <tr className="border-b border-edge/10 text-left text-xs uppercase tracking-widest text-fg/40">
              <th className="px-5 py-3">Order</th>
              <th className="px-5 py-3">Customer</th>
              <th className="px-5 py-3">Payment</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Total</th>
              <th className="px-5 py-3">Date</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-fg/40">Loading...</td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-fg/40">No orders found.</td>
              </tr>
            ) : (
              orders.map((o) => (
                <tr key={o.id} className="border-b border-edge/5 last:border-0 hover:bg-bg">
                  <td className="px-5 py-4">
                    <Link href={`/admin/orders/${o.id}`} className="text-gold hover:underline">
                      {o.orderNumber}
                    </Link>
                  </td>
                  <td className="px-5 py-4">
                    <div>{o.user.name}</div>
                    <div className="text-xs text-fg/40">{o.user.email}</div>
                  </td>
                  <td className="px-5 py-4">
                    {o.payment?.method} — {o.payment?.status ?? "—"}
                  </td>
                  <td className="px-5 py-4">{o.status}</td>
                  <td className="px-5 py-4">{formatINR(o.total)}</td>
                  <td className="px-5 py-4 text-fg/50">
                    {new Date(o.createdAt).toLocaleDateString("en-IN")}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
