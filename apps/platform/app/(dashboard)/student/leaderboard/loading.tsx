import { Card } from "@simplilms/ui";

export default function LeaderboardLoading() {
  return (
    <div className="space-y-6">
      <div>
        <div className="h-8 w-40 bg-gray-200 rounded animate-pulse" />
        <div className="h-4 w-60 bg-gray-200 rounded animate-pulse mt-1" />
      </div>
      <Card>
        <div className="p-4 space-y-3">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="h-5 w-5 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-32 bg-gray-200 rounded animate-pulse flex-1" />
              <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
