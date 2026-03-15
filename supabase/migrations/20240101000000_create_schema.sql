-- ============================================================================
-- Migration 1: Create Schema
-- ============================================================================
-- Creates all 17 tables for the COIN Education platform with proper types,
-- constraints, defaults, foreign keys, indexes, and updated_at triggers.
--
-- Tables are created in dependency order to satisfy foreign key references.
--
-- Multi-tenancy: Every data table includes a tenant_id column referencing
-- the tenants table, enabling white-label data isolation via RLS.
-- ============================================================================

-- ============================================================================
-- 0. Updated_at trigger function
-- ============================================================================
-- Automatically sets updated_at = now() on any row update for tables that
-- have an updated_at column.

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 1. tenants — Multi-tenant foundation
-- ============================================================================
-- Each tenant represents a separate school/organization using the platform.
-- COIN Education is the default tenant; white-label customers get their own.

CREATE TABLE public.tenants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  subdomain text UNIQUE NOT NULL,
  custom_domain text,
  logo_url text,
  primary_color text DEFAULT '#F26822',       -- COIN Education Primary Orange
  secondary_color text DEFAULT '#FFCE38',     -- COIN Education Golden Yellow
  stripe_account_id text,
  brevo_api_key text,
  zoom_credentials jsonb,
  feature_flags jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TRIGGER set_tenants_updated_at
  BEFORE UPDATE ON public.tenants
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================================
-- 2. profiles — Extends auth.users with application-specific data
-- ============================================================================
-- Every authenticated user has a profile row. The id column references
-- auth.users directly (1:1 relationship). Role and tenant determine access.

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  tenant_id uuid NOT NULL REFERENCES public.tenants(id),
  role text NOT NULL CHECK (role IN ('super_admin', 'school_rep', 'teacher_paid', 'teacher_unpaid', 'student')),
  first_name text,
  last_name text,
  email text,
  phone text,
  address text,
  mailing_address text,
  date_of_birth date,
  citizenship_status text,
  program_of_interest text,
  stripe_customer_id text,
  stripe_connect_id text,                     -- For instructors (Stripe Connect)
  avatar_url text,
  notification_preferences jsonb DEFAULT '{
    "message_alerts": {"email": true, "sms": true, "in_app": true},
    "class_reminders": {"email": true, "sms": false, "in_app": true},
    "payment_updates": {"email": true, "sms": true, "in_app": true},
    "emergency_alerts": {"email": true, "sms": true, "in_app": true}
  }'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================================
-- 3. prospects — Pre-application leads from interest forms
-- ============================================================================
-- Prospects enter the system via the public website interest form.
-- They are tracked through discovery calls and eligibility decisions
-- before being invited to submit a full application.

CREATE TABLE public.prospects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id),
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL,
  phone text,
  program_interest text,
  source text,
  inquiry_ip_address inet,
  inquiry_user_agent text,
  inquiry_submitted_at timestamptz DEFAULT now(),
  discovery_call_date timestamptz,
  discovery_call_zoom_link text,
  google_calendar_event_id text,
  eligibility_status text DEFAULT 'pending' CHECK (eligibility_status IN ('pending', 'yes', 'no', 'maybe')),
  eligibility_marked_by uuid REFERENCES public.profiles(id),
  eligibility_marked_at timestamptz,
  remarketing_eligible boolean DEFAULT true,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TRIGGER set_prospects_updated_at
  BEFORE UPDATE ON public.prospects
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================================
-- 4. programs — Educational programs offered by each tenant
-- ============================================================================
-- Programs define what students enroll in. Each has its own tuition
-- and enrollment fee structure.

CREATE TABLE public.programs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id),
  name text NOT NULL,
  description text,
  tuition_amount_cents integer,
  enrollment_fee_cents integer DEFAULT 220000, -- $2,200 in cents
  duration_weeks integer,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TRIGGER set_programs_updated_at
  BEFORE UPDATE ON public.programs
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================================
-- 5. applications — Full application with demographics, citizenship, KYC
-- ============================================================================
-- Applications are created after a prospect is marked eligible (Yes).
-- Includes full demographic data, citizenship verification fields,
-- Stripe Identity KYC status, and ISA consent tracking.

