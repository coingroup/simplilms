"use client";

import { Badge } from "@simplilms/ui";

interface InterviewStatusBadgeProps {
  status: string;
}

const STATUS_CONFIG: Record<
  string,
  { label: string; className: string }
> = {
  interviewing: {
    label: "Interviewing",
    className: "bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100",
  },
  generating: {
    label: "Generating",
    className: "bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-100",
  },
  review: {
    label: "Review",
    className: "bg-green-100 text-green-800 border-green-200 hover:bg-green-100",
  },
  completed: {
    label: "Completed",
    className: "bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-100",
  },
  failed: {
    label: "Failed",
    className: "bg-red-100 text-red-800 border-red-200 hover:bg-red-100",
  },
};

export function InterviewStatusBadge({ status }: InterviewStatusBadgeProps) {
  const config = STATUS_CONFIG[status] || {
    label: status,
    className: "bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-100",
  };

  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  );
}
