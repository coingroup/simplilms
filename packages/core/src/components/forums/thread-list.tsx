"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button, Badge, Card, Input, Textarea } from "@simplilms/ui";
import {
  MessageSquare,
  Pin,
  Lock,
  Plus,
  Search,
  Clock,
  User,
} from "lucide-react";
import type { DiscussionThreadRow } from "../../actions/forums";

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

interface ThreadListProps {
  threads: DiscussionThreadRow[];
  courseId: string;
  basePath: string; // "/student/courses/{id}" or "/admin/courses/{id}"
  canModerate: boolean;
  onCreateThread: (data: {
    title: string;
    body: string;
  }) => Promise<{ success: boolean; error?: string; id?: string }>;
}

export function ThreadList({
  threads,
  courseId,
  basePath,
  canModerate,
  onCreateThread,
}: ThreadListProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const filtered = threads.filter(
    (t) =>
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.body.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = () => {
    setError("");
    startTransition(async () => {
      const result = await onCreateThread({ title, body });
      if (result.success && result.id) {
        setTitle("");
        setBody("");
        setShowForm(false);
        router.push(`${basePath}/discussions/${result.id}`);
      } else {
        setError(result.error || "Failed to create thread");
      }
    });
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search discussions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button onClick={() => setShowForm(!showForm)} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          New Discussion
        </Button>
      </div>

      {/* Create Thread Form */}
      {showForm && (
        <Card className="p-4 space-y-3 border-primary/20">
          <Input
            placeholder="Discussion title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Textarea
            placeholder="What would you like to discuss?"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={4}
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex items-center gap-2 justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setShowForm(false);
                setError("");
              }}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleCreate}
              disabled={isPending || !title.trim() || !body.trim()}
            >
              {isPending ? "Creating..." : "Post Discussion"}
            </Button>
          </div>
        </Card>
      )}

      {/* Thread List */}
      {filtered.length === 0 ? (
        <Card className="p-8 text-center">
          <MessageSquare className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">
            {search
              ? "No discussions match your search."
              : "No discussions yet. Start the conversation!"}
          </p>
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((thread) => (
            <Card
              key={thread.id}
              className="p-4 hover:bg-muted/50 transition-colors cursor-pointer"
              onClick={() =>
                router.push(`${basePath}/discussions/${thread.id}`)
              }
            >
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    {thread.is_pinned && (
                      <Pin className="h-3.5 w-3.5 text-primary shrink-0" />
                    )}
                    {thread.is_locked && (
                      <Lock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    )}
                    <h3 className="font-medium text-sm truncate">
                      {thread.title}
                    </h3>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                    {thread.body}
                  </p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {thread.author_name}
                      {thread.author_role !== "student" && (
                        <Badge variant="secondary" className="text-[10px] px-1 py-0 ml-0.5">
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
                  </div>
                </div>
                <div className="flex flex-col items-center text-center shrink-0">
                  <span className="text-lg font-semibold text-muted-foreground">
                    {thread.reply_count}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {thread.reply_count === 1 ? "reply" : "replies"}
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