CREATE TABLE public.applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id),
  prospect_id uuid REFERENCES public.prospects(id),
  user_id uuid REFERENCES public.profiles(id),
  application_number text UNIQUE,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'under_review', 'approved', 'rejected', 'enrolled')),
  -- Demographics
  first_name text,
  last_name text,
  middle_name text,
  email text,
  phone text,
  date_of_birth date,
  address_line1 text,
  address_line2 text,
  city text,
  state text,
  zip_code text,
  country text DEFAULT 'US',
  mailing_address_line1 text,
  mailing_address_line2 text,
  mailing_city text,
  mailing_state text,
  mailing_zip text,
  mailing_country text,
  -- Program
  program_id uuid REFERENCES public.programs(id),
  -- Citizenship verification (Layer 2: self-declared)
  citizenship_status text,
  citizenship_document_type text,
  citizenship_document_url text,
  -- KYC via Stripe Identity (Layer 1: identity verification)
  stripe_identity_session_id text,
  stripe_identity_status text,
  stripe_identity_verified_at timestamptz,
  -- Submission metadata (audit trail)
  submitted_ip_address inet,
  submitted_user_agent text,
  submitted_at timestamptz,
  -- Review
  reviewed_by uuid REFERENCES public.profiles(id),
  reviewed_at timestamptz,
  rejection_reason text,
  -- ISA consent tracking
  isa_consent_given boolean DEFAULT false,
  isa_consent_text text,
  isa_consent_timestamp timestamptz,
  isa_consent_ip_address inet,
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TRIGGER set_applications_updated_at
  BEFORE UPDATE ON public.applications
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================================
-- 6. enrollments — Active student enrollments
-- ============================================================================
-- Created after successful payment of enrollment fees.
-- Links to the application and tracks tuition payment method selection.
-- application_id is UNIQUE to prevent duplicate enrollments.

CREATE TABLE public.enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id),
  application_id uuid UNIQUE REFERENCES public.applications(id),
  user_id uuid NOT NULL REFERENCES public.profiles(id),
  enrollment_number text UNIQUE,
  program_id uuid NOT NULL REFERENCES public.programs(id),
  status text DEFAULT 'active' CHECK (status IN ('active', 'payment_plan_active', 'suspended', 'completed', 'withdrawn')),
  tuition_payment_method text CHECK (tuition_payment_method IN ('full_payment', 'isa')),
  enrolled_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TRIGGER set_enrollments_updated_at
  BEFORE UPDATE ON public.enrollments
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================================
-- 7. payments — All financial transactions
-- ============================================================================
-- Tracks every payment through the enrollment and tuition lifecycle.
-- Each fee type is tracked separately for accounting clarity.
-- stripe_payment_intent_id is UNIQUE for idempotency.

CREATE TABLE public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id),
  user_id uuid NOT NULL REFERENCES public.profiles(id),
  application_id uuid REFERENCES public.applications(id),
  enrollment_id uuid REFERENCES public.enrollments(id),
  stripe_payment_intent_id text UNIQUE,
  stripe_checkout_session_id text,
  stripe_invoice_id text,
  amount_cents integer NOT NULL,
  currency text DEFAULT 'usd',
  fee_type text NOT NULL CHECK (fee_type IN ('registration', 'admission', 'document', 'deposit', 'tuition', 'installment')),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'succeeded', 'failed', 'refunded')),
  payment_method text,
  paid_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TRIGGER set_payments_updated_at
  BEFORE UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================================
-- 8. messages — In-portal messaging system
-- ============================================================================
-- Supports admin-to-student, rep-to-prospect, and teacher-to-student
-- messaging. System-generated messages (payment confirmations, etc.)
-- are flagged with is_system = true.

CREATE TABLE public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id),
  sender_id uuid REFERENCES public.profiles(id),
  recipient_id uuid NOT NULL REFERENCES public.profiles(id),
  subject text,
  body text NOT NULL,
  is_read boolean DEFAULT false,
  read_at timestamptz,
  is_system boolean DEFAULT false,
  message_type text DEFAULT 'general' CHECK (message_type IN ('general', 'payment_update', 'emergency', 'class_reminder')),
  created_at timestamptz DEFAULT now()
);

