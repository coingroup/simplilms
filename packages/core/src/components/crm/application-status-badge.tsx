import { Badge } from "@simplilms/ui";
import { cn } from "@simplilms/ui";

const STATUS_CONFIG: Record<
  string,
  { label: string; className: string }
> = {
  draft: {
    label: "Draft",
    className: "bg-gray-100 text-gray-700 border-gray-200",
  },
  submitted: {
    label: "Submitted",
    className: "bg-orange-50 text-orange-700 border-orange-200",
  },
  under_review: {
    label: "Under Review",
    className: "bg-amber-50 text-amber-700 border-amber-200",
  },
  approved: {
    label: "Approved",
    className: "bg-green-50 text-green-700 border-green-200",
  },
  rejected: {
    label: "Rejected",
    className: "bg-red-50 text-red-700 border-red-200",
  },
  enrolled: {
    label: "Enrolled",
    className: "bg-green-50 text-green-700 border-green-200",
  },
};

interface ApplicationStatusBadgeProps {
  status: string | null;
  className?: string;
}

export function ApplicationStatusBadge({
  status,
  className,
}: ApplicationStatusBadgeProps) {
  const config = STATUS_CONFIG[status || "draft"] || STATUS_CONFIG.draft;

  return (
    <Badge
      variant="outline"
      className={cn("font-medium", config.className, className)}
    >
      {config.label}
    </Badge>
  );
}
