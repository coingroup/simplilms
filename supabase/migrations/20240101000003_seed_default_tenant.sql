-- ============================================================================
-- Migration 4: Seed Default Tenant
-- ============================================================================
-- Creates the default COIN Education Services Center tenant.
--
-- This tenant uses a well-known UUID (00000000-0000-0000-0000-000000000001)
-- so it can be referenced consistently across:
--   - Application code (environment variables, config)
--   - n8n workflows (hardcoded tenant context for COIN Education operations)
--   - Seed data and test fixtures
--   - RLS policy fallback logic
--
-- Brand colors match the official COIN Education identity:
--   - Primary Orange: #F26822
--   - Golden Yellow: #FFCE38
-- ============================================================================

INSERT INTO public.tenants (
  id,
  name,
  subdomain,
  primary_color,
  secondary_color,
  feature_flags
)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'COIN Education Services Center',
  'coin-education',
  '#F26822',
  '#FFCE38',
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
);
