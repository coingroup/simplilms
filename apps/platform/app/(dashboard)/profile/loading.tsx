import { Card } from "@simplilms/ui";

export default function ProfileLoading() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-32 bg-gray-200 rounded animate-pulse" />
      <Card className="p-6 space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="space-y-1">
            <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
            <div className="h-9 w-full bg-gray-200 rounded animate-pulse" />
          </div>
        ))}
      </Card>
    </div>
  );
}
