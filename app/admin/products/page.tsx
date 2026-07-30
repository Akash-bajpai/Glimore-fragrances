"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Plus, Loader2 } from "lucide-react";
import { formatINR } from "@/lib/utils";

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  stock: number;
  isActive: boolean;
  image: string;
  category: { name: string } | null;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function loadProducts() {
    setLoading(true);
    fetch("/api/admin/products")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setProducts(d.data);
        setLoading(false);
      });
  }

  useEffect(loadProducts, []);

  async function updateStock(id: string, stock: number) {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, stock } : p)));
    await fetch(`/api/admin/products/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stock }),
    });
  }

  async function toggleActive(id: string, isActive: boolean) {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, isActive } : p)));
    await fetch(`/api/admin/products/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive }),
    });
  }

  async function handleCreate(formData: FormData) {
    setCreating(true);
    setError(null);
    const payload = {
      name: String(formData.get("name")),
      slug: String(formData.get("slug")),
      description: String(formData.get("description")),
      price: Number(formData.get("price")),
      image: String(formData.get("image")),
      stock: Number(formData.get("stock")),
      gallery: [],
      notesTop: [],
      notesHeart: [],
      notesBase: [],
      isActive: true,
    };
    const res = await fetch("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setCreating(false);
    if (!res.ok) {
      setError(data.error ?? "Could not create product.");
      return;
    }
    setShowForm(false);
    loadProducts();
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl">Products</h1>
        <button onClick={() => setShowForm((s) => !s)} className="btn-gold px-5 py-2.5 text-xs">
          <Plus size={14} /> New Product
        </button>
      </div>

      {showForm && (
        <form
          action={(fd) => handleCreate(fd)}
          className="grid grid-cols-1 gap-4 rounded-sm border border-edge/10 bg-surface p-6 sm:grid-cols-3"
        >
          <F name="name" label="Name" required />
          <F name="slug" label="Slug (lowercase-with-hyphens)" required />
          <F name="price" label="Price (₹)" type="number" required />
          <F name="stock" label="Stock" type="number" required />
          <F name="image" label="Image Path (e.g. /images/products/x.jpg)" required className="sm:col-span-2" />
          <div className="sm:col-span-3">
            <label className="font-body text-xs uppercase tracking-widest text-fg/45">Description</label>
            <textarea
              name="description"
              required
              rows={3}
              className="mt-1 w-full rounded-sm border border-edge/20 bg-transparent px-3 py-2 font-body text-sm focus:border-gold focus:outline-none"
            />
          </div>
          {error && <p className="font-body text-sm text-red-400 sm:col-span-3">{error}</p>}
          <button type="submit" disabled={creating} className="btn-gold self-start sm:col-span-3">
            {creating && <Loader2 size={14} className="animate-spin" />}
            Create Product
          </button>
        </form>
      )}

      <div className="overflow-x-auto rounded-sm border border-edge/10 bg-surface">
        <table className="w-full font-body text-sm">
          <thead>
            <tr className="border-b border-edge/10 text-left text-xs uppercase tracking-widest text-fg/40">
              <th className="px-5 py-3">Product</th>
              <th className="px-5 py-3">Category</th>
              <th className="px-5 py-3">Price</th>
              <th className="px-5 py-3">Stock</th>
              <th className="px-5 py-3">Active</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="px-5 py-8 text-center text-fg/40">Loading...</td></tr>
            ) : (
              products.map((p) => (
                <tr key={p.id} className="border-b border-edge/5 last:border-0">
                  <td className="flex items-center gap-3 px-5 py-3">
                    <div className="relative h-10 w-9 shrink-0 overflow-hidden rounded-sm">
                      <Image src={p.image} alt={p.name} fill className="object-cover" />
                    </div>
                    {p.name}
                  </td>
                  <td className="px-5 py-3 text-fg/55">{p.category?.name ?? "—"}</td>
                  <td className="px-5 py-3">{formatINR(p.price)}</td>
                  <td className="px-5 py-3">
                    <input
                      type="number"
                      defaultValue={p.stock}
                      onBlur={(e) => updateStock(p.id, Number(e.target.value))}
                      className="w-20 rounded-sm border border-edge/20 bg-transparent px-2 py-1 text-sm focus:border-gold focus:outline-none"
                    />
                  </td>
                  <td className="px-5 py-3">
                    <input
                      type="checkbox"
                      checked={p.isActive}
                      onChange={(e) => toggleActive(p.id, e.target.checked)}
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

function F({
  name,
  label,
  type = "text",
  required,
  className,
}: {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="font-body text-xs uppercase tracking-widest text-fg/45">{label}</label>
      <input
        name={name}
        type={type}
        required={required}
        className="mt-1 w-full border-b border-edge/20 bg-transparent py-2 font-body text-sm focus:border-gold focus:outline-none"
      />
    </div>
  );
}
