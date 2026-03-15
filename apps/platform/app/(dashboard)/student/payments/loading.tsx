import { Skeleton } from "@simplilms/ui";

export default function PaymentsLoading() {
  return (
    <div className="space-y-6">
      <div><Skeleton className="h-8 w-32" /><Skeleton className="h-4 w-48 mt-2" /></div>
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="border rounded-lg p-4"><Skeleton className="h-7 w-20" /><Skeleton className="h-3 w-28 mt-1" /></div>
        ))}
      </div>
      <div className="border rounded-lg overflow-hidden">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="px-4 py-3 border-b flex gap-6">
            <Skeleton className="h-4 w-24" /><Skeleton className="h-4 w-20" /><Skeleton className="h-5 w-16 rounded-full" /><Skeleton className="h-4 w-24" />
          </div>
        ))}
      </div>
    </div>
  );
}
