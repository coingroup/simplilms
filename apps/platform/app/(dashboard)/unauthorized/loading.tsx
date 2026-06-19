import { Skeleton } from "@simplilms/ui";

export default function UnauthorizedLoading() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="border rounded-lg p-8 w-full max-w-sm space-y-4 text-center">
        <Skeleton className="h-12 w-12 rounded-full mx-auto" />
        <Skeleton className="h-6 w-40 mx-auto" />
        <Skeleton className="h-4 w-56 mx-auto" />
        <Skeleton className="h-9 w-28 mx-auto" />
      </div>
    </div>
  );
}
