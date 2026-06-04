import { Skeleton } from "@/components/ui/skeleton";

function ChatPanelSkeleton() {
  return (
    <div className="flex flex-1 flex-col">
      <div className="flex-1 space-y-4 p-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className={`flex gap-3 ${i % 2 === 0 ? "flex-row-reverse" : ""}`}
          >
            <Skeleton className="size-8 shrink-0 rounded-full" />
            <Skeleton
              className={`h-16 rounded-2xl ${
                i % 2 === 0 ? "w-3/5" : "w-4/5"
              }`}
            />
          </div>
        ))}
      </div>
      <div className="flex gap-2 border-t border-border/60 px-4 py-3">
        <Skeleton className="h-9 flex-1 rounded-lg" />
        <Skeleton className="size-9 shrink-0 rounded-lg" />
      </div>
    </div>
  );
}

export function ChatPageSkeleton() {
  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col">
      <div className="mb-4 flex items-center gap-3">
        <Skeleton className="size-10 rounded-xl" />
        <div>
          <Skeleton className="mb-1 h-5 w-40" />
          <Skeleton className="h-3 w-64" />
        </div>
      </div>
      <div className="flex flex-1 gap-4 overflow-hidden">
        <div className="hidden w-56 shrink-0 space-y-2 sm:block">
          <Skeleton className="h-9 w-full rounded-lg" />
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-10 w-full rounded-lg" />
          ))}
        </div>
        <div className="flex flex-1 flex-col rounded-xl border border-border/60 bg-card">
          <ChatPanelSkeleton />
        </div>
      </div>
    </div>
  );
}
