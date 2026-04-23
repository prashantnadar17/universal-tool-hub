import { Skeleton } from "@/components/ui/skeleton";

export function FeaturedSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 xsm:gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="flex h-full min-w-0 flex-col rounded-2xl border border-border bg-card p-5"
        >
          <div className="flex items-center justify-between">
            <Skeleton className="h-11 w-11 rounded-xl" />
            <Skeleton className="h-4 w-16 rounded-full" />
          </div>
          <Skeleton className="mt-4 h-5 w-3/5" />
          <Skeleton className="mt-2 h-4 w-4/5" />
          <Skeleton className="mt-4 h-3 w-20" />
        </div>
      ))}
    </div>
  );
}

export function PopularSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
      <Skeleton className="mb-4 h-5 w-40" />
      <div className="grid grid-cols-1 gap-2.5 xsm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full rounded-lg" />
        ))}
      </div>
    </div>
  );
}

export function ResultsSkeleton() {
  return (
    <div className="space-y-8">
      {Array.from({ length: 2 }).map((_, s) => (
        <div key={s}>
          <Skeleton className="mb-3 h-5 w-40" />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 3xl:grid-cols-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-border bg-card p-4">
                <div className="mb-2 flex items-center justify-between">
                  <Skeleton className="h-4 w-20 rounded-full" />
                  <Skeleton className="h-4 w-4 rounded" />
                </div>
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="mt-2 h-4 w-full" />
                <Skeleton className="mt-1 h-4 w-5/6" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
