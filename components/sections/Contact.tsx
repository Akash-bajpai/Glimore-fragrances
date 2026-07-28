"use client";

import { useState, FormEvent } from "react";
import { motion } from "framer-motion";
import { MapPin, Phone, Mail, Loader2, Check } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { siteConfig } from "@/data/content";

type Status = "idle" | "loading" | "success";

export function Contact() {
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const name = String(form.get("name") || "").trim();
    const email = String(form.get("email") || "").trim();
    const message = String(form.get("message") || "").trim();

    const nextErrors: Record<string, string> = {};
    if (name.length < 2) nextErrors.name = "Please enter your name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) nextErrors.email = "Enter a valid email.";
    if (message.length < 10) nextErrors.message = "Tell us a little more (10+ characters).";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setStatus("loading");
    setTimeout(() => {
      setStatus("success");
      e.currentTarget.reset();
    }, 1200);
  };

  return (
    <section id="contact" className="section-px mx-auto max-w-content py-24 sm:py-32">
      <SectionHeading
        eyebrow="Get In Touch"
        title="We'd Love To Hear From You"
        description="For orders, gifting, corporate collaborations, or just to say hello."
        className="mb-14 sm:mb-16"
      />

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
        <div className="flex flex-col gap-8">
          <div className="overflow-hidden rounded-sm border border-edge/10">
            <iframe
              title="Glimoré Fragrances location — Sohna, Gurgaon"
              src="https://www.google.com/maps?q=Sohna,Gurgaon,Haryana,122103&output=embed"
              width="100%"
              height="280"
              loading="lazy"
              className="grayscale invert-[0.92] contrast-[0.9]"
              style={{ border: 0 }}
            />
          </div>

          <div className="flex flex-col gap-5">
            <ContactRow icon={<MapPin size={17} />} label="Studio Address">
              {siteConfig.address.line}, {siteConfig.address.pin}, {siteConfig.address.country}
            </ContactRow>
            <ContactRow icon={<Phone size={17} />} label="Phone / WhatsApp">
              {siteConfig.phoneDisplay}
            </ContactRow>
            <ContactRow icon={<Mail size={17} />} label="Email">
              {siteConfig.email}
            </ContactRow>
          </div>
        </div>

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
          <Field name="name" label="Your Name" error={errors.name} />
          <Field name="email" label="Email Address" type="email" error={errors.email} />
          <Field name="message" label="Your Message" textarea error={errors.message} />

          <motion.button
            type="submit"
            disabled={status === "loading"}
            whileTap={{ scale: 0.98 }}
            className="btn-gold mt-2 disabled:opacity-70"
          >
            {status === "loading" ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Sending
              </>
            ) : status === "success" ? (
              <>
                <Check size={16} /> Message Sent
              </>
            ) : (
              "Send Message"
            )}
          </motion.button>
          {status === "success" && (
            <p className="font-body text-xs text-fg/50">
              Thank you — our team will reach out within 24 hours.
            </p>
          )}
        </form>
      </div>
    </section>
  );
}

function ContactRow({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-4">
      <span className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold/10 text-gold">
        {icon}
      </span>
      <div>
        <p className="font-body text-xs uppercase tracking-widest text-fg/40">{label}</p>
        <p className="mt-1 font-body text-sm text-fg/80">{children}</p>
      </div>
    </div>
  );
}

function Field({
  name,
  label,
  type = "text",
  textarea = false,
  error,
}: {
  name: string;
  label: string;
  type?: string;
  textarea?: boolean;
  error?: string;
}) {
  const shared =
    "w-full border-b border-edge/20 bg-transparent py-3 font-body text-sm text-fg placeholder:text-fg/35 focus:border-gold focus:outline-none";
  return (
    <div>
      <label htmlFor={name} className="font-body text-xs uppercase tracking-widest text-fg/45">
        {label}
      </label>
      {textarea ? (
        <textarea id={name} name={name} rows={4} className={`${shared} mt-1 resize-none`} />
      ) : (
        <input id={name} type={type} name={name} className={`${shared} mt-1`} />
      )}
      {error && <p className="mt-1 font-body text-xs text-red-400/80">{error}</p>}
    </div>
  );
}
