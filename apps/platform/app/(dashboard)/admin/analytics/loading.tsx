import { Skeleton } from "@simplilms/ui";

export default function AnalyticsLoading() {
  return (
    <div className="space-y-6">
      <div><Skeleton className="h-8 w-32" /><Skeleton className="h-4 w-56 mt-2" /></div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="border rounded-lg p-6 flex items-center gap-4">
            <Skeleton className="h-12 w-12 rounded-lg" />
            <div><Skeleton className="h-7 w-12" /><Skeleton className="h-3 w-24 mt-1" /></div>
          </div>
        ))}
      </div>
      <div className="border rounded-lg p-6"><Skeleton className="h-6 w-44 mb-4" /><Skeleton className="h-4 w-full" /></div>
    </div>
  );
}
