"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { FlameMark } from "@/components/ui/FlameMark";

export default function SignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const form = new FormData(e.currentTarget);
    const password = String(form.get("password") || "");
    const confirm = String(form.get("confirmPassword") || "");

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    const payload = {
      name: String(form.get("name") || ""),
      email: String(form.get("email") || ""),
      phone: String(form.get("phone") || "") || undefined,
      password,
    };

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Could not create account. Please try again.");
        return;
      }

      router.push("/account?welcome=1");
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
          <h1 className="font-display text-4xl">Create Account</h1>
          <p className="mt-2 font-body text-sm text-fg/55">
            Join Glimoré and discover Illuminated Living.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-5"
          noValidate
          aria-label="Create account form"
        >
          {/* Full Name */}
          <div>
            <label
              htmlFor="name"
              className="font-body text-xs uppercase tracking-widest text-fg/45"
            >
              Full Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              autoComplete="name"
              placeholder="Aarav Sharma"
              className="mt-2 w-full border-b border-edge/20 bg-transparent pb-3 pt-1 font-body text-sm text-fg placeholder:text-fg/30 transition-colors focus:border-gold focus:outline-none"
            />
          </div>

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
              placeholder="you@example.com"
              className="mt-2 w-full border-b border-edge/20 bg-transparent pb-3 pt-1 font-body text-sm text-fg placeholder:text-fg/30 transition-colors focus:border-gold focus:outline-none"
            />
          </div>

          {/* Phone */}
          <div>
            <label
              htmlFor="phone"
              className="font-body text-xs uppercase tracking-widest text-fg/45"
            >
              Phone{" "}
              <span className="normal-case tracking-normal text-fg/30">(optional)</span>
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              placeholder="+91 98765 43210"
              className="mt-2 w-full border-b border-edge/20 bg-transparent pb-3 pt-1 font-body text-sm text-fg placeholder:text-fg/30 transition-colors focus:border-gold focus:outline-none"
            />
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="font-body text-xs uppercase tracking-widest text-fg/45"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                autoComplete="new-password"
                placeholder="Min. 8 characters"
                minLength={8}
                className="mt-2 w-full border-b border-edge/20 bg-transparent pb-3 pt-1 pr-10 font-body text-sm text-fg placeholder:text-fg/30 transition-colors focus:border-gold focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-0 top-3 text-fg/40 hover:text-gold transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="font-body text-xs uppercase tracking-widest text-fg/45"
            >
              Confirm Password
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirm ? "text" : "password"}
                required
                autoComplete="new-password"
                placeholder="Repeat password"
                className="mt-2 w-full border-b border-edge/20 bg-transparent pb-3 pt-1 pr-10 font-body text-sm text-fg placeholder:text-fg/30 transition-colors focus:border-gold focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowConfirm((p) => !p)}
                aria-label={showConfirm ? "Hide password" : "Show password"}
                className="absolute right-0 top-3 text-fg/40 hover:text-gold transition-colors"
              >
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
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
            className="btn-gold mt-3 flex w-full items-center justify-center gap-2 py-4 disabled:opacity-70"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            {loading ? "Creating Account…" : "Create Account"}
          </button>
        </form>

        <div className="my-8 flex items-center gap-4">
          <span className="h-px flex-1 bg-edge/15" />
          <span className="font-body text-xs uppercase tracking-widest text-fg/30">or</span>
          <span className="h-px flex-1 bg-edge/15" />
        </div>

        <p className="text-center font-body text-sm text-fg/55">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-gold hover:underline">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
