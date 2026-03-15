"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@simplilms/ui";
import { MessageTypeBadge } from "./message-type-badge";
import { formatDateTime } from "../../lib/formatting";
import { User, Bot } from "lucide-react";
import type { MessageRow } from "../../lib/queries";

interface MessageDetailDialogProps {
  message: MessageRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MessageDetailDialog({
  message,
  open,
  onOpenChange,
}: MessageDetailDialogProps) {
  if (!message) return null;

  const senderName = message.is_system
    ? "System"
    : message.sender_first_name && message.sender_last_name
      ? `${message.sender_first_name} ${message.sender_last_name}`
      : "Administration";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-start justify-between gap-2">
            <DialogTitle className="text-lg">
              {message.subject || "No Subject"}
            </DialogTitle>
            <MessageTypeBadge type={message.message_type} />
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Sender + Time */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {message.is_system ? (
              <Bot className="h-4 w-4" />
            ) : (
              <User className="h-4 w-4" />
            )}
            <span className="font-medium text-foreground">{senderName}</span>
            <span>&middot;</span>
            <span>{formatDateTime(message.created_at)}</span>
          </div>

          {/* Body */}
          <div className="rounded-md border border-gray-100 bg-gray-50/50 p-4">
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {message.body}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
