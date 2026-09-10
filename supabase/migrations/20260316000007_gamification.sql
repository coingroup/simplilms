-- ============================================================================
-- Migration: Gamification — Points, Streaks, Badges, Leaderboards
-- ============================================================================
-- Phase 19: Engagement features for student motivation and retention.
-- 3 new tables: student_points, student_streaks, student_badges
-- All tables are multi-tenant with tenant_id + RLS.
-- ============================================================================

-- ============================================================================
-- 1. student_points — XP ledger for point-earning activities
-- ============================================================================

CREATE TABLE public.student_points (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id),
  student_id uuid NOT NULL REFERENCES public.profiles(id),
  points integer NOT NULL,
  reason text NOT NULL,
  source_type text NOT NULL CHECK (source_type IN (
    'lesson_complete', 'quiz_pass', 'quiz_perfect', 'course_complete',
    'forum_post', 'forum_reply', 'streak_bonus', 'badge_earned', 'manual'
  )),
  source_id uuid,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_student_points_student ON public.student_points(student_id);
CREATE INDEX idx_student_points_tenant ON public.student_points(tenant_id);
CREATE INDEX idx_student_points_created ON public.student_points(student_id, created_at DESC);

-- ============================================================================
-- 2. student_streaks — Daily activity streak tracking
-- ============================================================================

CREATE TABLE public.student_streaks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id),
  student_id uuid NOT NULL REFERENCES public.profiles(id),
  current_streak integer DEFAULT 0,
  longest_streak integer DEFAULT 0,
  last_activity_date date,
  total_active_days integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (tenant_id, student_id)
);

CREATE TRIGGER set_student_streaks_updated_at
  BEFORE UPDATE ON public.student_streaks
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE INDEX idx_student_streaks_student ON public.student_streaks(student_id);
CREATE INDEX idx_student_streaks_tenant ON public.student_streaks(tenant_id);

-- ============================================================================
-- 3. student_badges — Earned achievement badges
-- ============================================================================

CREATE TABLE public.student_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id),
  student_id uuid NOT NULL REFERENCES public.profiles(id),
  badge_key text NOT NULL,
  badge_name text NOT NULL,
  badge_description text,
  badge_icon text NOT NULL DEFAULT 'award',
  earned_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  UNIQUE (tenant_id, student_id, badge_key)
);

CREATE INDEX idx_student_badges_student ON public.student_badges(student_id);
CREATE INDEX idx_student_badges_tenant ON public.student_badges(tenant_id);
CREATE INDEX idx_student_badges_key ON public.student_badges(badge_key);

-- ============================================================================
-- Enable RLS
-- ============================================================================

ALTER TABLE public.student_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_badges ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS Policies — STUDENT_POINTS
-- ============================================================================

-- Students can read their own points
CREATE POLICY "student_points_student_read_own"
  ON public.student_points FOR SELECT
  USING (
    tenant_id = public.current_tenant_id()
    AND student_id = auth.uid()
  );

-- Admin can read all points
CREATE POLICY "student_points_admin_read"
  ON public.student_points FOR SELECT
  USING (
    public.current_user_role() = 'super_admin'
    AND tenant_id = public.current_tenant_id()
  );

-- Teachers can read points for students in their courses
CREATE POLICY "student_points_teacher_read"
  ON public.student_points FOR SELECT
  USING (
    public.current_user_role() IN ('teacher_paid', 'teacher_unpaid')
    AND tenant_id = public.current_tenant_id()
    AND EXISTS (
      SELECT 1 FROM public.course_enrollments ce
      JOIN public.courses c ON c.id = ce.course_id
      WHERE ce.student_id = student_points.student_id
      AND c.instructor_id = auth.uid()
    )
  );

-- System/server can insert points (via service role or student action)
CREATE POLICY "student_points_insert"
  ON public.student_points FOR INSERT
  WITH CHECK (
    tenant_id = public.current_tenant_id()
  );

-- Admin can insert points (manual awards)
CREATE POLICY "student_points_admin_insert"
  ON public.student_points FOR INSERT
  WITH CHECK (
    public.current_user_role() = 'super_admin'
    AND tenant_id = public.current_tenant_id()
  );

-- ============================================================================
-- RLS Policies — STUDENT_STREAKS
-- ============================================================================

-- Students can read their own streak
CREATE POLICY "student_streaks_student_read_own"
  ON public.student_streaks FOR SELECT
  USING (
    tenant_id = public.current_tenant_id()
    AND student_id = auth.uid()
  );

-- Admin can read all streaks
CREATE POLICY "student_streaks_admin_read"
  ON public.student_streaks FOR SELECT
  USING (
    public.current_user_role() = 'super_admin'
    AND tenant_id = public.current_tenant_id()
  );

-- Students can insert/update their own streak
CREATE POLICY "student_streaks_student_upsert"
  ON public.student_streaks FOR INSERT
  WITH CHECK (
    tenant_id = public.current_tenant_id()
    AND student_id = auth.uid()
  );

CREATE POLICY "student_streaks_student_update"
  ON public.student_streaks FOR UPDATE
  USING (
    tenant_id = public.current_tenant_id()
    AND student_id = auth.uid()
  )
  WITH CHECK (
    tenant_id = public.current_tenant_id()
    AND student_id = auth.uid()
  );

-- ============================================================================
-- RLS Policies — STUDENT_BADGES
-- ============================================================================

-- Students can read their own badges
CREATE POLICY "student_badges_student_read_own"
  ON public.student_badges FOR SELECT
  USING (
    tenant_id = public.current_tenant_id()
    AND student_id = auth.uid()
  );

-- All authenticated users can read badges (for leaderboard/profiles)
CREATE POLICY "student_badges_read_all"
  ON public.student_badges FOR SELECT
  USING (
    tenant_id = public.current_tenant_id()
  );

-- Admin can read all badges
CREATE POLICY "student_badges_admin_read"
  ON public.student_badges FOR SELECT
  USING (
    public.current_user_role() = 'super_admin'
    AND tenant_id = public.current_tenant_id()
  );

-- System can insert badges
CREATE POLICY "student_badges_insert"
  ON public.student_badges FOR INSERT
  WITH CHECK (
    tenant_id = public.current_tenant_id()
  );
