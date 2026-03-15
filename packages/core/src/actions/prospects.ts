"use server";

import { revalidatePath } from "next/cache";
import { createServerClient } from "@simplilms/auth/server";
import { getUser } from "@simplilms/auth/server";
import type { EligibilityStatus } from "@simplilms/database";

export async function updateEligibility(
  prospectId: string,
  status: EligibilityStatus
): Promise<{ success: boolean; error?: string }> {
  try {
    const { user, error: authError } = await getUser();
    if (authError || !user) {
      return { success: false, error: "Unauthorized" };
    }

    if (!["super_admin", "school_rep"].includes(user.role)) {
      return { success: false, error: "Insufficient permissions" };
    }

    const supabase = await createServerClient();

    // Update prospect eligibility
    const { error } = await (supabase as any)
      .from("prospects")
      .update({
        eligibility_status: status,
        eligibility_marked_by: user.user.id,
        eligibility_marked_at: new Date().toISOString(),
      })
      .eq("id", prospectId);

    if (error) {
      console.error("Error updating eligibility:", error);
      return { success: false, error: "Failed to update eligibility status" };
    }

    // Log to audit trail
    await (supabase as any).from("audit_log").insert({
      tenant_id: user.tenantId,
      actor_id: user.user.id,
      action: "update_eligibility",
      entity_type: "prospect",
      entity_id: prospectId,
      new_values: { eligibility_status: status },
    });

    revalidatePath("/admin/prospects");
    revalidatePath("/rep/prospects");
    revalidatePath("/admin");
    revalidatePath("/rep");

    return { success: true };
  } catch (err) {
    console.error("updateEligibility error:", err);
    return { success: false, error: "An unexpected error occurred" };
  }
}

export async function addProspectNote(
  prospectId: string,
  note: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { user, error: authError } = await getUser();
    if (authError || !user) {
      return { success: false, error: "Unauthorized" };
    }

    if (!["super_admin", "school_rep"].includes(user.role)) {
      return { success: false, error: "Insufficient permissions" };
    }

    const supabase = await createServerClient();

    // Fetch current notes
    const { data: prospect, error: fetchError } = await (supabase as any)
      .from("prospects")
      .select("notes")
      .eq("id", prospectId)
      .single();

    if (fetchError) {
      return { success: false, error: "Failed to fetch prospect" };
    }

    // Format timestamp in EST
    const timestamp = new Date().toLocaleString("en-US", {
      timeZone: "America/New_York",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    const userName = `${user.profile?.firstName || ""} ${user.profile?.lastName || ""}`.trim() || "Unknown";
    const formattedNote = `[${timestamp} EST — ${userName}] ${note}`;
    const existingNotes = prospect?.notes || "";
    const updatedNotes = existingNotes
      ? `${existingNotes}\n\n${formattedNote}`
      : formattedNote;

    const { error: updateError } = await (supabase as any)
      .from("prospects")
      .update({ notes: updatedNotes })
      .eq("id", prospectId);

    if (updateError) {
      return { success: false, error: "Failed to save note" };
    }

    revalidatePath("/admin/prospects");
    revalidatePath("/rep/prospects");

    return { success: true };
  } catch (err) {
    console.error("addProspectNote error:", err);
    return { success: false, error: "An unexpected error occurred" };
  }
}
