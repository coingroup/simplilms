-- Add missing configuration columns to the tenants table
-- These columns enable the self-serve Admin Settings UI

ALTER TABLE tenants
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS contact_email text,
  ADD COLUMN IF NOT EXISTS contact_phone text,
  ADD COLUMN IF NOT EXISTS website_url text,
  ADD COLUMN IF NOT EXISTS location text,
  ADD COLUMN IF NOT EXISTS trademark text,
  ADD COLUMN IF NOT EXISTS accent_color text DEFAULT '#FAA62E',
  ADD COLUMN IF NOT EXISTS logo_fallback_letter text DEFAULT 'S',
  ADD COLUMN IF NOT EXISTS notification_settings jsonb DEFAULT '{}';

-- Seed the COIN Education tenant with contact info
UPDATE tenants SET
  description = 'COIN Education Services Center Portal',
  contact_email = 'admissions@coineducation.com',
  contact_phone = '(678) 541-8699',
  website_url = 'https://coineducation.com',
  location = 'Atlanta, GA',
  trademark = 'COIN Education Services Center',
  logo_fallback_letter = 'C'
WHERE id = '00000000-0000-0000-0000-000000000001';
