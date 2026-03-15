import { Skeleton } from "@simplilms/ui";

export default function SettingsLoading() {
  return (
    <div className="space-y-6">
      <div><Skeleton className="h-8 w-28" /><Skeleton className="h-4 w-52 mt-2" /></div>
      <div className="grid gap-4 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="border rounded-lg p-6 flex items-start gap-4">
            <Skeleton className="h-12 w-12 rounded-lg" />
            <div className="flex-1"><Skeleton className="h-4 w-28" /><Skeleton className="h-3 w-full mt-2" /></div>
          </div>
        ))}
      </div>
    </div>
  );
}
