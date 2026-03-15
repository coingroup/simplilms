"use client";

import { useState, useTransition } from "react";
import { Button, Textarea } from "@simplilms/ui";
import { addProspectNote } from "../../actions/prospects";
import { toast } from "sonner";
import { Send } from "lucide-react";

interface ProspectNotesProps {
  prospectId: string;
  notes: string | null;
}

export function ProspectNotes({ prospectId, notes }: ProspectNotesProps) {
  const [isPending, startTransition] = useTransition();
  const [newNote, setNewNote] = useState("");

  const handleSubmit = () => {
    if (!newNote.trim()) return;

    startTransition(async () => {
      const result = await addProspectNote(prospectId, newNote.trim());
      if (result.success) {
        toast.success("Note added");
        setNewNote("");
      } else {
        toast.error(result.error || "Failed to add note");
      }
    });
  };

  return (
    <div className="space-y-4">
      {/* Existing notes */}
      <div className="space-y-2">
        {notes ? (
          <div className="rounded-md border bg-muted/30 p-3">
            <pre className="whitespace-pre-wrap text-sm font-sans leading-relaxed">
              {notes}
            </pre>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground italic">
            No notes yet.
          </p>
        )}
      </div>

      {/* Add new note */}
      <div className="space-y-2">
        <Textarea
          placeholder="Add a note..."
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          rows={3}
          disabled={isPending}
        />
        <Button
          size="sm"
          onClick={handleSubmit}
          disabled={isPending || !newNote.trim()}
        >
          <Send className="mr-1.5 h-3.5 w-3.5" />
          {isPending ? "Adding..." : "Add Note"}
        </Button>
      </div>
    </div>
  );
}
