import Link from "next/link";
import { redirect } from "next/navigation";
import { Home, Plus, User } from "lucide-react";

import { LogoutButton } from "@/components/common/logout-button";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-10 border-b border-border bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
              M
            </span>
            <div className="hidden sm:block">
              <p className="text-sm font-semibold leading-tight">MediCare AI</p>
              <p className="text-[11px] leading-tight text-muted-foreground">
                {user.user_metadata?.name ?? user.email}
              </p>
            </div>
          </div>
          <LogoutButton />
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-6xl flex-1 gap-0 px-4 sm:px-6">
        <aside className="hidden w-56 shrink-0 border-r border-border pt-6 md:block">
          <nav className="space-y-1 pr-4">
            <Link
              href="/dashboard"
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <Home className="size-4" />
              Overview
            </Link>
            <Link
              href="/dashboard/patients/new"
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <Plus className="size-4" />
              Add patient
            </Link>
          </nav>
        </aside>

        <section className="min-w-0 flex-1 py-6 pl-0 md:pl-6">
          {children}
        </section>
      </div>
    </div>
  );
}
