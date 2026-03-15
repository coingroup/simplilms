import { Skeleton } from "@simplilms/ui";

export default function CourseAnalyticsLoading() {
  return (
    <div className="space-y-6">
      {/* Back link + title */}
      <div>
        <Skeleton className="h-4 w-32 mb-2" />
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-44 mt-2" />
      </div>

      {/* Stats row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="border rounded-lg p-6 flex items-center gap-4">
            <Skeleton className="h-12 w-12 rounded-lg" />
            <div>
              <Skeleton className="h-7 w-12" />
              <Skeleton className="h-3 w-24 mt-1" />
            </div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="border rounded-lg p-6">
        <Skeleton className="h-6 w-44 mb-4" />
        <Skeleton className="h-32 w-full" />
      </div>

      {/* Module completion */}
      <div className="border rounded-lg p-6">
        <Skeleton className="h-6 w-44 mb-4" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-1 mb-4">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-2 w-full rounded-full" />
          </div>
        ))}
      </div>

      {/* Top students */}
      <div className="border rounded-lg p-6">
        <Skeleton className="h-6 w-32 mb-4" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex gap-6 py-3 border-b last:border-0">
            <Skeleton className="h-4 w-6" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-12" />
          </div>
        ))}
      </div>
    </div>
  );
}
