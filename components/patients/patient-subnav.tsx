"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, UtensilsCrossed, Activity, Pill, ArrowLeftToLine } from "lucide-react";

const tabs = [
  { href: "", label: "Overview", icon: ArrowLeftToLine },
  { href: "/care", label: "Care", icon: Pill },
  { href: "/meal-plan", label: "Meal Plan", icon: UtensilsCrossed },
  { href: "/documents", label: "Documents", icon: FileText },
  { href: "/lab-trends", label: "Lab Trends", icon: Activity },
];

export function PatientSubnav({ patientId }: { patientId: string }) {
  const pathname = usePathname();

  return (
    <div className="-mx-4 mb-6 overflow-x-auto border-b border-border/40 px-4 sm:-mx-0 sm:px-0">
      <nav className="flex min-w-max gap-1 pb-3 sm:gap-2">
        {tabs.map((tab) => {
          const href =
            tab.href === ""
              ? `/dashboard/patients/${patientId}`
              : `/dashboard/patients/${patientId}${tab.href}`;
          const isActive =
            tab.href === ""
              ? pathname === href
              : pathname.startsWith(href);
          const Icon = tab.icon;

          return (
            <Link
              key={tab.href}
              href={href}
              className={`flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold tracking-wide transition-all ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Icon className="size-3.5" />
              {tab.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
