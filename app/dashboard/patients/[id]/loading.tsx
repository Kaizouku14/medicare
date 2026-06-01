import { Skeleton } from "@/components/ui/skeleton";

export default function PatientDetailLoading() {
  return (
    <div className="animate-pulse space-y-6">
      <Skeleton className="h-3 w-32" />

      <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-card p-6 sm:p-8">
        <div className="flex items-start gap-5">
          <Skeleton className="size-16 rounded-2xl" />
          <div className="space-y-2 pt-1">
            <Skeleton className="h-7 w-44" />
            <Skeleton className="h-4 w-28" />
            <div className="flex gap-1.5">
              <Skeleton className="h-5 w-20 rounded-full" />
              <Skeleton className="h-5 w-24 rounded-full" />
            </div>
          </div>
        </div>
        <div className="mt-6 grid border-t border-border/60 sm:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-3 border-border/40 p-4">
              <Skeleton className="size-9 rounded-xl" />
              <div className="space-y-1">
                <Skeleton className="h-3 w-12" />
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="space-y-4 lg:col-span-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl border border-border/60 bg-card p-5">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="mt-2 h-4 w-32" />
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-3 lg:col-span-3">
          {[1, 2].map((i) => (
            <div key={i} className="rounded-xl border border-border/60 bg-card p-5">
              <div className="flex items-center gap-4">
                <Skeleton className="size-11 rounded-xl" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-40" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
