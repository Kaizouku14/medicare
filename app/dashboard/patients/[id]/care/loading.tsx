import { Skeleton } from "@/components/ui/skeleton";

export default function CareLoading() {
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
        <Skeleton className="h-3 w-24" />
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="rounded-xl border border-border/60 bg-card p-5">
            <div className="flex items-center gap-3">
              <Skeleton className="size-8 rounded-lg" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="ml-auto h-6 w-16 rounded-full" />
            </div>
            <div className="mt-4 space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3 rounded-lg border border-border/40 p-3">
                  <Skeleton className="size-8 rounded-lg" />
                  <div className="flex-1 space-y-1">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <Skeleton className="size-7 rounded-md" />
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <div className="rounded-xl border border-border/60 bg-card p-5">
            <div className="flex items-center gap-2">
              <Skeleton className="size-5 rounded-md" />
              <Skeleton className="h-4 w-20" />
            </div>
            <div className="mt-4 space-y-2">
              {[1, 2].map((i) => (
                <div key={i} className="rounded-lg border border-border/40 p-3">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="mt-1 h-3 w-40" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
