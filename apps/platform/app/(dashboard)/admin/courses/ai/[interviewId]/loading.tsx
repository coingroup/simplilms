import { Skeleton } from "@simplilms/ui";

export default function InterviewLoading() {
  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-3">
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-3 w-2" />
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-3 w-2" />
        <Skeleton className="h-5 w-40" />
      </div>

      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-6" />
          <Skeleton className="h-8 w-64" />
        </div>
        <Skeleton className="mt-1 h-4 w-48" />
      </div>

      {/* Content area */}
      <div className="rounded-lg border border-gray-200 bg-white">
        <div className="p-6 space-y-4">
          {/* Simulated chat or form content */}
          <div className="space-y-4">
            <div className="flex gap-3">
              <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <div className="space-y-2 flex-1 max-w-md">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
              <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
            </div>
            <div className="flex gap-3">
              <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-1/3" />
              </div>
            </div>
          </div>

          {/* Input area */}
          <div className="pt-4 border-t border-gray-200">
            <div className="flex gap-3">
              <Skeleton className="h-10 flex-1" />
              <Skeleton className="h-10 w-20" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
