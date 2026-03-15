"use client";

import { useState, useTransition } from "react";
import { Button } from "@simplilms/ui";
import { MessageDetailDialog } from "./message-detail-dialog";
import { MessageTypeBadge } from "./message-type-badge";
import { markMessageAsRead, markAllMessagesAsRead } from "../../actions/messages";
import { getRelativeTime } from "../../lib/formatting";
import { CheckCheck, Mail, MailOpen } from "lucide-react";
import { toast } from "sonner";
import type { MessageRow } from "../../lib/queries";

interface MessageListProps {
  messages: MessageRow[];
  unreadCount: number;
}

export function MessageList({ messages, unreadCount }: MessageListProps) {
  const [selectedMessage, setSelectedMessage] = useState<MessageRow | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleMessageClick = (message: MessageRow) => {
    setSelectedMessage(message);
    setDialogOpen(true);

    // Mark as read if unread
    if (!message.is_read) {
      startTransition(async () => {
        await markMessageAsRead(message.id);
      });
    }
  };

  const handleMarkAllRead = () => {
    startTransition(async () => {
      const result = await markAllMessagesAsRead();
      if (result.success) {
        toast.success("All messages marked as read");
      } else {
        toast.error(result.error || "Failed to mark messages as read");
      }
    });
  };

  if (messages.length === 0) {
    return (
      <div className="text-center py-16 text-gray-500">
        <Mail className="h-12 w-12 mx-auto mb-3 text-gray-300" />
        <p className="text-sm font-medium">No messages yet</p>
        <p className="text-xs text-gray-400 mt-1">
          Messages from your school will appear here.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Header with Mark All Read */}
      {unreadCount > 0 && (
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-muted-foreground">
            {unreadCount} unread message{unreadCount !== 1 ? "s" : ""}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllRead}
            disabled={isPending}
          >
            <CheckCheck className="h-3.5 w-3.5 mr-1.5" />
            Mark All Read
          </Button>
        </div>
      )}

      {/* Message List */}
      <div className="space-y-1">
        {messages.map((message) => (
          <button
            key={message.id}
            onClick={() => handleMessageClick(message)}
            className={`w-full text-left px-4 py-3 rounded-lg border transition-colors hover:bg-gray-50 ${
              message.is_read
                ? "border-gray-100 bg-white"
                : "border-[#F26822]/20 bg-orange-50/50"
            }`}
          >
            <div className="flex items-start gap-3">
              {/* Read indicator */}
              <div className="pt-1 flex-shrink-0">
                {message.is_read ? (
                  <MailOpen className="h-4 w-4 text-gray-300" />
                ) : (
                  <Mail className="h-4 w-4 text-[#F26822]" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span
                    className={`text-sm truncate ${
                      message.is_read
                        ? "text-gray-700"
                        : "font-semibold text-gray-900"
                    }`}
                  >
                    {message.subject || "No Subject"}
                  </span>
                  <MessageTypeBadge type={message.message_type} />
                </div>
                <p className="text-xs text-gray-500 truncate">
                  {message.body.slice(0, 120)}
                  {message.body.length > 120 ? "..." : ""}
                </p>
              </div>

              {/* Time */}
              <span className="text-xs text-gray-400 flex-shrink-0 whitespace-nowrap">
                {getRelativeTime(message.created_at)}
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* Detail Dialog */}
      <MessageDetailDialog
        message={selectedMessage}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  );
}
