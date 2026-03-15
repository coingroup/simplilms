/**
 * Tenant resolution helpers for single-tenant-per-deployment model.
 *
 * Each SimpliLMS deployment has exactly ONE tenant.
 * The tenant ID is set via the TENANT_ID environment variable.
 */

/** Default tenant UUID (for local development / initial setup) */
const DEFAULT_TENANT_ID = "00000000-0000-0000-0000-000000000001";

/**
 * Get the tenant ID for the current deployment.
 */
export function getTenantId(): string {
  return process.env.TENANT_ID || DEFAULT_TENANT_ID;
}

/**
 * Get the tenant's public website URL.
 */
export function getTenantWebsiteUrl(): string {
  return process.env.NEXT_PUBLIC_WEBSITE_URL || "";
}

/**
 * Get the tenant's contact email.
 */
export function getTenantEmail(): string {
  return process.env.NEXT_PUBLIC_CONTACT_EMAIL || "admin@example.com";
}

/**
 * Get the tenant's display name.
 */
export function getTenantName(): string {
  return process.env.NEXT_PUBLIC_PORTAL_NAME || "Portal";
}

/**
 * Build tenant context object for n8n webhook payloads.
 * Includes Supabase credentials so n8n can write to the correct database.
 */
export function buildTenantContext() {
  return {
    tenant_id: getTenantId(),
    supabase_url: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    supabase_key: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
    tenant_name: getTenantName(),
    tenant_email: getTenantEmail(),
    tenant_website: getTenantWebsiteUrl(),
  };
}
