import { Skeleton } from "@/components/ui/skeleton";

export default function MedicationsLoading() {
  return (
    <div className="animate-pulse space-y-6">
      <Skeleton className="h-3 w-32" />

      <div className="space-y-3">
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-64" />
      </div>

      <div className="flex flex-col gap-2 rounded-xl border border-border/60 bg-card px-4 py-3 sm:flex-row sm:flex-wrap sm:items-center">
        <Skeleton className="h-3 w-36" />
        <Skeleton className="h-3 w-28" />
        <Skeleton className="h-3 w-20" />
      </div>

      <div className="space-y-2">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="animate-fade-in-up rounded-xl border border-border/60 bg-card p-4"
            style={{ animationDelay: `${i * 0.04}s` }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Skeleton className="size-9 rounded-lg" />
                <div className="space-y-1">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="size-7 rounded-md" />
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[1, 2, 3, 4].map((j) => (
                <div key={j}>
                  <Skeleton className="h-2 w-12" />
                  <Skeleton className="mt-0.5 h-3 w-16" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
