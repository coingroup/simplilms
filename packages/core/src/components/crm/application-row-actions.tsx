"use client";

import { Button } from "@simplilms/ui";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@simplilms/ui";
import { MoreHorizontal, Eye, CheckCircle, XCircle } from "lucide-react";
import type { ApplicationRow } from "../../lib/queries";

interface ApplicationRowActionsProps {
  application: ApplicationRow;
  onReview: () => void;
  canReview?: boolean;
}

export function ApplicationRowActions({
  application,
  onReview,
  canReview = false,
}: ApplicationRowActionsProps) {
  const isReviewable =
    canReview &&
    (application.status === "submitted" ||
      application.status === "under_review");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={onReview}>
          <Eye className="mr-2 h-4 w-4" />
          View Application
        </DropdownMenuItem>
        {isReviewable && (
          <>
            <DropdownMenuItem onClick={onReview}>
              <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
              Review & Decide
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
