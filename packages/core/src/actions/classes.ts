"use server";

import { revalidatePath } from "next/cache";
import { createServerClient, getUser } from "@simplilms/auth/server";
import { getTenantId } from "../lib/tenant";

// ============================================================
// Types
// ============================================================

export interface LiveSessionRow {
  id: string;
  tenant_id: string;
  class_id: string;
  session_date: string;
  start_time: string;
  end_time: string | null;
  zoom_meeting_id: string | null;
  zoom_join_url: string | null;
  zoom_start_url: string | null;
  zoom_recording_url: string | null;
  status: "scheduled" | "live" | "completed" | "cancelled";
  actual_start_at: string | null;
  actual_end_at: string | null;
  attendee_count: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// ============================================================
// Queries — Classes
// ============================================================

export async function getClasses(): Promise<any[]> {
  const supabase = await createServerClient();
  const { data, error } = await (supabase as any)
    .from("classes")
    .select("*, profiles:instructor_id(first_name, last_name)")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching classes:", error);
    return [];
  }
  return (data || []).map((row: any) => ({
    ...row,
    instructor_name: row.profiles
      ? `${row.profiles.first_name || ""} ${row.profiles.last_name || ""}`.trim()
      : "Unassigned",
    profiles: undefined,
  }));
}

export async function getClassByIdFull(classId: string): Promise<any | null> {
  const supabase = await createServerClient();
  const { data, error } = await (supabase as any)
    .from("classes")
    .select("*, profiles:instructor_id(first_name, last_name)")
    .eq("id", classId)
    .single();

  if (error) {
    console.error("Error fetching class:", error);
    return null;
  }
  return {
    ...data,
    instructor_name: data.profiles
      ? `${data.profiles.first_name || ""} ${data.profiles.last_name || ""}`.trim()
      : "Unassigned",
    profiles: undefined,
  };
}

// ============================================================
// Queries — Live Sessions
// ============================================================

export async function getSessionsByClass(
  classId: string
): Promise<LiveSessionRow[]> {
  const supabase = await createServerClient();
  const { data, error } = await (supabase as any)
    .from("live_class_sessions")
    .select("*")
    .eq("class_id", classId)
    .order("session_date", { ascending: true });

  if (error) {
    console.error("Error fetching live sessions:", error);
    return [];
  }
  return (data || []) as LiveSessionRow[];
}

export async function getUpcomingSessions(
  studentId?: string,
  instructorId?: string,
  limit: number = 10
): Promise<(LiveSessionRow & { class_name?: string; zoom_join_url?: string })[]> {
  const supabase = await createServerClient();
  const today = new Date().toISOString().split("T")[0];

  let query = (supabase as any)
    .from("live_class_sessions")
    .select("*, classes:class_id(name, zoom_join_url, zoom_start_url, instructor_id)")
    .gte("session_date", today)
    .in("status", ["scheduled", "live"])
    .order("session_date", { ascending: true })
    .limit(limit);

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching upcoming sessions:", error);
    return [];
  }

  let sessions = (data || []).map((row: any) => ({
    ...row,
    class_name: row.classes?.name || "Unknown Class",
    zoom_join_url: row.zoom_join_url || row.classes?.zoom_join_url,
    zoom_start_url: row.zoom_start_url || row.classes?.zoom_start_url,
    instructor_id: row.classes?.instructor_id,
    classes: undefined,
  }));

  // Filter by student enrollment or instructor ownership
  if (studentId) {
    const { data: enrollments } = await (supabase as any)
      .from("class_enrollments")
      .select("class_id")
      .eq("student_id", studentId)
      .eq("status", "enrolled");

    const enrolledClassIds = new Set(
      (enrollments || []).map((e: any) => e.class_id)
    );
    sessions = sessions.filter((s: any) => enrolledClassIds.has(s.class_id));
  }

  if (instructorId) {
    sessions = sessions.filter((s: any) => s.instructor_id === instructorId);
  }

  return sessions;
}

export async function getSessionRecordings(
  classId: string
): Promise<LiveSessionRow[]> {
  const supabase = await createServerClient();
  const { data, error } = await (supabase as any)
    .from("live_class_sessions")
    .select("*")
    .eq("class_id", classId)
    .eq("status", "completed")
    .not("zoom_recording_url", "is", null)
    .order("session_date", { ascending: false });

  if (error) {
    console.error("Error fetching recordings:", error);
    return [];
  }
  return (data || []) as LiveSessionRow[];
}

