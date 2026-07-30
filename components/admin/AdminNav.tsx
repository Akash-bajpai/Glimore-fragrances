"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, ShoppingBag, Tag, Users, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { FlameMark } from "@/components/ui/FlameMark";

const links = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/coupons", label: "Coupons", icon: Tag },
  { href: "/admin/customers", label: "Customers", icon: Users },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1">
      <div className="mb-6 flex items-center gap-2 px-4">
        <FlameMark className="h-6 w-auto" animated={false} />
        <span className="font-display text-lg">Admin</span>
      </div>
      {links.map((link) => {
        const active = link.href === "/admin" ? pathname === "/admin" : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex items-center gap-3 rounded-sm px-4 py-3 font-body text-sm transition-colors",
              active ? "bg-gold/10 text-gold" : "text-fg/65 hover:bg-surface"
            )}
          >
            <link.icon size={16} />
            {link.label}
          </Link>
        );
      })}
      <Link
        href="/"
        className="mt-4 flex items-center gap-3 rounded-sm px-4 py-3 font-body text-sm text-fg/40 hover:text-fg/70"
      >
        <ExternalLink size={16} />
        View Store
      </Link>
    </nav>
  );
}
