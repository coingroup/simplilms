"use server";

import { revalidatePath } from "next/cache";
import { createServerClient, getUser } from "@simplilms/auth/server";
import { getTenantId } from "../lib/tenant";

// ============================================================
// Types
// ============================================================

export type LiveSessionStatus = "scheduled" | "live" | "completed" | "cancelled";

export interface LiveSessionRow {
  id: string;
  tenant_id: string;
  class_id: string | null;
  course_id: string | null;
  title: string;
  description: string | null;
  instructor_id: string;
  scheduled_at: string;
  duration_minutes: number;
  zoom_meeting_id: string | null;
  zoom_join_url: string | null;
  zoom_start_url: string | null;
  zoom_passcode: string | null;
  recording_url: string | null;
  recording_available_at: string | null;
  status: LiveSessionStatus;
  max_attendees: number | null;
  attendee_count: number;
  created_at: string;
  updated_at: string;
  // joined fields
  instructor_first_name?: string | null;
  instructor_last_name?: string | null;
  class_name?: string | null;
  course_title?: string | null;
}

export interface CreateLiveSessionData {
  class_id?: string | null;
  course_id?: string | null;
  title: string;
  description?: string | null;
  scheduled_at: string;
  duration_minutes?: number;
  zoom_meeting_id?: string | null;
  zoom_join_url?: string | null;
  zoom_start_url?: string | null;
  zoom_passcode?: string | null;
  max_attendees?: number | null;
}

export interface UpdateLiveSessionData {
  title?: string;
  description?: string | null;
  scheduled_at?: string;
  duration_minutes?: number;
  zoom_meeting_id?: string | null;
  zoom_join_url?: string | null;
  zoom_start_url?: string | null;
  zoom_passcode?: string | null;
  max_attendees?: number | null;
  status?: LiveSessionStatus;
}

export interface ActionResult<T = void> {
  success: boolean;
  data?: T;
  error?: string;
}

// ============================================================
// Helpers
// ============================================================

const SESSION_SELECT = `
  *,
  instructor:profiles!live_class_sessions_instructor_id_fkey(first_name, last_name),
  class:classes(name),
  course:courses(title)
`;

function flattenSession(raw: Record<string, unknown>): LiveSessionRow {
  const instructor = raw.instructor as { first_name?: string; last_name?: string } | null;
  const cls = raw.class as { name?: string } | null;
  const course = raw.course as { title?: string } | null;
  return {
    ...(raw as unknown as LiveSessionRow),
    instructor_first_name: instructor?.first_name ?? null,
    instructor_last_name: instructor?.last_name ?? null,
    class_name: cls?.name ?? null,
    course_title: course?.title ?? null,
  };
}

// ============================================================
// Queries
// ============================================================

/**
 * Upcoming live sessions (scheduled_at > now or status = live).
 * Role-aware: students see only enrolled, teachers see their own, admins see all.
 */
export async function getUpcomingLiveSessions(options?: {
  class_id?: string;
  course_id?: string;
}): Promise<LiveSessionRow[]> {
  const { user, error: authError } = await getUser();
  if (authError || !user) return [];

  const supabase = await createServerClient();
  const now = new Date().toISOString();

  let query = (supabase as any)
    .from("live_class_sessions")
    .select(SESSION_SELECT)
    .in("status", ["scheduled", "live"])
    .gte("scheduled_at", now)
    .order("scheduled_at", { ascending: true });

  if (options?.class_id) query = query.eq("class_id", options.class_id);
  if (options?.course_id) query = query.eq("course_id", options.course_id);

  if (user.role === "teacher_paid" || user.role === "teacher_unpaid") {
    query = query.eq("instructor_id", user.user.id);
  }

  const { data, error } = await query;
  if (error) {
    console.error("Error fetching upcoming live sessions:", error);
    return [];
  }

  return ((data || []) as Record<string, unknown>[]).map(flattenSession);
}

/**
 * Past live sessions (completed / cancelled). Includes recordings.
 */
export async function getPastLiveSessions(options?: {
  class_id?: string;
  course_id?: string;
}): Promise<LiveSessionRow[]> {
  const { user, error: authError } = await getUser();
  if (authError || !user) return [];

  const supabase = await createServerClient();

  let query = (supabase as any)
    .from("live_class_sessions")
    .select(SESSION_SELECT)
    .in("status", ["completed", "cancelled"])
    .order("scheduled_at", { ascending: false });

  if (options?.class_id) query = query.eq("class_id", options.class_id);
  if (options?.course_id) query = query.eq("course_id", options.course_id);

  if (user.role === "teacher_paid" || user.role === "teacher_unpaid") {
    query = query.eq("instructor_id", user.user.id);
  }

  const { data, error } = await query;
  if (error) {
    console.error("Error fetching past live sessions:", error);
    return [];
  }

  return ((data || []) as Record<string, unknown>[]).map(flattenSession);
}

/**
 * All live sessions for admin overview.
 */
