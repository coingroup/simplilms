"use server";

import { revalidatePath } from "next/cache";
import { createServerClient } from "@simplilms/auth/server";
import { getUser } from "@simplilms/auth/server";
import { generatePaymentToken } from "../lib/payment";
import { buildTenantContext } from "../lib/tenant";

export async function approveApplication(
  applicationId: string
): Promise<{ success: boolean; paymentUrl?: string; error?: string }> {
  try {
    const { user, error: authError } = await getUser();
    if (authError || !user) {
      return { success: false, error: "Unauthorized" };
    }

    if (user.role !== "super_admin") {
      return { success: false, error: "Only admins can approve applications" };
    }

    const supabase = await createServerClient();

    // Generate a secure payment token for the semi-public payment page
    const paymentToken = generatePaymentToken();

    const { error } = await (supabase as any)
      .from("applications")
      .update({
        status: "approved",
        reviewed_by: user.user.id,
        reviewed_at: new Date().toISOString(),
        payment_token: paymentToken,
      })
      .eq("id", applicationId);

    if (error) {
      console.error("Error approving application:", error);
      return { success: false, error: "Failed to approve application" };
    }

    // Build payment URL
    const portalUrl =
      process.env.NEXT_PUBLIC_PORTAL_URL || "http://localhost:3001";
    const paymentUrl = `${portalUrl}/payment?token=${paymentToken}`;

    // Audit log
    await (supabase as any).from("audit_log").insert({
      tenant_id: user.tenantId,
      actor_id: user.user.id,
      action: "approve_application",
      entity_type: "application",
      entity_id: applicationId,
      new_values: { status: "approved", payment_token_generated: true },
    });

    // Fire n8n WF7 webhook with payment URL (fire-and-forget)
    const webhookUrl = process.env.N8N_WEBHOOK_APPLICATION_REVIEW;
    if (webhookUrl) {
      // Fetch application data for the webhook payload
      const { data: appData } = await (supabase as any)
        .from("applications")
        .select("first_name, last_name, email, phone, program_id")
        .eq("id", applicationId)
        .single();

      fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event: "application_approved",
          application_id: applicationId,
          first_name: appData?.first_name,
          last_name: appData?.last_name,
          email: appData?.email,
          phone: appData?.phone,
          program_id: appData?.program_id,
          payment_url: paymentUrl,
          tenant_context: buildTenantContext(),
        }),
      }).catch((err) =>
        console.error("Failed to fire n8n approval webhook:", err)
      );
    }

    revalidatePath("/admin/applications");
    revalidatePath("/rep/applications");
    revalidatePath("/admin");

    return { success: true, paymentUrl };
  } catch (err) {
    console.error("approveApplication error:", err);
    return { success: false, error: "An unexpected error occurred" };
  }
}

export async function rejectApplication(
  applicationId: string,
  reason: string
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!reason || reason.trim().length === 0) {
      return { success: false, error: "Rejection reason is required" };
    }

    const { user, error: authError } = await getUser();
    if (authError || !user) {
      return { success: false, error: "Unauthorized" };
    }

    if (user.role !== "super_admin") {
      return { success: false, error: "Only admins can reject applications" };
    }

    const supabase = await createServerClient();

    const { error } = await (supabase as any)
      .from("applications")
      .update({
        status: "rejected",
        reviewed_by: user.user.id,
        reviewed_at: new Date().toISOString(),
        rejection_reason: reason.trim(),
      })
      .eq("id", applicationId);

    if (error) {
      console.error("Error rejecting application:", error);
      return { success: false, error: "Failed to reject application" };
    }

    // Audit log
    await (supabase as any).from("audit_log").insert({
      tenant_id: user.tenantId,
      actor_id: user.user.id,
      action: "reject_application",
      entity_type: "application",
      entity_id: applicationId,
      new_values: { status: "rejected", rejection_reason: reason.trim() },
    });

    revalidatePath("/admin/applications");
    revalidatePath("/rep/applications");
    revalidatePath("/admin");

    return { success: true };
  } catch (err) {
    console.error("rejectApplication error:", err);
    return { success: false, error: "An unexpected error occurred" };
  }
}
