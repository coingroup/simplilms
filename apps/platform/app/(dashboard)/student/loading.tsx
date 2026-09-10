import { Card } from "@simplilms/ui";

export default function StudentDashboardLoading() {
  return (
    <div className="space-y-6">
      <div>
        <div className="h-8 w-56 bg-gray-200 rounded animate-pulse" />
        <div className="h-4 w-64 bg-gray-200 rounded animate-pulse mt-1" />
      </div>
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="p-3 flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-gray-200 animate-pulse" />
            <div className="space-y-1">
              <div className="h-5 w-10 bg-gray-200 rounded animate-pulse" />
              <div className="h-3 w-14 bg-gray-200 rounded animate-pulse" />
            </div>
          </Card>
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="p-4">
            <div className="h-4 w-20 bg-gray-200 rounded animate-pulse mb-3" />
            <div className="h-7 w-16 bg-gray-200 rounded animate-pulse" />
            <div className="h-3 w-24 bg-gray-200 rounded animate-pulse mt-1" />
          </Card>
        ))}
      </div>
    </div>
  );
}
