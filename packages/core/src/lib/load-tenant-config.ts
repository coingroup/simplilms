import { createClient } from "@supabase/supabase-js";
import type { TenantConfig } from "./tenant-config";
import { getTenantId } from "./tenant";

let cachedConfig: TenantConfig | null = null;

/**
 * Load tenant configuration from the single tenant record in Supabase.
 * Caches in-memory for the lifetime of the server process.
 * Called once in the root layout of each app.
 *
 * Falls back to environment variables if the tenant row is not found
 * (useful during initial setup before tenant is seeded).
 */
export async function loadTenantConfig(): Promise<TenantConfig> {
  if (cachedConfig) return cachedConfig;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (url && key) {
    try {
      const supabase = createClient(url, key);
      const tenantId = getTenantId();

      const { data, error } = await supabase
        .from("tenants")
        .select("*")
        .eq("id", tenantId)
        .single();

      if (!error && data) {
        cachedConfig = mapRowToConfig(data);
        return cachedConfig;
      }
    } catch {
      // Fall through to env-based config
    }
  }

  // Fallback to env-var-based config
  cachedConfig = getEnvFallbackConfig();
  return cachedConfig;
}

/**
 * Clear the cached config. Useful for testing or when tenant config
 * is updated and the server needs to reload.
 */
export function clearTenantConfigCache(): void {
  cachedConfig = null;
}

function mapRowToConfig(
  row: Record<string, unknown>
): TenantConfig {
  const featureFlags =
    (row.feature_flags as Record<string, boolean>) || {};
  const name = (row.name as string) || "Portal";

  return {
    id: row.id as string,
    name,
    shortName: buildShortName(name),
    description: `Admissions and enrollment for ${name}`,

    // Contact info from env vars (not stored in tenants table)
    email:
      process.env.NEXT_PUBLIC_CONTACT_EMAIL || "admissions@example.com",
    phone: process.env.NEXT_PUBLIC_CONTACT_PHONE || "",
    websiteUrl: process.env.NEXT_PUBLIC_WEBSITE_URL || "",
    location: process.env.NEXT_PUBLIC_LOCATION || "",
    trademark: process.env.NEXT_PUBLIC_TRADEMARK || undefined,

    // Branding from tenant row
    logoUrl: (row.logo_url as string) || null,
    logoFallbackLetter: name.charAt(0).toUpperCase(),
    primaryColor: (row.primary_color as string) || "#F26822",
    secondaryColor: (row.secondary_color as string) || "#FFCE38",
    accentColor: "#FAA62E",

    // Features
    features: {
      isaEnabled: featureFlags.isa_enabled ?? false,
      remarketingEnabled: featureFlags.remarketing_enabled ?? true,
      zoomIntegration: featureFlags.zoom_integration ?? false,
      stripeConnect: featureFlags.stripe_connect ?? false,
      lmsEnabled: featureFlags.lms_enabled ?? true,
      aiCourseCreator: featureFlags.ai_course_creator ?? false,
      certificates: featureFlags.certificates ?? true,
      quizzes: featureFlags.quizzes ?? true,

      // Sector modules
      sectorRealEstate: featureFlags.sector_real_estate ?? false,
      sectorInsurance: featureFlags.sector_insurance ?? false,
      sectorHealthcare: featureFlags.sector_healthcare ?? false,
      sectorCdlTrucking: featureFlags.sector_cdl_trucking ?? false,
      sectorCosmetology: featureFlags.sector_cosmetology ?? false,
      sectorItTech: featureFlags.sector_it_tech ?? false,
      sectorCorporateCompliance: featureFlags.sector_corporate_compliance ?? false,
      sectorGovernment: featureFlags.sector_government ?? false,
    },

    // Active sector keys (derived from feature flags)
    activeSectors: deriveActiveSectors(featureFlags),

    // ISA partner config
    isaPartner: featureFlags.isa_enabled
      ? {
          name: "Education Funding Group",
          url: "educationfunding.co",
          contactEmail: "support@educationfunding.co",
        }
      : undefined,
  };
}

