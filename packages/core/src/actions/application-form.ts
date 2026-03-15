"use server";

import { headers } from "next/headers";
import { createServerClient } from "@simplilms/auth/server";
import type { ApplicationFormData } from "../lib/validations/application-schema";
import { applicationFormSchema } from "../lib/validations/application-schema";
import {
  STORAGE_BUCKET,
  getDocumentStoragePath,
  MAX_FILE_SIZE_BYTES,
  ACCEPTED_FILE_TYPES,
} from "../lib/citizenship";
import { getTenantId } from "../lib/tenant";

// ============================================================
// Save Draft
// ============================================================

/**
 * Save application form data as a draft.
 * Creates a new application record if none exists, or updates the existing draft.
 */
export async function saveDraft(
  prospectId: string,
  formData: Partial<ApplicationFormData>,
  existingApplicationId?: string
): Promise<{ success: boolean; applicationId?: string; error?: string }> {
  try {
    const supabase = await createServerClient();
    const tenantId = getTenantId();

    const payload = {
      tenant_id: tenantId,
      prospect_id: prospectId,
      status: "draft",
      ...formData,
      // Remove non-database fields
      same_as_residential: undefined,
      tuition_payment_preference: undefined,
    };

    // Clean undefined values
    const cleanPayload = Object.fromEntries(
      Object.entries(payload).filter(([, v]) => v !== undefined)
    );

    if (existingApplicationId) {
      // Update existing draft
      const { error } = await (supabase as any)
        .from("applications")
        .update(cleanPayload)
        .eq("id", existingApplicationId)
        .eq("status", "draft");

      if (error) {
        console.error("Error updating draft:", error);
        return { success: false, error: "Failed to save draft" };
      }

      return { success: true, applicationId: existingApplicationId };
    } else {
      // Insert new draft
      const { data, error } = await (supabase as any)
        .from("applications")
        .insert(cleanPayload)
        .select("id")
        .single();

      if (error) {
        console.error("Error creating draft:", error);
        return { success: false, error: "Failed to create application draft" };
      }

      return { success: true, applicationId: data.id };
    }
  } catch (err) {
    console.error("saveDraft error:", err);
    return { success: false, error: "An unexpected error occurred" };
  }
}

// ============================================================
// Submit Application
// ============================================================

/**
 * Submit the completed application.
 * Validates all form data, captures IP/user agent, sets status to 'submitted'.
 */
export async function submitApplication(
  applicationId: string,
  formData: ApplicationFormData
): Promise<{ success: boolean; error?: string }> {
  try {
    // Validate form data
    const validated = applicationFormSchema.safeParse(formData);
    if (!validated.success) {
      const firstError = validated.error.issues[0];
      return {
        success: false,
        error: firstError?.message || "Invalid form data",
      };
    }

    // Capture submission metadata
    const headersList = await headers();
    const ip =
      headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      headersList.get("x-real-ip") ||
      "unknown";
    const userAgent = headersList.get("user-agent") || "unknown";

    const supabase = await createServerClient();

    // Prepare ISA consent fields
    const isaFields: Record<string, unknown> = {};
    if (validated.data.isa_consent_given) {
      isaFields.isa_consent_given = true;
      isaFields.isa_consent_text = validated.data.isa_consent_text || "";
      isaFields.isa_consent_timestamp = new Date().toISOString();
      isaFields.isa_consent_ip_address = ip;
    }

    const { error } = await (supabase as any)
      .from("applications")
      .update({
        status: "submitted",
        first_name: validated.data.first_name,
        last_name: validated.data.last_name,
        middle_name: validated.data.middle_name || null,
        email: validated.data.email,
        phone: validated.data.phone,
        date_of_birth: validated.data.date_of_birth,
        address_line1: validated.data.address_line1,
        address_line2: validated.data.address_line2 || null,
        city: validated.data.city,
        state: validated.data.state,
        zip_code: validated.data.zip_code,
        country: validated.data.country,
        mailing_address_line1: validated.data.mailing_address_line1 || null,
        mailing_address_line2: validated.data.mailing_address_line2 || null,
        mailing_city: validated.data.mailing_city || null,
        mailing_state: validated.data.mailing_state || null,
        mailing_zip: validated.data.mailing_zip || null,
        mailing_country: validated.data.mailing_country || null,
        program_id: validated.data.program_id,
        citizenship_status: validated.data.citizenship_status,
        citizenship_document_type:
          validated.data.citizenship_document_type || null,
        citizenship_document_url:
          validated.data.citizenship_document_url || null,
        stripe_identity_session_id:
          validated.data.stripe_identity_session_id || null,
        stripe_identity_status: validated.data.stripe_identity_status || null,
        submitted_ip_address: ip,
        submitted_user_agent: userAgent,
        submitted_at: new Date().toISOString(),
        ...isaFields,
      })
      .eq("id", applicationId);

    if (error) {
      console.error("Error submitting application:", error);
      return { success: false, error: "Failed to submit application" };
    }

    // Trigger n8n workflow for application submission (fire-and-forget)
    const webhookUrl = process.env.N8N_WEBHOOK_APPLICATION_SUBMIT;
    if (webhookUrl) {
      fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          application_id: applicationId,
          prospect_id: validated.data.program_id,
          email: validated.data.email,
          first_name: validated.data.first_name,
          last_name: validated.data.last_name,
        }),
      }).catch((err) =>
        console.error("Failed to trigger n8n webhook:", err)
      );
    }

    return { success: true };
  } catch (err) {
    console.error("submitApplication error:", err);
    return { success: false, error: "An unexpected error occurred" };
  }
}

// ============================================================
// Upload Document
// ============================================================

/**
 * Upload a citizenship document to Supabase Storage.
 * Returns the storage path (URL generated via signed URL on retrieval).
 */
export async function uploadDocument(
  formData: FormData
): Promise<{ success: boolean; path?: string; error?: string }> {
  try {
    const file = formData.get("file") as File | null;
    const prospectId = formData.get("prospectId") as string | null;

    if (!file) {
      return { success: false, error: "No file provided" };
    }

    if (!prospectId) {
      return { success: false, error: "Prospect ID is required" };
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return {
        success: false,
        error: `File too large. Maximum size is 10 MB.`,
      };
    }

    // Validate file type
    if (!ACCEPTED_FILE_TYPES.includes(file.type as any)) {
      return {
        success: false,
        error: "Invalid file type. Please upload a PDF, JPG, or PNG file.",
      };
    }

    const supabase = await createServerClient();
    const storagePath = getDocumentStoragePath(prospectId, file.name);

    const { error } = await (supabase as any).storage
      .from(STORAGE_BUCKET)
      .upload(storagePath, file, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      console.error("Error uploading document:", error);
      return { success: false, error: "Failed to upload document" };
    }

    return { success: true, path: storagePath };
  } catch (err) {
    console.error("uploadDocument error:", err);
    return { success: false, error: "An unexpected error occurred" };
  }
}
