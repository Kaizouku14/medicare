"use client";

import { useRouter, usePathname } from "next/navigation";
import { useCallback } from "react";
import { Home, Plus, HeartPulse, ChevronRight, Bot } from "lucide-react";

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

export function Sidebar({
  recentPatients,
}: {
  recentPatients: RecentPatient[];
}) {
  const router = useRouter();
  const pathname = usePathname();

  const navigate = useCallback(
    (href: string) => {
      router.push(href);
    },
    [router],
  );

  const isPatientPage =
    pathname.startsWith("/dashboard/patients/") &&
    !pathname.endsWith("/new") &&
    !pathname.endsWith("/edit");

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
          <button
            key={link.href}
            type="button"
            onClick={() => navigate(link.href)}
            className={`group relative flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
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
          </button>
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
                <button
                  key={p.id}
                  type="button"
                  onClick={() => navigate(`/dashboard/patients/${p.id}`)}
                  className={`group flex w-full items-center gap-2.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <Avatar className="size-6 rounded-md shrink-0">
                    <AvatarFallback className="rounded-md text-[9px] font-bold bg-gradient-to-br from-primary/15 to-primary/5 text-primary">
                      {getInitials(p.name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="truncate flex-1 text-left">{p.name}</span>
                  <ChevronRight className="size-3 text-muted-foreground/30 transition-all group-hover:translate-x-0.5 group-hover:text-muted-foreground group-hover:opacity-100 opacity-0 shrink-0" />
                </button>
              );
            })}
          </div>
        </>
      )}
    </nav>
  );
}