function getEnvFallbackConfig(): TenantConfig {
  const name = process.env.NEXT_PUBLIC_PORTAL_NAME || "Portal";

  return {
    id: getTenantId(),
    name,
    shortName: buildShortName(name),
    description:
      process.env.NEXT_PUBLIC_PORTAL_DESCRIPTION ||
      `Admissions and enrollment for ${name}`,

    email:
      process.env.NEXT_PUBLIC_CONTACT_EMAIL || "admissions@example.com",
    phone: process.env.NEXT_PUBLIC_CONTACT_PHONE || "",
    websiteUrl: process.env.NEXT_PUBLIC_WEBSITE_URL || "",
    location: process.env.NEXT_PUBLIC_LOCATION || "",
    trademark: process.env.NEXT_PUBLIC_TRADEMARK || undefined,

    logoUrl: null,
    logoFallbackLetter: name.charAt(0).toUpperCase(),
    primaryColor: process.env.NEXT_PUBLIC_PRIMARY_COLOR || "#F26822",
    secondaryColor:
      process.env.NEXT_PUBLIC_SECONDARY_COLOR || "#FFCE38",
    accentColor: process.env.NEXT_PUBLIC_ACCENT_COLOR || "#FAA62E",

    features: {
      isaEnabled: process.env.NEXT_PUBLIC_FEATURE_ISA === "true",
      remarketingEnabled: true,
      zoomIntegration:
        process.env.NEXT_PUBLIC_FEATURE_ZOOM === "true",
      stripeConnect:
        process.env.NEXT_PUBLIC_FEATURE_STRIPE_CONNECT === "true",
      lmsEnabled: process.env.NEXT_PUBLIC_FEATURE_LMS !== "false",
      aiCourseCreator:
        process.env.NEXT_PUBLIC_FEATURE_AI_COURSE === "true",
      certificates:
        process.env.NEXT_PUBLIC_FEATURE_CERTIFICATES !== "false",
      quizzes: process.env.NEXT_PUBLIC_FEATURE_QUIZZES !== "false",

      // Sector modules
      sectorRealEstate:
        process.env.NEXT_PUBLIC_SECTOR_REAL_ESTATE === "true",
      sectorInsurance:
        process.env.NEXT_PUBLIC_SECTOR_INSURANCE === "true",
      sectorHealthcare:
        process.env.NEXT_PUBLIC_SECTOR_HEALTHCARE === "true",
      sectorCdlTrucking:
        process.env.NEXT_PUBLIC_SECTOR_CDL_TRUCKING === "true",
      sectorCosmetology:
        process.env.NEXT_PUBLIC_SECTOR_COSMETOLOGY === "true",
      sectorItTech:
        process.env.NEXT_PUBLIC_SECTOR_IT_TECH === "true",
      sectorCorporateCompliance:
        process.env.NEXT_PUBLIC_SECTOR_CORPORATE_COMPLIANCE === "true",
      sectorGovernment:
        process.env.NEXT_PUBLIC_SECTOR_GOVERNMENT === "true",
    },
  };
}

/** Derive active sector keys from feature flags */
function deriveActiveSectors(
  flags: Record<string, boolean>
): string[] {
  const sectorMap: Record<string, string> = {
    sector_real_estate: "real_estate",
    sector_insurance: "insurance",
    sector_healthcare: "healthcare",
    sector_cdl_trucking: "cdl_trucking",
    sector_cosmetology: "cosmetology",
    sector_it_tech: "it_tech",
    sector_corporate_compliance: "corporate_compliance",
    sector_government: "government",
  };

  return Object.entries(sectorMap)
    .filter(([flag]) => flags[flag])
    .map(([, key]) => key);
}

/** Build a short portal name from a full org name */
function buildShortName(name: string): string {
  const shortName = process.env.NEXT_PUBLIC_PORTAL_SHORT_NAME;
  if (shortName) return shortName;

  // Use first word + "Portal", e.g. "Acme Training Academy" → "Acme Portal"
  const firstWord = name.split(" ")[0];
  return `${firstWord} Portal`;
}
