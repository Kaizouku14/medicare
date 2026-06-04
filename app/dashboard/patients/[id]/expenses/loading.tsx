import { Skeleton } from "@/components/ui/skeleton";

export default function ExpensesLoading() {
  return (
    <div className="animate-pulse space-y-6">
      <Skeleton className="h-3 w-32" />

      <div className="space-y-3">
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-8 w-52" />
        <Skeleton className="h-4 w-64" />
      </div>

      <div className="flex flex-col gap-2 rounded-xl border border-border/60 bg-card px-4 py-3 sm:flex-row sm:flex-wrap sm:items-center">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-3 w-28" />
        <Skeleton className="h-3 w-24" />
      </div>

      <div className="rounded-xl border border-border/60 bg-card">
        <div className="p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="size-10 rounded-xl" />
              <div className="space-y-1">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-3 w-36" />
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-xl border border-border/40 p-4">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="mt-1 h-6 w-20" />
              </div>
            ))}
          </div>

          <div className="mt-6 space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center justify-between rounded-lg border border-border/40 p-3">
                <div className="space-y-1">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <Skeleton className="h-5 w-16 rounded-md" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
