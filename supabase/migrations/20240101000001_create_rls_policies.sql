-- ============================================================================
-- Migration 2: Row Level Security (RLS) Policies
-- ============================================================================
-- Enables RLS on ALL tables and creates fine-grained access policies.
--
-- Security model:
--   1. Tenant isolation: Every query is scoped to the user's tenant_id
--   2. Role-based access: Policies check the user's role from JWT claims
--   3. Row ownership: Users can only access their own data (students, etc.)
--   4. Service role bypass: The Supabase service_role key bypasses RLS
--      for backend operations (n8n workflows, webhooks, etc.)
--
-- Helper functions (current_user_role, current_tenant_id) extract claims
-- from the JWT token set by the custom_access_token_hook function.
-- ============================================================================

-- ============================================================================
-- Helper Functions for RLS
-- ============================================================================

-- Returns the current user's role from JWT claims.
-- Falls back to 'anonymous' if no role is set.
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS text AS $$
  SELECT coalesce(
    (current_setting('request.jwt.claims', true)::jsonb ->> 'user_role'),
    'anonymous'
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Returns the current user's tenant_id from JWT claims.
-- Falls back to a nil UUID if no tenant is set.
CREATE OR REPLACE FUNCTION public.current_tenant_id()
RETURNS uuid AS $$
  SELECT coalesce(
    (current_setting('request.jwt.claims', true)::jsonb ->> 'tenant_id')::uuid,
    '00000000-0000-0000-0000-000000000000'::uuid
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;


-- ============================================================================
-- Enable RLS on ALL tables
-- ============================================================================

ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prospects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communication_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communication_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consent_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.error_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;


-- ============================================================================
-- TENANTS — Policies
-- ============================================================================
-- super_admin can read their own tenant configuration.
-- No client-side writes; tenant management is backend-only (service role).

CREATE POLICY "tenants_admin_read_own"
  ON public.tenants
  FOR SELECT
  USING (
    id = public.current_tenant_id()
    AND public.current_user_role() = 'super_admin'
  );


-- ============================================================================
-- PROFILES — Policies
-- ============================================================================
-- Users can read and update their own profile.
-- Admins and reps can read all profiles in their tenant.
-- super_admin can update any profile in their tenant.
-- Teachers can read limited student info for students in their classes.
-- super_admin can insert profiles (for user provisioning).

-- Users read their own profile
CREATE POLICY "profiles_users_read_own"
  ON public.profiles
  FOR SELECT
  USING (id = auth.uid());

-- Users update their own profile
-- (field-level restriction enforced at app layer via update_student_profile function)
CREATE POLICY "profiles_users_update_own"
  ON public.profiles
  FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Admins and school reps read all profiles in their tenant
CREATE POLICY "profiles_admin_rep_read_all"
  ON public.profiles
  FOR SELECT
  USING (
    public.current_user_role() IN ('super_admin', 'school_rep')
    AND tenant_id = public.current_tenant_id()
  );

-- super_admin can update any profile in their tenant
CREATE POLICY "profiles_admin_update_all"
  ON public.profiles
  FOR UPDATE
  USING (
    public.current_user_role() = 'super_admin'
    AND tenant_id = public.current_tenant_id()
  )
  WITH CHECK (
    public.current_user_role() = 'super_admin'
    AND tenant_id = public.current_tenant_id()
  );

-- super_admin can insert profiles (creating new users)
CREATE POLICY "profiles_admin_insert"
  ON public.profiles
  FOR INSERT
  WITH CHECK (
    public.current_user_role() = 'super_admin'
    AND tenant_id = public.current_tenant_id()
  );

-- Teachers can read profiles of students enrolled in their classes
CREATE POLICY "profiles_teacher_read_class_students"
  ON public.profiles
  FOR SELECT
  USING (
    public.current_user_role() IN ('teacher_paid', 'teacher_unpaid')
    AND id IN (
      SELECT ce.student_id
      FROM public.class_enrollments ce
      JOIN public.classes c ON ce.class_id = c.id
      WHERE c.instructor_id = auth.uid()
    )
  );


-- ============================================================================
-- PROSPECTS — Policies
-- ============================================================================
-- Only super_admin and school_rep can access prospects.
-- Full CRUD for pipeline management.

CREATE POLICY "prospects_admin_rep_all"
  ON public.prospects
  FOR ALL
  USING (
    public.current_user_role() IN ('super_admin', 'school_rep')
    AND tenant_id = public.current_tenant_id()
  )
  WITH CHECK (
    public.current_user_role() IN ('super_admin', 'school_rep')
    AND tenant_id = public.current_tenant_id()
  );


-- ============================================================================
-- PROGRAMS — Policies
-- ============================================================================
-- Any authenticated user can read active programs in their tenant.
-- super_admin can manage (create, update, delete) programs.

CREATE POLICY "programs_authenticated_read_active"
  ON public.programs
  FOR SELECT
  USING (
    tenant_id = public.current_tenant_id()
    AND is_active = true
  );

-- super_admin can read all programs (including inactive)
CREATE POLICY "programs_admin_read_all"
  ON public.programs
  FOR SELECT
  USING (
    public.current_user_role() = 'super_admin'
    AND tenant_id = public.current_tenant_id()
  );

-- super_admin can insert programs
CREATE POLICY "programs_admin_insert"
  ON public.programs
  FOR INSERT
  WITH CHECK (
    public.current_user_role() = 'super_admin'
    AND tenant_id = public.current_tenant_id()
  );

-- super_admin can update programs
CREATE POLICY "programs_admin_update"
  ON public.programs
  FOR UPDATE
  USING (
    public.current_user_role() = 'super_admin'
    AND tenant_id = public.current_tenant_id()
  )
  WITH CHECK (
    public.current_user_role() = 'super_admin'
    AND tenant_id = public.current_tenant_id()
  );

-- super_admin can delete programs
CREATE POLICY "programs_admin_delete"
  ON public.programs
  FOR DELETE
  USING (
    public.current_user_role() = 'super_admin'
    AND tenant_id = public.current_tenant_id()
  );


-- ============================================================================
-- APPLICATIONS — Policies
-- ============================================================================
-- Students can read their own application.
-- Students can insert (create) their own application.
-- Students can update their own application (while in draft status, enforced at app layer).
-- super_admin has full CRUD on all applications in their tenant.
-- school_rep can read applications (cannot approve/reject — that requires super_admin).

-- Students read their own application
CREATE POLICY "applications_student_read_own"
  ON public.applications
  FOR SELECT
  USING (
    user_id = auth.uid()
    AND tenant_id = public.current_tenant_id()
  );

-- Students can insert their own application
CREATE POLICY "applications_student_insert"
  ON public.applications
  FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND tenant_id = public.current_tenant_id()
  );

-- Students can update their own application (draft stage)
CREATE POLICY "applications_student_update_own"
  ON public.applications
  FOR UPDATE
  USING (
    user_id = auth.uid()
    AND tenant_id = public.current_tenant_id()
  )
  WITH CHECK (
    user_id = auth.uid()
    AND tenant_id = public.current_tenant_id()
  );

-- super_admin full access to all applications in their tenant
CREATE POLICY "applications_admin_all"
  ON public.applications
  FOR ALL
  USING (
    public.current_user_role() = 'super_admin'
    AND tenant_id = public.current_tenant_id()
  )
  WITH CHECK (
    public.current_user_role() = 'super_admin'
    AND tenant_id = public.current_tenant_id()
  );

-- school_rep can read applications (view pipeline, cannot modify)
CREATE POLICY "applications_rep_read"
  ON public.applications
  FOR SELECT
  USING (
    public.current_user_role() = 'school_rep'
    AND tenant_id = public.current_tenant_id()
  );


-- ============================================================================
-- ENROLLMENTS — Policies
-- ============================================================================
-- Students can read their own enrollment.
-- super_admin can manage all enrollments in their tenant.

-- Students read their own enrollment
CREATE POLICY "enrollments_student_read_own"
  ON public.enrollments
  FOR SELECT
  USING (
    user_id = auth.uid()
    AND tenant_id = public.current_tenant_id()
  );

-- super_admin full access
CREATE POLICY "enrollments_admin_all"
  ON public.enrollments
  FOR ALL
  USING (
    public.current_user_role() = 'super_admin'
    AND tenant_id = public.current_tenant_id()
  )
  WITH CHECK (
    public.current_user_role() = 'super_admin'
    AND tenant_id = public.current_tenant_id()
  );


-- ============================================================================
-- PAYMENTS — Policies
-- ============================================================================
-- Students can read their own payments.
-- super_admin can read all payments in their tenant.
-- No client-side inserts/updates; payments are managed by backend (service role).

-- Students read their own payments
CREATE POLICY "payments_student_read_own"
  ON public.payments
  FOR SELECT
  USING (
    user_id = auth.uid()
    AND tenant_id = public.current_tenant_id()
  );

-- super_admin reads all payments in their tenant
CREATE POLICY "payments_admin_read_all"
  ON public.payments
  FOR SELECT
  USING (
    public.current_user_role() = 'super_admin'
    AND tenant_id = public.current_tenant_id()
  );


-- ============================================================================
-- MESSAGES — Policies
-- ============================================================================
-- Recipients can read their messages.
-- Recipients can update their messages (mark as read).
-- super_admin and school_rep can insert messages (send to users).
-- super_admin can read all messages in their tenant (for oversight).
-- Teachers can send messages to students in their classes.

-- Recipients read their own messages
CREATE POLICY "messages_recipient_read"
  ON public.messages
  FOR SELECT
  USING (
    recipient_id = auth.uid()
    AND tenant_id = public.current_tenant_id()
  );

-- Recipients update their messages (mark as read)
CREATE POLICY "messages_recipient_update"
  ON public.messages
  FOR UPDATE
  USING (
    recipient_id = auth.uid()
    AND tenant_id = public.current_tenant_id()
  )
  WITH CHECK (
    recipient_id = auth.uid()
    AND tenant_id = public.current_tenant_id()
  );

-- super_admin reads all messages in tenant (oversight)
CREATE POLICY "messages_admin_read_all"
  ON public.messages
  FOR SELECT
  USING (
    public.current_user_role() = 'super_admin'
    AND tenant_id = public.current_tenant_id()
  );

-- super_admin and school_rep can send messages
CREATE POLICY "messages_admin_rep_insert"
  ON public.messages
  FOR INSERT
  WITH CHECK (
    public.current_user_role() IN ('super_admin', 'school_rep')
    AND tenant_id = public.current_tenant_id()
  );

-- Teachers can send messages to students in their classes
CREATE POLICY "messages_teacher_send_to_class_students"
  ON public.messages
  FOR INSERT
  WITH CHECK (
    public.current_user_role() IN ('teacher_paid', 'teacher_unpaid')
    AND tenant_id = public.current_tenant_id()
    AND recipient_id IN (
      SELECT ce.student_id
      FROM public.class_enrollments ce
      JOIN public.classes c ON ce.class_id = c.id
      WHERE c.instructor_id = auth.uid()
    )
  );


-- ============================================================================
-- COMMUNICATION_TEMPLATES — Policies
-- ============================================================================
-- super_admin and school_rep can manage templates in their tenant.

CREATE POLICY "comm_templates_admin_rep_all"
  ON public.communication_templates
  FOR ALL
  USING (
    public.current_user_role() IN ('super_admin', 'school_rep')
    AND tenant_id = public.current_tenant_id()
  )
  WITH CHECK (
    public.current_user_role() IN ('super_admin', 'school_rep')
    AND tenant_id = public.current_tenant_id()
  );


-- ============================================================================
-- COMMUNICATION_LOG — Policies
-- ============================================================================
-- super_admin and school_rep can read and insert communication logs.

-- Read access
CREATE POLICY "comm_log_admin_rep_read"
  ON public.communication_log
  FOR SELECT
  USING (
    public.current_user_role() IN ('super_admin', 'school_rep')
    AND tenant_id = public.current_tenant_id()
  );

-- Insert access (logging sent communications)
CREATE POLICY "comm_log_admin_rep_insert"
  ON public.communication_log
  FOR INSERT
  WITH CHECK (
    public.current_user_role() IN ('super_admin', 'school_rep')
    AND tenant_id = public.current_tenant_id()
  );


-- ============================================================================
-- CLASSES — Policies
-- ============================================================================
-- Teachers see their assigned classes.
-- Students see classes they are enrolled in.
-- super_admin sees all classes and can manage them.

-- Teachers read their own assigned classes
CREATE POLICY "classes_teacher_read_own"
  ON public.classes
  FOR SELECT
  USING (
    public.current_user_role() IN ('teacher_paid', 'teacher_unpaid')
    AND instructor_id = auth.uid()
    AND tenant_id = public.current_tenant_id()
  );

-- Students read classes they are enrolled in
CREATE POLICY "classes_student_read_enrolled"
  ON public.classes
  FOR SELECT
  USING (
    public.current_user_role() = 'student'
    AND id IN (
      SELECT class_id FROM public.class_enrollments WHERE student_id = auth.uid()
    )
    AND tenant_id = public.current_tenant_id()
  );

-- super_admin full access to all classes
CREATE POLICY "classes_admin_all"
  ON public.classes
  FOR ALL
  USING (
    public.current_user_role() = 'super_admin'
    AND tenant_id = public.current_tenant_id()
  )
  WITH CHECK (
    public.current_user_role() = 'super_admin'
    AND tenant_id = public.current_tenant_id()
  );


-- ============================================================================
-- CLASS_ENROLLMENTS — Policies
-- ============================================================================
-- Students can read their own class enrollments.
-- Teachers can read enrollments for their classes (to see roster).
-- super_admin can manage all class enrollments.

-- Students read their own class enrollments
CREATE POLICY "class_enrollments_student_read_own"
  ON public.class_enrollments
  FOR SELECT
  USING (
    student_id = auth.uid()
    AND tenant_id = public.current_tenant_id()
  );

-- Teachers read enrollments for their classes
CREATE POLICY "class_enrollments_teacher_read_class"
  ON public.class_enrollments
  FOR SELECT
  USING (
    public.current_user_role() IN ('teacher_paid', 'teacher_unpaid')
    AND class_id IN (
      SELECT id FROM public.classes WHERE instructor_id = auth.uid()
    )
    AND tenant_id = public.current_tenant_id()
  );

-- super_admin full access
CREATE POLICY "class_enrollments_admin_all"
  ON public.class_enrollments
  FOR ALL
  USING (
    public.current_user_role() = 'super_admin'
    AND tenant_id = public.current_tenant_id()
  )
  WITH CHECK (
    public.current_user_role() = 'super_admin'
    AND tenant_id = public.current_tenant_id()
  );


-- ============================================================================
-- ATTENDANCE — Policies
-- ============================================================================
-- Teachers can insert and read attendance for their classes.
-- Students can read their own attendance records.
-- super_admin can read all attendance records.

-- Teachers insert attendance for their classes
CREATE POLICY "attendance_teacher_insert"
  ON public.attendance
  FOR INSERT
  WITH CHECK (
    public.current_user_role() IN ('teacher_paid', 'teacher_unpaid')
    AND class_id IN (
      SELECT id FROM public.classes WHERE instructor_id = auth.uid()
    )
    AND tenant_id = public.current_tenant_id()
  );

-- Teachers read attendance for their classes
CREATE POLICY "attendance_teacher_read"
  ON public.attendance
  FOR SELECT
  USING (
    public.current_user_role() IN ('teacher_paid', 'teacher_unpaid')
    AND class_id IN (
      SELECT id FROM public.classes WHERE instructor_id = auth.uid()
    )
    AND tenant_id = public.current_tenant_id()
  );

-- Students read their own attendance
CREATE POLICY "attendance_student_read_own"
  ON public.attendance
  FOR SELECT
  USING (
    student_id = auth.uid()
    AND tenant_id = public.current_tenant_id()
  );

-- super_admin reads all attendance
CREATE POLICY "attendance_admin_read_all"
  ON public.attendance
  FOR SELECT
  USING (
    public.current_user_role() = 'super_admin'
    AND tenant_id = public.current_tenant_id()
  );


-- ============================================================================
-- CONSENT_RECORDS — Policies
-- ============================================================================
-- Users can read their own consent records.
-- Users can insert their own consent records (giving/revoking consent).
-- super_admin can read all consent records in their tenant.

-- Users read their own consent records
CREATE POLICY "consent_records_user_read_own"
  ON public.consent_records
  FOR SELECT
  USING (
    user_id = auth.uid()
    AND tenant_id = public.current_tenant_id()
  );

-- Users insert their own consent records
CREATE POLICY "consent_records_user_insert_own"
  ON public.consent_records
  FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND tenant_id = public.current_tenant_id()
  );

