import { Skeleton } from "@simplilms/ui";

export default function CourseStudentsLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-4 w-40" />
      <div className="flex justify-between"><div><Skeleton className="h-8 w-48" /><Skeleton className="h-4 w-36 mt-2" /></div><Skeleton className="h-9 w-32" /></div>
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="border rounded-lg p-4"><Skeleton className="h-7 w-12" /><Skeleton className="h-3 w-20 mt-1" /></div>
        ))}
      </div>
      <div className="border rounded-lg overflow-hidden">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="px-4 py-3 border-b flex gap-6">
            <Skeleton className="h-4 w-28" /><Skeleton className="h-4 w-40" /><Skeleton className="h-5 w-16 rounded-full" /><Skeleton className="h-4 w-12" />
          </div>
        ))}
      </div>
    </div>
  );
}
