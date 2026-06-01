import { Skeleton } from "@/components/ui/skeleton";

export default function DocumentsLoading() {
  return (
    <div className="animate-pulse space-y-6">
      <Skeleton className="h-3 w-32" />

      <div className="space-y-3">
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-48" />
      </div>

      <div className="rounded-xl border border-border/60 bg-card px-5 py-3.5">
        <Skeleton className="h-3 w-48" />
      </div>

      <div className="rounded-2xl border-2 border-dashed border-border/70 bg-card p-8">
        <div className="flex flex-col items-center gap-3">
          <Skeleton className="size-14 rounded-2xl" />
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-3 w-56" />
        </div>
      </div>

      <div className="space-y-2">
        <Skeleton className="h-3 w-24" />
        {[1, 2].map((i) => (
          <div
            key={i}
            className="rounded-xl border border-border/60 bg-card p-4"
          >
            <div className="flex items-center gap-3.5">
              <Skeleton className="size-10 rounded-xl" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
