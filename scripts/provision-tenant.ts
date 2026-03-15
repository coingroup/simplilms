#!/usr/bin/env npx tsx
// ============================================================================
// SimpliLMS — Tenant Provisioning Script
// ============================================================================
// Creates all configuration artifacts needed to deploy a new SimpliLMS tenant:
//   1. .env file content (paste into Vercel environment variables)
//   2. seed.sql file content (run in tenant's Supabase SQL Editor)
//   3. Checklist of remaining manual steps
//
// Usage:
//   npx tsx scripts/provision-tenant.ts
//
// The script prompts for all required values interactively.
// ============================================================================

import * as crypto from "crypto";
import * as fs from "fs";
import * as path from "path";
import * as readline from "readline";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface TenantConfig {
  tenantName: string;
  contactEmail: string;
  contactPhone: string;
  websiteUrl: string;
  location: string;
  primaryColor: string;
  logoUrl: string;
  supabaseUrl: string;
  supabaseAnonKey: string;
  supabaseServiceRoleKey: string;
  stripeSecretKey: string;
  stripePublishableKey: string;
  stripeIdentityWebhookSecret: string;
  stripePaymentWebhookSecret: string;
  domain: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function createPrompt(): readline.Interface {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
}

function ask(
  rl: readline.Interface,
  question: string,
  defaultValue?: string
): Promise<string> {
  const suffix = defaultValue ? ` [${defaultValue}]` : "";
  return new Promise((resolve) => {
    rl.question(`  ${question}${suffix}: `, (answer) => {
      resolve(answer.trim() || defaultValue || "");
    });
  });
}

function generateSubdomain(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function generateShortName(name: string): string {
  const firstWord = name.split(/\s+/)[0];
  return firstWord.charAt(0).toUpperCase() + firstWord.slice(1) + " Portal";
}

function isValidHex(color: string): boolean {
  return /^#[0-9A-Fa-f]{6}$/.test(color);
}

function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

function escapeSQL(value: string): string {
  return value.replace(/'/g, "''");
}

// ---------------------------------------------------------------------------
// Generators
// ---------------------------------------------------------------------------

function generateEnvContent(
  tenantId: string,
  shortName: string,
  config: TenantConfig
): string {
  return `# =============================================================================
# SimpliLMS — Tenant Environment Variables
# =============================================================================
# Tenant: ${config.tenantName}
# Generated: ${new Date().toISOString()}
#
# Paste these into Vercel > Project Settings > Environment Variables
# or save as .env.local for local development.
# =============================================================================

# -----------------------------------------------------------------------------
# Tenant Configuration
# -----------------------------------------------------------------------------
TENANT_ID=${tenantId}
TENANT_NAME=${config.tenantName}
TENANT_SHORT_NAME=${shortName}
TENANT_EMAIL=${config.contactEmail}
TENANT_WEBSITE_URL=${config.websiteUrl}
TENANT_LOGO_URL=${config.logoUrl}
TENANT_PRIMARY_COLOR=${config.primaryColor}
TENANT_SECONDARY_COLOR=#FFFFFF

# -----------------------------------------------------------------------------
# Supabase
# -----------------------------------------------------------------------------
NEXT_PUBLIC_SUPABASE_URL=${config.supabaseUrl}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${config.supabaseAnonKey}
SUPABASE_SERVICE_ROLE_KEY=${config.supabaseServiceRoleKey}

# -----------------------------------------------------------------------------
# Stripe
# -----------------------------------------------------------------------------
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=${config.stripePublishableKey}
STRIPE_SECRET_KEY=${config.stripeSecretKey}
STRIPE_IDENTITY_WEBHOOK_SECRET=${config.stripeIdentityWebhookSecret}
STRIPE_PAYMENT_WEBHOOK_SECRET=${config.stripePaymentWebhookSecret}

# -----------------------------------------------------------------------------
# n8n Webhooks (configure after importing workflows)
# -----------------------------------------------------------------------------
N8N_WEBHOOK_BASE_URL=
N8N_REMARKETING_WEBHOOK_URL=
N8N_WEBHOOK_APPLICATION_SUBMIT=
N8N_WEBHOOK_APPLICATION_REVIEW=
N8N_WEBHOOK_ENROLLMENT_CONFIRMED=

# -----------------------------------------------------------------------------
# App Configuration
# -----------------------------------------------------------------------------
NEXT_PUBLIC_APP_URL=https://${config.domain}
NEXT_PUBLIC_PORTAL_URL=https://${config.domain}
NEXT_PUBLIC_SITE_NAME=${config.tenantName}
`;
}

function generateSeedSQL(
  tenantId: string,
  config: TenantConfig
): string {
  const templatePath = path.join(__dirname, "templates", "tenant-seed.sql");
  let template: string;

  try {
    template = fs.readFileSync(templatePath, "utf-8");
  } catch {
    // Fallback if template file is not found — generate inline
    template = `-- Tenant Seed: {{TENANT_NAME}}
-- Generated at: {{GENERATED_AT}}

INSERT INTO public.tenants (
  id,
  name,
  subdomain,
  custom_domain,
  logo_url,
  primary_color,
  secondary_color,
  feature_flags
)
VALUES (
  '{{TENANT_ID}}',
  '{{TENANT_NAME}}',
  '{{TENANT_SUBDOMAIN}}',
  '{{TENANT_DOMAIN}}',
  {{LOGO_URL}},
  '{{PRIMARY_COLOR}}',
  '{{SECONDARY_COLOR}}',
  '{
    "admissions": true,
    "crm": true,
    "messaging": true,
    "classes": true,
    "instructor_marketplace": true,
    "stripe_payments": true,
    "stripe_identity": true,
    "zoom_integration": true,
    "remarketing": true,
    "white_label": false
  }'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  subdomain = EXCLUDED.subdomain,
  custom_domain = EXCLUDED.custom_domain,
  logo_url = EXCLUDED.logo_url,
  primary_color = EXCLUDED.primary_color,
  secondary_color = EXCLUDED.secondary_color,
  updated_at = now();`;
  }

  const subdomain = generateSubdomain(config.tenantName);
  const logoUrlSQL = config.logoUrl
    ? `'${escapeSQL(config.logoUrl)}'`
    : "NULL";

  return template
    .replace(/\{\{TENANT_ID\}\}/g, tenantId)
    .replace(/\{\{TENANT_NAME\}\}/g, escapeSQL(config.tenantName))
    .replace(/\{\{TENANT_SUBDOMAIN\}\}/g, escapeSQL(subdomain))
    .replace(/\{\{TENANT_DOMAIN\}\}/g, escapeSQL(config.domain))
    .replace(/\{\{LOGO_URL\}\}/g, logoUrlSQL)
    .replace(/\{\{PRIMARY_COLOR\}\}/g, config.primaryColor)
    .replace(/\{\{SECONDARY_COLOR\}\}/g, "#FFFFFF")
    .replace(/\{\{GENERATED_AT\}\}/g, new Date().toISOString());
}

function generateChecklist(
  tenantId: string,
  shortName: string,
  config: TenantConfig
): string {
  return `
================================================================================
  REMAINING MANUAL STEPS
================================================================================

  Tenant: ${config.tenantName}
  ID:     ${tenantId}
  Domain: ${config.domain}

  1. [ ] Create a new Supabase project (if not already created)
         - Region: Choose closest to ${config.location || "tenant location"}
         - Note the project URL and keys

  2. [ ] Apply database migrations to the Supabase project
         Run: npx tsx scripts/apply-migrations.ts \\
                --url ${config.supabaseUrl} \\
                --key ${config.supabaseServiceRoleKey.substring(0, 10)}...
         Or paste each migration file into the Supabase SQL Editor manually.

  3. [ ] Run the generated seed.sql in the Supabase SQL Editor
         This inserts the tenant row into the tenants table.

  4. [ ] Create the "citizenship-documents" Storage bucket in Supabase
         - Dashboard > Storage > New Bucket
         - Name: citizenship-documents
         - Public: OFF (private bucket)

  5. [ ] Register the custom_access_token_hook in Supabase
         - Dashboard > Authentication > Hooks
         - Hook: Customize Access Token
         - Function: custom_access_token_hook

  6. [ ] Configure Stripe webhooks
         - Go to Stripe Dashboard > Developers > Webhooks
         - Add endpoint: https://${config.domain}/api/stripe/identity-webhook
           Events: identity.verification_session.*
         - Add endpoint: https://${config.domain}/api/stripe/payment-webhook
           Events: checkout.session.completed, payment_intent.succeeded,
                   payment_intent.payment_failed, invoice.paid

  7. [ ] Deploy to Vercel
         - Create a new Vercel project linked to the simplilms repo
         - Set the root directory to apps/platform
         - Add all environment variables from the generated .env content
         - Configure the custom domain: ${config.domain}

  8. [ ] Set up DNS
         - Add a CNAME record: ${config.domain} -> cname.vercel-dns.com

  9. [ ] Create the first super_admin user
         - Sign up via the portal login page
         - In Supabase SQL Editor, run:
           UPDATE public.profiles
           SET role = 'super_admin', tenant_id = '${tenantId}'
           WHERE email = '<admin-email-here>';

 10. [ ] (Optional) Import n8n workflows
         - Import workflows from n8n/workflows/ into the n8n instance
         - Configure webhook URLs in the .env

 11. [ ] Verify end-to-end
         - Log in as super_admin
         - Create a test prospect
         - Walk through the admissions pipeline

================================================================================
`;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  console.log("");
  console.log("================================================================================");
  console.log("  SimpliLMS — Tenant Provisioning");
  console.log("================================================================================");
  console.log("");
  console.log("  This script generates all configuration needed to deploy a new tenant.");
  console.log("  Answer each prompt below. Press Enter to accept defaults shown in [brackets].");
  console.log("");

  const rl = createPrompt();

  try {
    // --- Collect tenant information ---

    console.log("  --- Tenant Information ---");
    console.log("");

    const tenantName = await ask(rl, "Tenant name (e.g., Acme Training Academy)");
    if (!tenantName) {
      console.error("\n  Error: Tenant name is required.\n");
      process.exit(1);
    }

    const contactEmail = await ask(rl, "Contact email");
    if (!contactEmail) {
      console.error("\n  Error: Contact email is required.\n");
      process.exit(1);
    }

    const contactPhone = await ask(rl, "Contact phone");
    const websiteUrl = await ask(rl, "Website URL");
    const location = await ask(rl, "Location (city, state)");

    let primaryColor = await ask(rl, "Primary brand color (hex)", "#333333");
    if (!isValidHex(primaryColor)) {
      console.warn(`\n  Warning: "${primaryColor}" is not a valid hex color. Using #333333.\n`);
      primaryColor = "#333333";
    }

    const logoUrl = await ask(rl, "Logo URL (optional, press Enter to skip)");
    if (logoUrl && !isValidUrl(logoUrl)) {
      console.warn(`\n  Warning: "${logoUrl}" does not appear to be a valid URL.\n`);
    }

    console.log("");
    console.log("  --- Supabase Configuration ---");
    console.log("");

    const supabaseUrl = await ask(rl, "Supabase project URL (e.g., https://xxx.supabase.co)");
    if (!supabaseUrl) {
      console.error("\n  Error: Supabase URL is required.\n");
      process.exit(1);
    }

    const supabaseAnonKey = await ask(rl, "Supabase anon key");
    if (!supabaseAnonKey) {
      console.error("\n  Error: Supabase anon key is required.\n");
      process.exit(1);
    }

    const supabaseServiceRoleKey = await ask(rl, "Supabase service role key");
    if (!supabaseServiceRoleKey) {
      console.error("\n  Error: Supabase service role key is required.\n");
      process.exit(1);
    }

    console.log("");
    console.log("  --- Stripe Configuration ---");
    console.log("");

    const stripeSecretKey = await ask(rl, "Stripe secret key (sk_...)");
    if (!stripeSecretKey) {
      console.error("\n  Error: Stripe secret key is required.\n");
      process.exit(1);
    }

    const stripePublishableKey = await ask(rl, "Stripe publishable key (pk_...)");
    if (!stripePublishableKey) {
      console.error("\n  Error: Stripe publishable key is required.\n");
      process.exit(1);
    }

    const stripeIdentityWebhookSecret = await ask(
      rl,
      "Stripe Identity webhook secret (whsec_...)"
    );
    if (!stripeIdentityWebhookSecret) {
      console.error("\n  Error: Stripe Identity webhook secret is required.\n");
      process.exit(1);
    }

    const stripePaymentWebhookSecret = await ask(
      rl,
      "Stripe Payment webhook secret (whsec_...)"
    );
    if (!stripePaymentWebhookSecret) {
      console.error("\n  Error: Stripe Payment webhook secret is required.\n");
      process.exit(1);
    }

    console.log("");
    console.log("  --- Domain ---");
    console.log("");

    const defaultDomain = `${generateSubdomain(tenantName)}.simplilms.com`;
    const domain = await ask(rl, "Domain", defaultDomain);

    rl.close();

    // --- Generate outputs ---

    const tenantId = crypto.randomUUID();
    const shortName = generateShortName(tenantName);

    const config: TenantConfig = {
      tenantName,
      contactEmail,
      contactPhone,
      websiteUrl,
      location,
      primaryColor,
      logoUrl,
      supabaseUrl,
      supabaseAnonKey,
      supabaseServiceRoleKey,
      stripeSecretKey,
      stripePublishableKey,
      stripeIdentityWebhookSecret,
      stripePaymentWebhookSecret,
      domain,
    };

    const envContent = generateEnvContent(tenantId, shortName, config);
    const seedSQL = generateSeedSQL(tenantId, config);
    const checklist = generateChecklist(tenantId, shortName, config);

    // --- Write output files ---

    const outputDir = path.join(__dirname, "..", "tenants", generateSubdomain(tenantName));
    fs.mkdirSync(outputDir, { recursive: true });

    const envPath = path.join(outputDir, ".env");
    const seedPath = path.join(outputDir, "seed.sql");

    fs.writeFileSync(envPath, envContent, "utf-8");
    fs.writeFileSync(seedPath, seedSQL, "utf-8");

    // --- Print results ---

    console.log("");
    console.log("================================================================================");
    console.log("  TENANT PROVISIONED SUCCESSFULLY");
    console.log("================================================================================");
    console.log("");
    console.log(`  Tenant ID:    ${tenantId}`);
    console.log(`  Tenant Name:  ${tenantName}`);
    console.log(`  Short Name:   ${shortName}`);
    console.log(`  Subdomain:    ${generateSubdomain(tenantName)}`);
    console.log(`  Domain:       ${domain}`);
    console.log(`  Primary Color: ${primaryColor}`);
    console.log("");
    console.log("  Files generated:");
    console.log(`    .env      -> ${envPath}`);
    console.log(`    seed.sql  -> ${seedPath}`);
    console.log("");

    // Print .env content
    console.log("================================================================================");
    console.log("  ENVIRONMENT VARIABLES (.env)");
    console.log("================================================================================");
    console.log("");
    console.log(envContent);

    // Print seed SQL
    console.log("================================================================================");
    console.log("  SEED SQL (run in Supabase SQL Editor)");
    console.log("================================================================================");
    console.log("");
    console.log(seedSQL);

    // Print checklist
    console.log(checklist);
  } catch (error) {
    rl.close();
    console.error("\n  Error during provisioning:", error);
    process.exit(1);
  }
}

main();
