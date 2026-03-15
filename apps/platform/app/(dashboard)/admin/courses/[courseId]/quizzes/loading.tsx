import { Skeleton } from "@simplilms/ui";

export default function QuizListLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-4 w-40" />
      <div><Skeleton className="h-8 w-28" /><Skeleton className="h-4 w-40 mt-2" /></div>
      <div className="grid gap-4 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="border rounded-lg p-4 space-y-2">
            <Skeleton className="h-5 w-3/4" /><Skeleton className="h-4 w-full" />
            <div className="flex gap-2"><Skeleton className="h-5 w-16 rounded-full" /><Skeleton className="h-5 w-16 rounded-full" /></div>
          </div>
        ))}
      </div>
    </div>
  );
}
