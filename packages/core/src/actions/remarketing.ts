"use server";

import { revalidatePath } from "next/cache";
import { createServerClient } from "@simplilms/auth/server";
import { getUser } from "@simplilms/auth/server";
import type { CommunicationChannel } from "@simplilms/database";
import { getTenantWebsiteUrl } from "../lib/tenant";

export async function sendRemarketing(data: {
  prospectId: string;
  templateId: string;
  channel: CommunicationChannel;
}): Promise<{ success: boolean; error?: string; trackingId?: string }> {
  try {
    const { user, error: authError } = await getUser();
    if (authError || !user) {
      return { success: false, error: "Unauthorized" };
    }

    if (!["super_admin", "school_rep"].includes(user.role)) {
      return { success: false, error: "Insufficient permissions" };
    }

    const supabase = await createServerClient();

    // Fetch prospect
    const { data: prospect, error: prospectError } = await (supabase as any)
      .from("prospects")
      .select("*")
      .eq("id", data.prospectId)
      .single();

    if (prospectError || !prospect) {
      return { success: false, error: "Prospect not found" };
    }

    // Fetch template
    const { data: template, error: templateError } = await (supabase as any)
      .from("communication_templates")
      .select("*")
      .eq("id", data.templateId)
      .single();

    if (templateError || !template) {
      return { success: false, error: "Template not found" };
    }

    const websiteUrl = getTenantWebsiteUrl();

    // Resolve merge codes
    const resolvedBody = resolveMergeCodes(template.body || "", {
      first_name: prospect.first_name || "",
      last_name: prospect.last_name || "",
      program: prospect.program_interest || "",
      payment_link: "", // Will be set by n8n
      website_link: websiteUrl,
    });

    const resolvedSubject = template.subject
      ? resolveMergeCodes(template.subject, {
          first_name: prospect.first_name || "",
          last_name: prospect.last_name || "",
          program: prospect.program_interest || "",
          payment_link: "",
          website_link: websiteUrl,
        })
      : null;

    // Generate tracking ID
    const trackingId = crypto.randomUUID();

    // Create communication log entry
    await (supabase as any).from("communication_log").insert({
      tenant_id: user.tenantId,
      template_id: data.templateId,
      recipient_id: data.prospectId,
      recipient_type: "prospect",
      channel: data.channel,
      sent_at: new Date().toISOString(),
      tracking_id: trackingId,
      metadata: {
        resolved_body: resolvedBody,
        resolved_subject: resolvedSubject,
        sent_by: user.user.id,
      },
    });

    // Forward to n8n webhook
    const webhookUrl = process.env.N8N_REMARKETING_WEBHOOK_URL;
    if (webhookUrl) {
      try {
        await fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prospect: {
              id: prospect.id,
              first_name: prospect.first_name,
              last_name: prospect.last_name,
              email: prospect.email,
              phone: prospect.phone,
              program_interest: prospect.program_interest,
            },
            template: {
              id: template.id,
              name: template.name,
              channel: data.channel,
              subject: resolvedSubject,
              body: resolvedBody,
            },
            trackingId,
            channel: data.channel,
          }),
        });
      } catch (webhookError) {
        console.error("Failed to send to n8n webhook:", webhookError);
        // Don't fail the action — the communication log is recorded
      }
    } else {
      console.log(
        "N8N_REMARKETING_WEBHOOK_URL not configured. Message logged but not sent."
      );
    }

    revalidatePath("/admin/prospects");
    revalidatePath("/rep/prospects");

    return { success: true, trackingId };
  } catch (err) {
    console.error("sendRemarketing error:", err);
    return { success: false, error: "An unexpected error occurred" };
  }
}

function resolveMergeCodes(
  text: string,
  values: Record<string, string>
): string {
  return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return values[key] !== undefined ? values[key] : match;
  });
}
