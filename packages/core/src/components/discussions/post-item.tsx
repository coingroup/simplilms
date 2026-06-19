"use client";

import { useState, useTransition } from "react";
import { Badge } from "@simplilms/ui";
import { Trash2, GraduationCap } from "lucide-react";
import { deletePost } from "@simplilms/core/actions/discussions";
import type { DiscussionPostRow } from "@simplilms/core/actions/discussions";

interface PostItemProps {
  post: DiscussionPostRow;
  currentUserId: string;
  isAdmin: boolean;
}

function formatRelativeTime(dateStr: string): string {
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

export function PostItem({ post, currentUserId, isAdmin }: PostItemProps) {
  const [isPending, startTransition] = useTransition();
  const [deleted, setDeleted] = useState(false);

  const canDelete = isAdmin || post.author_id === currentUserId;
  const authorName = post.author?.full_name ?? "Unknown User";

  function handleDelete() {
    if (!confirm("Delete this reply?")) return;
    startTransition(async () => {
      const result = await deletePost(post.id);
      if (result.success) {
        setDeleted(true);
      } else {
        alert(result.error ?? "Failed to delete reply");
      }
    });
  }

  if (deleted) return null;

  return (
    <div
      className={`flex gap-4 py-4 border-b border-gray-100 last:border-0 ${
        post.is_instructor_post ? "bg-blue-50/50 -mx-4 px-4 rounded-lg" : ""
      } ${isPending ? "opacity-50 pointer-events-none" : ""}`}
    >
      {/* Avatar */}
      <div className="flex-shrink-0">
        {post.author?.avatar_url ? (
          <img
            src={post.author.avatar_url}
            alt={authorName}
            className="h-9 w-9 rounded-full object-cover"
          />
        ) : (
          <div
            className={`h-9 w-9 rounded-full flex items-center justify-center text-xs font-semibold text-white ${
              post.is_instructor_post ? "bg-blue-600" : "bg-gray-400"
            }`}
          >
            {getInitials(authorName)}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-gray-900">{authorName}</span>
          {post.is_instructor_post && (
            <Badge variant="secondary" className="text-xs flex items-center gap-1 bg-blue-100 text-blue-700">
              <GraduationCap className="h-3 w-3" />
              Instructor
            </Badge>
          )}
          <span className="text-xs text-gray-400">{formatRelativeTime(post.created_at)}</span>
        </div>
        <p className="mt-1.5 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
          {post.body}
        </p>
      </div>

      {/* Actions */}
      {canDelete && (
        <button
          onClick={handleDelete}
          disabled={isPending}
          className="flex-shrink-0 text-gray-300 hover:text-red-500 transition-colors mt-1"
          title="Delete reply"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
