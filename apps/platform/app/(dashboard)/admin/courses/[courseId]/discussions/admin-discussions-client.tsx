"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Badge, Button } from "@simplilms/ui";
import {
  MessageSquare,
  Pin,
  PinOff,
  Lock,
  LockOpen,
  Trash2,
} from "lucide-react";
import {
  pinThread,
  unpinThread,
  lockThread,
  deleteThread,
} from "@simplilms/core/actions/discussions";
import type { DiscussionThreadRow } from "@simplilms/core/actions/discussions";
import { useRouter } from "next/navigation";

interface AdminDiscussionsClientProps {
  threads: DiscussionThreadRow[];
  courseId: string;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function AdminDiscussionsClient({
  threads: initialThreads,
  courseId,
}: AdminDiscussionsClientProps) {
  const router = useRouter();
  const [threads, setThreads] = useState(initialThreads);
  const [isPending, startTransition] = useTransition();

  function handlePin(threadId: string, currentlyPinned: boolean) {
    startTransition(async () => {
      const action = currentlyPinned ? unpinThread : pinThread;
      const result = await action(threadId);
      if (result.success) {
        setThreads((prev) =>
          prev.map((t) =>
            t.id === threadId ? { ...t, is_pinned: !currentlyPinned } : t
          )
        );
      }
    });
  }

  function handleLock(threadId: string, currentlyLocked: boolean) {
    startTransition(async () => {
      const result = await lockThread(threadId, !currentlyLocked);
      if (result.success) {
        setThreads((prev) =>
          prev.map((t) =>
            t.id === threadId ? { ...t, is_locked: !currentlyLocked } : t
          )
        );
      }
    });
  }

  function handleDelete(threadId: string) {
    if (!confirm("Permanently delete this thread and all its replies?")) return;
    startTransition(async () => {
      const result = await deleteThread(threadId);
      if (result.success) {
        setThreads((prev) => prev.filter((t) => t.id !== threadId));
      } else {
        alert(result.error ?? "Failed to delete thread");
      }
    });
  }

  return (
    <div className="divide-y divide-gray-100">
      {threads.map((thread) => (
        <div
          key={thread.id}
          className={`flex items-start justify-between gap-4 px-6 py-4 hover:bg-gray-50 transition-colors ${
            isPending ? "opacity-60 pointer-events-none" : ""
          }`}
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <Link
                href={`/student/courses/${courseId}/discuss/${thread.id}`}
                className="text-sm font-semibold text-gray-900 hover:text-primary transition-colors truncate"
              >
                {thread.title}
              </Link>
              {thread.is_pinned && (
                <Badge
                  variant="outline"
                  className="text-xs border-amber-200 text-amber-600 bg-amber-50"
                >
                  <Pin className="h-3 w-3 mr-1" />
                  Pinned
                </Badge>
              )}
              {thread.is_locked && (
                <Badge
                  variant="outline"
                  className="text-xs border-gray-300 text-gray-500"
                >
                  <Lock className="h-3 w-3 mr-1" />
                  Locked
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-400 flex-wrap">
              <span>By {thread.author?.full_name ?? "Unknown"}</span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <MessageSquare className="h-3 w-3" />
                {thread.reply_count}{" "}
                {thread.reply_count === 1 ? "reply" : "replies"}
              </span>
              <span>·</span>
              <span>{formatDate(thread.created_at)}</span>
            </div>
          </div>

          {/* Moderation actions */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handlePin(thread.id, thread.is_pinned)}
              disabled={isPending}
              title={thread.is_pinned ? "Unpin" : "Pin"}
              className="h-8 w-8 p-0"
            >
              {thread.is_pinned ? (
                <PinOff className="h-4 w-4 text-amber-500" />
              ) : (
                <Pin className="h-4 w-4 text-gray-400" />
              )}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleLock(thread.id, thread.is_locked)}
              disabled={isPending}
              title={thread.is_locked ? "Unlock" : "Lock"}
              className="h-8 w-8 p-0"
            >
              {thread.is_locked ? (
                <LockOpen className="h-4 w-4 text-blue-500" />
              ) : (
                <Lock className="h-4 w-4 text-gray-400" />
              )}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDelete(thread.id)}
              disabled={isPending}
              title="Delete thread"
              className="h-8 w-8 p-0 text-red-400 hover:text-red-600"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
