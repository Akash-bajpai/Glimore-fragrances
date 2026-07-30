"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Loader2, Check } from "lucide-react";
import { FlameMark } from "@/components/ui/FlameMark";

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const email = String(new FormData(e.currentTarget).get("email") || "");

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }
      setMessage(data.data.message);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="section-px flex min-h-[90vh] items-center justify-center py-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md"
      >
        <div className="mb-8 flex flex-col items-center text-center">
          <FlameMark className="mb-4 h-9 w-auto" />
          <h1 className="font-display text-3xl">Reset Your Password</h1>
          <p className="mt-2 font-body text-sm text-fg/55">
            Enter your email and we&rsquo;ll send you a reset link.
          </p>
        </div>

        {message ? (
          <div className="flex flex-col items-center gap-3 rounded-sm border border-edge/10 bg-surface p-8 text-center">
            <Check size={24} className="text-gold" />
            <p className="font-body text-sm text-fg/70">{message}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label htmlFor="email" className="font-body text-xs uppercase tracking-widest text-fg/45">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="mt-1 w-full border-b border-edge/20 bg-transparent py-3 font-body text-sm text-fg placeholder:text-fg/35 focus:border-gold focus:outline-none"
              />
            </div>
            {error && <p className="font-body text-sm text-red-400">{error}</p>}
            <button type="submit" disabled={loading} className="btn-gold mt-2 disabled:opacity-70">
              {loading && <Loader2 size={16} className="animate-spin" />}
              {loading ? "Sending" : "Send Reset Link"}
            </button>
          </form>
        )}

        <p className="mt-6 text-center font-body text-sm text-fg/55">
          <Link href="/login" className="text-gold link-underline">
            Back to sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
