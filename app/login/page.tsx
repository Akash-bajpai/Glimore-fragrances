"use client";

import { useState, FormEvent, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { FlameMark } from "@/components/ui/FlameMark";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/account";

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const payload = {
      email: String(form.get("email") || ""),
      password: String(form.get("password") || ""),
    };

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Invalid email or password.");
        return;
      }

      router.push(redirectTo);
      router.refresh();
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
          <h1 className="font-display text-3xl">Welcome Back</h1>
          <p className="mt-2 font-body text-sm text-fg/55">Sign in to continue.</p>
        </div>

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
          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="font-body text-xs uppercase tracking-widest text-fg/45">
                Password
              </label>
              <Link href="/forgot-password" className="font-body text-xs text-gold link-underline">
                Forgot password?
              </Link>
            </div>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="mt-1 w-full border-b border-edge/20 bg-transparent py-3 font-body text-sm text-fg placeholder:text-fg/35 focus:border-gold focus:outline-none"
            />
          </div>

          {error && <p className="font-body text-sm text-red-400">{error}</p>}

          <button type="submit" disabled={loading} className="btn-gold mt-2 disabled:opacity-70">
            {loading && <Loader2 size={16} className="animate-spin" />}
            {loading ? "Signing In" : "Sign In"}
          </button>
        </form>

        <p className="mt-6 text-center font-body text-sm text-fg/55">
          New to Glimoré?{" "}
          <Link href="/signup" className="text-gold link-underline">
            Create an account
          </Link>
        </p>
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
