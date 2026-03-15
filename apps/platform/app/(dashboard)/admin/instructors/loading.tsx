import { Skeleton } from "@simplilms/ui";

export default function InstructorsLoading() {
  return (
    <div className="space-y-6">
      <div><Skeleton className="h-8 w-36" /><Skeleton className="h-4 w-40 mt-2" /></div>
      <div className="border rounded-lg overflow-hidden">
        <div className="bg-gray-50 border-b px-4 py-3 flex gap-8">
          {["Name", "Email", "Type", "Joined"].map((h) => <Skeleton key={h} className="h-3 w-16" />)}
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="px-4 py-3 border-b flex gap-8">
            <Skeleton className="h-4 w-32" /><Skeleton className="h-4 w-48" /><Skeleton className="h-5 w-16 rounded-full" /><Skeleton className="h-4 w-24" />
          </div>
        ))}
      </div>
    </div>
  );
}
