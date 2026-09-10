import { requireRole } from "@simplilms/auth/server";
import { notFound } from "next/navigation";
import {
  getThreadById,
  getPostsByThread,
  createPost,
  updatePost,
  deletePost,
  toggleThreadPin,
  toggleThreadLock,
  deleteThread,
} from "@simplilms/core/actions/forums";
import { ThreadDetail } from "@simplilms/core/components/forums/thread-detail";

interface PageProps {
  params: Promise<{ courseId: string; threadId: string }>;
}

export const metadata = { title: "Discussion Thread — Admin" };

export default async function AdminThreadPage({ params }: PageProps) {
  const user = await requireRole(["super_admin"]);
  const { courseId, threadId } = await params;

  const thread = await getThreadById(threadId);
  if (!thread || thread.course_id !== courseId) notFound();

  const posts = await getPostsByThread(threadId);

  const boundCreatePost = async (data: { body: string; parentPostId?: string }) => {
    "use server";
    return createPost(threadId, courseId, data);
  };

  const boundUpdatePost = async (postId: string, data: { body: string }) => {
    "use server";
    return updatePost(postId, threadId, courseId, data);
  };

  const boundDeletePost = async (postId: string) => {
    "use server";
    return deletePost(postId, threadId, courseId);
  };

  const boundTogglePin = async () => {
    "use server";
    return toggleThreadPin(threadId, courseId);
  };

  const boundToggleLock = async () => {
    "use server";
    return toggleThreadLock(threadId, courseId);
  };

  const boundDeleteThread = async () => {
    "use server";
    return deleteThread(threadId, courseId);
  };

  return (
    <ThreadDetail
      thread={thread}
      posts={posts}
      courseId={courseId}
      currentUserId={user.user.id}
      currentUserRole={user.role}
      basePath={`/admin/courses/${courseId}`}
      onCreatePost={boundCreatePost}
      onUpdatePost={boundUpdatePost}
      onDeletePost={boundDeletePost}
      onTogglePin={boundTogglePin}
      onToggleLock={boundToggleLock}
      onDeleteThread={boundDeleteThread}
    />
  );
}
