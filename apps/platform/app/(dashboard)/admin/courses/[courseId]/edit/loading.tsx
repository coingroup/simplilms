import { Skeleton } from "@simplilms/ui";

export default function CourseEditLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-4 w-40" />
      <div><Skeleton className="h-8 w-48" /><Skeleton className="h-4 w-64 mt-2" /></div>
      <div className="border rounded-lg p-6 space-y-4 max-w-2xl">
        <Skeleton className="h-6 w-36" />
        <Skeleton className="h-10 w-full" /><Skeleton className="h-20 w-full" />
        <div className="grid grid-cols-2 gap-4"><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" /></div>
      </div>
      <div className="border rounded-lg p-6 space-y-4 max-w-2xl">
        <Skeleton className="h-6 w-24" /><Skeleton className="h-10 w-full" />
      </div>
    </div>
  );
}
