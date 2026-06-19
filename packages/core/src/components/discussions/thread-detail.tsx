"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import Link from "next/link";
import { Button, Badge, Textarea, Card, CardContent } from "@simplilms/ui";
import {
  ArrowLeft,
  Pin,
  PinOff,
  Lock,
  LockOpen,
  Trash2,
  MessageSquare,
  Send,
  GraduationCap,
  Loader2,
} from "lucide-react";
import { PostItem } from "./post-item";
import {
  createDiscussionPost,
  pinThread,
  unpinThread,
  lockThread,
  deleteThread,
} from "@simplilms/core/actions/discussions";
import type { ThreadWithPosts } from "@simplilms/core/actions/discussions";
import { useRouter } from "next/navigation";

interface ThreadDetailProps {
  thread: ThreadWithPosts;
  currentUserId: string;
  currentUserRole: string;
  courseId: string;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
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

const ADMIN_ROLES = ["super_admin", "school_rep"];

export function ThreadDetail({
  thread: initialThread,
  currentUserId,
  currentUserRole,
  courseId,
}: ThreadDetailProps) {
  const router = useRouter();
  const [thread, setThread] = useState(initialThread);
  const [replyBody, setReplyBody] = useState("");
  const [replyError, setReplyError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isModPending, startModTransition] = useTransition();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isAdmin = ADMIN_ROLES.includes(currentUserRole);
  const isLocked = thread.is_locked;
  const canReply = !isLocked || isAdmin;
  const authorName = thread.author?.full_name ?? "Unknown User";

  function handleReply(e: React.FormEvent) {
    e.preventDefault();
    setReplyError(null);
    startTransition(async () => {
      const result = await createDiscussionPost(thread.id, replyBody);
      if (result.success) {
        setReplyBody("");
        router.refresh();
      } else {
        setReplyError(result.error ?? "Failed to post reply");
      }
    });
  }

  function handlePin() {
    startModTransition(async () => {
      const action = thread.is_pinned ? unpinThread : pinThread;
      const result = await action(thread.id);
      if (result.success) {
        setThread((t) => ({ ...t, is_pinned: !t.is_pinned }));
      }
    });
  }

  function handleLock() {
    startModTransition(async () => {
      const result = await lockThread(thread.id, !thread.is_locked);
      if (result.success) {
        setThread((t) => ({ ...t, is_locked: !t.is_locked }));
      }
    });
  }

  function handleDelete() {
    if (!confirm("Permanently delete this discussion thread and all replies?")) return;
    startModTransition(async () => {
      const result = await deleteThread(thread.id);
      if (result.success) {
        router.push(`/student/courses/${courseId}/discuss`);
      } else {
        alert(result.error ?? "Failed to delete thread");
      }
    });
  }

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        href={`/student/courses/${courseId}/discuss`}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Discussions
      </Link>

      {/* Thread header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-2">
                {thread.is_pinned && (
                  <Badge variant="outline" className="text-xs border-amber-200 text-amber-600 bg-amber-50">
                    <Pin className="h-3 w-3 mr-1" />
                    Pinned
                  </Badge>
                )}
                {thread.is_locked && (
                  <Badge variant="outline" className="text-xs border-gray-300 text-gray-500">
                    <Lock className="h-3 w-3 mr-1" />
                    Locked
                  </Badge>
                )}
              </div>
              <h1 className="text-xl font-bold text-gray-900">{thread.title}</h1>
            </div>

            {/* Admin actions */}
            {isAdmin && (
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePin}
                  disabled={isModPending}
                  title={thread.is_pinned ? "Unpin" : "Pin thread"}
                >
                  {thread.is_pinned ? (
                    <PinOff className="h-4 w-4" />
                  ) : (
                    <Pin className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLock}
                  disabled={isModPending}
                  title={thread.is_locked ? "Unlock" : "Lock thread"}
                >
                  {thread.is_locked ? (
                    <LockOpen className="h-4 w-4" />
                  ) : (
                    <Lock className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDelete}
                  disabled={isModPending}
                  className="text-red-600 hover:text-red-700 hover:border-red-300"
                  title="Delete thread"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Original post */}
          <div className="mt-4 flex gap-4">
            <div className="flex-shrink-0">
              {thread.author?.avatar_url ? (
                <img
                  src={thread.author.avatar_url}
                  alt={authorName}
                  className="h-10 w-10 rounded-full object-cover"
                />
              ) : (
                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-sm font-semibold text-gray-600">
                  {getInitials(authorName)}
                </div>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-900">{authorName}</span>
                <span className="text-xs text-gray-400">{formatDate(thread.created_at)}</span>
              </div>
              <p className="mt-2 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                {thread.body}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Replies */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          {thread.reply_count} {thread.reply_count === 1 ? "Reply" : "Replies"}
        </h2>

        <Card>
          <CardContent className="pt-4">
            {thread.posts.length === 0 ? (
              <p className="text-sm text-gray-400 py-4 text-center">
                No replies yet. Be the first to respond.
              </p>
            ) : (
              <div>
                {thread.posts.map((post) => (
                  <PostItem
                    key={post.id}
                    post={post}
                    currentUserId={currentUserId}
                    isAdmin={isAdmin}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Reply form */}
      {canReply ? (
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Add a Reply
            </h3>
            <form onSubmit={handleReply} className="space-y-3">
              <Textarea
                ref={textareaRef}
                placeholder="Write your reply..."
                value={replyBody}
                onChange={(e) => setReplyBody(e.target.value)}
                disabled={isPending}
                rows={4}
                className="resize-none"
                required
              />
              {replyError && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                  {replyError}
                </p>
              )}
              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={isPending || !replyBody.trim()}
                >
                  {isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Posting...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Post Reply
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : (
        <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
          <Lock className="h-4 w-4 text-gray-400" />
          This thread is locked. No new replies can be added.
        </div>
      )}
    </div>
  );
}
