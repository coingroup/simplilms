import { Skeleton } from "@simplilms/ui";

export default function AnalyticsLoading() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-56 mt-2" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-32" />
          <Skeleton className="h-9 w-32" />
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="border rounded-lg p-6 flex items-center gap-4"
          >
            <Skeleton className="h-12 w-12 rounded-lg" />
            <div>
              <Skeleton className="h-7 w-16" />
              <Skeleton className="h-3 w-24 mt-1" />
            </div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="border rounded-lg p-6">
          <Skeleton className="h-6 w-44 mb-4" />
          <Skeleton className="h-32 w-full" />
        </div>
        <div className="border rounded-lg p-6">
          <Skeleton className="h-6 w-44 mb-4" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-lg p-6">
        <Skeleton className="h-6 w-44 mb-4" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex gap-6 py-3 border-b last:border-0">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}
