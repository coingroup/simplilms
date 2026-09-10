"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button, Badge, Card, Textarea } from "@simplilms/ui";
import {
  ArrowLeft,
  Clock,
  Edit2,
  Lock,
  MessageSquare,
  MoreVertical,
  Pin,
  Reply,
  Trash2,
  User,
} from "lucide-react";
import type {
  DiscussionThreadRow,
  DiscussionPostRow,
} from "../../actions/forums";

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return date.toLocaleDateString();
}

interface ThreadDetailProps {
  thread: DiscussionThreadRow;
  posts: DiscussionPostRow[];
  courseId: string;
  currentUserId: string;
  currentUserRole: string;
  basePath: string;
  onCreatePost: (data: {
    body: string;
    parentPostId?: string;
  }) => Promise<{ success: boolean; error?: string; id?: string }>;
  onUpdatePost: (
    postId: string,
    data: { body: string }
  ) => Promise<{ success: boolean; error?: string }>;
  onDeletePost: (
    postId: string
  ) => Promise<{ success: boolean; error?: string }>;
  onTogglePin: () => Promise<{ success: boolean; error?: string }>;
  onToggleLock: () => Promise<{ success: boolean; error?: string }>;
  onDeleteThread: () => Promise<{ success: boolean; error?: string }>;
}

