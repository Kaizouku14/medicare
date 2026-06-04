import { Skeleton } from "@/components/ui/skeleton";

export default function NewPatientLoading() {
  return (
    <div className="animate-pulse space-y-6">
      <Skeleton className="h-3 w-28" />

      <div className="rounded-xl border border-border/60 bg-card">
        <div className="p-6 sm:p-8">
          <Skeleton className="h-6 w-36 font-serif" />
          <Skeleton className="mt-1 h-4 w-56" />
        </div>
        <div className="border-t border-border/60 px-6 py-6 sm:px-8 sm:py-8">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full rounded-lg" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full rounded-lg" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-10 w-full rounded-lg" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full rounded-lg" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>
          </div>
          <div className="mt-8 space-y-4">
            <Skeleton className="h-4 w-28" />
            <div className="flex flex-wrap gap-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-8 w-24 rounded-full" />
              ))}
            </div>
          </div>
          <div className="mt-8 flex gap-3">
            <Skeleton className="h-10 w-28 rounded-lg" />
            <Skeleton className="h-10 w-28 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}
