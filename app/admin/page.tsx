"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { TrendingUp, ShoppingBag, Users, Clock, AlertTriangle } from "lucide-react";
import { formatINR } from "@/lib/utils";

interface Stats {
  totalRevenue: number;
  orderCount: number;
  customerCount: number;
  pendingCount: number;
  lowStock: { id: string; name: string; stock: number }[];
  recentOrders: { id: string; orderNumber: string; total: number; status: string; user: { name: string } }[];
  statusCounts: { status: string; count: number }[];
  revenueTrend: { date: string; total: number }[];
  topProducts: { productId: string; name: string; unitsSold: number }[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setStats(d.data);
      });
  }, []);

  if (!stats) return <div className="py-10 text-fg/40">Loading dashboard...</div>;

  const maxRevenue = Math.max(...stats.revenueTrend.map((r) => r.total), 1);

  return (
    <div className="flex flex-col gap-8">
      <h1 className="font-display text-3xl">Dashboard</h1>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={<TrendingUp size={18} />} label="Total Revenue" value={formatINR(stats.totalRevenue)} />
        <StatCard icon={<ShoppingBag size={18} />} label="Total Orders" value={String(stats.orderCount)} />
        <StatCard icon={<Users size={18} />} label="Customers" value={String(stats.customerCount)} />
        <StatCard icon={<Clock size={18} />} label="Pending Orders" value={String(stats.pendingCount)} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-sm border border-edge/10 bg-surface p-6 lg:col-span-2">
          <h2 className="mb-6 font-display text-lg">Revenue — Last 30 Days</h2>
          {stats.revenueTrend.length === 0 ? (
            <p className="font-body text-sm text-fg/40">No paid orders yet.</p>
          ) : (
            <div className="flex h-40 items-end gap-1">
              {stats.revenueTrend.map((point) => (
                <div key={point.date} className="group relative flex-1">
                  <div
                    className="w-full rounded-t-sm bg-gold/70 transition-colors group-hover:bg-gold"
                    style={{ height: `${Math.max(4, (point.total / maxRevenue) * 100)}%` }}
                  />
                  <div className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-ink px-2 py-1 font-body text-[10px] text-cream opacity-0 transition-opacity group-hover:opacity-100">
                    {formatINR(point.total)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-sm border border-edge/10 bg-surface p-6">
          <h2 className="mb-4 font-display text-lg">Order Status</h2>
          <div className="flex flex-col gap-2.5">
            {stats.statusCounts.map((s) => (
              <div key={s.status} className="flex items-center justify-between font-body text-sm">
                <span className="text-fg/60">{s.status}</span>
                <span>{s.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-sm border border-edge/10 bg-surface p-6">
          <h2 className="mb-4 font-display text-lg">Recent Orders</h2>
          <div className="flex flex-col divide-y divide-edge/10">
            {stats.recentOrders.map((o) => (
              <Link
                key={o.id}
                href={`/admin/orders/${o.id}`}
                className="flex items-center justify-between py-3 font-body text-sm hover:text-gold"
              >
                <span>{o.orderNumber} — {o.user.name}</span>
                <span>{formatINR(o.total)}</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-sm border border-edge/10 bg-surface p-6">
          <h2 className="mb-4 flex items-center gap-2 font-display text-lg">
            <AlertTriangle size={16} className="text-gold" /> Low Stock
          </h2>
          {stats.lowStock.length === 0 ? (
            <p className="font-body text-sm text-fg/40">All products well stocked.</p>
          ) : (
            <div className="flex flex-col divide-y divide-edge/10">
              {stats.lowStock.map((p) => (
                <div key={p.id} className="flex items-center justify-between py-3 font-body text-sm">
                  <span>{p.name}</span>
                  <span className="text-red-400">{p.stock} left</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="rounded-sm border border-edge/10 bg-surface p-6">
        <h2 className="mb-4 font-display text-lg">Top Products</h2>
        <div className="flex flex-col divide-y divide-edge/10">
          {stats.topProducts.map((p) => (
            <div key={p.productId} className="flex items-center justify-between py-3 font-body text-sm">
              <span>{p.name}</span>
              <span className="text-fg/55">{p.unitsSold} sold</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-sm border border-edge/10 bg-surface p-5">
      <div className="flex items-center gap-2 text-gold">{icon}</div>
      <p className="mt-3 font-display text-2xl">{value}</p>
      <p className="mt-1 font-body text-xs text-fg/45">{label}</p>
    </div>
  );
}
