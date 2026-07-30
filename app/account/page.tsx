"use client";

import { useEffect, useState, FormEvent } from "react";
import { Loader2, Check } from "lucide-react";

interface Me {
  name: string;
  email: string;
  phone: string | null;
  createdAt: string;
}

export default function ProfilePage() {
  const [user, setUser] = useState<Me | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => setUser(d.data.user));
  }, []);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);

    const form = new FormData(e.currentTarget);
    const payload = {
      name: String(form.get("name") || ""),
      phone: String(form.get("phone") || ""),
    };

    const res = await fetch("/api/account/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setSaving(false);

    if (!res.ok) {
      setError(data.error ?? "Could not save changes.");
      return;
    }
    setUser(data.data);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  if (!user) {
    return <div className="py-10 text-fg/40">Loading...</div>;
  }

  return (
    <div className="max-w-lg rounded-sm border border-edge/10 bg-surface p-8">
      <h2 className="mb-6 font-display text-2xl">Profile Details</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div>
          <label className="font-body text-xs uppercase tracking-widest text-fg/45">Full Name</label>
          <input
            name="name"
            defaultValue={user.name}
            required
            className="mt-1 w-full border-b border-edge/20 bg-transparent py-2.5 font-body text-sm focus:border-gold focus:outline-none"
          />
        </div>
        <div>
          <label className="font-body text-xs uppercase tracking-widest text-fg/45">Email</label>
          <input
            value={user.email}
            disabled
            className="mt-1 w-full border-b border-edge/10 bg-transparent py-2.5 font-body text-sm text-fg/40"
          />
        </div>
        <div>
          <label className="font-body text-xs uppercase tracking-widest text-fg/45">Phone</label>
          <input
            name="phone"
            defaultValue={user.phone ?? ""}
            className="mt-1 w-full border-b border-edge/20 bg-transparent py-2.5 font-body text-sm focus:border-gold focus:outline-none"
          />
        </div>

        {error && <p className="font-body text-sm text-red-400">{error}</p>}

        <button type="submit" disabled={saving} className="btn-gold self-start disabled:opacity-60">
          {saving && <Loader2 size={16} className="animate-spin" />}
          {saved && <Check size={16} />}
          {saving ? "Saving" : saved ? "Saved" : "Save Changes"}
        </button>
      </form>
    </div>
  );
}
