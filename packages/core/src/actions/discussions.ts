"use server";

import { revalidatePath } from "next/cache";
import { createServerClient, getUser } from "@simplilms/auth/server";
import { getTenantId } from "../lib/tenant";

// ============================================================
// Types
// ============================================================

export interface DiscussionAuthor {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  role: string | null;
}

export interface DiscussionThreadRow {
  id: string;
  tenant_id: string;
  course_id: string;
  title: string;
  body: string;
  author_id: string;
  is_pinned: boolean;
  is_locked: boolean;
  reply_count: number;
  last_reply_at: string | null;
  created_at: string;
  updated_at: string;
  author?: DiscussionAuthor;
}

export interface DiscussionPostRow {
  id: string;
  tenant_id: string;
  thread_id: string;
  author_id: string;
  body: string;
  is_instructor_post: boolean;
  created_at: string;
  updated_at: string;
  author?: DiscussionAuthor;
}

export interface ThreadWithPosts extends DiscussionThreadRow {
  posts: DiscussionPostRow[];
}

// ============================================================
// Helpers
// ============================================================

const ALLOWED_ROLES = ["super_admin", "school_rep", "student", "teacher_paid", "teacher_unpaid"] as const;
const ADMIN_ROLES = ["super_admin", "school_rep"] as const;

function isAdminRole(role: string): boolean {
  return (ADMIN_ROLES as readonly string[]).includes(role);
}

function isAllowedRole(role: string): boolean {
  return (ALLOWED_ROLES as readonly string[]).includes(role);
}

// ============================================================
// Queries
// ============================================================

/**
 * List all discussion threads for a course, ordered by pinned first then last_reply_at.
 */
export async function getDiscussionThreads(
  courseId: string
): Promise<DiscussionThreadRow[]> {
  const { user, error: authError } = await getUser();
  if (authError || !user || !isAllowedRole(user.role)) return [];

  const supabase = await createServerClient();

  const { data, error } = await (supabase as any)
    .from("discussion_threads")
    .select(
      `
      *,
      author:profiles!discussion_threads_author_id_fkey(id, full_name, avatar_url, role)
    `
    )
    .eq("course_id", courseId)
    .order("is_pinned", { ascending: false })
    .order("last_reply_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getDiscussionThreads error:", error);
    return [];
  }

  return (data ?? []) as DiscussionThreadRow[];
}

/**
 * Fetch a single thread with all its posts and author profiles.
 */
export async function getDiscussionThread(
  threadId: string
): Promise<ThreadWithPosts | null> {
  const { user, error: authError } = await getUser();
  if (authError || !user || !isAllowedRole(user.role)) return null;

  const supabase = await createServerClient();

  const { data: thread, error: threadError } = await (supabase as any)
    .from("discussion_threads")
    .select(
      `
      *,
      author:profiles!discussion_threads_author_id_fkey(id, full_name, avatar_url, role)
    `
    )
    .eq("id", threadId)
    .single();

  if (threadError || !thread) {
    console.error("getDiscussionThread error:", threadError);
    return null;
  }

  const { data: posts, error: postsError } = await (supabase as any)
    .from("discussion_posts")
    .select(
      `
      *,
      author:profiles!discussion_posts_author_id_fkey(id, full_name, avatar_url, role)
    `
    )
    .eq("thread_id", threadId)
    .order("created_at", { ascending: true });

  if (postsError) {
    console.error("getDiscussionThread posts error:", postsError);
  }

  return {
    ...thread,
    posts: (posts ?? []) as DiscussionPostRow[],
  } as ThreadWithPosts;
}

// ============================================================
// Mutations
// ============================================================

/**
 * Create a new discussion thread in a course.
 * Any enrolled student, course teacher, or admin may post.
 */
