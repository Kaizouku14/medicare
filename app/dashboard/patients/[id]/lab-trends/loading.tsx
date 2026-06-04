import { Skeleton } from "@/components/ui/skeleton";

export default function LabTrendsLoading() {
  return (
    <div className="animate-pulse space-y-6">
      <Skeleton className="h-3 w-32" />

      <div className="space-y-3">
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>

      <div className="flex flex-col gap-2 rounded-xl border border-border/60 bg-card px-4 py-3 sm:flex-row sm:flex-wrap sm:items-center">
        <Skeleton className="h-3 w-36" />
        <Skeleton className="h-3 w-28" />
      </div>

      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="animate-fade-in-up rounded-xl border border-border/60 bg-card p-4"
            style={{ animationDelay: `${i * 0.05}s` }}
          >
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-40" />
              </div>
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <div className="mt-3">
              <Skeleton className="h-2 w-full rounded-full" />
            </div>
            <div className="mt-2 flex gap-1">
              {[1, 2, 3, 4, 5].map((j) => (
                <Skeleton key={j} className="h-1.5 flex-1 rounded-full" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
