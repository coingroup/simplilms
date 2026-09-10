import { Card } from "@simplilms/ui";

export default function TeacherDashboardLoading() {
  return (
    <div className="space-y-6">
      <div>
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
        <div className="h-4 w-64 bg-gray-200 rounded animate-pulse mt-1" />
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
