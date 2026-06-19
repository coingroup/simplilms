"use client";

import Link from "next/link";
import { Badge } from "@simplilms/ui";
import { MessageSquare, Pin, Lock, ChevronRight } from "lucide-react";
import type { DiscussionThreadRow } from "@simplilms/core/actions/discussions";

interface ThreadListProps {
  threads: DiscussionThreadRow[];
  courseId: string;
  basePath?: string; // defaults to /student/courses/:courseId/discuss
}

function formatRelativeTime(dateStr: string | null): string {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function getInitials(name: string | null | undefined): string {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function ThreadList({ threads, courseId, basePath }: ThreadListProps) {
  const base = basePath ?? `/student/courses/${courseId}/discuss`;

  if (threads.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <MessageSquare className="h-12 w-12 text-gray-300 mb-4" />
        <p className="text-gray-500 font-medium">No discussions yet</p>
        <p className="text-sm text-gray-400 mt-1">
          Be the first to start a conversation.
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-100">
      {threads.map((thread) => (
        <Link
          key={thread.id}
          href={`${base}/${thread.id}`}
          className="flex items-start gap-4 py-4 px-1 hover:bg-gray-50 rounded-lg transition-colors group"
        >
          {/* Author avatar */}
          <div className="flex-shrink-0 mt-0.5">
            {thread.author?.avatar_url ? (
              <img
                src={thread.author.avatar_url}
                alt={thread.author.full_name ?? ""}
                className="h-9 w-9 rounded-full object-cover"
              />
            ) : (
              <div className="h-9 w-9 rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold text-gray-600">
                {getInitials(thread.author?.full_name)}
              </div>
            )}
          </div>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              {thread.is_pinned && (
                <Pin className="h-3.5 w-3.5 text-amber-500 flex-shrink-0" />
              )}
              <span className="text-sm font-semibold text-gray-900 group-hover:text-primary transition-colors truncate">
                {thread.title}
              </span>
              {thread.is_pinned && (
                <Badge variant="outline" className="text-xs border-amber-200 text-amber-600 bg-amber-50">
                  Pinned
                </Badge>
              )}
              {thread.is_locked && (
                <Badge variant="outline" className="text-xs border-gray-200 text-gray-500">
                  <Lock className="h-3 w-3 mr-1" />
                  Locked
                </Badge>
              )}
            </div>

            <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
              {thread.body}
            </p>

            <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-400">
              <span>{thread.author?.full_name ?? "Unknown"}</span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <MessageSquare className="h-3 w-3" />
                {thread.reply_count}{" "}
                {thread.reply_count === 1 ? "reply" : "replies"}
              </span>
              <span>·</span>
              <span>
                {thread.last_reply_at
                  ? `Last reply ${formatRelativeTime(thread.last_reply_at)}`
                  : `Posted ${formatRelativeTime(thread.created_at)}`}
              </span>
            </div>
          </div>

          {/* Chevron */}
          <ChevronRight className="h-4 w-4 text-gray-300 flex-shrink-0 mt-2 group-hover:text-gray-500 transition-colors" />
        </Link>
      ))}
    </div>
  );
}
