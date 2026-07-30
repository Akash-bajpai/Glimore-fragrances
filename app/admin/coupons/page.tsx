"use client";

import { useEffect, useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import { formatINR } from "@/lib/utils";

interface Coupon {
  id: string;
  code: string;
  discountType: "PERCENT" | "FLAT";
  discountValue: number;
  minOrderValue: number;
  usedCount: number;
  usageLimit: number | null;
  isActive: boolean;
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function load() {
    setLoading(true);
    fetch("/api/admin/coupons")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setCoupons(d.data);
        setLoading(false);
      });
  }

  useEffect(load, []);

  async function toggleActive(id: string, isActive: boolean) {
    setCoupons((prev) => prev.map((c) => (c.id === id ? { ...c, isActive } : c)));
    await fetch(`/api/admin/coupons/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive }),
    });
  }

  async function handleCreate(formData: FormData) {
    setCreating(true);
    setError(null);
    const payload = {
      code: String(formData.get("code")),
      discountType: String(formData.get("discountType")),
      discountValue: Number(formData.get("discountValue")),
      minOrderValue: Number(formData.get("minOrderValue") || 0),
    };
    const res = await fetch("/api/admin/coupons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setCreating(false);
    if (!res.ok) {
      setError(data.error ?? "Could not create coupon.");
      return;
    }
    setShowForm(false);
    load();
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl">Coupons</h1>
        <button onClick={() => setShowForm((s) => !s)} className="btn-gold px-5 py-2.5 text-xs">
          <Plus size={14} /> New Coupon
        </button>
      </div>

      {showForm && (
        <form
          action={(fd) => handleCreate(fd)}
          className="grid grid-cols-1 gap-4 rounded-sm border border-edge/10 bg-surface p-6 sm:grid-cols-4"
        >
          <div>
            <label className="font-body text-xs uppercase tracking-widest text-fg/45">Code</label>
            <input name="code" required className="mt-1 w-full border-b border-edge/20 bg-transparent py-2 font-body text-sm focus:border-gold focus:outline-none" />
          </div>
          <div>
            <label className="font-body text-xs uppercase tracking-widest text-fg/45">Type</label>
            <select name="discountType" className="mt-1 w-full border-b border-edge/20 bg-transparent py-2 font-body text-sm focus:border-gold focus:outline-none">
              <option value="PERCENT">Percent</option>
              <option value="FLAT">Flat (₹)</option>
            </select>
          </div>
          <div>
            <label className="font-body text-xs uppercase tracking-widest text-fg/45">Value</label>
            <input name="discountValue" type="number" required className="mt-1 w-full border-b border-edge/20 bg-transparent py-2 font-body text-sm focus:border-gold focus:outline-none" />
          </div>
          <div>
            <label className="font-body text-xs uppercase tracking-widest text-fg/45">Min Order (₹)</label>
            <input name="minOrderValue" type="number" defaultValue={0} className="mt-1 w-full border-b border-edge/20 bg-transparent py-2 font-body text-sm focus:border-gold focus:outline-none" />
          </div>
          {error && <p className="font-body text-sm text-red-400 sm:col-span-4">{error}</p>}
          <button type="submit" disabled={creating} className="btn-gold self-start sm:col-span-4">
            {creating && <Loader2 size={14} className="animate-spin" />}
            Create Coupon
          </button>
        </form>
      )}

      <div className="overflow-x-auto rounded-sm border border-edge/10 bg-surface">
        <table className="w-full font-body text-sm">
          <thead>
            <tr className="border-b border-edge/10 text-left text-xs uppercase tracking-widest text-fg/40">
              <th className="px-5 py-3">Code</th>
              <th className="px-5 py-3">Discount</th>
              <th className="px-5 py-3">Min Order</th>
              <th className="px-5 py-3">Used</th>
              <th className="px-5 py-3">Active</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="px-5 py-8 text-center text-fg/40">Loading...</td></tr>
            ) : (
              coupons.map((c) => (
                <tr key={c.id} className="border-b border-edge/5 last:border-0">
                  <td className="px-5 py-3 font-medium">{c.code}</td>
                  <td className="px-5 py-3">
                    {c.discountType === "PERCENT" ? `${c.discountValue}%` : formatINR(c.discountValue)}
                  </td>
                  <td className="px-5 py-3">{formatINR(c.minOrderValue)}</td>
                  <td className="px-5 py-3">{c.usedCount}{c.usageLimit ? ` / ${c.usageLimit}` : ""}</td>
                  <td className="px-5 py-3">
                    <input
                      type="checkbox"
                      checked={c.isActive}
                      onChange={(e) => toggleActive(c.id, e.target.checked)}
                      className="accent-[#C8A96A]"
                    />
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
