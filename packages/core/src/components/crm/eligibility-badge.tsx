import { Badge } from "@simplilms/ui";
import { cn } from "@simplilms/ui";

const STATUS_CONFIG: Record<
  string,
  { label: string; className: string }
> = {
  pending: {
    label: "Pending",
    className: "bg-gray-100 text-gray-700 border-gray-200",
  },
  yes: {
    label: "Eligible",
    className: "bg-green-50 text-green-700 border-green-200",
  },
  no: {
    label: "Not Eligible",
    className: "bg-red-50 text-red-700 border-red-200",
  },
  maybe: {
    label: "Follow Up",
    className: "bg-yellow-50 text-yellow-700 border-yellow-200",
  },
};

interface EligibilityBadgeProps {
  status: string | null;
  className?: string;
}

export function EligibilityBadge({ status, className }: EligibilityBadgeProps) {
  const config = STATUS_CONFIG[status || "pending"] || STATUS_CONFIG.pending;

  return (
    <Badge
      variant="outline"
      className={cn("font-medium", config.className, className)}
    >
      <span
        className={cn("mr-1.5 inline-block h-2 w-2 rounded-full", {
          "bg-gray-400": !status || status === "pending",
          "bg-green-500": status === "yes",
          "bg-red-500": status === "no",
          "bg-yellow-500": status === "maybe",
        })}
      />
      {config.label}
    </Badge>
  );
}
