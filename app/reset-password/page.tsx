"use client";

import { useState, FormEvent, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { FlameMark } from "@/components/ui/FlameMark";

function ResetForm() {
  const router = useRouter();
  const token = useSearchParams().get("token") ?? "";
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const password = String(new FormData(e.currentTarget).get("password") || "");

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }
      setSuccess(true);
      setTimeout(() => router.push("/login"), 1800);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="section-px flex min-h-[80vh] items-center justify-center text-center">
        <p className="font-body text-sm text-fg/60">
          This reset link is missing its token. Please request a new one from the
          forgot password page.
        </p>
      </div>
    );
  }

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
          <h1 className="font-display text-3xl">Set a New Password</h1>
        </div>

        {success ? (
          <p className="text-center font-body text-sm text-fg/60">
            Password updated — redirecting you to sign in...
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label htmlFor="password" className="font-body text-xs uppercase tracking-widest text-fg/45">
                New Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                minLength={8}
                className="mt-1 w-full border-b border-edge/20 bg-transparent py-3 font-body text-sm text-fg placeholder:text-fg/35 focus:border-gold focus:outline-none"
              />
            </div>
            {error && <p className="font-body text-sm text-red-400">{error}</p>}
            <button type="submit" disabled={loading} className="btn-gold mt-2 disabled:opacity-70">
              {loading && <Loader2 size={16} className="animate-spin" />}
              {loading ? "Updating" : "Update Password"}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetForm />
    </Suspense>
  );
}
