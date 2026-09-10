"use server";

import { revalidatePath } from "next/cache";
import { createServerClient, getUser } from "@simplilms/auth/server";
import { getTenantId } from "../lib/tenant";

function revalidateDiscussionList(courseId: string) {
  revalidatePath(`/student/courses/${courseId}/discussions`);
  revalidatePath(`/teacher/courses/${courseId}/discussions`);
  revalidatePath(`/admin/courses/${courseId}/discussions`);
}

function revalidateDiscussionThread(courseId: string, threadId: string) {
  revalidateDiscussionList(courseId);
  revalidatePath(`/student/courses/${courseId}/discussions/${threadId}`);
  revalidatePath(`/teacher/courses/${courseId}/discussions/${threadId}`);
  revalidatePath(`/admin/courses/${courseId}/discussions/${threadId}`);
}

// ============================================================
// Types
// ============================================================

export interface DiscussionThreadRow {
  id: string;
  tenant_id: string;
  course_id: string;
  author_id: string;
  title: string;
  body: string;
  is_pinned: boolean;
  is_locked: boolean;
  reply_count: number;
  last_activity_at: string;
  created_at: string;
  updated_at: string;
  author_name?: string;
  author_role?: string;
}

export interface DiscussionPostRow {
  id: string;
  tenant_id: string;
  thread_id: string;
  author_id: string;
  parent_post_id: string | null;
  body: string;
  is_edited: boolean;
  edited_at: string | null;
  created_at: string;
  updated_at: string;
  author_name?: string;
  author_role?: string;
}

// ============================================================
// Queries
// ============================================================

export async function getThreadsByCourse(
  courseId: string
): Promise<DiscussionThreadRow[]> {
  const supabase = await createServerClient();
  const { data, error } = await (supabase as any)
    .from("discussion_threads")
    .select("*, profiles:author_id(first_name, last_name, role)")
    .eq("course_id", courseId)
    .order("is_pinned", { ascending: false })
    .order("last_activity_at", { ascending: false });

  if (error) {
    console.error("Error fetching discussion threads:", error);
    return [];
  }

  return ((data || []) as any[]).map((row) => ({
    ...row,
    author_name: row.profiles
      ? `${row.profiles.first_name || ""} ${row.profiles.last_name || ""}`.trim() || "Unknown"
      : "Unknown",
    author_role: row.profiles?.role || "student",
    profiles: undefined,
  })) as DiscussionThreadRow[];
}

export async function getThreadById(
  threadId: string
): Promise<DiscussionThreadRow | null> {
  const supabase = await createServerClient();
  const { data, error } = await (supabase as any)
    .from("discussion_threads")
    .select("*, profiles:author_id(first_name, last_name, role)")
    .eq("id", threadId)
    .single();

  if (error) {
    console.error("Error fetching thread:", error);
    return null;
  }

  return {
    ...data,
    author_name: data.profiles
      ? `${data.profiles.first_name || ""} ${data.profiles.last_name || ""}`.trim() || "Unknown"
      : "Unknown",
    author_role: data.profiles?.role || "student",
    profiles: undefined,
  } as DiscussionThreadRow;
}

export async function getPostsByThread(
  threadId: string
): Promise<DiscussionPostRow[]> {
  const supabase = await createServerClient();
  const { data, error } = await (supabase as any)
    .from("discussion_posts")
    .select("*, profiles:author_id(first_name, last_name, role)")
    .eq("thread_id", threadId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching discussion posts:", error);
    return [];
  }

  return ((data || []) as any[]).map((row) => ({
    ...row,
    author_name: row.profiles
      ? `${row.profiles.first_name || ""} ${row.profiles.last_name || ""}`.trim() || "Unknown"
      : "Unknown",
    author_role: row.profiles?.role || "student",
    profiles: undefined,
  })) as DiscussionPostRow[];
}

export async function getCourseThreadCount(
  courseId: string
): Promise<number> {
  const supabase = await createServerClient();
  const { count, error } = await (supabase as any)
    .from("discussion_threads")
    .select("id", { count: "exact", head: true })
    .eq("course_id", courseId);

  if (error) {
    console.error("Error fetching thread count:", error);
    return 0;
  }
  return count || 0;
}

// ============================================================
// Mutations — Threads
// ============================================================

