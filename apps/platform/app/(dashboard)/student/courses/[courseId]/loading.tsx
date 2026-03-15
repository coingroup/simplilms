import { Card, CardContent, Skeleton } from "@simplilms/ui";

export default function CoursePlayerLoading() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96 mt-2" />
      </div>

      {/* Progress Bar Skeleton */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-10" />
        </div>
        <Skeleton className="h-2.5 w-full rounded-full" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
        {/* Sidebar Skeleton */}
        <div className="order-2 lg:order-1">
          <Card>
            <CardContent className="p-0">
              <div className="p-3 border-b">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-3 w-40 mt-1.5" />
              </div>
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i}>
                  <div className="px-3 py-2 bg-gray-50">
                    <Skeleton className="h-3.5 w-32" />
                  </div>
                  {Array.from({ length: 3 }).map((_, j) => (
                    <div key={j} className="flex items-center gap-2 px-3 py-2">
                      <Skeleton className="h-3.5 w-3.5 rounded-full" />
                      <Skeleton className="h-3 w-full" />
                    </div>
                  ))}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Main Content Skeleton */}
        <div className="order-1 lg:order-2">
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                </div>
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
              <Skeleton className="h-64 w-full rounded-lg" />
              <div className="flex items-center gap-3 pt-4 border-t">
                <Skeleton className="h-9 w-36" />
                <Skeleton className="h-9 w-28" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