-- ============================================================================
-- 9. communication_templates — Reusable message templates for remarketing
-- ============================================================================
-- Templates support merge codes: {{first_name}}, {{last_name}},
-- {{program}}, {{payment_link}}, {{website_link}}.
-- Used for email, SMS, and WhatsApp outreach campaigns.

CREATE TABLE public.communication_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id),
  name text NOT NULL,
  channel text NOT NULL CHECK (channel IN ('email', 'sms', 'whatsapp')),
  subject text,
  body text NOT NULL,
  created_by uuid REFERENCES public.profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TRIGGER set_communication_templates_updated_at
  BEFORE UPDATE ON public.communication_templates
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================================
-- 10. communication_log — Trackable outbound communications
-- ============================================================================
-- Every outbound email, SMS, and WhatsApp message is logged here.
-- Tracking IDs allow link-click and open tracking for remarketing analytics.

CREATE TABLE public.communication_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id),
  template_id uuid REFERENCES public.communication_templates(id),
  recipient_id uuid,                          -- Can reference profiles or prospects
  recipient_type text DEFAULT 'profile' CHECK (recipient_type IN ('profile', 'prospect')),
  channel text NOT NULL,
  sent_at timestamptz DEFAULT now(),
  delivered_at timestamptz,
  opened_at timestamptz,
  clicked_at timestamptz,
  tracking_id text UNIQUE,
  link_url text,
  metadata jsonb
);

-- ============================================================================
-- 11. classes — Instructor-led classes with Zoom integration
-- ============================================================================
-- Classes are assigned to instructors and linked to programs.
-- Zoom meeting details are stored for in-portal classroom access.
-- Commission rate defaults to 50% (COIN Education / Instructor split).

CREATE TABLE public.classes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id),
  program_id uuid REFERENCES public.programs(id),
  instructor_id uuid NOT NULL REFERENCES public.profiles(id),
  name text NOT NULL,
  description text,
  zoom_meeting_id text,
  zoom_join_url text,
  zoom_start_url text,
  schedule jsonb,                             -- Recurring schedule definition
  max_students integer,
  commission_rate numeric DEFAULT 0.50,       -- 50% instructor / 50% platform
  price_cents integer,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TRIGGER set_classes_updated_at
  BEFORE UPDATE ON public.classes
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================================
-- 12. class_enrollments — Student enrollment in specific classes
-- ============================================================================

CREATE TABLE public.class_enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id),
  class_id uuid NOT NULL REFERENCES public.classes(id),
  student_id uuid NOT NULL REFERENCES public.profiles(id),
  stripe_payment_intent_id text,
  status text DEFAULT 'enrolled' CHECK (status IN ('enrolled', 'dropped', 'completed')),
  enrolled_at timestamptz DEFAULT now()
);

-- ============================================================================
-- 13. attendance — Per-session attendance tracking
-- ============================================================================
-- Instructors mark attendance for each class session.
-- Supports present, absent, late, and excused statuses.

CREATE TABLE public.attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id),
  class_id uuid NOT NULL REFERENCES public.classes(id),
  student_id uuid NOT NULL REFERENCES public.profiles(id),
  session_date date NOT NULL,
  status text NOT NULL CHECK (status IN ('present', 'absent', 'late', 'excused')),
  marked_by uuid NOT NULL REFERENCES public.profiles(id),
  marked_at timestamptz DEFAULT now()
);

-- ============================================================================
-- 14. consent_records — Auditable consent tracking (FERPA, ISA, marketing)
-- ============================================================================
-- Every consent action is recorded with full audit trail including
-- IP address, user agent, and the exact text the user consented to.
-- Consent can be revoked (revoked_at timestamp set).

CREATE TABLE public.consent_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id),
  user_id uuid NOT NULL REFERENCES public.profiles(id),
  consent_type text NOT NULL CHECK (consent_type IN ('isa_data_sharing', 'marketing_email', 'marketing_sms', 'terms_of_service', 'privacy_policy')),
  consent_text text NOT NULL,
  consented boolean NOT NULL,
  ip_address inet,
  user_agent text,
  consented_at timestamptz DEFAULT now(),
  revoked_at timestamptz
);

