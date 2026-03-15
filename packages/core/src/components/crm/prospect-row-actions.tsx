"use client";

import { useState } from "react";
import { Button } from "@simplilms/ui";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@simplilms/ui";
import { MoreHorizontal, Eye, Send } from "lucide-react";
import { RemarketingDialog } from "./remarketing-dialog";
import type { ProspectRow } from "../../lib/queries";

interface ProspectRowActionsProps {
  prospect: ProspectRow;
  onView: () => void;
}

export function ProspectRowActions({
  prospect,
  onView,
}: ProspectRowActionsProps) {
  const [remarketingOpen, setRemarketingOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={onView}>
            <Eye className="mr-2 h-4 w-4" />
            View Details
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setRemarketingOpen(true)}
            disabled={!prospect.remarketing_eligible}
          >
            <Send className="mr-2 h-4 w-4" />
            Send Message
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <RemarketingDialog
        prospect={prospect}
        open={remarketingOpen}
        onOpenChange={setRemarketingOpen}
      />
    </>
  );
}