export async function createThread(
  courseId: string,
  data: { title: string; body: string }
): Promise<{ success: boolean; error?: string; id?: string }> {
  try {
    const { user, error: authError } = await getUser();
    if (authError || !user) return { success: false, error: "Unauthorized" };

    if (!data.title.trim()) {
      return { success: false, error: "Thread title is required" };
    }
    if (data.title.length > 200) {
      return { success: false, error: "Title must be under 200 characters" };
    }
    if (!data.body.trim()) {
      return { success: false, error: "Thread body is required" };
    }
    if (data.body.length > 10000) {
      return { success: false, error: "Content must be under 10,000 characters" };
    }

    const supabase = await createServerClient();
    const tenantId = getTenantId();

    const { data: thread, error } = await (supabase as any)
      .from("discussion_threads")
      .insert({
        tenant_id: tenantId,
        course_id: courseId,
        author_id: user.user.id,
        title: data.title.trim(),
        body: data.body.trim(),
      })
      .select("id")
      .single();

    if (error) {
      console.error("Error creating thread:", error);
      return { success: false, error: "Failed to create thread" };
    }

    revalidateDiscussionList(courseId);
    return { success: true, id: thread.id };
  } catch (err) {
    console.error("createThread error:", err);
    return { success: false, error: "An unexpected error occurred" };
  }
}

export async function updateThread(
  threadId: string,
  courseId: string,
  data: { title?: string; body?: string }
): Promise<{ success: boolean; error?: string }> {
  try {
    const { user, error: authError } = await getUser();
    if (authError || !user) return { success: false, error: "Unauthorized" };

    // Verify ownership — only author or admin can update
    const thread = await getThreadById(threadId);
    if (!thread) return { success: false, error: "Thread not found" };
    if (thread.author_id !== user.user.id && user.role !== "super_admin") {
      return { success: false, error: "You can only edit your own threads" };
    }

    const supabase = await createServerClient();
    const updateData: Record<string, unknown> = {};
    if (data.title !== undefined) updateData.title = data.title.trim();
    if (data.body !== undefined) updateData.body = data.body.trim();

    const { error } = await (supabase as any)
      .from("discussion_threads")
      .update(updateData)
      .eq("id", threadId);

    if (error) {
      console.error("Error updating thread:", error);
      return { success: false, error: "Failed to update thread" };
    }

    revalidateDiscussionThread(courseId, threadId);
    return { success: true };
  } catch (err) {
    console.error("updateThread error:", err);
    return { success: false, error: "An unexpected error occurred" };
  }
}

export async function toggleThreadPin(
  threadId: string,
  courseId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { user, error: authError } = await getUser();
    if (authError || !user) return { success: false, error: "Unauthorized" };

    if (!["super_admin", "teacher_paid", "teacher_unpaid"].includes(user.role)) {
      return { success: false, error: "Insufficient permissions" };
    }

    const thread = await getThreadById(threadId);
    if (!thread) return { success: false, error: "Thread not found" };

    const supabase = await createServerClient();
    const { error } = await (supabase as any)
      .from("discussion_threads")
      .update({ is_pinned: !thread.is_pinned })
      .eq("id", threadId);

    if (error) {
      console.error("Error toggling thread pin:", error);
      return { success: false, error: "Failed to update thread" };
    }

    revalidateDiscussionList(courseId);
    return { success: true };
  } catch (err) {
    console.error("toggleThreadPin error:", err);
    return { success: false, error: "An unexpected error occurred" };
  }
}

export async function toggleThreadLock(
  threadId: string,
  courseId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { user, error: authError } = await getUser();
    if (authError || !user) return { success: false, error: "Unauthorized" };

    if (!["super_admin", "teacher_paid", "teacher_unpaid"].includes(user.role)) {
      return { success: false, error: "Insufficient permissions" };
    }

    const thread = await getThreadById(threadId);
    if (!thread) return { success: false, error: "Thread not found" };

    const supabase = await createServerClient();
    const { error } = await (supabase as any)
      .from("discussion_threads")
      .update({ is_locked: !thread.is_locked })
      .eq("id", threadId);

    if (error) {
      console.error("Error toggling thread lock:", error);
      return { success: false, error: "Failed to update thread" };
    }

    revalidateDiscussionThread(courseId, threadId);
    return { success: true };
  } catch (err) {
    console.error("toggleThreadLock error:", err);
    return { success: false, error: "An unexpected error occurred" };
  }
}