export async function getAllLiveSessions(): Promise<LiveSessionRow[]> {
  const { user, error: authError } = await getUser();
  if (authError || !user || user.role !== "super_admin") return [];

  const supabase = await createServerClient();
  const { data, error } = await (supabase as any)
    .from("live_class_sessions")
    .select(SESSION_SELECT)
    .order("scheduled_at", { ascending: false });

  if (error) {
    console.error("Error fetching all live sessions:", error);
    return [];
  }

  return ((data || []) as Record<string, unknown>[]).map(flattenSession);
}

/**
 * Single session detail.
 */
export async function getLiveSession(
  sessionId: string
): Promise<LiveSessionRow | null> {
  const { user, error: authError } = await getUser();
  if (authError || !user) return null;

  const supabase = await createServerClient();
  const { data, error } = await (supabase as any)
    .from("live_class_sessions")
    .select(SESSION_SELECT)
    .eq("id", sessionId)
    .single();

  if (error) {
    console.error("Error fetching live session:", error);
    return null;
  }

  return flattenSession(data as Record<string, unknown>);
}

// ============================================================
// Mutations
// ============================================================

/**
 * Create a new live session. Teachers create for themselves; admins can specify instructor_id.
 */
export async function createLiveSession(
  data: CreateLiveSessionData
): Promise<ActionResult<LiveSessionRow>> {
  const { user, error: authError } = await getUser();
  if (authError || !user) return { success: false, error: "Not authenticated" };

  const isAdmin = user.role === "super_admin";
  const isTeacher =
    user.role === "teacher_paid" || user.role === "teacher_unpaid";

  if (!isAdmin && !isTeacher) {
    return { success: false, error: "Unauthorized" };
  }

  const tenantId = await getTenantId();
  const supabase = await createServerClient();

  const payload = {
    tenant_id: tenantId,
    instructor_id: user.user.id,
    title: data.title,
    description: data.description ?? null,
    class_id: data.class_id ?? null,
    course_id: data.course_id ?? null,
    scheduled_at: data.scheduled_at,
    duration_minutes: data.duration_minutes ?? 60,
    zoom_meeting_id: data.zoom_meeting_id ?? null,
    zoom_join_url: data.zoom_join_url ?? null,
    zoom_start_url: data.zoom_start_url ?? null,
    zoom_passcode: data.zoom_passcode ?? null,
    max_attendees: data.max_attendees ?? null,
    status: "scheduled" as LiveSessionStatus,
  };

  const { data: created, error } = await (supabase as any)
    .from("live_class_sessions")
    .insert(payload)
    .select(SESSION_SELECT)
    .single();

  if (error) {
    console.error("Error creating live session:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/teacher/live");
  revalidatePath("/student/live");
  revalidatePath("/admin/live");

  return {
    success: true,
    data: flattenSession(created as Record<string, unknown>),
  };
}

/**
 * Update a live session.
 */
export async function updateLiveSession(
  sessionId: string,
  data: UpdateLiveSessionData
): Promise<ActionResult> {
  const { user, error: authError } = await getUser();
  if (authError || !user) return { success: false, error: "Not authenticated" };

  const isAdmin = user.role === "super_admin";
  const isTeacher =
    user.role === "teacher_paid" || user.role === "teacher_unpaid";

  if (!isAdmin && !isTeacher) {
    return { success: false, error: "Unauthorized" };
  }

  const supabase = await createServerClient();

  // Teachers can only update their own sessions
  const filter = isAdmin
    ? (supabase as any)
        .from("live_class_sessions")
        .update(data)
        .eq("id", sessionId)
    : (supabase as any)
        .from("live_class_sessions")
        .update(data)
        .eq("id", sessionId)
        .eq("instructor_id", user.user.id);

  const { error } = await filter;
  if (error) {
    console.error("Error updating live session:", error);
    return { success: false, error: error.message };
  }

  revalidatePath(`/teacher/live/${sessionId}`);
  revalidatePath("/teacher/live");
  revalidatePath("/admin/live");

  return { success: true };
}

/**
 * Cancel a live session.
 */
export async function cancelLiveSession(sessionId: string): Promise<ActionResult> {
  return updateLiveSession(sessionId, { status: "cancelled" });
}

/**
 * Add (or update) the recording URL after a session ends.
 */
export async function addRecording(
  sessionId: string,
  recordingUrl: string
): Promise<ActionResult> {
  const { user, error: authError } = await getUser();
  if (authError || !user) return { success: false, error: "Not authenticated" };

  const isAdmin = user.role === "super_admin";
  const isTeacher =
    user.role === "teacher_paid" || user.role === "teacher_unpaid";

  if (!isAdmin && !isTeacher) {
    return { success: false, error: "Unauthorized" };
  }

  const supabase = await createServerClient();

  const payload = {
    recording_url: recordingUrl,
    recording_available_at: new Date().toISOString(),
    status: "completed" as LiveSessionStatus,
  };

  let query = (supabase as any)
    .from("live_class_sessions")
    .update(payload)
    .eq("id", sessionId);

  if (isTeacher) {
    query = query.eq("instructor_id", user.user.id);
  }

  const { error } = await query;
  if (error) {
    console.error("Error adding recording:", error);
    return { success: false, error: error.message };
  }

  revalidatePath(`/teacher/live/${sessionId}`);
  revalidatePath(`/student/live/${sessionId}`);
  revalidatePath("/admin/live");

  return { success: true };
}
