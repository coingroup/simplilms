import { Card } from "@simplilms/ui";

export default function ClassDetailLoading() {
  return (
    <div className="space-y-6">
      <div>
        <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mb-2" />
        <div className="h-8 w-64 bg-gray-200 rounded animate-pulse" />
        <div className="h-4 w-80 bg-gray-200 rounded animate-pulse mt-1" />
      </div>
      <div className="grid gap-4 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="p-4">
            <div className="h-4 w-20 bg-gray-200 rounded animate-pulse mb-3" />
            <div className="h-7 w-12 bg-gray-200 rounded animate-pulse" />
            <div className="h-3 w-24 bg-gray-200 rounded animate-pulse mt-1" />
          </Card>
        ))}
      </div>
      <div className="h-5 w-40 bg-gray-200 rounded animate-pulse" />
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="p-4">
            <div className="h-4 w-48 bg-gray-200 rounded animate-pulse" />
            <div className="h-3 w-32 bg-gray-200 rounded animate-pulse mt-2" />
          </Card>
        ))}
      </div>
    </div>
  );
}
