-- =============================================================
-- Gamification: points, streaks, badges
-- =============================================================

-- student_points: one row per earning event
CREATE TABLE student_points (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     text NOT NULL,
  student_id    uuid NOT NULL,
  points        integer NOT NULL CHECK (points > 0),
  action        text NOT NULL CHECK (action IN (
                  'lesson_complete',
                  'quiz_pass',
                  'quiz_perfect',
                  'streak_7',
                  'streak_30',
                  'course_complete',
                  'first_post',
                  'helpful_post'
                )),
  reference_id  text,          -- lesson_id, quiz_id, etc.
  earned_at     timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_student_points_tenant_student ON student_points (tenant_id, student_id);
CREATE INDEX idx_student_points_earned_at      ON student_points (earned_at DESC);

-- student_streaks: one row per student (upserted on activity)
CREATE TABLE student_streaks (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id          text NOT NULL,
  student_id         uuid NOT NULL,
  current_streak     integer NOT NULL DEFAULT 0,
  longest_streak     integer NOT NULL DEFAULT 0,
  last_activity_date date,
  streak_start_date  date,
  updated_at         timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, student_id)
);

CREATE INDEX idx_student_streaks_tenant_student ON student_streaks (tenant_id, student_id);

-- student_badges: one row per badge earned (de-duped in application layer)
CREATE TABLE student_badges (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id          text NOT NULL,
  student_id         uuid NOT NULL,
  badge_key          text NOT NULL,
  badge_name         text NOT NULL,
  badge_description  text,
  earned_at          timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, student_id, badge_key)
);

CREATE INDEX idx_student_badges_tenant_student ON student_badges (tenant_id, student_id);

-- trigger: auto-update updated_at on student_streaks
CREATE OR REPLACE FUNCTION update_student_streaks_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_student_streaks_updated_at
  BEFORE UPDATE ON student_streaks
  FOR EACH ROW EXECUTE FUNCTION update_student_streaks_updated_at();

-- ============================================================
-- RLS
-- ============================================================

ALTER TABLE student_points  ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_badges  ENABLE ROW LEVEL SECURITY;

-- student_points policies
CREATE POLICY "students_read_own_points"
  ON student_points FOR SELECT
  USING (student_id = auth.uid());

CREATE POLICY "admins_read_all_points"
  ON student_points FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('super_admin', 'school_rep')
    )
  );

CREATE POLICY "service_insert_points"
  ON student_points FOR INSERT
  WITH CHECK (true);

-- student_streaks policies
CREATE POLICY "students_read_own_streaks"
  ON student_streaks FOR SELECT
  USING (student_id = auth.uid());

CREATE POLICY "admins_read_all_streaks"
  ON student_streaks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('super_admin', 'school_rep')
    )
  );

CREATE POLICY "service_upsert_streaks"
  ON student_streaks FOR ALL
  WITH CHECK (true);

-- student_badges policies
CREATE POLICY "students_read_own_badges"
  ON student_badges FOR SELECT
  USING (student_id = auth.uid());

CREATE POLICY "admins_read_all_badges"
  ON student_badges FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('super_admin', 'school_rep')
    )
  );

CREATE POLICY "service_insert_badges"
  ON student_badges FOR INSERT
  WITH CHECK (true);
