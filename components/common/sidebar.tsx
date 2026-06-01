"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Plus, HeartPulse } from "lucide-react";

const links = [
  { href: "/dashboard", label: "Overview", icon: Home },
  { href: "/dashboard/patients/new", label: "Add patient", icon: Plus },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <nav className="space-y-1 pr-5">
      <div className="mb-4 flex items-center gap-2 px-3">
        <div className="flex size-5 items-center justify-center rounded-md bg-primary/10">
          <HeartPulse className="size-3 text-primary" />
        </div>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/60">
          Navigation
        </p>
      </div>
      {links.map((link) => {
        const Icon = link.icon;
        const isActive = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`group relative flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
              isActive
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            {isActive && (
              <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-primary" />
            )}
            <Icon className="size-4" />
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
