-- ============================================================================
-- Migration: LMS Tables — Courses, Modules, Lessons, Quizzes, Progress
-- ============================================================================
-- Phase 11: Core LMS functionality.
-- 9 new tables for course creation, delivery, assessment, and certification.
-- All tables are multi-tenant with tenant_id + RLS.
-- ============================================================================

-- ============================================================================
-- 1. courses — Course catalog
-- ============================================================================

CREATE TABLE public.courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id),
  title text NOT NULL,
  slug text NOT NULL,
  description text,
  thumbnail_url text,
  category text,
  difficulty text CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  estimated_hours numeric,
  is_published boolean DEFAULT false,
  is_free boolean DEFAULT false,
  price_cents integer,
  max_students integer,
  instructor_id uuid REFERENCES public.profiles(id),
  prerequisites jsonb DEFAULT '[]',
  learning_objectives jsonb DEFAULT '[]',
  tags jsonb DEFAULT '[]',
  settings jsonb DEFAULT '{}',
  sort_order integer DEFAULT 0,
  published_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (tenant_id, slug)
);

CREATE TRIGGER set_courses_updated_at
  BEFORE UPDATE ON public.courses
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE INDEX idx_courses_tenant_id ON public.courses(tenant_id);
CREATE INDEX idx_courses_instructor ON public.courses(instructor_id);
CREATE INDEX idx_courses_published ON public.courses(tenant_id, is_published);

-- ============================================================================
-- 2. modules — Groupings within a course
-- ============================================================================

CREATE TABLE public.modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id),
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  sort_order integer DEFAULT 0,
  is_published boolean DEFAULT true,
  unlock_rule text CHECK (unlock_rule IN ('immediate', 'sequential', 'date')) DEFAULT 'immediate',
  unlock_date timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TRIGGER set_modules_updated_at
  BEFORE UPDATE ON public.modules
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE INDEX idx_modules_course ON public.modules(course_id);
CREATE INDEX idx_modules_tenant ON public.modules(tenant_id);

-- ============================================================================
-- 3. lessons — Individual learning units
-- ============================================================================

CREATE TABLE public.lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id),
  module_id uuid NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  content_type text CHECK (content_type IN ('text', 'video', 'document', 'embed', 'quiz')) DEFAULT 'text',
  content jsonb NOT NULL DEFAULT '{}',
  duration_minutes integer,
  is_required boolean DEFAULT true,
  is_published boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TRIGGER set_lessons_updated_at
  BEFORE UPDATE ON public.lessons
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE INDEX idx_lessons_module ON public.lessons(module_id);
CREATE INDEX idx_lessons_tenant ON public.lessons(tenant_id);

-- ============================================================================
-- 4. quizzes — Assessment definitions
-- ============================================================================

CREATE TABLE public.quizzes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id),
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  lesson_id uuid REFERENCES public.lessons(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  quiz_type text CHECK (quiz_type IN ('graded', 'practice', 'survey')) DEFAULT 'graded',
  passing_score integer DEFAULT 70,
  max_attempts integer,
  time_limit_minutes integer,
  shuffle_questions boolean DEFAULT false,
  show_answers_after text CHECK (show_answers_after IN ('never', 'submission', 'grading')) DEFAULT 'submission',
  is_published boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TRIGGER set_quizzes_updated_at
  BEFORE UPDATE ON public.quizzes
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE INDEX idx_quizzes_course ON public.quizzes(course_id);
CREATE INDEX idx_quizzes_lesson ON public.quizzes(lesson_id);
CREATE INDEX idx_quizzes_tenant ON public.quizzes(tenant_id);

-- ============================================================================
-- 5. quiz_questions — Question bank
-- ============================================================================

CREATE TABLE public.quiz_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id),
  quiz_id uuid NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  question_type text CHECK (question_type IN ('multiple_choice', 'true_false', 'short_answer', 'essay')) DEFAULT 'multiple_choice',
  question_text text NOT NULL,
  explanation text,
  options jsonb DEFAULT '[]',
  points integer DEFAULT 1,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_quiz_questions_quiz ON public.quiz_questions(quiz_id);
CREATE INDEX idx_quiz_questions_tenant ON public.quiz_questions(tenant_id);

-- ============================================================================
-- 6. course_enrollments — Student ↔ Course
-- ============================================================================

CREATE TABLE public.course_enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id),
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.profiles(id),
  status text CHECK (status IN ('active', 'completed', 'dropped', 'expired')) DEFAULT 'active',
  enrolled_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  expires_at timestamptz,
  certificate_id uuid,
  progress_pct numeric DEFAULT 0,
  last_accessed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE (tenant_id, course_id, student_id)
);

