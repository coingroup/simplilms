"use server";

import { revalidatePath } from "next/cache";
import { createServerClient, getUser } from "@simplilms/auth/server";
import { getTenantId } from "../lib/tenant";
import { clearTenantConfigCache } from "../lib/load-tenant-config";

// ============================================================
// Types
// ============================================================

interface ActionResult {
  success: boolean;
  error?: string;
}

interface OrganizationData {
  name: string;
  description: string;
  contactEmail: string;
  contactPhone: string;
  websiteUrl: string;
  location: string;
  trademark: string;
}

interface BrandingData {
  logoUrl: string;
  logoFallbackLetter: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
}

interface FeatureFlags {
  [key: string]: boolean;
}

interface NotificationSettings {
  newInquiry: { email: boolean; inApp: boolean };
  applicationSubmitted: { email: boolean; inApp: boolean };
  paymentReceived: { email: boolean; inApp: boolean };
  systemErrors: { email: boolean; inApp: boolean };
}

// ============================================================
// Helpers
// ============================================================

function isValidHex(color: string): boolean {
  return /^#[0-9A-Fa-f]{6}$/.test(color);
}

async function logAuditEntry(
  supabase: any,
  userId: string,
  action: string,
  oldValues: Record<string, unknown>,
  newValues: Record<string, unknown>
) {
  try {
    await supabase.from("audit_log").insert({
      tenant_id: getTenantId(),
      actor_id: userId,
      action,
      entity_type: "tenant_settings",
      entity_id: getTenantId(),
      old_values: oldValues,
      new_values: newValues,
    });
  } catch {
    // Non-critical — don't fail the operation
  }
}

// ============================================================
// Update Organization Settings
// ============================================================

export async function updateOrganizationSettings(
  data: OrganizationData
): Promise<ActionResult> {
  const { user, error: authError } = await getUser();
  if (authError || !user) {
    return { success: false, error: "Unauthorized" };
  }
  if (user.role !== "super_admin") {
    return { success: false, error: "Insufficient permissions" };
  }

  if (!data.name.trim()) {
    return { success: false, error: "Organization name is required" };
  }

  const supabase = await createServerClient();
  const tenantId = getTenantId();

  // Get current values for audit log
  const { data: current } = await (supabase as any)
    .from("tenants")
    .select("name, description, contact_email, contact_phone, website_url, location, trademark")
    .eq("id", tenantId)
    .single();

  const updatePayload = {
    name: data.name.trim(),
    description: data.description.trim() || null,
    contact_email: data.contactEmail.trim() || null,
    contact_phone: data.contactPhone.trim() || null,
    website_url: data.websiteUrl.trim() || null,
    location: data.location.trim() || null,
    trademark: data.trademark.trim() || null,
    updated_at: new Date().toISOString(),
  };

  const { error } = await (supabase as any)
    .from("tenants")
    .update(updatePayload)
    .eq("id", tenantId);

  if (error) {
    console.error("Error updating organization settings:", error);
    return { success: false, error: "Failed to save organization settings" };
  }

  await logAuditEntry(
    supabase,
    user.user.id,
    "update_organization_settings",
    current || {},
    updatePayload
  );

  clearTenantConfigCache();
  revalidatePath("/admin/settings");
  revalidatePath("/", "layout");

  return { success: true };
}

// ============================================================
// Update Branding Settings
// ============================================================

