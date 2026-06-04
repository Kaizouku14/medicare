"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
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
  const router = useRouter();
  const pathname = usePathname();
  const panelRef = useRef<HTMLElement>(null);
  const touchStartX = useRef(0);
  const isDragging = useRef(false);

  const close = useCallback(() => setOpen(false), []);

  const navigate = useCallback(
    (href: string) => {
      close();
      router.push(href);
    },
    [close, router],
  );

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

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    isDragging.current = true;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging.current) return;
    const diff = e.touches[0].clientX - touchStartX.current;
    if (diff < 0 && panelRef.current) {
      panelRef.current.style.transform = `translateX(${Math.max(diff, -120)}px)`;
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (!isDragging.current) return;
    isDragging.current = false;
    if (!panelRef.current) return;
    const rect = panelRef.current.getBoundingClientRect();
    panelRef.current.style.transform = "";
    if (rect.right - rect.left > 0 && rect.left < 0) {
      const translateX = Math.abs(rect.left);
      if (translateX > 60) {
        close();
      }
    }
  }, [close]);

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
        ref={panelRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className={`fixed left-0 top-0 z-50 flex h-dvh w-72 max-w-[85vw] flex-col border-r border-border/60 bg-card shadow-2xl transition-transform duration-300 ease-out md:hidden ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-border/40 px-4 sm:px-5">
          <div className="flex items-center gap-3 min-w-0">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-primary to-primary/80 text-base font-bold text-primary-foreground shadow-xs">
              M
            </span>
            <div className="min-w-0">
              <p className="font-serif text-base font-medium leading-tight text-foreground truncate">
                MediCare AI
              </p>
              <p className="text-xs leading-tight text-muted-foreground truncate">
                Care Management
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={close}
            className="flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Close navigation"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain px-3 pt-6 pb-8">
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
                className={`group relative flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-all active:scale-[0.98] ${
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
                      className={`group flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-all active:scale-[0.98] ${
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
                      <span className="flex-1 truncate text-left">{p.name}</span>
                      <ChevronRight className="size-3 text-muted-foreground/30 transition-all group-hover:translate-x-0.5 group-hover:text-muted-foreground group-hover:opacity-100 opacity-0 shrink-0" />
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </aside>
    </>
  );
}