CREATE INDEX idx_course_enrollments_student ON public.course_enrollments(student_id);
CREATE INDEX idx_course_enrollments_course ON public.course_enrollments(course_id);
CREATE INDEX idx_course_enrollments_tenant ON public.course_enrollments(tenant_id);

-- ============================================================================
-- 7. lesson_progress — Per-student, per-lesson progress
-- ============================================================================

CREATE TABLE public.lesson_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id),
  student_id uuid NOT NULL REFERENCES public.profiles(id),
  lesson_id uuid NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  status text CHECK (status IN ('not_started', 'in_progress', 'completed')) DEFAULT 'not_started',
  started_at timestamptz,
  completed_at timestamptz,
  time_spent_seconds integer DEFAULT 0,
  last_position jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (tenant_id, student_id, lesson_id)
);

CREATE TRIGGER set_lesson_progress_updated_at
  BEFORE UPDATE ON public.lesson_progress
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE INDEX idx_lesson_progress_student_course ON public.lesson_progress(student_id, course_id);
CREATE INDEX idx_lesson_progress_tenant ON public.lesson_progress(tenant_id);

-- ============================================================================
-- 8. quiz_attempts — Student quiz submissions
-- ============================================================================

CREATE TABLE public.quiz_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id),
  quiz_id uuid NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.profiles(id),
  attempt_number integer NOT NULL DEFAULT 1,
  status text CHECK (status IN ('in_progress', 'submitted', 'graded')) DEFAULT 'in_progress',
  answers jsonb DEFAULT '[]',
  score_pct numeric,
  points_earned integer,
  points_possible integer,
  passed boolean,
  started_at timestamptz DEFAULT now(),
  submitted_at timestamptz,
  graded_at timestamptz,
  graded_by uuid REFERENCES public.profiles(id),
  time_spent_seconds integer,
  created_at timestamptz DEFAULT now(),
  UNIQUE (tenant_id, quiz_id, student_id, attempt_number)
);

CREATE INDEX idx_quiz_attempts_student ON public.quiz_attempts(student_id);
CREATE INDEX idx_quiz_attempts_quiz ON public.quiz_attempts(quiz_id);
CREATE INDEX idx_quiz_attempts_tenant ON public.quiz_attempts(tenant_id);

-- ============================================================================
-- 9. certificates — Course completion certificates
-- ============================================================================

CREATE TABLE public.certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id),
  student_id uuid NOT NULL REFERENCES public.profiles(id),
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  certificate_number text UNIQUE,
  issued_at timestamptz DEFAULT now(),
  template_data jsonb DEFAULT '{}',
  pdf_url text,
  verification_code text UNIQUE,
  created_at timestamptz DEFAULT now(),
  UNIQUE (tenant_id, student_id, course_id)
);

CREATE INDEX idx_certificates_student ON public.certificates(student_id);
CREATE INDEX idx_certificates_course ON public.certificates(course_id);
CREATE INDEX idx_certificates_tenant ON public.certificates(tenant_id);
CREATE INDEX idx_certificates_verification ON public.certificates(verification_code);

-- Add FK from course_enrollments to certificates (deferred because of creation order)
ALTER TABLE public.course_enrollments
  ADD CONSTRAINT fk_course_enrollments_certificate
  FOREIGN KEY (certificate_id) REFERENCES public.certificates(id);

-- ============================================================================
-- Certificate number generator function
-- ============================================================================

CREATE OR REPLACE FUNCTION public.generate_certificate_number()
RETURNS text AS $$
DECLARE
  next_num integer;
  cert_year text;
BEGIN
  cert_year := to_char(now(), 'YYYY');
  SELECT COALESCE(MAX(
    CAST(NULLIF(regexp_replace(certificate_number, '^CERT-\d{4}-', ''), '') AS integer)
  ), 0) + 1
  INTO next_num
  FROM public.certificates
  WHERE certificate_number LIKE 'CERT-' || cert_year || '-%';

  RETURN 'CERT-' || cert_year || '-' || lpad(next_num::text, 6, '0');
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Enable RLS on all new tables
-- ============================================================================

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS Policies — COURSES
-- ============================================================================

-- All authenticated users can see published courses in their tenant
CREATE POLICY "courses_read_published"
  ON public.courses FOR SELECT
  USING (
    tenant_id = public.current_tenant_id()
    AND is_published = true
  );