export async function updateBrandingSettings(
  data: BrandingData
): Promise<ActionResult> {
  const { user, error: authError } = await getUser();
  if (authError || !user) {
    return { success: false, error: "Unauthorized" };
  }
  if (user.role !== "super_admin") {
    return { success: false, error: "Insufficient permissions" };
  }

  // Validate hex colors
  if (data.primaryColor && !isValidHex(data.primaryColor)) {
    return { success: false, error: "Invalid primary color format (use #RRGGBB)" };
  }
  if (data.secondaryColor && !isValidHex(data.secondaryColor)) {
    return { success: false, error: "Invalid secondary color format (use #RRGGBB)" };
  }
  if (data.accentColor && !isValidHex(data.accentColor)) {
    return { success: false, error: "Invalid accent color format (use #RRGGBB)" };
  }

  const supabase = await createServerClient();
  const tenantId = getTenantId();

  // Get current values for audit log
  const { data: current } = await (supabase as any)
    .from("tenants")
    .select("logo_url, logo_fallback_letter, primary_color, secondary_color, accent_color")
    .eq("id", tenantId)
    .single();

  const updatePayload = {
    logo_url: data.logoUrl.trim() || null,
    logo_fallback_letter: data.logoFallbackLetter.trim().charAt(0).toUpperCase() || "S",
    primary_color: data.primaryColor || "#F26822",
    secondary_color: data.secondaryColor || "#FFCE38",
    accent_color: data.accentColor || "#FAA62E",
    updated_at: new Date().toISOString(),
  };

  const { error } = await (supabase as any)
    .from("tenants")
    .update(updatePayload)
    .eq("id", tenantId);

  if (error) {
    console.error("Error updating branding settings:", error);
    return { success: false, error: "Failed to save branding settings" };
  }

  await logAuditEntry(
    supabase,
    user.user.id,
    "update_branding_settings",
    current || {},
    updatePayload
  );

  clearTenantConfigCache();
  revalidatePath("/admin/settings");
  revalidatePath("/", "layout");

  return { success: true };
}

// ============================================================
// Update Feature Flags
// ============================================================

export async function updateFeatureFlags(
  flags: FeatureFlags
): Promise<ActionResult> {
  const { user, error: authError } = await getUser();
  if (authError || !user) {
    return { success: false, error: "Unauthorized" };
  }
  if (user.role !== "super_admin") {
    return { success: false, error: "Insufficient permissions" };
  }

  const supabase = await createServerClient();
  const tenantId = getTenantId();

  // Get current flags for audit log
  const { data: current } = await (supabase as any)
    .from("tenants")
    .select("feature_flags")
    .eq("id", tenantId)
    .single();

  const { error } = await (supabase as any)
    .from("tenants")
    .update({
      feature_flags: flags,
      updated_at: new Date().toISOString(),
    })
    .eq("id", tenantId);

  if (error) {
    console.error("Error updating feature flags:", error);
    return { success: false, error: "Failed to save feature flags" };
  }

  await logAuditEntry(
    supabase,
    user.user.id,
    "update_feature_flags",
    { feature_flags: current?.feature_flags || {} },
    { feature_flags: flags }
  );

  clearTenantConfigCache();
  revalidatePath("/admin/settings");
  revalidatePath("/", "layout");

  return { success: true };
}

// ============================================================
// Update Notification Settings
// ============================================================

export async function updateNotificationSettings(
  settings: NotificationSettings
): Promise<ActionResult> {
  const { user, error: authError } = await getUser();
  if (authError || !user) {
    return { success: false, error: "Unauthorized" };
  }
  if (user.role !== "super_admin") {
    return { success: false, error: "Insufficient permissions" };
  }

  const supabase = await createServerClient();
  const tenantId = getTenantId();

  // Get current settings for audit log
  const { data: current } = await (supabase as any)
    .from("tenants")
    .select("notification_settings")
    .eq("id", tenantId)
    .single();

  const { error } = await (supabase as any)
    .from("tenants")
    .update({
      notification_settings: settings,
      updated_at: new Date().toISOString(),
    })
    .eq("id", tenantId);

  if (error) {
    console.error("Error updating notification settings:", error);
    return { success: false, error: "Failed to save notification settings" };
  }

  await logAuditEntry(
    supabase,
    user.user.id,
    "update_notification_settings",
    { notification_settings: current?.notification_settings || {} },
    { notification_settings: settings }
  );

  clearTenantConfigCache();
  revalidatePath("/admin/settings");

  return { success: true };
}
