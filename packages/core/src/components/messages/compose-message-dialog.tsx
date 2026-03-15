"use client";

import { useState, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Button,
  Input,
  Label,
  Textarea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@simplilms/ui";
import { Send, Users } from "lucide-react";
import { sendMessage, sendBroadcastMessage } from "../../actions/messages";
import { toast } from "sonner";

interface StudentOption {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
}

interface ComposeMessageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  students: StudentOption[];
  showBroadcast?: boolean;
}

const MESSAGE_TYPES = [
  { value: "general", label: "General" },
  { value: "payment_update", label: "Payment Update" },
  { value: "class_reminder", label: "Class Reminder" },
  { value: "emergency", label: "Emergency" },
];

export function ComposeMessageDialog({
  open,
  onOpenChange,
  students,
  showBroadcast = true,
}: ComposeMessageDialogProps) {
  const [recipientId, setRecipientId] = useState<string>("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [messageType, setMessageType] = useState("general");
  const [isPending, startTransition] = useTransition();

  const resetForm = () => {
    setRecipientId("");
    setSubject("");
    setBody("");
    setMessageType("general");
  };

  const handleSend = () => {
    if (!body.trim()) {
      toast.error("Message body is required");
      return;
    }

    if (!recipientId) {
      toast.error("Please select a recipient");
      return;
    }

    startTransition(async () => {
      let result;

      if (recipientId === "__broadcast__") {
        result = await sendBroadcastMessage({
          subject,
          body,
          messageType,
        });
        if (result.success) {
          toast.success(
            `Message broadcast to ${result.sentCount} student${result.sentCount !== 1 ? "s" : ""}`
          );
        }
      } else {
        result = await sendMessage({
          recipientId,
          subject,
          body,
          messageType,
        });
        if (result.success) {
          toast.success("Message sent successfully");
        }
      }

      if (result.success) {
        resetForm();
        onOpenChange(false);
      } else {
        toast.error(result.error || "Failed to send message");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Compose Message</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Recipient */}
          <div className="space-y-2">
            <Label>Recipient</Label>
            <Select value={recipientId} onValueChange={setRecipientId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a recipient..." />
              </SelectTrigger>
              <SelectContent>
                {showBroadcast && (
                  <SelectItem value="__broadcast__">
                    <div className="flex items-center gap-2">
                      <Users className="h-3.5 w-3.5" />
                      All Students (Broadcast)
                    </div>
                  </SelectItem>
                )}
                {students.map((student) => (
                  <SelectItem key={student.id} value={student.id}>
                    {student.first_name || ""} {student.last_name || ""}{" "}
                    {student.email ? `(${student.email})` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Message Type */}
          <div className="space-y-2">
            <Label>Type</Label>
            <Select value={messageType} onValueChange={setMessageType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MESSAGE_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Subject */}
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Message subject (optional)"
              disabled={isPending}
            />
          </div>

          {/* Body */}
          <div className="space-y-2">
            <Label htmlFor="body">Message</Label>
            <Textarea
              id="body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write your message..."
              rows={5}
              disabled={isPending}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSend}
            disabled={isPending || !body.trim() || !recipientId}
          >
            <Send className="h-4 w-4 mr-1.5" />
            {isPending
              ? "Sending..."
              : recipientId === "__broadcast__"
                ? "Broadcast"
                : "Send"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
