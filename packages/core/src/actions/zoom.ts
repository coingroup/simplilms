"use server";

import { revalidatePath } from "next/cache";
import { createServerClient, getUser } from "@simplilms/auth/server";
import { getTenantId } from "../lib/tenant";

// ============================================================
// Types
// ============================================================

interface ZoomMeetingResponse {
  id: number;
  join_url: string;
  start_url: string;
  topic: string;
  password?: string;
}

interface ZoomTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

// ============================================================
// Zoom API Helpers
// ============================================================

async function getZoomAccessToken(): Promise<string | null> {
  const accountId = process.env.ZOOM_ACCOUNT_ID;
  const clientId = process.env.ZOOM_CLIENT_ID;
  const clientSecret = process.env.ZOOM_CLIENT_SECRET;

  if (!accountId || !clientId || !clientSecret) {
    return null;
  }

  try {
    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
    const response = await fetch("https://zoom.us/oauth/token", {
      method: "POST",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "account_credentials",
        account_id: accountId,
      }),
    });

    if (!response.ok) {
      console.error("Zoom token error:", await response.text());
      return null;
    }

    const data = (await response.json()) as ZoomTokenResponse;
    return data.access_token;
  } catch (err) {
    console.error("Failed to get Zoom access token:", err);
    return null;
  }
}

// ============================================================
// Queries
// ============================================================

export async function isZoomConfigured(): Promise<boolean> {
  return !!(
    process.env.ZOOM_ACCOUNT_ID &&
    process.env.ZOOM_CLIENT_ID &&
    process.env.ZOOM_CLIENT_SECRET
  );
}

// ============================================================
// Mutations
// ============================================================

export async function createZoomMeeting(
  classId: string,
  data: {
    topic: string;
    startTime?: string;
    duration?: number;
    schedule?: { days: string[]; startTime: string; endTime: string; timezone: string };
  }
): Promise<{
  success: boolean;
  error?: string;
  meetingId?: string;
  joinUrl?: string;
  startUrl?: string;
}> {
  try {
    const { user, error: authError } = await getUser();
    if (authError || !user) return { success: false, error: "Unauthorized" };
    if (user.role !== "super_admin")
      return { success: false, error: "Insufficient permissions" };

    const token = await getZoomAccessToken();
    if (!token) {
      return {
        success: false,
        error: "Zoom API not configured. Set ZOOM_ACCOUNT_ID, ZOOM_CLIENT_ID, and ZOOM_CLIENT_SECRET in environment variables.",
      };
    }

    // Build meeting settings
    const meetingBody: Record<string, unknown> = {
      topic: data.topic,
      type: 2, // Scheduled meeting
      duration: data.duration || 60,
      settings: {
        join_before_host: false,
        mute_upon_entry: true,
        waiting_room: true,
        auto_recording: "cloud",
      },
    };

    if (data.startTime) {
      meetingBody.start_time = data.startTime;
    }

    if (data.schedule?.timezone) {
      meetingBody.timezone = data.schedule.timezone;
    }

    // Create meeting via Zoom API
    const response = await fetch("https://api.zoom.us/v2/users/me/meetings", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(meetingBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Zoom meeting creation error:", errorText);
      return { success: false, error: "Failed to create Zoom meeting" };
    }

    const meeting = (await response.json()) as ZoomMeetingResponse;

    // Update the class with Zoom details
    const supabase = await createServerClient();
    const { error } = await (supabase as any)
      .from("classes")
      .update({
        zoom_meeting_id: String(meeting.id),
        zoom_join_url: meeting.join_url,
        zoom_start_url: meeting.start_url,
      })
      .eq("id", classId);

    if (error) {
      console.error("Error saving Zoom details to class:", error);
      return { success: false, error: "Meeting created but failed to save details" };
    }

    revalidatePath("/admin/classes");
    revalidatePath(`/admin/classes/${classId}`);
    revalidatePath("/teacher/classes");
    revalidatePath("/student/classes");

    return {
      success: true,
      meetingId: String(meeting.id),
      joinUrl: meeting.join_url,
      startUrl: meeting.start_url,
    };
  } catch (err) {
    console.error("createZoomMeeting error:", err);
    return { success: false, error: "An unexpected error occurred" };
  }
}

export async function deleteZoomMeeting(
  classId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { user, error: authError } = await getUser();
    if (authError || !user) return { success: false, error: "Unauthorized" };
    if (user.role !== "super_admin")
      return { success: false, error: "Insufficient permissions" };

    const supabase = await createServerClient();

    // Get the current meeting ID
    const { data: cls } = await (supabase as any)
      .from("classes")
      .select("zoom_meeting_id")
      .eq("id", classId)
      .single();

    if (cls?.zoom_meeting_id) {
      const token = await getZoomAccessToken();
      if (token) {
        // Delete from Zoom API
        await fetch(
          `https://api.zoom.us/v2/meetings/${cls.zoom_meeting_id}`,
          {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      }
    }

    // Clear Zoom fields from class
    const { error } = await (supabase as any)
      .from("classes")
      .update({
        zoom_meeting_id: null,
        zoom_join_url: null,
        zoom_start_url: null,
      })
      .eq("id", classId);

    if (error) {
      console.error("Error clearing Zoom details:", error);
      return { success: false, error: "Failed to remove Zoom meeting" };
    }

    revalidatePath("/admin/classes");
    revalidatePath(`/admin/classes/${classId}`);
    revalidatePath("/teacher/classes");
    revalidatePath("/student/classes");

    return { success: true };
  } catch (err) {
    console.error("deleteZoomMeeting error:", err);
    return { success: false, error: "An unexpected error occurred" };
  }
}

export async function fetchZoomRecording(
  meetingId: string,
  sessionId: string
): Promise<{ success: boolean; error?: string; recordingUrl?: string }> {
  try {
    const { user, error: authError } = await getUser();
    if (authError || !user) return { success: false, error: "Unauthorized" };
    if (user.role !== "super_admin")
      return { success: false, error: "Insufficient permissions" };

    const token = await getZoomAccessToken();
    if (!token) {
      return { success: false, error: "Zoom API not configured" };
    }

    const response = await fetch(
      `https://api.zoom.us/v2/meetings/${meetingId}/recordings`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!response.ok) {
      return { success: false, error: "No recordings found for this meeting" };
    }

    const data = await response.json();
    const recordings = data.recording_files || [];
    const videoRecording = recordings.find(
      (r: any) => r.recording_type === "shared_screen_with_speaker_view" || r.recording_type === "active_speaker"
    );

    const recordingUrl = videoRecording?.play_url || data.share_url || null;
    if (!recordingUrl) {
      return { success: false, error: "No video recording available" };
    }

    // Save recording URL to the session
    const supabase = await createServerClient();
    const tenantId = getTenantId();
    await (supabase as any)
      .from("live_class_sessions")
      .update({ zoom_recording_url: recordingUrl })
      .eq("id", sessionId)
      .eq("tenant_id", tenantId);

    revalidatePath("/admin/classes");
    revalidatePath("/teacher/classes");
    revalidatePath("/student/classes");

    return { success: true, recordingUrl };
  } catch (err) {
    console.error("fetchZoomRecording error:", err);
    return { success: false, error: "An unexpected error occurred" };
  }
}