-- Admin can read all courses (including drafts)
CREATE POLICY "courses_admin_read_all"
  ON public.courses FOR SELECT
  USING (
    public.current_user_role() = 'super_admin'
    AND tenant_id = public.current_tenant_id()
  );

-- Teachers can read their assigned courses
CREATE POLICY "courses_teacher_read_own"
  ON public.courses FOR SELECT
  USING (
    public.current_user_role() IN ('teacher_paid', 'teacher_unpaid')
    AND tenant_id = public.current_tenant_id()
    AND instructor_id = auth.uid()
  );

-- Admin can create, update, delete courses
CREATE POLICY "courses_admin_insert"
  ON public.courses FOR INSERT
  WITH CHECK (
    public.current_user_role() = 'super_admin'
    AND tenant_id = public.current_tenant_id()
  );

CREATE POLICY "courses_admin_update"
  ON public.courses FOR UPDATE
  USING (
    public.current_user_role() = 'super_admin'
    AND tenant_id = public.current_tenant_id()
  )
  WITH CHECK (
    public.current_user_role() = 'super_admin'
    AND tenant_id = public.current_tenant_id()
  );

CREATE POLICY "courses_admin_delete"
  ON public.courses FOR DELETE
  USING (
    public.current_user_role() = 'super_admin'
    AND tenant_id = public.current_tenant_id()
  );

-- ============================================================================
-- RLS Policies — MODULES
-- ============================================================================

-- Read published modules for published courses
CREATE POLICY "modules_read_published"
  ON public.modules FOR SELECT
  USING (
    tenant_id = public.current_tenant_id()
    AND is_published = true
    AND EXISTS (
      SELECT 1 FROM public.courses c
      WHERE c.id = course_id AND c.is_published = true
    )
  );

-- Admin full access
CREATE POLICY "modules_admin_read_all"
  ON public.modules FOR SELECT
  USING (
    public.current_user_role() = 'super_admin'
    AND tenant_id = public.current_tenant_id()
  );

CREATE POLICY "modules_admin_insert"
  ON public.modules FOR INSERT
  WITH CHECK (
    public.current_user_role() = 'super_admin'
    AND tenant_id = public.current_tenant_id()
  );

CREATE POLICY "modules_admin_update"
  ON public.modules FOR UPDATE
  USING (
    public.current_user_role() = 'super_admin'
    AND tenant_id = public.current_tenant_id()
  )
  WITH CHECK (
    public.current_user_role() = 'super_admin'
    AND tenant_id = public.current_tenant_id()
  );

CREATE POLICY "modules_admin_delete"
  ON public.modules FOR DELETE
  USING (
    public.current_user_role() = 'super_admin'
    AND tenant_id = public.current_tenant_id()
  );

-- ============================================================================
-- RLS Policies — LESSONS
-- ============================================================================

CREATE POLICY "lessons_read_published"
  ON public.lessons FOR SELECT
  USING (
    tenant_id = public.current_tenant_id()
    AND is_published = true
    AND EXISTS (
      SELECT 1 FROM public.modules m
      JOIN public.courses c ON c.id = m.course_id
      WHERE m.id = module_id AND c.is_published = true AND m.is_published = true
    )
  );

CREATE POLICY "lessons_admin_read_all"
  ON public.lessons FOR SELECT
  USING (
    public.current_user_role() = 'super_admin'
    AND tenant_id = public.current_tenant_id()
  );

CREATE POLICY "lessons_admin_insert"
  ON public.lessons FOR INSERT
  WITH CHECK (
    public.current_user_role() = 'super_admin'
    AND tenant_id = public.current_tenant_id()
  );

CREATE POLICY "lessons_admin_update"
  ON public.lessons FOR UPDATE
  USING (
    public.current_user_role() = 'super_admin'
    AND tenant_id = public.current_tenant_id()
  )
  WITH CHECK (
    public.current_user_role() = 'super_admin'
    AND tenant_id = public.current_tenant_id()
  );

CREATE POLICY "lessons_admin_delete"
  ON public.lessons FOR DELETE
  USING (
    public.current_user_role() = 'super_admin'
    AND tenant_id = public.current_tenant_id()
  );

-- ============================================================================
-- RLS Policies — QUIZZES
-- ============================================================================

CREATE POLICY "quizzes_read_published"
  ON public.quizzes FOR SELECT
  USING (
    tenant_id = public.current_tenant_id()
    AND is_published = true
  );

