"use client";

import { useState, FormEvent, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { FlameMark } from "@/components/ui/FlameMark";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/account";

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

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
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md"
      >
        <div className="mb-10 flex flex-col items-center text-center">
          <FlameMark className="mb-5 h-9 w-auto" />
          <h1 className="font-display text-4xl">Welcome Back</h1>
          <p className="mt-2 font-body text-sm text-fg/55">
            Sign in to your Glimoré account.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-6"
          noValidate
          aria-label="Sign in form"
        >
          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="font-body text-xs uppercase tracking-widest text-fg/45"
            >
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              aria-label="Email address"
              placeholder="you@example.com"
              className="mt-2 w-full border-b border-edge/20 bg-transparent pb-3 pt-1 font-body text-sm text-fg placeholder:text-fg/30 transition-colors focus:border-gold focus:outline-none"
            />
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label
                htmlFor="password"
                className="font-body text-xs uppercase tracking-widest text-fg/45"
              >
                Password
              </label>
              <Link
                href="/forgot-password"
                className="font-body text-xs text-gold hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                autoComplete="current-password"
                aria-label="Password"
                placeholder="••••••••"
                className="w-full border-b border-edge/20 bg-transparent pb-3 pt-1 pr-10 font-body text-sm text-fg placeholder:text-fg/30 transition-colors focus:border-gold focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-0 top-1 text-fg/40 hover:text-gold transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-sm border border-red-500/30 bg-red-500/10 px-4 py-3 font-body text-sm text-red-400"
            >
              {error}
            </motion.p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-gold mt-2 flex w-full items-center justify-center gap-2 py-4 disabled:opacity-70"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            {loading ? "Signing In…" : "Sign In"}
          </button>
        </form>

        <div className="my-8 flex items-center gap-4">
          <span className="h-px flex-1 bg-edge/15" />
          <span className="font-body text-xs uppercase tracking-widest text-fg/30">or</span>
          <span className="h-px flex-1 bg-edge/15" />
        </div>

        <p className="text-center font-body text-sm text-fg/55">
          New to Glimoré?{" "}
          <Link href="/signup" className="font-medium text-gold hover:underline">
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
