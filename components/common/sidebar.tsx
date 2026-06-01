"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Plus } from "lucide-react";

const links = [
  { href: "/dashboard", label: "Overview", icon: Home },
  { href: "/dashboard/patients/new", label: "Add patient", icon: Plus },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <nav className="space-y-1 pr-4">
      <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/60">
        Menu
      </p>
      {links.map((link) => {
        const Icon = link.icon;
        const isActive = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
              isActive
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <Icon className="size-4" />
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