CREATE POLICY "quizzes_admin_read_all"
  ON public.quizzes FOR SELECT
  USING (
    public.current_user_role() = 'super_admin'
    AND tenant_id = public.current_tenant_id()
  );

CREATE POLICY "quizzes_admin_insert"
  ON public.quizzes FOR INSERT
  WITH CHECK (
    public.current_user_role() = 'super_admin'
    AND tenant_id = public.current_tenant_id()
  );

CREATE POLICY "quizzes_admin_update"
  ON public.quizzes FOR UPDATE
  USING (
    public.current_user_role() = 'super_admin'
    AND tenant_id = public.current_tenant_id()
  )
  WITH CHECK (
    public.current_user_role() = 'super_admin'
    AND tenant_id = public.current_tenant_id()
  );

CREATE POLICY "quizzes_admin_delete"
  ON public.quizzes FOR DELETE
  USING (
    public.current_user_role() = 'super_admin'
    AND tenant_id = public.current_tenant_id()
  );

-- ============================================================================
-- RLS Policies — QUIZ_QUESTIONS
-- ============================================================================

-- Students can read questions for quizzes they have active attempts on
CREATE POLICY "quiz_questions_student_read"
  ON public.quiz_questions FOR SELECT
  USING (
    tenant_id = public.current_tenant_id()
    AND EXISTS (
      SELECT 1 FROM public.quiz_attempts qa
      WHERE qa.quiz_id = quiz_id AND qa.student_id = auth.uid()
    )
  );

CREATE POLICY "quiz_questions_admin_read_all"
  ON public.quiz_questions FOR SELECT
  USING (
    public.current_user_role() IN ('super_admin', 'teacher_paid', 'teacher_unpaid')
    AND tenant_id = public.current_tenant_id()
  );

CREATE POLICY "quiz_questions_admin_insert"
  ON public.quiz_questions FOR INSERT
  WITH CHECK (
    public.current_user_role() = 'super_admin'
    AND tenant_id = public.current_tenant_id()
  );

CREATE POLICY "quiz_questions_admin_update"
  ON public.quiz_questions FOR UPDATE
  USING (
    public.current_user_role() = 'super_admin'
    AND tenant_id = public.current_tenant_id()
  )
  WITH CHECK (
    public.current_user_role() = 'super_admin'
    AND tenant_id = public.current_tenant_id()
  );

CREATE POLICY "quiz_questions_admin_delete"
  ON public.quiz_questions FOR DELETE
  USING (
    public.current_user_role() = 'super_admin'
    AND tenant_id = public.current_tenant_id()
  );

-- ============================================================================
-- RLS Policies — COURSE_ENROLLMENTS
-- ============================================================================

-- Students can read their own enrollments
CREATE POLICY "course_enrollments_student_read_own"
  ON public.course_enrollments FOR SELECT
  USING (
    tenant_id = public.current_tenant_id()
    AND student_id = auth.uid()
  );

-- Admin can read all enrollments
CREATE POLICY "course_enrollments_admin_read_all"
  ON public.course_enrollments FOR SELECT
  USING (
    public.current_user_role() = 'super_admin'
    AND tenant_id = public.current_tenant_id()
  );

-- Teachers can see enrollments for their courses
CREATE POLICY "course_enrollments_teacher_read"
  ON public.course_enrollments FOR SELECT
  USING (
    public.current_user_role() IN ('teacher_paid', 'teacher_unpaid')
    AND tenant_id = public.current_tenant_id()
    AND EXISTS (
      SELECT 1 FROM public.courses c
      WHERE c.id = course_id AND c.instructor_id = auth.uid()
    )
  );

-- Admin can insert/update enrollments
CREATE POLICY "course_enrollments_admin_insert"
  ON public.course_enrollments FOR INSERT
  WITH CHECK (
    public.current_user_role() = 'super_admin'
    AND tenant_id = public.current_tenant_id()
  );

CREATE POLICY "course_enrollments_admin_update"
  ON public.course_enrollments FOR UPDATE
  USING (
    public.current_user_role() = 'super_admin'
    AND tenant_id = public.current_tenant_id()
  )
  WITH CHECK (
    public.current_user_role() = 'super_admin'
    AND tenant_id = public.current_tenant_id()
  );

-- ============================================================================
-- RLS Policies — LESSON_PROGRESS
-- ============================================================================

-- Students can read/write their own progress
CREATE POLICY "lesson_progress_student_read_own"
  ON public.lesson_progress FOR SELECT
  USING (
    tenant_id = public.current_tenant_id()
    AND student_id = auth.uid()
  );

