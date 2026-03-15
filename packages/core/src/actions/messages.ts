"use server";

import { revalidatePath } from "next/cache";
import { createServerClient, getUser } from "@simplilms/auth/server";
import { getTenantId } from "../lib/tenant";

/**
 * Mark a single message as read.
 * Any authenticated user can mark their own messages (RLS enforces recipient_id = auth.uid).
 */
export async function markMessageAsRead(messageId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { user, error: authError } = await getUser();
    if (authError || !user) {
      return { success: false, error: "Unauthorized" };
    }

    const supabase = await createServerClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from("messages")
      .update({
        is_read: true,
        read_at: new Date().toISOString(),
      })
      .eq("id", messageId)
      .eq("recipient_id", user.user.id);

    if (error) {
      console.error("Error marking message as read:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/student/messages");
    revalidatePath("/student");
    revalidatePath("/teacher/messages");
    revalidatePath("/teacher");
    return { success: true };
  } catch (err) {
    console.error("markMessageAsRead error:", err);
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Mark all unread messages as read for the current user.
 */
export async function markAllMessagesAsRead(): Promise<{ success: boolean; error?: string }> {
  try {
    const { user, error: authError } = await getUser();
    if (authError || !user) {
      return { success: false, error: "Unauthorized" };
    }

    const supabase = await createServerClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from("messages")
      .update({
        is_read: true,
        read_at: new Date().toISOString(),
      })
      .eq("recipient_id", user.user.id)
      .eq("is_read", false);

    if (error) {
      console.error("Error marking all messages as read:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/student/messages");
    revalidatePath("/student");
    revalidatePath("/teacher/messages");
    revalidatePath("/teacher");
    return { success: true };
  } catch (err) {
    console.error("markAllMessagesAsRead error:", err);
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Send a message to a specific student.
 * Only super_admin and school_rep can send messages.
 */
export async function sendMessage(data: {
  recipientId: string;
  subject: string;
  body: string;
  messageType: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const { user, error: authError } = await getUser();
    if (authError || !user) {
      return { success: false, error: "Unauthorized" };
    }

    if (!["super_admin", "school_rep", "teacher_paid", "teacher_unpaid"].includes(user.role)) {
      return { success: false, error: "Insufficient permissions" };
    }

    if (!data.body.trim()) {
      return { success: false, error: "Message body is required" };
    }

    const tenantId = getTenantId();
    const supabase = await createServerClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from("messages")
      .insert({
        tenant_id: tenantId,
        sender_id: user.user.id,
        recipient_id: data.recipientId,
        subject: data.subject?.trim() || null,
        body: data.body.trim(),
        message_type: data.messageType || "general",
        is_system: false,
        is_read: false,
      });

    if (error) {
      console.error("Error sending message:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/admin/messages");
    revalidatePath("/rep/messages");
    revalidatePath("/teacher/messages");
    return { success: true };
  } catch (err) {
    console.error("sendMessage error:", err);
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Broadcast a message to all students.
 * Only super_admin can broadcast.
 */
export async function sendBroadcastMessage(data: {
  subject: string;
  body: string;
  messageType: string;
}): Promise<{ success: boolean; error?: string; sentCount?: number }> {
  try {
    const { user, error: authError } = await getUser();
    if (authError || !user) {
      return { success: false, error: "Unauthorized" };
    }

    if (user.role !== "super_admin") {
      return { success: false, error: "Only admins can broadcast messages" };
    }

    if (!data.body.trim()) {
      return { success: false, error: "Message body is required" };
    }

    const tenantId = getTenantId();
    const supabase = await createServerClient();

    // Fetch all student profiles
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: students, error: fetchError } = await (supabase as any)
      .from("profiles")
      .select("id")
      .eq("role", "student");

    if (fetchError) {
      console.error("Error fetching students for broadcast:", fetchError);
      return { success: false, error: "Failed to fetch student list" };
    }

    if (!students || students.length === 0) {
      return { success: false, error: "No students found" };
    }

    // Create individual message for each student (batch insert)
    const messages = students.map((student: { id: string }) => ({
      tenant_id: tenantId,
      sender_id: user.user.id,
      recipient_id: student.id,
      subject: data.subject?.trim() || null,
      body: data.body.trim(),
      message_type: data.messageType || "general",
      is_system: false,
      is_read: false,
    }));

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: insertError } = await (supabase as any)
      .from("messages")
      .insert(messages);

    if (insertError) {
      console.error("Error broadcasting messages:", insertError);
      return { success: false, error: insertError.message };
    }

    revalidatePath("/admin/messages");
    return { success: true, sentCount: students.length };
  } catch (err) {
    console.error("sendBroadcastMessage error:", err);
    return { success: false, error: "An unexpected error occurred" };
  }
}
