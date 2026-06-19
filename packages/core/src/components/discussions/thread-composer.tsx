"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button, Input, Textarea, Card, CardContent, CardHeader, CardTitle } from "@simplilms/ui";
import { MessageSquare, Loader2 } from "lucide-react";
import { createDiscussionThread } from "@simplilms/core/actions/discussions";

interface ThreadComposerProps {
  courseId: string;
}

export function ThreadComposer({ courseId }: ThreadComposerProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await createDiscussionThread(courseId, title, body);
      if (result.success && result.threadId) {
        router.push(`/student/courses/${courseId}/discuss/${result.threadId}`);
      } else {
        setError(result.error ?? "Failed to create thread");
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <MessageSquare className="h-5 w-5 text-primary" />
          Start a New Discussion
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="thread-title" className="text-sm font-medium text-gray-700">
              Title
            </label>
            <Input
              id="thread-title"
              placeholder="What would you like to discuss?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isPending}
              required
              maxLength={200}
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="thread-body" className="text-sm font-medium text-gray-700">
              Details
            </label>
            <Textarea
              id="thread-body"
              placeholder="Describe your question or topic in detail..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              disabled={isPending}
              required
              rows={6}
              className="resize-none"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(`/student/courses/${courseId}/discuss`)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || !title.trim() || !body.trim()}>
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Posting...
                </>
              ) : (
                "Post Discussion"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
