import Link from "next/link";
import { redirect } from "next/navigation";

import { LogoutButton } from "@/components/common/logout-button";
import { Sidebar } from "@/components/common/sidebar";
import { Toaster } from "sonner";
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

  const initials = (user.user_metadata?.name as string)
    ?.split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-10 border-b border-border/60 bg-card/90 backdrop-blur-lg">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/dashboard" className="flex items-center gap-3.5">
            <span className="flex size-9 items-center justify-center rounded-xl bg-linear-to-br from-primary to-primary/80 text-base font-bold text-primary-foreground shadow-xs transition-transform hover:scale-105">
              M
            </span>
            <div className="hidden sm:block">
              <p className="font-serif text-base font-medium leading-tight text-foreground">
                MediCare AI
              </p>
              <p className="flex items-center gap-1.5 text-xs leading-tight text-muted-foreground">
                <span className="flex size-4 items-center justify-center rounded-full bg-primary/10 text-[9px] font-bold text-primary">
                  {initials ?? "U"}
                </span>
                {user.user_metadata?.name ?? user.email}
              </p>
            </div>
          </Link>
          <LogoutButton />
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-6xl flex-1 gap-0 px-4 sm:px-6">
        <aside className="hidden w-56 shrink-0 border-r border-border/60 pt-8 md:block">
          <Sidebar />
        </aside>

        <section className="min-w-0 flex-1 py-8 pl-0 md:pl-8">
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                borderRadius: "0.75rem",
                border: "1px solid oklch(0.88 0.015 75)",
                background: "oklch(0.998 0.004 80)",
              },
            }}
          />
        </section>
      </div>
    </div>
  );
}