-- ============================================================================
-- 15. audit_log — System-wide audit trail
-- ============================================================================
-- Records all significant data changes for compliance and debugging.
-- old_values and new_values store the before/after state as JSONB.

CREATE TABLE public.audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id),
  actor_id uuid REFERENCES public.profiles(id),
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  old_values jsonb,
  new_values jsonb,
  ip_address inet,
  created_at timestamptz DEFAULT now()
);

-- ============================================================================
-- 16. error_log — Centralized error tracking
-- ============================================================================
-- All system errors (n8n workflow failures, webhook errors, API errors)
-- are logged here for monitoring and resolution tracking.
-- tenant_id is nullable because some errors are system-wide.

CREATE TABLE public.error_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES public.tenants(id), -- Nullable for system-wide errors
  source text NOT NULL,                          -- 'n8n', 'stripe_webhook', 'brevo', 'twilio', etc.
  error_type text,
  error_message text NOT NULL,
  stack_trace text,
  context jsonb,
  resolved boolean DEFAULT false,
  resolved_by uuid REFERENCES public.profiles(id),
  resolved_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- ============================================================================
-- 17. webhook_events — Idempotency tracking for inbound webhooks
-- ============================================================================
-- Every webhook event from external providers is logged here before processing.
-- The event_id (provider's unique event ID) is checked for deduplication
-- to prevent double-processing of events.
-- tenant_id is nullable because some webhook events arrive before tenant context.

CREATE TABLE public.webhook_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES public.tenants(id), -- Nullable for pre-tenant-resolution events
  provider text NOT NULL,                        -- 'stripe', 'twilio', 'zoom', 'brevo'
  event_id text UNIQUE NOT NULL,                 -- Provider's event ID for deduplication
  event_type text NOT NULL,
  payload jsonb,
  processed boolean DEFAULT false,
  processed_at timestamptz,
  created_at timestamptz DEFAULT now()
);


-- ============================================================================
-- INDEXES — Performance optimization for common query patterns
-- ============================================================================

-- prospects: CRM pipeline queries by tenant + status, and email lookups
CREATE INDEX idx_prospects_tenant_status ON public.prospects (tenant_id, eligibility_status);
CREATE INDEX idx_prospects_tenant_email ON public.prospects (tenant_id, email);

-- applications: Pipeline views by tenant + status, and per-user lookups
CREATE INDEX idx_applications_tenant_status ON public.applications (tenant_id, status);
CREATE INDEX idx_applications_tenant_user ON public.applications (tenant_id, user_id);

-- enrollments: Student management by tenant + user, and status filtering
CREATE INDEX idx_enrollments_tenant_user ON public.enrollments (tenant_id, user_id);
CREATE INDEX idx_enrollments_tenant_status ON public.enrollments (tenant_id, status);

-- payments: Financial reports by tenant + user, status, and Stripe lookups
CREATE INDEX idx_payments_tenant_user ON public.payments (tenant_id, user_id);
CREATE INDEX idx_payments_tenant_status ON public.payments (tenant_id, status);
CREATE INDEX idx_payments_stripe_intent ON public.payments (stripe_payment_intent_id);

-- messages: Inbox queries by recipient and read status
CREATE INDEX idx_messages_tenant_recipient_read ON public.messages (tenant_id, recipient_id, is_read);

-- classes: Instructor dashboard queries
CREATE INDEX idx_classes_tenant_instructor ON public.classes (tenant_id, instructor_id);

-- class_enrollments: Class roster and student schedule queries
CREATE INDEX idx_class_enrollments_tenant_class_student ON public.class_enrollments (tenant_id, class_id, student_id);

-- attendance: Session-based attendance reports
CREATE INDEX idx_attendance_tenant_class_date ON public.attendance (tenant_id, class_id, session_date);

-- audit_log: Entity-specific audit trail lookups
CREATE INDEX idx_audit_log_tenant_entity ON public.audit_log (tenant_id, entity_type, entity_id);

-- webhook_events: Deduplication lookups by provider + event_id
CREATE INDEX idx_webhook_events_provider_event ON public.webhook_events (provider, event_id);

-- communication_log: Tracking ID lookups for link tracking
CREATE INDEX idx_communication_log_tenant_tracking ON public.communication_log (tenant_id, tracking_id);
