import { Skeleton } from "@simplilms/ui";

export default function RepMessagesLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><Skeleton className="h-8 w-32" /><Skeleton className="h-4 w-44 mt-2" /></div>
        <Skeleton className="h-9 w-28" />
      </div>
      <div className="border rounded-lg p-6 space-y-3">
        <Skeleton className="h-6 w-36" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex gap-4 py-2">
            <Skeleton className="h-4 w-32" /><Skeleton className="h-4 w-48" /><Skeleton className="h-4 w-24" /><Skeleton className="h-4 w-20" />
          </div>
        ))}
      </div>
    </div>
  );
}