export function ThreadDetail({
  thread,
  posts,
  courseId,
  currentUserId,
  currentUserRole,
  basePath,
  onCreatePost,
  onUpdatePost,
  onDeletePost,
  onTogglePin,
  onToggleLock,
  onDeleteThread,
}: ThreadDetailProps) {
  const router = useRouter();
  const [replyBody, setReplyBody] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editBody, setEditBody] = useState("");
  const [showActions, setShowActions] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const canModerate = ["super_admin", "teacher_paid", "teacher_unpaid"].includes(
    currentUserRole
  );
  const isAuthor = thread.author_id === currentUserId;

  const handleReply = () => {
    if (!replyBody.trim()) return;
    startTransition(async () => {
      const result = await onCreatePost({
        body: replyBody,
        parentPostId: replyingTo || undefined,
      });
      if (result.success) {
        setReplyBody("");
        setReplyingTo(null);
      }
    });
  };

  const handleEditPost = (postId: string) => {
    if (!editBody.trim()) return;
    startTransition(async () => {
      const result = await onUpdatePost(postId, { body: editBody });
      if (result.success) {
        setEditingPostId(null);
        setEditBody("");
      }
    });
  };

  const handleDeletePost = (postId: string) => {
    startTransition(async () => {
      await onDeletePost(postId);
    });
  };

  const handleDeleteThread = () => {
    startTransition(async () => {
      const result = await onDeleteThread();
      if (result.success) {
        router.push(`${basePath}/discussions`);
      }
    });
  };

  // Separate top-level posts from nested replies
  const topLevelPosts = posts.filter((p) => !p.parent_post_id);
  const repliesByParent = posts.reduce(
    (acc, p) => {
      if (p.parent_post_id) {
        if (!acc[p.parent_post_id]) acc[p.parent_post_id] = [];
        acc[p.parent_post_id].push(p);
      }
      return acc;
    },
    {} as Record<string, DiscussionPostRow[]>
  );

  function renderPost(post: DiscussionPostRow, depth: number = 0) {
    const isPostAuthor = post.author_id === currentUserId;
    const childReplies = repliesByParent[post.id] || [];

    return (
      <div key={post.id} className={depth > 0 ? "ml-6 border-l-2 border-muted pl-4" : ""}>
        <div className="py-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <User className="h-3 w-3" />
              <span className="font-medium text-foreground">
                {post.author_name}
              </span>
              {post.author_role !== "student" && (
                <Badge
                  variant="secondary"
                  className="text-[10px] px-1 py-0"
                >
                  {post.author_role === "super_admin"
                    ? "Admin"
                    : "Instructor"}
                </Badge>
              )}
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {timeAgo(post.created_at)}
              </span>
              {post.is_edited && (
                <span className="italic">(edited)</span>
              )}
            </div>
            {(isPostAuthor || canModerate) && (
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowActions(showActions === post.id ? null : post.id);
                  }}
                  className="p-1 rounded hover:bg-muted"
                >
                  <MoreVertical className="h-4 w-4 text-muted-foreground" />
                </button>
                {showActions === post.id && (
                  <div className="absolute right-0 top-full mt-1 bg-background border rounded-md shadow-md z-10 min-w-[120px]">
                    {isPostAuthor && (
                      <button
                        className="flex items-center gap-2 w-full px-3 py-1.5 text-xs hover:bg-muted"
                        onClick={() => {
                          setEditingPostId(post.id);
                          setEditBody(post.body);
                          setShowActions(null);
                        }}
                      >
                        <Edit2 className="h-3 w-3" />
                        Edit
                      </button>
                    )}
                    <button
                      className="flex items-center gap-2 w-full px-3 py-1.5 text-xs text-destructive hover:bg-muted"
                      onClick={() => {
                        handleDeletePost(post.id);
                        setShowActions(null);
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                      Delete
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {editingPostId === post.id ? (
            <div className="mt-2 space-y-2">
              <Textarea
                value={editBody}
                onChange={(e) => setEditBody(e.target.value)}
                rows={3}
              />
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditingPostId(null);
                    setEditBody("");
                  }}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleEditPost(post.id)}
                  disabled={isPending}
                >
                  Save
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-sm mt-1.5 whitespace-pre-wrap">{post.body}</p>
          )}

          {!thread.is_locked && !editingPostId && (
            <button
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mt-2"
              onClick={() => {
                setReplyingTo(replyingTo === post.id ? null : post.id);
                setReplyBody("");
              }}
            >
              <Reply className="h-3 w-3" />
              Reply
            </button>
          )}

          {replyingTo === post.id && (
            <div className="mt-2 ml-4 space-y-2">
              <Textarea
                value={replyBody}
                onChange={(e) => setReplyBody(e.target.value)}
                placeholder="Write a reply..."
                rows={2}
                autoFocus
              />
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setReplyingTo(null)}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleReply}
                  disabled={isPending || !replyBody.trim()}
                >
                  {isPending ? "Posting..." : "Reply"}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Nested replies */}
        {childReplies.map((child) => renderPost(child, depth + 1))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Back link */}
      <button
        onClick={() => router.push(`${basePath}/discussions`)}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Discussions
      </button>

      {/* Thread Header */}
      <Card className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              {thread.is_pinned && (
                <Pin className="h-4 w-4 text-primary shrink-0" />
              )}
              {thread.is_locked && (
                <Lock className="h-4 w-4 text-muted-foreground shrink-0" />
              )}
              <h1 className="text-xl font-bold">{thread.title}</h1>
            </div>
            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <User className="h-3 w-3" />
                {thread.author_name}
                {thread.author_role !== "student" && (
                  <Badge
                    variant="secondary"
                    className="text-[10px] px-1 py-0 ml-0.5"
                  >
                    {thread.author_role === "super_admin"
                      ? "Admin"
                      : "Instructor"}
                  </Badge>
                )}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {timeAgo(thread.created_at)}
              </span>
              <span className="flex items-center gap-1">
                <MessageSquare className="h-3 w-3" />
                {thread.reply_count}{" "}
                {thread.reply_count === 1 ? "reply" : "replies"}
              </span>
            </div>
          </div>

          {/* Moderation actions */}
          {(canModerate || isAuthor) && (
            <div className="flex items-center gap-1">
              {canModerate && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      startTransition(async () => { await onTogglePin(); })
                    }
                    title={thread.is_pinned ? "Unpin" : "Pin"}
                  >
                    <Pin
                      className={`h-4 w-4 ${thread.is_pinned ? "text-primary" : ""}`}
                    />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      startTransition(async () => { await onToggleLock(); })
                    }
                    title={thread.is_locked ? "Unlock" : "Lock"}
                  >
                    <Lock
                      className={`h-4 w-4 ${thread.is_locked ? "text-destructive" : ""}`}
                    />
                  </Button>
                </>
              )}
              {(isAuthor || canModerate) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDeleteThread}
                  title="Delete thread"
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Thread body */}
        <div className="mt-4 pt-4 border-t">
          <p className="text-sm whitespace-pre-wrap">{thread.body}</p>
        </div>
      </Card>

      {/* Replies */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground mb-3">
          {thread.reply_count}{" "}
          {thread.reply_count === 1 ? "Reply" : "Replies"}
        </h2>

        {topLevelPosts.length > 0 ? (
          <Card className="divide-y">
            <div className="px-4">
              {topLevelPosts.map((post) => renderPost(post))}
            </div>
          </Card>
        ) : (
          <Card className="p-6 text-center">
            <p className="text-sm text-muted-foreground">
              No replies yet. Be the first to respond!
            </p>
          </Card>
        )}
      </div>

      {/* Reply form (top-level) */}
      {!thread.is_locked ? (
        <Card className="p-4">
          <h3 className="text-sm font-medium mb-2">Add a Reply</h3>
          <Textarea
            value={replyingTo ? "" : replyBody}
            onChange={(e) => {
              if (!replyingTo) setReplyBody(e.target.value);
            }}
            placeholder="Write your reply..."
            rows={3}
            disabled={!!replyingTo}
          />
          <div className="flex justify-end mt-2">
            <Button
              size="sm"
              onClick={() => {
                if (replyingTo) return;
                startTransition(async () => {
                  const result = await onCreatePost({ body: replyBody });
                  if (result.success) setReplyBody("");
                });
              }}
              disabled={isPending || !replyBody.trim() || !!replyingTo}
            >
              {isPending ? "Posting..." : "Post Reply"}
            </Button>
          </div>
        </Card>
      ) : (
        <Card className="p-4 text-center bg-muted/50">
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Lock className="h-4 w-4" />
            This discussion is locked. No new replies can be posted.
          </div>
        </Card>
      )}
    </div>
  );
}
