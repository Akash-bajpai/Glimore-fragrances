import Link from "next/link";
import { Instagram, Facebook, MapPin, Phone, Mail } from "lucide-react";
import { FlameMark } from "@/components/ui/FlameMark";
import { siteConfig, navLinks } from "@/data/content";
import { categories } from "@/data/products";

const policies = ["Privacy Policy", "Terms of Service", "Shipping Policy", "Return & Refund"];

export function Footer() {
  return (
    <footer className="border-t border-edge/10 bg-surface-2">
      <div className="section-px mx-auto max-w-content py-16 sm:py-20">
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-2 lg:grid-cols-5 lg:gap-8">
          <div className="col-span-2 flex flex-col gap-5 lg:col-span-2">
            <Link href="#top" className="flex items-center gap-2.5">
              <FlameMark className="h-7 w-auto" animated={false} />
              <span className="font-display text-2xl">{siteConfig.name}</span>
            </Link>
            <p className="max-w-xs font-body text-sm leading-relaxed text-fg/55">
              {siteConfig.description}
            </p>
            <div className="flex gap-3">
              <SocialIcon href={siteConfig.instagram} label="Instagram">
                <Instagram size={16} />
              </SocialIcon>
              <SocialIcon href={siteConfig.facebook} label="Facebook">
                <Facebook size={16} />
              </SocialIcon>
            </div>
          </div>

          <FooterColumn title="Explore">
            {navLinks.map((l) => (
              <a key={l.href} href={l.href} className="link-underline">
                {l.label}
              </a>
            ))}
          </FooterColumn>

          <FooterColumn title="Categories">
            {categories.slice(0, 4).map((c) => (
              <a key={c.name} href="#collections" className="link-underline">
                {c.name}
              </a>
            ))}
          </FooterColumn>

          <FooterColumn title="Policies">
            {policies.map((p) => (
              <a key={p} href="#" className="link-underline">
                {p}
              </a>
            ))}
          </FooterColumn>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-4 border-t border-edge/10 pt-8 font-body text-sm text-fg/60 sm:grid-cols-3">
          <div className="flex items-center gap-2.5">
            <MapPin size={15} className="shrink-0 text-gold" />
            <span>
              {siteConfig.address.line} – {siteConfig.address.pin}
            </span>
          </div>
          <div className="flex items-center gap-2.5">
            <Phone size={15} className="shrink-0 text-gold" />
            <span>{siteConfig.phoneDisplay}</span>
          </div>
          <div className="flex items-center gap-2.5">
            <Mail size={15} className="shrink-0 text-gold" />
            <span>{siteConfig.email}</span>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-edge/10 pt-6 font-body text-xs text-fg/40 sm:flex-row">
          <p>© {new Date().getFullYear()} {siteConfig.fullName}. All rights reserved.</p>
          <p>Handcrafted in Sohna, Gurgaon, India.</p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <h4 className="font-body text-xs uppercase tracking-widest text-fg/40">{title}</h4>
      <div className="flex flex-col gap-2.5 font-body text-sm text-fg/70">{children}</div>
    </div>
  );
}

function SocialIcon({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="flex h-9 w-9 items-center justify-center rounded-full border border-edge/15 text-fg/60 transition-colors hover:border-gold hover:text-gold"
    >
      {children}
    </a>
  );
}
