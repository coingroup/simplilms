import { Skeleton } from "@simplilms/ui";

export default function CourseDetailLoading() {
  return (
    <div className="space-y-6">
      {/* Back link */}
      <Skeleton className="h-5 w-32" />

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-6 w-20" />
          </div>
          <Skeleton className="mt-1 h-4 w-80" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Metadata */}
      <div className="flex flex-wrap gap-6">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-5 w-28" />
      </div>

      {/* Publish button */}
      <Skeleton className="h-10 w-28" />

      {/* Modules heading */}
      <Skeleton className="h-6 w-40" />

      {/* Module cards */}
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="rounded-lg border p-4 space-y-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-8 w-24" />
          </div>
          <div className="space-y-2 pl-6">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      ))}

      {/* Add module button */}
      <Skeleton className="h-10 w-full" />
    </div>
  );
}
