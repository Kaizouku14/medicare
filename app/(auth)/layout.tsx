import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-4">
      {/* Ambient background */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -left-32 -top-32 size-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 size-96 rounded-full bg-secondary/10 blur-3xl" />
        <div className="absolute left-1/2 top-1/3 size-64 -translate-x-1/2 rounded-full bg-primary/3 blur-3xl" />
      </div>

      {/* Decorative corner element */}
      <div className="pointer-events-none fixed bottom-0 left-0 -z-10 h-48 w-48 opacity-[0.03]">
        <svg viewBox="0 0 200 200" fill="none" className="h-full w-full">
          <path d="M0 200L200 0H0V200Z" fill="currentColor" className="text-primary" />
        </svg>
      </div>

      <Link
        href="/"
        className="animate-fade-in-up group absolute left-6 top-6 flex items-center gap-2.5 rounded-xl px-3 py-2 transition-colors hover:bg-muted"
      >
        <span className="flex size-8 items-center justify-center rounded-lg bg-linear-to-br from-primary to-primary/80 text-sm font-bold text-primary-foreground shadow-xs transition-transform group-hover:scale-105">
          M
        </span>
        <span className="hidden text-sm font-semibold text-foreground sm:inline">MediCare AI</span>
      </Link>

      <div className="animate-fade-in-up w-full max-w-sm" style={{ animationDelay: "0.1s" }}>
        <div className="rounded-2xl border border-border/60 bg-card/80 p-8 shadow-lg shadow-primary/5 backdrop-blur-sm">
          {children}
        </div>
      </div>

      <p className="animate-fade-in-up absolute bottom-6 flex items-center gap-2 text-[11px] text-muted-foreground" style={{ animationDelay: "0.3s" }}>
        <span className="flex size-3 items-center justify-center rounded-full bg-primary/10 text-[7px] font-bold text-primary">♥</span>
        Supporting Filipino families with compassion
      </p>
    </main>
  );
}