// ============================================================
// Mutations — Classes (Admin)
// ============================================================

export async function createClass(
  data: {
    name: string;
    description?: string;
    programId?: string;
    instructorId: string;
    schedule: { days: string[]; startTime: string; endTime: string; timezone: string };
    maxStudents?: number;
    priceCents?: number;
    commissionRate?: number;
    zoomMeetingId?: string;
    zoomJoinUrl?: string;
    zoomStartUrl?: string;
  }
): Promise<{ success: boolean; error?: string; id?: string }> {
  try {
    const { user, error: authError } = await getUser();
    if (authError || !user) return { success: false, error: "Unauthorized" };
    if (user.role !== "super_admin") return { success: false, error: "Insufficient permissions" };

    if (!data.name.trim()) return { success: false, error: "Class name is required" };
    if (data.name.length > 255) return { success: false, error: "Class name must be under 255 characters" };
    if (data.description && data.description.length > 2000) return { success: false, error: "Description must be under 2,000 characters" };
    if (!data.instructorId) return { success: false, error: "Instructor is required" };

    const supabase = await createServerClient();
    const tenantId = getTenantId();

    const { data: cls, error } = await (supabase as any)
      .from("classes")
      .insert({
        tenant_id: tenantId,
        name: data.name.trim(),
        description: data.description?.trim() || null,
        program_id: data.programId || null,
        instructor_id: data.instructorId,
        schedule: data.schedule,
        max_students: data.maxStudents || null,
        price_cents: data.priceCents || null,
        commission_rate: data.commissionRate ?? 0.5,
        zoom_meeting_id: data.zoomMeetingId || null,
        zoom_join_url: data.zoomJoinUrl || null,
        zoom_start_url: data.zoomStartUrl || null,
        is_active: true,
      })
      .select("id")
      .single();

    if (error) {
      console.error("Error creating class:", error);
      return { success: false, error: "Failed to create class" };
    }

    revalidatePath("/admin/classes");
    return { success: true, id: cls.id };
  } catch (err) {
    console.error("createClass error:", err);
    return { success: false, error: "An unexpected error occurred" };
  }
}

export async function updateClass(
  classId: string,
  data: {
    name?: string;
    description?: string;
    instructorId?: string;
    schedule?: { days: string[]; startTime: string; endTime: string; timezone: string };
    maxStudents?: number | null;
    priceCents?: number | null;
    commissionRate?: number;
    zoomMeetingId?: string | null;
    zoomJoinUrl?: string | null;
    zoomStartUrl?: string | null;
    isActive?: boolean;
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    const { user, error: authError } = await getUser();
    if (authError || !user) return { success: false, error: "Unauthorized" };
    if (user.role !== "super_admin") return { success: false, error: "Insufficient permissions" };

    const supabase = await createServerClient();
    const updateData: Record<string, unknown> = {};

    if (data.name !== undefined) updateData.name = data.name.trim();
    if (data.description !== undefined) updateData.description = data.description.trim() || null;
    if (data.instructorId !== undefined) updateData.instructor_id = data.instructorId;
    if (data.schedule !== undefined) updateData.schedule = data.schedule;
    if (data.maxStudents !== undefined) updateData.max_students = data.maxStudents;
    if (data.priceCents !== undefined) updateData.price_cents = data.priceCents;
    if (data.commissionRate !== undefined) updateData.commission_rate = data.commissionRate;
    if (data.zoomMeetingId !== undefined) updateData.zoom_meeting_id = data.zoomMeetingId;
    if (data.zoomJoinUrl !== undefined) updateData.zoom_join_url = data.zoomJoinUrl;
    if (data.zoomStartUrl !== undefined) updateData.zoom_start_url = data.zoomStartUrl;
    if (data.isActive !== undefined) updateData.is_active = data.isActive;

    const { error } = await (supabase as any)
      .from("classes")
      .update(updateData)
      .eq("id", classId);

    if (error) {
      console.error("Error updating class:", error);
      return { success: false, error: "Failed to update class" };
    }

    revalidatePath("/admin/classes");
    revalidatePath(`/admin/classes/${classId}`);
    revalidatePath("/teacher/classes");
    revalidatePath("/student/classes");
    return { success: true };
  } catch (err) {
    console.error("updateClass error:", err);
    return { success: false, error: "An unexpected error occurred" };
  }
}

// ============================================================
// Mutations — Live Sessions
// ============================================================

