"use client";

import { useEffect, useRef, useState, FormEvent, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { FlameMark } from "@/components/ui/FlameMark";

const RESEND_COOLDOWN = 60;

function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";
  const rawRedirect = searchParams.get("redirect") || "/account?welcome=1";
  const redirectTo = rawRedirect.startsWith("/") && !rawRedirect.startsWith("//") ? rawRedirect : "/account";

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const submit = async (value: string) => {
    if (!/^\d{6}$/.test(value)) {
      setError("Enter the 6-digit code from your email.");
      return;
    }
    setError(null);
    setInfo(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: value }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not verify the code. Please try again.");
        setCode("");
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

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    submit(code);
  };

  const resend = async () => {
    setError(null);
    setInfo(null);
    setResending(true);
    try {
      const res = await fetch("/api/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      const wait = data.details?.retryAfterSeconds ?? data.data?.retryAfterSeconds ?? RESEND_COOLDOWN;
      setCooldown(wait);
      if (!res.ok) {
        setError(data.error ?? "Could not resend the code.");
        return;
      }
      setInfo("A new code is on its way. Check your inbox (and spam folder).");
      setCode("");
      inputRef.current?.focus();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setResending(false);
    }
  };

  if (!email) {
    return (
      <div className="section-px flex min-h-[70vh] items-center justify-center py-24 text-center">
        <p className="font-body text-sm text-fg/60">
          Missing email.{" "}
          <Link href="/login" className="text-gold hover:underline">
            Sign in
          </Link>{" "}
          to get a new code.
        </p>
      </div>
    );
  }

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
          <h1 className="font-display text-4xl">Verify Your Email</h1>
          <p className="mt-3 font-body text-sm text-fg/55">
            We sent a 6-digit code to <span className="text-fg">{email}</span>. It expires in 10 minutes.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6" noValidate aria-label="Verify email form">
          <input
            ref={inputRef}
            id="code"
            name="code"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="\d{6}"
            maxLength={6}
            aria-label="6-digit verification code"
            placeholder="••••••"
            value={code}
            onChange={(e) => {
              const v = e.target.value.replace(/\D/g, "").slice(0, 6);
              setCode(v);
              if (v.length === 6 && !loading) submit(v);
            }}
            className="w-full border-b border-edge/20 bg-transparent pb-3 pt-1 text-center font-body text-3xl tracking-[0.6em] text-fg placeholder:text-fg/25 transition-colors focus:border-gold focus:outline-none"
          />

          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-sm border border-red-500/30 bg-red-500/10 px-4 py-3 font-body text-sm text-red-400"
            >
              {error}
            </motion.p>
          )}
          {info && (
            <p className="rounded-sm border border-gold/30 bg-gold/10 px-4 py-3 font-body text-sm text-fg/80">{info}</p>
          )}

          <button
            type="submit"
            disabled={loading || code.length !== 6}
            className="btn-gold mt-2 flex w-full items-center justify-center gap-2 py-4 disabled:opacity-70"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            {loading ? "Verifying…" : "Verify & Continue"}
          </button>
        </form>

        <p className="mt-8 text-center font-body text-sm text-fg/55">
          Didn&apos;t get it?{" "}
          {cooldown > 0 ? (
            <span className="text-fg/40">Resend code in {cooldown}s</span>
          ) : (
            <button
              type="button"
              onClick={resend}
              disabled={resending}
              className="font-medium text-gold hover:underline disabled:opacity-60"
            >
              {resending ? "Sending…" : "Resend code"}
            </button>
          )}
        </p>
      </motion.div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailForm />
    </Suspense>
  );
}
