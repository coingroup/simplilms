import { Skeleton } from "@simplilms/ui";

export default function LeaderboardLoading() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-56 mt-2" />
      </div>
      {/* Top 3 podium */}
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="border rounded-lg p-6 flex flex-col items-center gap-3">
            <Skeleton className="h-14 w-14 rounded-full" />
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
      {/* Rankings table */}
      <div className="border rounded-lg overflow-hidden">
        <div className="bg-muted/40 border-b px-4 py-3 flex gap-6">
          {["Rank", "Student", "XP", "Badges"].map((h) => (
            <Skeleton key={h} className="h-3 w-16" />
          ))}
        </div>
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="px-4 py-3 border-b last:border-0 flex gap-6 items-center">
            <Skeleton className="h-4 w-8" />
            <Skeleton className="h-4 w-36 flex-1" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-12" />
          </div>
        ))}
      </div>
    </div>
  );
}
