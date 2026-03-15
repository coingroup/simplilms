"use client";

import { useState } from "react";
import { Button } from "@simplilms/ui";
import { Plus } from "lucide-react";
import { ComposeMessageDialog } from "@simplilms/core/components/messages/compose-message-dialog";

interface StudentOption {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
}

interface AdminMessagesClientProps {
  students: StudentOption[];
}

export function AdminMessagesClient({ students }: AdminMessagesClientProps) {
  const [composeOpen, setComposeOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setComposeOpen(true)}>
        <Plus className="h-4 w-4 mr-1.5" />
        Compose
      </Button>
      <ComposeMessageDialog
        open={composeOpen}
        onOpenChange={setComposeOpen}
        students={students}
      />
    </>
  );
}
