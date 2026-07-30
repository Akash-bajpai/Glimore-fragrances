"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { FlameMark } from "@/components/ui/FlameMark";

export default function SignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const payload = {
      name: String(form.get("name") || ""),
      email: String(form.get("email") || ""),
      password: String(form.get("password") || ""),
      phone: String(form.get("phone") || "") || undefined,
    };

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        if (data.details) {
          const errs: Record<string, string> = {};
          for (const d of data.details) errs[d.path] = d.message;
          setFieldErrors(errs);
        }
        setError(data.error ?? "Something went wrong.");
        return;
      }

      router.push("/account");
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
          <h1 className="font-display text-3xl">Create Your Account</h1>
          <p className="mt-2 font-body text-sm text-fg/55">
            Join the Glimoré Circle for faster checkout and order tracking.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <TextField name="name" label="Full Name" error={fieldErrors.name} />
          <TextField name="email" label="Email Address" type="email" error={fieldErrors.email} />
          <TextField name="phone" label="Phone (optional)" type="tel" error={fieldErrors.phone} />
          <TextField name="password" label="Password" type="password" error={fieldErrors.password} />

          {error && <p className="font-body text-sm text-red-400">{error}</p>}

          <button type="submit" disabled={loading} className="btn-gold mt-2 disabled:opacity-70">
            {loading && <Loader2 size={16} className="animate-spin" />}
            {loading ? "Creating Account" : "Create Account"}
          </button>
        </form>

        <p className="mt-6 text-center font-body text-sm text-fg/55">
          Already have an account?{" "}
          <Link href="/login" className="text-gold link-underline">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}

function TextField({
  name,
  label,
  type = "text",
  error,
}: {
  name: string;
  label: string;
  type?: string;
  error?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="font-body text-xs uppercase tracking-widest text-fg/45">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={name !== "phone"}
        className="mt-1 w-full border-b border-edge/20 bg-transparent py-3 font-body text-sm text-fg placeholder:text-fg/35 focus:border-gold focus:outline-none"
      />
      {error && <p className="mt-1 font-body text-xs text-red-400/80">{error}</p>}
    </div>
  );
}