export async function createDiscussionThread(
  courseId: string,
  title: string,
  body: string
): Promise<{ success: boolean; threadId?: string; error?: string }> {
  try {
    const { user, error: authError } = await getUser();
    if (authError || !user) return { success: false, error: "Unauthorized" };
    if (!isAllowedRole(user.role)) return { success: false, error: "Forbidden" };

    const trimmedTitle = title.trim();
    const trimmedBody = body.trim();
    if (!trimmedTitle) return { success: false, error: "Title is required" };
    if (!trimmedBody) return { success: false, error: "Body is required" };

    const tenantId = await getTenantId();
    const supabase = await createServerClient();

    const { data, error } = await (supabase as any)
      .from("discussion_threads")
      .insert({
        tenant_id: tenantId,
        course_id: courseId,
        title: trimmedTitle,
        body: trimmedBody,
        author_id: user.user.id,
        is_pinned: false,
        is_locked: false,
      })
      .select("id")
      .single();

    if (error) {
      console.error("createDiscussionThread error:", error);
      return { success: false, error: error.message };
    }

    revalidatePath(`/student/courses/${courseId}/discuss`);
    revalidatePath(`/admin/courses/${courseId}/discussions`);

    return { success: true, threadId: data.id };
  } catch (err) {
    console.error("createDiscussionThread unexpected error:", err);
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Create a reply post within a thread.
 * Any enrolled user may reply unless the thread is locked (enforced at app layer).
 */
export async function createDiscussionPost(
  threadId: string,
  body: string
): Promise<{ success: boolean; postId?: string; error?: string }> {
  try {
    const { user, error: authError } = await getUser();
    if (authError || !user) return { success: false, error: "Unauthorized" };
    if (!isAllowedRole(user.role)) return { success: false, error: "Forbidden" };

    const trimmedBody = body.trim();
    if (!trimmedBody) return { success: false, error: "Reply cannot be empty" };

    // Fetch the thread to get course_id, tenant_id, and lock status
    const supabase = await createServerClient();
    const { data: thread, error: threadError } = await (supabase as any)
      .from("discussion_threads")
      .select("id, course_id, tenant_id, is_locked")
      .eq("id", threadId)
      .single();

    if (threadError || !thread) {
      return { success: false, error: "Thread not found" };
    }

    if (thread.is_locked && !isAdminRole(user.role)) {
      return { success: false, error: "This thread is locked" };
    }

    const isInstructorPost = ["teacher_paid", "teacher_unpaid", "super_admin", "school_rep"].includes(user.role);

    const { data, error } = await (supabase as any)
      .from("discussion_posts")
      .insert({
        tenant_id: thread.tenant_id,
        thread_id: threadId,
        author_id: user.user.id,
        body: trimmedBody,
        is_instructor_post: isInstructorPost,
      })
      .select("id")
      .single();

    if (error) {
      console.error("createDiscussionPost error:", error);
      return { success: false, error: error.message };
    }

    revalidatePath(`/student/courses/${thread.course_id}/discuss/${threadId}`);
    revalidatePath(`/admin/courses/${thread.course_id}/discussions`);

    return { success: true, postId: data.id };
  } catch (err) {
    console.error("createDiscussionPost unexpected error:", err);
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Pin a thread. Admin only.
 */
export async function pinThread(
  threadId: string
): Promise<{ success: boolean; error?: string }> {
  return setThreadPinned(threadId, true);
}

/**
 * Unpin a thread. Admin only.
 */
export async function unpinThread(
  threadId: string
): Promise<{ success: boolean; error?: string }> {
  return setThreadPinned(threadId, false);
}

async function setThreadPinned(
  threadId: string,
  pinned: boolean
): Promise<{ success: boolean; error?: string }> {
  try {
    const { user, error: authError } = await getUser();
    if (authError || !user) return { success: false, error: "Unauthorized" };
    if (!isAdminRole(user.role)) return { success: false, error: "Forbidden: admins only" };

    const supabase = await createServerClient();

    const { data: thread, error: fetchError } = await (supabase as any)
      .from("discussion_threads")
      .select("course_id")
      .eq("id", threadId)
      .single();

    if (fetchError || !thread) return { success: false, error: "Thread not found" };

    const { error } = await (supabase as any)
      .from("discussion_threads")
      .update({ is_pinned: pinned })
      .eq("id", threadId);

    if (error) {
      console.error("setThreadPinned error:", error);
      return { success: false, error: error.message };
    }

    revalidatePath(`/student/courses/${thread.course_id}/discuss`);
    revalidatePath(`/admin/courses/${thread.course_id}/discussions`);

    return { success: true };
  } catch (err) {
    console.error("setThreadPinned unexpected error:", err);
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Lock a thread. Admin only.
 */
export async function lockThread(
  threadId: string,
  locked = true
): Promise<{ success: boolean; error?: string }> {
  try {
    const { user, error: authError } = await getUser();
    if (authError || !user) return { success: false, error: "Unauthorized" };
    if (!isAdminRole(user.role)) return { success: false, error: "Forbidden: admins only" };

    const supabase = await createServerClient();

    const { data: thread, error: fetchError } = await (supabase as any)
      .from("discussion_threads")
      .select("course_id")
      .eq("id", threadId)
      .single();

    if (fetchError || !thread) return { success: false, error: "Thread not found" };

    const { error } = await (supabase as any)
      .from("discussion_threads")
      .update({ is_locked: locked })
      .eq("id", threadId);

    if (error) {
      console.error("lockThread error:", error);
      return { success: false, error: error.message };
    }

    revalidatePath(`/student/courses/${thread.course_id}/discuss`);
    revalidatePath(`/student/courses/${thread.course_id}/discuss/${threadId}`);
    revalidatePath(`/admin/courses/${thread.course_id}/discussions`);

    return { success: true };
  } catch (err) {
    console.error("lockThread unexpected error:", err);
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Delete a thread. Admin only.
 */
export async function deleteThread(
  threadId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { user, error: authError } = await getUser();
    if (authError || !user) return { success: false, error: "Unauthorized" };
    if (!isAdminRole(user.role)) return { success: false, error: "Forbidden: admins only" };

    const supabase = await createServerClient();

    const { data: thread, error: fetchError } = await (supabase as any)
      .from("discussion_threads")
      .select("course_id")
      .eq("id", threadId)
      .single();

    if (fetchError || !thread) return { success: false, error: "Thread not found" };

    const { error } = await (supabase as any)
      .from("discussion_threads")
      .delete()
      .eq("id", threadId);

    if (error) {
      console.error("deleteThread error:", error);
      return { success: false, error: error.message };
    }

    revalidatePath(`/student/courses/${thread.course_id}/discuss`);
    revalidatePath(`/admin/courses/${thread.course_id}/discussions`);

    return { success: true };
  } catch (err) {
    console.error("deleteThread unexpected error:", err);
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Delete a post. Admin or post author.
 */
export async function deletePost(
  postId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { user, error: authError } = await getUser();
    if (authError || !user) return { success: false, error: "Unauthorized" };
    if (!isAllowedRole(user.role)) return { success: false, error: "Forbidden" };

    const supabase = await createServerClient();

    const { data: post, error: fetchError } = await (supabase as any)
      .from("discussion_posts")
      .select("author_id, thread_id, discussion_threads!inner(course_id)")
      .eq("id", postId)
      .single();

    if (fetchError || !post) return { success: false, error: "Post not found" };

    // Only admin or the author may delete
    if (!isAdminRole(user.role) && post.author_id !== user.user.id) {
      return { success: false, error: "Forbidden" };
    }

    const { error } = await (supabase as any)
      .from("discussion_posts")
      .delete()
      .eq("id", postId);

    if (error) {
      console.error("deletePost error:", error);
      return { success: false, error: error.message };
    }

    const courseId = post.discussion_threads?.course_id;
    if (courseId) {
      revalidatePath(`/student/courses/${courseId}/discuss/${post.thread_id}`);
      revalidatePath(`/admin/courses/${courseId}/discussions`);
    }

    return { success: true };
  } catch (err) {
    console.error("deletePost unexpected error:", err);
    return { success: false, error: "An unexpected error occurred" };
  }
}
