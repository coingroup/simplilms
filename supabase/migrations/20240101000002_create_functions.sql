-- ============================================================================
-- Migration 3: Database Functions
-- ============================================================================
-- Creates all application-level PostgreSQL functions:
--
--   1. custom_access_token_hook  — Adds role + tenant_id to JWT claims
--   2. update_student_profile    — Restricts which fields students can update
--   3. generate_application_number — Sequential APP-YYYY-NNNNN format
--   4. generate_enrollment_number  — Sequential ENR-YYYY-NNNNN format
--   5. handle_updated_at          — Trigger function (already created in
--                                   migration 1, included here for reference
--                                   as CREATE OR REPLACE)
--
-- All functions use SECURITY DEFINER where they need elevated privileges
-- to read from tables that the calling user may not have direct access to.
-- ============================================================================


-- ============================================================================
-- 1. custom_access_token_hook
-- ============================================================================
-- Supabase Auth hook that enriches JWT access tokens with custom claims.
-- When a user authenticates, this function is called to add:
--   - user_role: The user's role from the profiles table
--   - tenant_id: The user's tenant from the profiles table
--
-- These claims are then available in RLS policies via current_user_role()
-- and current_tenant_id() helper functions.
--
-- IMPORTANT: This function must be registered as an Auth hook in the
-- Supabase dashboard under Authentication > Hooks > Customize Access Token.

CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event jsonb)
RETURNS jsonb AS $$
DECLARE
  claims jsonb;
  user_role text;
  user_tenant_id uuid;
BEGIN
  -- Look up the user's role and tenant from the profiles table
  SELECT role, tenant_id
  INTO user_role, user_tenant_id
  FROM public.profiles
  WHERE id = (event->>'user_id')::uuid;

  -- Get the existing claims from the event
  claims := event->'claims';

  -- Only add custom claims if the user has a profile
  IF user_role IS NOT NULL THEN
    claims := jsonb_set(claims, '{user_role}', to_jsonb(user_role));
    claims := jsonb_set(claims, '{tenant_id}', to_jsonb(user_tenant_id::text));
  END IF;

  -- Return the modified event with updated claims
  event := jsonb_set(event, '{claims}', claims);
  RETURN event;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to supabase_auth_admin so the Auth hook can call it
GRANT EXECUTE ON FUNCTION public.custom_access_token_hook(jsonb) TO supabase_auth_admin;

-- Revoke from public for security
REVOKE EXECUTE ON FUNCTION public.custom_access_token_hook(jsonb) FROM public;
REVOKE EXECUTE ON FUNCTION public.custom_access_token_hook(jsonb) FROM anon;
REVOKE EXECUTE ON FUNCTION public.custom_access_token_hook(jsonb) FROM authenticated;


-- ============================================================================
-- 2. update_student_profile
-- ============================================================================
-- Restricts which profile fields students can update.
-- Students can ONLY update: address, mailing_address, phone, email.
-- All other fields (name, DOB, citizenship, program, etc.) require admin.
--
-- Uses SECURITY DEFINER to bypass RLS and directly update the row,
-- but only for the authenticated user's own profile (auth.uid()).
--
-- Usage from client: SELECT update_student_profile(p_phone := '+1234567890');

CREATE OR REPLACE FUNCTION public.update_student_profile(
  p_address text DEFAULT NULL,
  p_mailing_address text DEFAULT NULL,
  p_phone text DEFAULT NULL,
  p_email text DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  UPDATE public.profiles
  SET
    address = COALESCE(p_address, address),
    mailing_address = COALESCE(p_mailing_address, mailing_address),
    phone = COALESCE(p_phone, phone),
    email = COALESCE(p_email, email),
    updated_at = now()
  WHERE id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================================================
-- 3. generate_application_number
-- ============================================================================
-- Generates sequential application numbers in the format: APP-YYYY-NNNNN
-- Example: APP-2024-00001, APP-2024-00002, etc.
--
-- The sequence resets each year (the year prefix changes).
-- Uses MAX() on existing application numbers to determine the next number.
--
-- NOTE: In high-concurrency scenarios, consider using a Postgres sequence
-- or advisory lock to prevent race conditions. For the expected volume of
-- this application (tens to hundreds per year), MAX() is sufficient.

CREATE OR REPLACE FUNCTION public.generate_application_number()
RETURNS text AS $$
DECLARE
  next_num integer;
  year_part text;
BEGIN
  year_part := to_char(now(), 'YYYY');

  -- Find the highest existing number for this year and increment
  SELECT COALESCE(
    MAX(CAST(SUBSTRING(application_number FROM 10) AS integer)),
    0
  ) + 1
  INTO next_num
  FROM public.applications
  WHERE application_number LIKE 'APP-' || year_part || '-%';

  RETURN 'APP-' || year_part || '-' || LPAD(next_num::text, 5, '0');
END;
$$ LANGUAGE plpgsql;


-- ============================================================================
-- 4. generate_enrollment_number
-- ============================================================================
-- Generates sequential enrollment numbers in the format: ENR-YYYY-NNNNN
-- Example: ENR-2024-00001, ENR-2024-00002, etc.
--
-- Same pattern as generate_application_number but for enrollments.

CREATE OR REPLACE FUNCTION public.generate_enrollment_number()
RETURNS text AS $$
DECLARE
  next_num integer;
  year_part text;
BEGIN
  year_part := to_char(now(), 'YYYY');

  -- Find the highest existing number for this year and increment
  SELECT COALESCE(
    MAX(CAST(SUBSTRING(enrollment_number FROM 10) AS integer)),
    0
  ) + 1
  INTO next_num
  FROM public.enrollments
  WHERE enrollment_number LIKE 'ENR-' || year_part || '-%';

  RETURN 'ENR-' || year_part || '-' || LPAD(next_num::text, 5, '0');
END;
$$ LANGUAGE plpgsql;


-- ============================================================================
-- 5. handle_updated_at (CREATE OR REPLACE — idempotent)
-- ============================================================================
-- This function was initially created in Migration 1 (create_schema).
-- Included here as CREATE OR REPLACE for completeness and to ensure
-- it exists if migrations are run independently.
--
-- Automatically sets updated_at = now() on any row update.
-- Applied via BEFORE UPDATE triggers on all tables with updated_at columns.

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