CREATE POLICY "lesson_progress_student_insert"
  ON public.lesson_progress FOR INSERT
  WITH CHECK (
    tenant_id = public.current_tenant_id()
    AND student_id = auth.uid()
  );

CREATE POLICY "lesson_progress_student_update"
  ON public.lesson_progress FOR UPDATE
  USING (
    tenant_id = public.current_tenant_id()
    AND student_id = auth.uid()
  )
  WITH CHECK (
    tenant_id = public.current_tenant_id()
    AND student_id = auth.uid()
  );

-- Admin can read all progress
CREATE POLICY "lesson_progress_admin_read_all"
  ON public.lesson_progress FOR SELECT
  USING (
    public.current_user_role() = 'super_admin'
    AND tenant_id = public.current_tenant_id()
  );

-- Teachers can read progress for their courses
CREATE POLICY "lesson_progress_teacher_read"
  ON public.lesson_progress FOR SELECT
  USING (
    public.current_user_role() IN ('teacher_paid', 'teacher_unpaid')
    AND tenant_id = public.current_tenant_id()
    AND EXISTS (
      SELECT 1 FROM public.courses c
      WHERE c.id = course_id AND c.instructor_id = auth.uid()
    )
  );

-- ============================================================================
-- RLS Policies — QUIZ_ATTEMPTS
-- ============================================================================

-- Students can read/insert their own attempts
CREATE POLICY "quiz_attempts_student_read_own"
  ON public.quiz_attempts FOR SELECT
  USING (
    tenant_id = public.current_tenant_id()
    AND student_id = auth.uid()
  );

CREATE POLICY "quiz_attempts_student_insert"
  ON public.quiz_attempts FOR INSERT
  WITH CHECK (
    tenant_id = public.current_tenant_id()
    AND student_id = auth.uid()
  );

CREATE POLICY "quiz_attempts_student_update"
  ON public.quiz_attempts FOR UPDATE
  USING (
    tenant_id = public.current_tenant_id()
    AND student_id = auth.uid()
  )
  WITH CHECK (
    tenant_id = public.current_tenant_id()
    AND student_id = auth.uid()
  );

-- Admin can read all attempts
CREATE POLICY "quiz_attempts_admin_read_all"
  ON public.quiz_attempts FOR SELECT
  USING (
    public.current_user_role() = 'super_admin'
    AND tenant_id = public.current_tenant_id()
  );

-- Teachers can read/update attempts for their courses (grading)
CREATE POLICY "quiz_attempts_teacher_read"
  ON public.quiz_attempts FOR SELECT
  USING (
    public.current_user_role() IN ('teacher_paid', 'teacher_unpaid')
    AND tenant_id = public.current_tenant_id()
    AND EXISTS (
      SELECT 1 FROM public.quizzes q
      JOIN public.courses c ON c.id = q.course_id
      WHERE q.id = quiz_id AND c.instructor_id = auth.uid()
    )
  );

CREATE POLICY "quiz_attempts_teacher_update"
  ON public.quiz_attempts FOR UPDATE
  USING (
    public.current_user_role() IN ('teacher_paid', 'teacher_unpaid')
    AND tenant_id = public.current_tenant_id()
    AND EXISTS (
      SELECT 1 FROM public.quizzes q
      JOIN public.courses c ON c.id = q.course_id
      WHERE q.id = quiz_id AND c.instructor_id = auth.uid()
    )
  )
  WITH CHECK (
    public.current_user_role() IN ('teacher_paid', 'teacher_unpaid')
    AND tenant_id = public.current_tenant_id()
  );

-- ============================================================================
-- RLS Policies — CERTIFICATES
-- ============================================================================

-- Students can read their own certificates
CREATE POLICY "certificates_student_read_own"
  ON public.certificates FOR SELECT
  USING (
    tenant_id = public.current_tenant_id()
    AND student_id = auth.uid()
  );

-- Admin can read all certificates
CREATE POLICY "certificates_admin_read_all"
  ON public.certificates FOR SELECT
  USING (
    public.current_user_role() = 'super_admin'
    AND tenant_id = public.current_tenant_id()
  );

-- Admin can insert certificates
CREATE POLICY "certificates_admin_insert"
  ON public.certificates FOR INSERT
  WITH CHECK (
    public.current_user_role() = 'super_admin'
    AND tenant_id = public.current_tenant_id()
  );

-- Public certificate verification (by verification_code only)
CREATE POLICY "certificates_public_verify"
  ON public.certificates FOR SELECT
  USING (verification_code IS NOT NULL);
