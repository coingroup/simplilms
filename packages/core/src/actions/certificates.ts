"use server";

import { revalidatePath } from "next/cache";
import { createServerClient, getUser } from "@simplilms/auth/server";
import { getTenantId } from "../lib/tenant";

// ============================================================
// Types
// ============================================================

export interface CertificateRow {
  id: string;
  tenant_id: string;
  student_id: string;
  course_id: string;
  certificate_number: string | null;
  issued_at: string;
  template_data: Record<string, unknown>;
  pdf_url: string | null;
  verification_code: string | null;
  created_at: string;
  student_name?: string;
  student_email?: string;
  course_title?: string;
}

// ============================================================
// Queries
// ============================================================

export async function getAllCertificates(): Promise<CertificateRow[]> {
  const supabase = await createServerClient();
  const { data, error } = await (supabase as any)
    .from("certificates")
    .select(
      "*, profiles:student_id(first_name, last_name, email), courses:course_id(title)"
    )
    .order("issued_at", { ascending: false });

  if (error) {
    console.error("Error fetching certificates:", error);
    return [];
  }

  return ((data || []) as any[]).map((row) => ({
    ...row,
    student_name: row.profiles
      ? `${row.profiles.first_name || ""} ${row.profiles.last_name || ""}`.trim() || "Unknown"
      : "Unknown",
    student_email: row.profiles?.email || "",
    course_title: row.courses?.title || "Unknown Course",
    profiles: undefined,
    courses: undefined,
  })) as CertificateRow[];
}

export async function getCertificateCount(): Promise<number> {
  const supabase = await createServerClient();
  const { count, error } = await (supabase as any)
    .from("certificates")
    .select("id", { count: "exact", head: true });

  if (error) return 0;
  return count || 0;
}

export async function revokeCertificate(
  certificateId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { user, error: authError } = await getUser();
    if (authError || !user) return { success: false, error: "Unauthorized" };
    if (user.role !== "super_admin")
      return { success: false, error: "Insufficient permissions" };

    const supabase = await createServerClient();
    const tenantId = getTenantId();

    // Remove certificate_id from enrollment
    const { data: cert } = await (supabase as any)
      .from("certificates")
      .select("student_id, course_id")
      .eq("id", certificateId)
      .eq("tenant_id", tenantId)
      .single();

    if (cert) {
      await (supabase as any)
        .from("course_enrollments")
        .update({ certificate_id: null })
        .eq("student_id", cert.student_id)
        .eq("course_id", cert.course_id);
    }

    // Delete the certificate
    const { error } = await (supabase as any)
      .from("certificates")
      .delete()
      .eq("id", certificateId)
      .eq("tenant_id", tenantId);

    if (error) {
      console.error("Error revoking certificate:", error);
      return { success: false, error: "Failed to revoke certificate" };
    }

    revalidatePath("/admin/certificates");
    revalidatePath("/student/certificates");
    return { success: true };
  } catch (err) {
    console.error("revokeCertificate error:", err);
    return { success: false, error: "An unexpected error occurred" };
  }
}
