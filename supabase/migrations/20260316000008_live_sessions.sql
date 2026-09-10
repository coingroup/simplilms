-- ============================================================================
-- Migration: Live Class Sessions — Zoom integration enhancements
-- ============================================================================
-- Phase 20: Per-session tracking for live classes with Zoom recordings.
-- 1 new table: live_class_sessions
-- 1 column addition: zoom_recording_url on classes
-- ============================================================================

-- Add recording URL column to existing classes table
ALTER TABLE public.classes ADD COLUMN IF NOT EXISTS zoom_recording_url text;

-- ============================================================================
-- 1. live_class_sessions — Individual live class instances
-- ============================================================================

CREATE TABLE public.live_class_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id),
  class_id uuid NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  session_date date NOT NULL,
  start_time text NOT NULL,
  end_time text,
  zoom_meeting_id text,
  zoom_join_url text,
  zoom_start_url text,
  zoom_recording_url text,
  status text CHECK (status IN ('scheduled', 'live', 'completed', 'cancelled')) DEFAULT 'scheduled',
  actual_start_at timestamptz,
  actual_end_at timestamptz,
  attendee_count integer DEFAULT 0,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (tenant_id, class_id, session_date)
);

CREATE TRIGGER set_live_class_sessions_updated_at
  BEFORE UPDATE ON public.live_class_sessions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE INDEX idx_live_sessions_class ON public.live_class_sessions(class_id);
CREATE INDEX idx_live_sessions_tenant ON public.live_class_sessions(tenant_id);
CREATE INDEX idx_live_sessions_date ON public.live_class_sessions(session_date);
CREATE INDEX idx_live_sessions_status ON public.live_class_sessions(class_id, status);

-- ============================================================================
-- Enable RLS
-- ============================================================================

ALTER TABLE public.live_class_sessions ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS Policies — LIVE_CLASS_SESSIONS
-- ============================================================================

-- Enrolled students can read sessions for their classes
CREATE POLICY "live_sessions_student_read"
  ON public.live_class_sessions FOR SELECT
  USING (
    tenant_id = public.current_tenant_id()
    AND EXISTS (
      SELECT 1 FROM public.class_enrollments ce
      WHERE ce.class_id = live_class_sessions.class_id
      AND ce.student_id = auth.uid()
      AND ce.status = 'enrolled'
    )
  );

-- Teachers can read sessions for their classes
CREATE POLICY "live_sessions_teacher_read"
  ON public.live_class_sessions FOR SELECT
  USING (
    public.current_user_role() IN ('teacher_paid', 'teacher_unpaid')
    AND tenant_id = public.current_tenant_id()
    AND EXISTS (
      SELECT 1 FROM public.classes c
      WHERE c.id = live_class_sessions.class_id AND c.instructor_id = auth.uid()
    )
  );

-- Admin can read all sessions
CREATE POLICY "live_sessions_admin_read"
  ON public.live_class_sessions FOR SELECT
  USING (
    public.current_user_role() = 'super_admin'
    AND tenant_id = public.current_tenant_id()
  );

-- Admin can create/update/delete sessions
CREATE POLICY "live_sessions_admin_insert"
  ON public.live_class_sessions FOR INSERT
  WITH CHECK (
    public.current_user_role() = 'super_admin'
    AND tenant_id = public.current_tenant_id()
  );

CREATE POLICY "live_sessions_admin_update"
  ON public.live_class_sessions FOR UPDATE
  USING (
    public.current_user_role() = 'super_admin'
    AND tenant_id = public.current_tenant_id()
  )
  WITH CHECK (
    public.current_user_role() = 'super_admin'
    AND tenant_id = public.current_tenant_id()
  );

-- Teachers can update sessions for their classes (mark live, add notes)
CREATE POLICY "live_sessions_teacher_update"
  ON public.live_class_sessions FOR UPDATE
  USING (
    public.current_user_role() IN ('teacher_paid', 'teacher_unpaid')
    AND tenant_id = public.current_tenant_id()
    AND EXISTS (
      SELECT 1 FROM public.classes c
      WHERE c.id = live_class_sessions.class_id AND c.instructor_id = auth.uid()
    )
  )
  WITH CHECK (
    public.current_user_role() IN ('teacher_paid', 'teacher_unpaid')
    AND tenant_id = public.current_tenant_id()
  );

CREATE POLICY "live_sessions_admin_delete"
  ON public.live_class_sessions FOR DELETE
  USING (
    public.current_user_role() = 'super_admin'
    AND tenant_id = public.current_tenant_id()
  );
