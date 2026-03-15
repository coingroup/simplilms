import { Skeleton } from "@simplilms/ui";

export default function EnrollmentsLoading() {
  return (
    <div className="space-y-6">
      <div><Skeleton className="h-8 w-36" /><Skeleton className="h-4 w-48 mt-2" /></div>
      <div className="flex gap-2"><Skeleton className="h-9 w-20" /><Skeleton className="h-9 w-20" /><Skeleton className="h-9 w-20" /></div>
      <div className="border rounded-lg overflow-hidden">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="px-4 py-3 border-b flex gap-6">
            <Skeleton className="h-4 w-28" /><Skeleton className="h-4 w-36" /><Skeleton className="h-5 w-16 rounded-full" /><Skeleton className="h-4 w-24" />
          </div>
        ))}
      </div>
    </div>
  );
}
