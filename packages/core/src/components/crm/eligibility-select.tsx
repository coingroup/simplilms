"use client";

import { useState, useTransition } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@simplilms/ui";
import { updateEligibility } from "../../actions/prospects";
import { toast } from "sonner";
import type { EligibilityStatus } from "@simplilms/database";

interface EligibilitySelectProps {
  prospectId: string;
  currentStatus: string | null;
}

export function EligibilitySelect({
  prospectId,
  currentStatus,
}: EligibilitySelectProps) {
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState(currentStatus || "pending");

  const handleChange = (value: string) => {
    setStatus(value);
    startTransition(async () => {
      const result = await updateEligibility(
        prospectId,
        value as EligibilityStatus
      );
      if (result.success) {
        toast.success(
          `Eligibility updated to ${
            value === "yes"
              ? "Eligible"
              : value === "no"
                ? "Not Eligible"
                : value === "maybe"
                  ? "Follow Up"
                  : "Pending"
          }`
        );
      } else {
        toast.error(result.error || "Failed to update");
        setStatus(currentStatus || "pending"); // Revert
      }
    });
  };

  return (
    <Select
      value={status}
      onValueChange={handleChange}
      disabled={isPending}
    >
      <SelectTrigger className="w-[130px] h-8 text-xs">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="pending">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-gray-400" />
            Pending
          </span>
        </SelectItem>
        <SelectItem value="yes">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-green-500" />
            Eligible
          </span>
        </SelectItem>
        <SelectItem value="no">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-red-500" />
            Not Eligible
          </span>
        </SelectItem>
        <SelectItem value="maybe">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-yellow-500" />
            Follow Up
          </span>
        </SelectItem>
      </SelectContent>
    </Select>
  );
}
