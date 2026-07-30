"use client";

import { useEffect, useState } from "react";
import { formatINR } from "@/lib/utils";

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  createdAt: string;
  orderCount: number;
  totalSpend: number;
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    setLoading(true);
    const url = search ? `/api/admin/customers?q=${encodeURIComponent(search)}` : "/api/admin/customers";
    const t = setTimeout(() => {
      fetch(url)
        .then((r) => r.json())
        .then((d) => {
          if (d.success) setCustomers(d.data);
          setLoading(false);
        });
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl">Customers</h1>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email"
          className="rounded-sm border border-edge/20 bg-surface px-4 py-2 font-body text-sm focus:border-gold focus:outline-none"
        />
      </div>

      <div className="overflow-x-auto rounded-sm border border-edge/10 bg-surface">
        <table className="w-full font-body text-sm">
          <thead>
            <tr className="border-b border-edge/10 text-left text-xs uppercase tracking-widest text-fg/40">
              <th className="px-5 py-3">Name</th>
              <th className="px-5 py-3">Email</th>
              <th className="px-5 py-3">Orders</th>
              <th className="px-5 py-3">Total Spend</th>
              <th className="px-5 py-3">Joined</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="px-5 py-8 text-center text-fg/40">Loading...</td></tr>
            ) : customers.length === 0 ? (
              <tr><td colSpan={5} className="px-5 py-8 text-center text-fg/40">No customers found.</td></tr>
            ) : (
              customers.map((c) => (
                <tr key={c.id} className="border-b border-edge/5 last:border-0">
                  <td className="px-5 py-3">{c.name}</td>
                  <td className="px-5 py-3 text-fg/55">{c.email}</td>
                  <td className="px-5 py-3">{c.orderCount}</td>
                  <td className="px-5 py-3">{formatINR(c.totalSpend)}</td>
                  <td className="px-5 py-3 text-fg/50">
                    {new Date(c.createdAt).toLocaleDateString("en-IN")}
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
