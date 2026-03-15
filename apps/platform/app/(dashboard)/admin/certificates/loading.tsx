import { Skeleton } from "@simplilms/ui";

export default function CertificatesLoading() {
  return (
    <div className="space-y-6">
      <div><Skeleton className="h-8 w-36" /><Skeleton className="h-4 w-52 mt-2" /></div>
      <div className="border rounded-lg p-8 flex flex-col items-center gap-3">
        <Skeleton className="h-8 w-8 rounded" />
        <Skeleton className="h-4 w-48" />
      </div>
    </div>
  );
}
