"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Home, Plus, HeartPulse, ChevronRight, Bot } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const links = [
  { href: "/dashboard", label: "Overview", icon: Home },
  { href: "/dashboard/chat", label: "Caregiver Chat", icon: Bot },
  { href: "/dashboard/patients/new", label: "Add patient", icon: Plus },
];

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

type RecentPatient = {
  id: string;
  name: string;
  updatedAt: string;
};

export function MobileNav({
  recentPatients,
}: {
  recentPatients: RecentPatient[];
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [open, close]);

  const isPatientPage =
    pathname.startsWith("/dashboard/patients/") &&
    !pathname.endsWith("/new") &&
    !pathname.endsWith("/edit");

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="relative flex size-9 items-center justify-center rounded-xl border border-border/60 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:hidden"
        aria-label={open ? "Close navigation" : "Open navigation"}
      >
        <Menu
          className={`size-4 transition-all duration-300 ${open ? "scale-0 opacity-0" : "scale-100 opacity-100"}`}
        />
        <X
          className={`absolute size-4 transition-all duration-300 ${open ? "scale-100 opacity-100" : "scale-0 opacity-0"}`}
        />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm md:hidden"
          onClick={close}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-50 flex h-dvh w-72 flex-col border-r border-border/60 bg-card shadow-2xl transition-transform duration-300 ease-out md:hidden ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 shrink-0 items-center gap-3 border-b border-border/40 px-5">
          <span className="flex size-9 items-center justify-center rounded-xl bg-linear-to-br from-primary to-primary/80 text-base font-bold text-primary-foreground shadow-xs">
            M
          </span>
          <div>
            <p className="font-serif text-base font-medium leading-tight text-foreground">
              MediCare AI
            </p>
            <p className="text-xs leading-tight text-muted-foreground">
              Care Management
            </p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-4 pt-6">
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
                onClick={close}
                className={`group relative flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {isActive && (
                  <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-primary shadow-[0_0_6px_0_var(--primary)]" />
                )}
                <Icon className="size-4 shrink-0" />
                {link.label}
              </Link>
            );
          })}

          {recentPatients.length > 0 && (
            <>
              <div className="mt-6 mb-3 flex items-center gap-2 px-3">
                <div className="flex size-5 items-center justify-center rounded-md bg-primary/10">
                  <HeartPulse className="size-3 text-primary" />
                </div>
                <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                  Recent Patients
                </p>
              </div>
              <div className="space-y-0.5">
                {recentPatients.map((p) => {
                  const isActive =
                    isPatientPage &&
                    pathname.includes(`/dashboard/patients/${p.id}`);
                  return (
                    <Link
                      key={p.id}
                      href={`/dashboard/patients/${p.id}`}
                      onClick={close}
                      className={`group flex items-center gap-2.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      <Avatar className="size-6 rounded-md">
                        <AvatarFallback className="rounded-md text-[9px] font-bold bg-gradient-to-br from-primary/15 to-primary/5 text-primary">
                          {getInitials(p.name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="flex-1 truncate">{p.name}</span>
                      <ChevronRight className="size-3 text-muted-foreground/30 transition-all group-hover:translate-x-0.5 group-hover:text-muted-foreground group-hover:opacity-100 opacity-0" />
                    </Link>
                  );
                })}
              </div>
            </>
          )}
        </nav>
      </aside>
    </>
  );
}