export async function deleteThread(
  threadId: string,
  courseId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { user, error: authError } = await getUser();
    if (authError || !user) return { success: false, error: "Unauthorized" };

    // Verify ownership — only author, teacher (of course), or admin can delete
    const thread = await getThreadById(threadId);
    if (!thread) return { success: false, error: "Thread not found" };
    const canModerate = ["super_admin", "teacher_paid", "teacher_unpaid"].includes(user.role);
    if (thread.author_id !== user.user.id && !canModerate) {
      return { success: false, error: "You can only delete your own threads" };
    }

    const supabase = await createServerClient();
    const { error } = await (supabase as any)
      .from("discussion_threads")
      .delete()
      .eq("id", threadId);

    if (error) {
      console.error("Error deleting thread:", error);
      return { success: false, error: "Failed to delete thread" };
    }

    revalidateDiscussionList(courseId);
    return { success: true };
  } catch (err) {
    console.error("deleteThread error:", err);
    return { success: false, error: "An unexpected error occurred" };
  }
}

// ============================================================
// Mutations — Posts (Replies)
// ============================================================

export async function createPost(
  threadId: string,
  courseId: string,
  data: { body: string; parentPostId?: string }
): Promise<{ success: boolean; error?: string; id?: string }> {
  try {
    const { user, error: authError } = await getUser();
    if (authError || !user) return { success: false, error: "Unauthorized" };

    if (!data.body.trim()) {
      return { success: false, error: "Reply body is required" };
    }
    if (data.body.length > 10000) {
      return { success: false, error: "Content must be under 10,000 characters" };
    }

    const supabase = await createServerClient();
    const tenantId = getTenantId();

    const { data: post, error } = await (supabase as any)
      .from("discussion_posts")
      .insert({
        tenant_id: tenantId,
        thread_id: threadId,
        author_id: user.user.id,
        parent_post_id: data.parentPostId || null,
        body: data.body.trim(),
      })
      .select("id")
      .single();

    if (error) {
      console.error("Error creating post:", error);
      return { success: false, error: "Failed to create reply" };
    }

    revalidateDiscussionThread(courseId, threadId);
    return { success: true, id: post.id };
  } catch (err) {
    console.error("createPost error:", err);
    return { success: false, error: "An unexpected error occurred" };
  }
}

export async function updatePost(
  postId: string,
  threadId: string,
  courseId: string,
  data: { body: string }
): Promise<{ success: boolean; error?: string }> {
  try {
    const { user, error: authError } = await getUser();
    if (authError || !user) return { success: false, error: "Unauthorized" };

    if (!data.body.trim()) {
      return { success: false, error: "Reply body is required" };
    }
    if (data.body.length > 10000) {
      return { success: false, error: "Content must be under 10,000 characters" };
    }

    // Verify ownership — only author or admin can edit
    const supabase = await createServerClient();
    const { data: post } = await (supabase as any)
      .from("discussion_posts")
      .select("author_id")
      .eq("id", postId)
      .single();

    if (!post) return { success: false, error: "Post not found" };
    if (post.author_id !== user.user.id && user.role !== "super_admin") {
      return { success: false, error: "You can only edit your own posts" };
    }

    const { error } = await (supabase as any)
      .from("discussion_posts")
      .update({
        body: data.body.trim(),
        is_edited: true,
        edited_at: new Date().toISOString(),
      })
      .eq("id", postId);

    if (error) {
      console.error("Error updating post:", error);
      return { success: false, error: "Failed to update reply" };
    }

    revalidateDiscussionThread(courseId, threadId);
    return { success: true };
  } catch (err) {
    console.error("updatePost error:", err);
    return { success: false, error: "An unexpected error occurred" };
  }
}

export async function deletePost(
  postId: string,
  threadId: string,
  courseId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { user, error: authError } = await getUser();
    if (authError || !user) return { success: false, error: "Unauthorized" };

    // Verify ownership — only author, teacher (of course), or admin can delete
    const supabase = await createServerClient();
    const { data: post } = await (supabase as any)
      .from("discussion_posts")
      .select("author_id")
      .eq("id", postId)
      .single();

    if (!post) return { success: false, error: "Post not found" };
    const canModerate = ["super_admin", "teacher_paid", "teacher_unpaid"].includes(user.role);
    if (post.author_id !== user.user.id && !canModerate) {
      return { success: false, error: "You can only delete your own posts" };
    }

    const { error } = await (supabase as any)
      .from("discussion_posts")
      .delete()
      .eq("id", postId);

    if (error) {
      console.error("Error deleting post:", error);
      return { success: false, error: "Failed to delete reply" };
    }

    revalidateDiscussionThread(courseId, threadId);
    return { success: true };
  } catch (err) {
    console.error("deletePost error:", err);
    return { success: false, error: "An unexpected error occurred" };
  }
}
