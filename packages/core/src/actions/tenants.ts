"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServerClient, getUser } from "@simplilms/auth/server";

// ============================================================
// Types
// ============================================================

export interface WhitelabelTenantRow {
  id: string;
  name: string;
  contact_name: string | null;
  contact_email: string | null;
  domain: string | null;
  supabase_project_url: string | null;
  primary_color: string;
  secondary_color: string;
  logo_url: string | null;
  status: "active" | "suspended" | "provisioning";
  provisioned_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// ============================================================
// Queries
// ============================================================

/**
 * Fetch all whitelabel tenants (admin only).
 */
export async function getWhitelabelTenants(): Promise<WhitelabelTenantRow[]> {
  const supabase = createServerClient();
  const { data, error } = await (supabase as any)
    .from("whitelabel_tenants")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching whitelabel tenants:", error);
    return [];
  }

  return (data || []) as WhitelabelTenantRow[];
}

/**
 * Fetch a single whitelabel tenant by ID.
 */
export async function getWhitelabelTenantById(
  id: string
): Promise<WhitelabelTenantRow | null> {
  const supabase = createServerClient();
  const { data, error } = await (supabase as any)
    .from("whitelabel_tenants")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching whitelabel tenant:", error);
    return null;
  }

  return data as WhitelabelTenantRow;
}

// ============================================================
// Mutations
// ============================================================

/**
 * Create a new whitelabel tenant. Redirects to the tenant detail page on success.
 */
export async function createWhitelabelTenant(
  formData: FormData
): Promise<void> {
  const { user, error: authError } = await getUser();
  if (authError || !user) {
    throw new Error("Unauthorized");
  }
  if (user.role !== "super_admin") {
    throw new Error("Insufficient permissions");
  }

  const name = formData.get("name") as string;
  if (!name || name.trim().length === 0) {
    throw new Error("Tenant name is required");
  }

  const supabase = createServerClient();

  const insertData: Record<string, unknown> = {
    name: name.trim(),
    contact_name: (formData.get("contact_name") as string)?.trim() || null,
    contact_email: (formData.get("contact_email") as string)?.trim() || null,
    domain: (formData.get("domain") as string)?.trim() || null,
    supabase_project_url:
      (formData.get("supabase_project_url") as string)?.trim() || null,
    primary_color:
      (formData.get("primary_color") as string)?.trim() || "#333333",
    secondary_color:
      (formData.get("secondary_color") as string)?.trim() || "#666666",
    logo_url: (formData.get("logo_url") as string)?.trim() || null,
    notes: (formData.get("notes") as string)?.trim() || null,
  };

  const { data, error } = await (supabase as any)
    .from("whitelabel_tenants")
    .insert(insertData)
    .select("id")
    .single();

  if (error) {
    console.error("Error creating whitelabel tenant:", error);
    throw new Error("Failed to create tenant");
  }

  revalidatePath("/admin/tenants");
  redirect(`/admin/tenants/${data.id}`);
}

/**
 * Update an existing whitelabel tenant.
 */
export async function updateWhitelabelTenant(
  tenantId: string,
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  try {
    const { user, error: authError } = await getUser();
    if (authError || !user) {
      return { success: false, error: "Unauthorized" };
    }
    if (user.role !== "super_admin") {
      return { success: false, error: "Insufficient permissions" };
    }

    const name = formData.get("name") as string;
    if (!name || name.trim().length === 0) {
      return { success: false, error: "Tenant name is required" };
    }

    const status = formData.get("status") as string;
    const validStatuses = ["active", "suspended", "provisioning"];
    if (!validStatuses.includes(status)) {
      return { success: false, error: "Invalid status" };
    }

    const supabase = createServerClient();

    const updateData: Record<string, unknown> = {
      name: name.trim(),
      contact_name: (formData.get("contact_name") as string)?.trim() || null,
      contact_email: (formData.get("contact_email") as string)?.trim() || null,
      domain: (formData.get("domain") as string)?.trim() || null,
      supabase_project_url:
        (formData.get("supabase_project_url") as string)?.trim() || null,
      primary_color:
        (formData.get("primary_color") as string)?.trim() || "#333333",
      secondary_color:
        (formData.get("secondary_color") as string)?.trim() || "#666666",
      logo_url: (formData.get("logo_url") as string)?.trim() || null,
      notes: (formData.get("notes") as string)?.trim() || null,
      status,
      updated_at: new Date().toISOString(),
    };

    // Set provisioned_at when first activated
    if (status === "active") {
      const existing = await getWhitelabelTenantById(tenantId);
      if (existing && !existing.provisioned_at) {
        updateData.provisioned_at = new Date().toISOString();
      }
    }

    const { error } = await (supabase as any)
      .from("whitelabel_tenants")
      .update(updateData)
      .eq("id", tenantId);

    if (error) {
      console.error("Error updating whitelabel tenant:", error);
      return { success: false, error: "Failed to update tenant" };
    }

    revalidatePath("/admin/tenants");
    revalidatePath(`/admin/tenants/${tenantId}`);

    return { success: true };
  } catch (err) {
    console.error("updateWhitelabelTenant error:", err);
    return { success: false, error: "An unexpected error occurred" };
  }
}
