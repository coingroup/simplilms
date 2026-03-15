import { Skeleton } from "@simplilms/ui";

export default function TenantsLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-56" />
          <Skeleton className="mt-1 h-4 w-36" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      <div className="rounded-md border">
        <div className="p-4 space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}
