"use client";

import { useState } from "react";
import { Button } from "@simplilms/ui";
import { Send } from "lucide-react";
import { ComposeMessageDialog } from "@simplilms/core/components/messages/compose-message-dialog";

interface TeacherMessagesClientProps {
  students: { id: string; first_name: string | null; last_name: string | null; email: string | null }[];
}

export function TeacherMessagesClient({ students }: TeacherMessagesClientProps) {
  const [composeOpen, setComposeOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setComposeOpen(true)}>
        <Send className="h-4 w-4 mr-1.5" />
        Send Message
      </Button>
      <ComposeMessageDialog
        open={composeOpen}
        onOpenChange={setComposeOpen}
        students={students}
        showBroadcast={false}
      />
    </>
  );
}
