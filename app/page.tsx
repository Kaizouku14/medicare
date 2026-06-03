import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "MediCare AI",
  description:
    "An intelligent companion for Filipino families managing the financial and medical challenges of caring for a loved one with chronic illness.",
};

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-4">
      <div className="mx-auto flex w-full max-w-2xl flex-col items-center text-center">
        <div className="animate-fade-in-up animate-stagger-1 mb-2 inline-flex items-center gap-2 rounded-full border border-border bg-white/60 px-4 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur-sm">
          <span className="inline-block size-1.5 rounded-full bg-primary" />
          AI-Powered Care Planning
        </div>

        <h1 className="animate-fade-in-up animate-stagger-2 mt-6 font-serif text-5xl leading-tight tracking-tight text-foreground sm:text-6xl md:text-7xl">
          Care with
          <br />
          <span className="text-primary">heart and mind</span>
        </h1>

        <p className="animate-fade-in-up animate-stagger-3 mt-5 max-w-lg text-base leading-relaxed text-muted-foreground sm:text-lg">
          An intelligent companion for Filipino families managing the financial
          and medical challenges of caring for a loved one with chronic illness.
        </p>

        <div className="animate-fade-in-up animate-stagger-4 mt-10 flex flex-wrap items-center justify-center gap-3">
          <Button asChild size="lg" className="h-11 rounded-full px-6 text-sm">
            <Link href="/signup">Create free account</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="h-11 rounded-full px-6 text-sm">
            <Link href="/login">Sign in</Link>
          </Button>
        </div>
      </div>

      <footer className="animate-fade-in absolute bottom-6 text-xs text-muted-foreground">
        MediCare AI &mdash; supporting Filipino families with compassion
      </footer>
    </main>
  );
}
