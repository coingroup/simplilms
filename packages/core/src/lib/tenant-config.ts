/**
 * Tenant configuration types and runtime config for the portal.
 *
 * In the single-tenant-per-deployment model, each Vercel deployment serves
 * exactly one tenant (school). The TenantConfig is loaded once at startup
 * from the Supabase `tenants` table and cached for the server process lifetime.
 */

export interface TenantConfig {
  /** Tenant UUID */
  id: string;

  /** Full organization name, e.g. "Acme Training Academy" */
  name: string;

  /** Short name for sidebar/header, e.g. "Acme Portal" */
  shortName: string;

  /** Site description for metadata */
  description: string;

  /** Primary contact email */
  email: string;

  /** Primary phone number */
  phone: string;

  /** Public-facing website URL */
  websiteUrl: string;

  /** Location string, e.g. "Atlanta, GA" */
  location: string;

  /** Trademark or legal name (used in footers), e.g. "Acme Training Center" */
  trademark?: string;

  /** Logo URL (from Supabase Storage or external) */
  logoUrl: string | null;

  /** Single character shown in gradient fallback logo */
  logoFallbackLetter: string;

  /** Primary brand color hex, e.g. "#F26822" */
  primaryColor: string;

  /** Secondary brand color hex, e.g. "#FFCE38" */
  secondaryColor: string;

  /** Accent brand color hex, e.g. "#FAA62E" */
  accentColor: string;

  /** Feature flags controlling which modules are enabled */
  features: {
    /** Income Share Agreement option available */
    isaEnabled: boolean;
    /** Remarketing/campaign tools available */
    remarketingEnabled: boolean;
    /** Zoom classroom integration */
    zoomIntegration: boolean;
    /** Stripe Connect instructor marketplace */
    stripeConnect: boolean;
  };

  /** ISA partner details (only if isaEnabled) */
  isaPartner?: {
    name: string;
    url: string;
    contactEmail: string;
  };
}
