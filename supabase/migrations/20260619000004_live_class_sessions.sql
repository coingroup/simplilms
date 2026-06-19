-- ============================================================================
-- Migration: Live Class Sessions
-- ============================================================================
-- Phase 20: Live classes / Zoom integration.
-- Stores scheduled live session metadata and Zoom links.
-- ============================================================================

-- ============================================================================
-- 1. live_class_sessions
-- ============================================================================

CREATE TABLE public.live_class_sessions (
  id                     uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id              uuid NOT NULL REFERENCES public.tenants(id),
  class_id               uuid REFERENCES public.classes(id) ON DELETE SET NULL,
  course_id              uuid REFERENCES public.courses(id) ON DELETE SET NULL,
  title                  text NOT NULL,
  description            text,
  instructor_id          uuid NOT NULL REFERENCES public.profiles(id),
  scheduled_at           timestamptz NOT NULL,
  duration_minutes       integer NOT NULL DEFAULT 60,
  zoom_meeting_id        text,
  zoom_join_url          text,
  zoom_start_url         text,
  zoom_passcode          text,
  recording_url          text,
  recording_available_at timestamptz,
  status                 text NOT NULL DEFAULT 'scheduled'
                           CHECK (status IN ('scheduled', 'live', 'completed', 'cancelled')),
  max_attendees          integer,
  attendee_count         integer NOT NULL DEFAULT 0,
  created_at             timestamptz NOT NULL DEFAULT now(),
  updated_at             timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER set_live_class_sessions_updated_at
  BEFORE UPDATE ON public.live_class_sessions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Indexes
CREATE INDEX idx_live_sessions_class     ON public.live_class_sessions(class_id);
CREATE INDEX idx_live_sessions_course    ON public.live_class_sessions(course_id);
CREATE INDEX idx_live_sessions_instructor ON public.live_class_sessions(instructor_id);
CREATE INDEX idx_live_sessions_scheduled ON public.live_class_sessions(scheduled_at);
CREATE INDEX idx_live_sessions_status    ON public.live_class_sessions(status);
CREATE INDEX idx_live_sessions_tenant    ON public.live_class_sessions(tenant_id);

-- ============================================================================
-- 2. Row-Level Security
-- ============================================================================

ALTER TABLE public.live_class_sessions ENABLE ROW LEVEL SECURITY;

-- Admins: full access
CREATE POLICY "Admins can do everything on live_class_sessions"
  ON public.live_class_sessions
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role = 'super_admin'
    )
  );

-- Teachers: read/write their own sessions
CREATE POLICY "Teachers can manage their own live sessions"
  ON public.live_class_sessions
  FOR ALL
  TO authenticated
  USING (
    instructor_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role IN ('teacher_paid', 'teacher_unpaid')
    )
  )
  WITH CHECK (
    instructor_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role IN ('teacher_paid', 'teacher_unpaid')
    )
  );

-- Students: read sessions for enrolled classes or courses
CREATE POLICY "Students can view live sessions for enrolled classes or courses"
  ON public.live_class_sessions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role = 'student'
    )
    AND (
      -- enrolled in the class
      (
        class_id IS NOT NULL
        AND EXISTS (
          SELECT 1 FROM public.class_enrollments ce
          WHERE ce.student_id = auth.uid()
            AND ce.class_id = live_class_sessions.class_id
        )
      )
      OR
      -- enrolled in the course
      (
        course_id IS NOT NULL
        AND EXISTS (
          SELECT 1 FROM public.enrollments e
          WHERE e.student_id = auth.uid()
            AND e.course_id = live_class_sessions.course_id
            AND e.status = 'active'
        )
      )
    )
  );
