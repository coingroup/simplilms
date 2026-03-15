import { Skeleton } from "@simplilms/ui";

export default function AiCourseCreatorLoading() {
  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Skeleton className="h-5 w-48" />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-6" />
            <Skeleton className="h-8 w-52" />
          </div>
          <Skeleton className="mt-1 h-4 w-80" />
        </div>
        <Skeleton className="h-10 w-36" />
      </div>

      {/* Table */}
      <div className="rounded-lg border border-gray-200">
        {/* Table header */}
        <div className="bg-gray-50 border-b border-gray-200 px-4 py-3">
          <div className="flex gap-8">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-14" />
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-16" />
          </div>
        </div>
        {/* Table rows */}
        <div className="p-4 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-8">
              <Skeleton className="h-10 flex-1" />
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-5 w-16" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
