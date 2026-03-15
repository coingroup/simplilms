export default function ApplicationLoading() {
  return (
    <div className="space-y-6">
      {/* Progress bar skeleton */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          {[1, 2, 3, 4, 5].map((step) => (
            <div key={step} className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse" />
              <div className="hidden sm:block h-4 w-20 bg-gray-200 animate-pulse rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* Form skeleton */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
        <div className="h-6 w-48 bg-gray-200 animate-pulse rounded" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 w-24 bg-gray-200 animate-pulse rounded" />
              <div className="h-10 w-full bg-gray-100 animate-pulse rounded-md" />
            </div>
          ))}
        </div>
        <div className="flex justify-end gap-3 pt-4">
          <div className="h-10 w-24 bg-gray-200 animate-pulse rounded-md" />
          <div className="h-10 w-24 bg-gray-200 animate-pulse rounded-md" />
        </div>
      </div>
    </div>
  );
}
