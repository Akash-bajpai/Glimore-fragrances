"use client";

import { useEffect, useState } from "react";
import { Trash2, Star, Plus } from "lucide-react";

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

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/addresses")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setAddresses(d.data);
        setLoading(false);
      });
  }, []);

  async function handleAdd(formData: FormData) {
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
    setShowForm(false);
  }

  async function handleDelete(id: string) {
    await fetch(`/api/addresses/${id}`, { method: "DELETE" });
    setAddresses((prev) => prev.filter((a) => a.id !== id));
  }

  async function handleSetDefault(id: string) {
    await fetch(`/api/addresses/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isDefault: true }),
    });
    setAddresses((prev) => prev.map((a) => ({ ...a, isDefault: a.id === id })));
  }

  if (loading) return <div className="py-10 text-fg/40">Loading...</div>;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {addresses.map((addr) => (
          <div key={addr.id} className="flex flex-col gap-2 rounded-sm border border-edge/10 bg-surface p-5">
            <div className="flex items-start justify-between">
              <p className="font-body text-sm font-medium">
                {addr.fullName}
                {addr.isDefault && (
                  <span className="ml-2 rounded-full bg-gold/15 px-2 py-0.5 font-body text-[10px] uppercase tracking-widest text-gold">
                    Default
                  </span>
                )}
              </p>
              <button onClick={() => handleDelete(addr.id)} className="text-fg/35 hover:text-red-400">
                <Trash2 size={14} />
              </button>
            </div>
            <p className="font-body text-xs text-fg/55">{addr.phone}</p>
            <p className="font-body text-xs text-fg/55">
              {addr.line1}{addr.line2 ? `, ${addr.line2}` : ""}, {addr.city}, {addr.state} - {addr.pincode}
            </p>
            {!addr.isDefault && (
              <button
                onClick={() => handleSetDefault(addr.id)}
                className="mt-1 flex items-center gap-1.5 self-start font-body text-xs text-gold link-underline"
              >
                <Star size={12} /> Set as default
              </button>
            )}
          </div>
        ))}
      </div>

      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 self-start font-body text-sm text-gold link-underline"
        >
          <Plus size={15} /> Add New Address
        </button>
      ) : (
        <form
          action={(fd) => handleAdd(fd)}
          className="grid grid-cols-1 gap-4 rounded-sm border border-edge/10 bg-surface p-6 sm:grid-cols-2"
        >
          <Field name="fullName" label="Full Name" required />
          <Field name="phone" label="Phone Number" required />
          <Field name="line1" label="Address Line 1" required className="sm:col-span-2" />
          <Field name="line2" label="Address Line 2 (optional)" className="sm:col-span-2" />
          <Field name="city" label="City" required />
          <Field name="state" label="State" required />
          <Field name="pincode" label="PIN Code" required pattern="[1-9][0-9]{5}" />
          {error && <p className="font-body text-sm text-red-400 sm:col-span-2">{error}</p>}
          <div className="flex gap-3 sm:col-span-2">
            <button type="submit" className="btn-gold">
              Save Address
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-outline">
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

function Field({
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
      <label className="font-body text-xs uppercase tracking-widest text-fg/45">{label}</label>
      <input
        name={name}
        required={required}
        pattern={pattern}
        className="mt-1 w-full border-b border-edge/20 bg-transparent py-2.5 font-body text-sm focus:border-gold focus:outline-none"
      />
    </div>
  );
}
