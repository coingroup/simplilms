"use server";

import { revalidatePath } from "next/cache";
import { createServerClient, getUser } from "@simplilms/auth/server";

/**
 * Update notification preferences for the current user.
 * Uses the SECURITY DEFINER function `update_notification_preferences` which
 * hardcodes payment_updates=true and emergency_alerts=true — students cannot opt out of those.
 */
export async function updateNotificationPreferences(prefs: {
  generalMessages: boolean;
  classReminders: boolean;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const { user, error: authError } = await getUser();
    if (authError || !user) {
      return { success: false, error: "Unauthorized" };
    }

    const supabase = await createServerClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).rpc("update_notification_preferences", {
      p_general_messages: prefs.generalMessages,
      p_class_reminders: prefs.classReminders,
    });

    if (error) {
      console.error("Error updating notification preferences:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/profile");
    return { success: true };
  } catch (err) {
    console.error("updateNotificationPreferences error:", err);
    return { success: false, error: "An unexpected error occurred" };
  }
}