-- super_admin reads all consent records in tenant
CREATE POLICY "consent_records_admin_read_all"
  ON public.consent_records
  FOR SELECT
  USING (
    public.current_user_role() = 'super_admin'
    AND tenant_id = public.current_tenant_id()
  );


-- ============================================================================
-- AUDIT_LOG — Policies
-- ============================================================================
-- Only super_admin can read audit logs.
-- No client-side inserts; audit entries are created by service role (backend).

-- super_admin reads audit log
CREATE POLICY "audit_log_admin_read"
  ON public.audit_log
  FOR SELECT
  USING (
    public.current_user_role() = 'super_admin'
    AND tenant_id = public.current_tenant_id()
  );


-- ============================================================================
-- ERROR_LOG — Policies
-- ============================================================================
-- Only super_admin can read and update error logs.
-- No client-side inserts; errors are logged by service role (backend).

-- super_admin reads error log
CREATE POLICY "error_log_admin_read"
  ON public.error_log
  FOR SELECT
  USING (
    public.current_user_role() = 'super_admin'
    AND (tenant_id = public.current_tenant_id() OR tenant_id IS NULL)
  );

-- super_admin can update error log (mark as resolved)
CREATE POLICY "error_log_admin_update"
  ON public.error_log
  FOR UPDATE
  USING (
    public.current_user_role() = 'super_admin'
    AND (tenant_id = public.current_tenant_id() OR tenant_id IS NULL)
  )
  WITH CHECK (
    public.current_user_role() = 'super_admin'
    AND (tenant_id = public.current_tenant_id() OR tenant_id IS NULL)
  );


-- ============================================================================
-- WEBHOOK_EVENTS — Policies
-- ============================================================================
-- No general client access; webhook events are managed by service role.
-- super_admin can read for debugging purposes.

-- super_admin can read webhook events for debugging
CREATE POLICY "webhook_events_admin_read"
  ON public.webhook_events
  FOR SELECT
  USING (
    public.current_user_role() = 'super_admin'
    AND (tenant_id = public.current_tenant_id() OR tenant_id IS NULL)
  );
