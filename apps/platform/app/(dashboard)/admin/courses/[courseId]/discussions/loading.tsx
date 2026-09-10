import { Card } from "@simplilms/ui";

export default function DiscussionsLoading() {
  return (
    <div className="space-y-6">
      <div>
        <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mb-2" />
        <div className="h-8 w-64 bg-gray-200 rounded animate-pulse" />
        <div className="h-4 w-40 bg-gray-200 rounded animate-pulse mt-1" />
      </div>
      <div className="flex items-center justify-between">
        <div className="h-9 w-64 bg-gray-200 rounded animate-pulse" />
        <div className="h-9 w-36 bg-gray-200 rounded animate-pulse" />
      </div>
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i} className="p-4">
            <div className="flex items-start gap-3">
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse" />
                <div className="h-3 w-1/2 bg-gray-200 rounded animate-pulse" />
                <div className="h-3 w-1/3 bg-gray-200 rounded animate-pulse" />
              </div>
              <div className="h-8 w-8 bg-gray-200 rounded animate-pulse" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
