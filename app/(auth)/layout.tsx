import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center px-4">
      <Link
        href="/"
        className="animate-fade-in-up absolute left-6 top-6 flex items-center gap-2"
      >
        <span className="flex size-7 items-center justify-center rounded-md bg-primary text-xs font-bold text-primary-foreground">
          M
        </span>
        <span className="text-sm font-semibold">MediCare AI</span>
      </Link>

      <div className="animate-fade-in-up w-full max-w-sm">{children}</div>

      <p className="animate-fade-in absolute bottom-6 text-[11px] text-muted-foreground">
        Supporting Filipino families with compassion
      </p>
    </main>
  );
}