export async function createLiveSession(
  classId: string,
  data: {
    sessionDate: string;
    startTime: string;
    endTime?: string;
    zoomMeetingId?: string;
    zoomJoinUrl?: string;
    zoomStartUrl?: string;
  }
): Promise<{ success: boolean; error?: string; id?: string }> {
  try {
    const { user, error: authError } = await getUser();
    if (authError || !user) return { success: false, error: "Unauthorized" };
    if (user.role !== "super_admin") return { success: false, error: "Insufficient permissions" };

    const supabase = await createServerClient();
    const tenantId = getTenantId();

    const { data: session, error } = await (supabase as any)
      .from("live_class_sessions")
      .insert({
        tenant_id: tenantId,
        class_id: classId,
        session_date: data.sessionDate,
        start_time: data.startTime,
        end_time: data.endTime || null,
        zoom_meeting_id: data.zoomMeetingId || null,
        zoom_join_url: data.zoomJoinUrl || null,
        zoom_start_url: data.zoomStartUrl || null,
        status: "scheduled",
      })
      .select("id")
      .single();

    if (error) {
      console.error("Error creating live session:", error);
      return { success: false, error: "Failed to create session" };
    }

    revalidatePath(`/admin/classes/${classId}`);
    revalidatePath("/teacher/classes");
    revalidatePath("/student/classes");
    return { success: true, id: session.id };
  } catch (err) {
    console.error("createLiveSession error:", err);
    return { success: false, error: "An unexpected error occurred" };
  }
}

export async function updateSessionStatus(
  sessionId: string,
  status: "scheduled" | "live" | "completed" | "cancelled",
  extra?: {
    actualStartAt?: string;
    actualEndAt?: string;
    attendeeCount?: number;
    zoomRecordingUrl?: string;
    notes?: string;
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    const { user, error: authError } = await getUser();
    if (authError || !user) return { success: false, error: "Unauthorized" };

    const supabase = await createServerClient();

    // Teachers can only update sessions for their own classes
    if (user.role === "teacher_paid" || user.role === "teacher_unpaid") {
      const { data: session } = await (supabase as any)
        .from("live_class_sessions")
        .select("class_id")
        .eq("id", sessionId)
        .single();

      if (!session) return { success: false, error: "Session not found" };

      const { data: cls } = await (supabase as any)
        .from("classes")
        .select("instructor_id")
        .eq("id", session.class_id)
        .single();

      if (!cls || cls.instructor_id !== user.user.id) {
        return { success: false, error: "You can only update sessions for your own classes" };
      }
    } else if (user.role !== "super_admin") {
      return { success: false, error: "Insufficient permissions" };
    }

    const updateData: Record<string, unknown> = { status };

    if (extra?.actualStartAt) updateData.actual_start_at = extra.actualStartAt;
    if (extra?.actualEndAt) updateData.actual_end_at = extra.actualEndAt;
    if (extra?.attendeeCount !== undefined) updateData.attendee_count = extra.attendeeCount;
    if (extra?.zoomRecordingUrl) updateData.zoom_recording_url = extra.zoomRecordingUrl;
    if (extra?.notes !== undefined) updateData.notes = extra.notes;

    const { error } = await (supabase as any)
      .from("live_class_sessions")
      .update(updateData)
      .eq("id", sessionId);

    if (error) {
      console.error("Error updating session status:", error);
      return { success: false, error: "Failed to update session" };
    }

    revalidatePath("/admin/classes");
    revalidatePath("/teacher/classes");
    revalidatePath("/student/classes");
    return { success: true };
  } catch (err) {
    console.error("updateSessionStatus error:", err);
    return { success: false, error: "An unexpected error occurred" };
  }
}

export async function enrollStudentInClass(
  classId: string,
  studentId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { user, error: authError } = await getUser();
    if (authError || !user) return { success: false, error: "Unauthorized" };
    if (user.role !== "super_admin") return { success: false, error: "Insufficient permissions" };

    const supabase = await createServerClient();
    const tenantId = getTenantId();

    const { error } = await (supabase as any)
      .from("class_enrollments")
      .insert({
        tenant_id: tenantId,
        class_id: classId,
        student_id: studentId,
        status: "enrolled",
      });

    if (error) {
      if (error.code === "23505") return { success: false, error: "Student already enrolled" };
      console.error("Error enrolling student:", error);
      return { success: false, error: "Failed to enroll student" };
    }

    revalidatePath(`/admin/classes/${classId}`);
    return { success: true };
  } catch (err) {
    console.error("enrollStudentInClass error:", err);
    return { success: false, error: "An unexpected error occurred" };
  }
}
