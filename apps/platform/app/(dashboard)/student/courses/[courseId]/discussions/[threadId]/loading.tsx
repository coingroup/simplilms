import { Card } from "@simplilms/ui";

export default function ThreadLoading() {
  return (
    <div className="space-y-4">
      <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />

      {/* Thread header skeleton */}
      <Card className="p-5 space-y-4">
        <div className="h-6 w-3/4 bg-gray-200 rounded animate-pulse" />
        <div className="flex gap-3">
          <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
          <div className="h-3 w-20 bg-gray-200 rounded animate-pulse" />
          <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="border-t pt-4 space-y-2">
          <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-5/6 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-2/3 bg-gray-200 rounded animate-pulse" />
        </div>
      </Card>

      {/* Replies skeleton */}
      <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
      <Card className="divide-y">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="p-4 space-y-2">
            <div className="flex gap-3">
              <div className="h-3 w-20 bg-gray-200 rounded animate-pulse" />
              <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-4/5 bg-gray-200 rounded animate-pulse" />
          </div>
        ))}
      </Card>

      {/* Reply form skeleton */}
      <Card className="p-4 space-y-2">
        <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
        <div className="h-20 w-full bg-gray-200 rounded animate-pulse" />
      </Card>
    </div>
  );
}
