import { Card } from "@simplilms/ui";

export default function BadgesLoading() {
  return (
    <div className="space-y-6">
      <div>
        <div className="h-8 w-32 bg-gray-200 rounded animate-pulse" />
        <div className="h-4 w-52 bg-gray-200 rounded animate-pulse mt-1" />
      </div>
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="p-3 flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-gray-200 animate-pulse" />
            <div className="space-y-1">
              <div className="h-5 w-12 bg-gray-200 rounded animate-pulse" />
              <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
            </div>
          </Card>
        ))}
      </div>
      <div className="h-5 w-24 bg-gray-200 rounded animate-pulse" />
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {Array.from({ length: 15 }).map((_, i) => (
          <Card key={i} className="p-3 text-center">
            <div className="h-10 w-10 rounded-full bg-gray-200 animate-pulse mx-auto" />
            <div className="h-3 w-16 bg-gray-200 rounded animate-pulse mx-auto mt-2" />
            <div className="h-2 w-20 bg-gray-200 rounded animate-pulse mx-auto mt-1" />
          </Card>
        ))}
      </div>
    </div>
  );
}
