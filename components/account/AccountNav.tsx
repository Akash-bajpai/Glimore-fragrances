"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { User, Package, MapPin, Heart, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/account", label: "Profile", icon: User },
  { href: "/account/orders", label: "Orders", icon: Package },
  { href: "/account/addresses", label: "Addresses", icon: MapPin },
  { href: "/account/wishlist", label: "Wishlist", icon: Heart },
];

export function AccountNav() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <nav className="flex flex-row gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
      {links.map((link) => {
        const active = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex items-center gap-3 whitespace-nowrap rounded-sm px-4 py-3 font-body text-sm transition-colors",
              active ? "bg-gold/10 text-gold" : "text-fg/65 hover:bg-surface"
            )}
          >
            <link.icon size={16} />
            {link.label}
          </Link>
        );
      })}
      <button
        onClick={handleLogout}
        className="flex items-center gap-3 whitespace-nowrap rounded-sm px-4 py-3 font-body text-sm text-fg/50 transition-colors hover:bg-surface hover:text-red-400"
      >
        <LogOut size={16} />
        Sign Out
      </button>
    </nav>
  );
}
