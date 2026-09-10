-- ============================================================================
-- Migration: Discussion Forums — Threaded discussions per course
-- ============================================================================
-- Phase 18: Discussion forums for course-based student/instructor interaction.
-- 2 new tables: discussion_threads, discussion_posts
-- All tables are multi-tenant with tenant_id + RLS.
-- ============================================================================

-- ============================================================================
-- 1. discussion_threads — Top-level discussion topics per course
-- ============================================================================

CREATE TABLE public.discussion_threads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id),
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  author_id uuid NOT NULL REFERENCES public.profiles(id),
  title text NOT NULL,
  body text NOT NULL DEFAULT '',
  is_pinned boolean DEFAULT false,
  is_locked boolean DEFAULT false,
  reply_count integer DEFAULT 0,
  last_activity_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TRIGGER set_discussion_threads_updated_at
  BEFORE UPDATE ON public.discussion_threads
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE INDEX idx_discussion_threads_course ON public.discussion_threads(course_id);
CREATE INDEX idx_discussion_threads_tenant ON public.discussion_threads(tenant_id);
CREATE INDEX idx_discussion_threads_author ON public.discussion_threads(author_id);
CREATE INDEX idx_discussion_threads_activity ON public.discussion_threads(course_id, last_activity_at DESC);

-- ============================================================================
-- 2. discussion_posts — Replies within a thread
-- ============================================================================

CREATE TABLE public.discussion_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id),
  thread_id uuid NOT NULL REFERENCES public.discussion_threads(id) ON DELETE CASCADE,
  author_id uuid NOT NULL REFERENCES public.profiles(id),
  parent_post_id uuid REFERENCES public.discussion_posts(id) ON DELETE CASCADE,
  body text NOT NULL,
  is_edited boolean DEFAULT false,
  edited_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TRIGGER set_discussion_posts_updated_at
  BEFORE UPDATE ON public.discussion_posts
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE INDEX idx_discussion_posts_thread ON public.discussion_posts(thread_id);
CREATE INDEX idx_discussion_posts_tenant ON public.discussion_posts(tenant_id);
CREATE INDEX idx_discussion_posts_author ON public.discussion_posts(author_id);
CREATE INDEX idx_discussion_posts_parent ON public.discussion_posts(parent_post_id);

-- ============================================================================
-- Trigger: Auto-update thread reply_count and last_activity_at
-- ============================================================================

CREATE OR REPLACE FUNCTION public.update_thread_on_post()
RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.discussion_threads
    SET reply_count = reply_count + 1,
        last_activity_at = now()
    WHERE id = NEW.thread_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.discussion_threads
    SET reply_count = GREATEST(reply_count - 1, 0)
    WHERE id = OLD.thread_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_thread_on_post
  AFTER INSERT OR DELETE ON public.discussion_posts
  FOR EACH ROW EXECUTE FUNCTION public.update_thread_on_post();

-- ============================================================================
-- Enable RLS
-- ============================================================================

ALTER TABLE public.discussion_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discussion_posts ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS Policies — DISCUSSION_THREADS
-- ============================================================================

-- Enrolled students can read threads for their courses
CREATE POLICY "discussion_threads_enrolled_read"
  ON public.discussion_threads FOR SELECT
  USING (
    tenant_id = public.current_tenant_id()
    AND EXISTS (
      SELECT 1 FROM public.course_enrollments ce
      WHERE ce.course_id = discussion_threads.course_id
      AND ce.student_id = auth.uid()
      AND ce.status = 'active'
    )
  );

-- Teachers can read threads for their assigned courses
CREATE POLICY "discussion_threads_teacher_read"
  ON public.discussion_threads FOR SELECT
  USING (
    public.current_user_role() IN ('teacher_paid', 'teacher_unpaid')
    AND tenant_id = public.current_tenant_id()
    AND EXISTS (
      SELECT 1 FROM public.courses c
      WHERE c.id = discussion_threads.course_id AND c.instructor_id = auth.uid()
    )
  );

-- Admin can read all threads
CREATE POLICY "discussion_threads_admin_read"
  ON public.discussion_threads FOR SELECT
  USING (
    public.current_user_role() = 'super_admin'
    AND tenant_id = public.current_tenant_id()
  );

-- Enrolled students can create threads
CREATE POLICY "discussion_threads_student_insert"
  ON public.discussion_threads FOR INSERT
  WITH CHECK (
    tenant_id = public.current_tenant_id()
    AND author_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.course_enrollments ce
      WHERE ce.course_id = discussion_threads.course_id
      AND ce.student_id = auth.uid()
      AND ce.status = 'active'
    )
  );

-- Teachers can create threads in their courses
CREATE POLICY "discussion_threads_teacher_insert"
  ON public.discussion_threads FOR INSERT
  WITH CHECK (
    public.current_user_role() IN ('teacher_paid', 'teacher_unpaid')
    AND tenant_id = public.current_tenant_id()
    AND author_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.courses c
      WHERE c.id = discussion_threads.course_id AND c.instructor_id = auth.uid()
    )
  );

-- Admin can create threads in any course
CREATE POLICY "discussion_threads_admin_insert"
  ON public.discussion_threads FOR INSERT
  WITH CHECK (
    public.current_user_role() = 'super_admin'
    AND tenant_id = public.current_tenant_id()
  );

-- Authors can update their own threads (title/body)
CREATE POLICY "discussion_threads_author_update"
  ON public.discussion_threads FOR UPDATE
  USING (
    tenant_id = public.current_tenant_id()
    AND author_id = auth.uid()
  )
  WITH CHECK (
    tenant_id = public.current_tenant_id()
    AND author_id = auth.uid()
  );

-- Admin can update any thread (pin, lock, edit)
CREATE POLICY "discussion_threads_admin_update"
  ON public.discussion_threads FOR UPDATE
  USING (
    public.current_user_role() = 'super_admin'
    AND tenant_id = public.current_tenant_id()
  )
  WITH CHECK (
    public.current_user_role() = 'super_admin'
    AND tenant_id = public.current_tenant_id()
  );

-- Teachers can update threads in their courses (pin, lock)
CREATE POLICY "discussion_threads_teacher_update"
  ON public.discussion_threads FOR UPDATE
  USING (
    public.current_user_role() IN ('teacher_paid', 'teacher_unpaid')
    AND tenant_id = public.current_tenant_id()
    AND EXISTS (
      SELECT 1 FROM public.courses c
      WHERE c.id = discussion_threads.course_id AND c.instructor_id = auth.uid()
    )
  )
  WITH CHECK (
    public.current_user_role() IN ('teacher_paid', 'teacher_unpaid')
    AND tenant_id = public.current_tenant_id()
  );

-- Admin can delete any thread
CREATE POLICY "discussion_threads_admin_delete"
  ON public.discussion_threads FOR DELETE
  USING (
    public.current_user_role() = 'super_admin'
    AND tenant_id = public.current_tenant_id()
  );

-- Authors can delete their own threads
CREATE POLICY "discussion_threads_author_delete"
  ON public.discussion_threads FOR DELETE
  USING (
    tenant_id = public.current_tenant_id()
    AND author_id = auth.uid()
  );

-- ============================================================================
-- RLS Policies — DISCUSSION_POSTS
-- ============================================================================

-- Enrolled students can read posts in threads they can see
CREATE POLICY "discussion_posts_enrolled_read"
  ON public.discussion_posts FOR SELECT
  USING (
    tenant_id = public.current_tenant_id()
    AND EXISTS (
      SELECT 1 FROM public.discussion_threads dt
      JOIN public.course_enrollments ce ON ce.course_id = dt.course_id
      WHERE dt.id = discussion_posts.thread_id
      AND ce.student_id = auth.uid()
      AND ce.status = 'active'
    )
  );

-- Teachers can read posts in their course threads
CREATE POLICY "discussion_posts_teacher_read"
  ON public.discussion_posts FOR SELECT
  USING (
    public.current_user_role() IN ('teacher_paid', 'teacher_unpaid')
    AND tenant_id = public.current_tenant_id()
    AND EXISTS (
      SELECT 1 FROM public.discussion_threads dt
      JOIN public.courses c ON c.id = dt.course_id
      WHERE dt.id = discussion_posts.thread_id AND c.instructor_id = auth.uid()
    )
  );

-- Admin can read all posts
CREATE POLICY "discussion_posts_admin_read"
  ON public.discussion_posts FOR SELECT
  USING (
    public.current_user_role() = 'super_admin'
    AND tenant_id = public.current_tenant_id()
  );

-- Enrolled students can post replies (if thread not locked)
CREATE POLICY "discussion_posts_student_insert"
  ON public.discussion_posts FOR INSERT
  WITH CHECK (
    tenant_id = public.current_tenant_id()
    AND author_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.discussion_threads dt
      JOIN public.course_enrollments ce ON ce.course_id = dt.course_id
      WHERE dt.id = discussion_posts.thread_id
      AND ce.student_id = auth.uid()
      AND ce.status = 'active'
      AND dt.is_locked = false
    )
  );

-- Teachers can post in their course threads
CREATE POLICY "discussion_posts_teacher_insert"
  ON public.discussion_posts FOR INSERT
  WITH CHECK (
    public.current_user_role() IN ('teacher_paid', 'teacher_unpaid')
    AND tenant_id = public.current_tenant_id()
    AND author_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.discussion_threads dt
      JOIN public.courses c ON c.id = dt.course_id
      WHERE dt.id = discussion_posts.thread_id AND c.instructor_id = auth.uid()
    )
  );

-- Admin can post in any thread
CREATE POLICY "discussion_posts_admin_insert"
  ON public.discussion_posts FOR INSERT
  WITH CHECK (
    public.current_user_role() = 'super_admin'
    AND tenant_id = public.current_tenant_id()
  );

-- Authors can update their own posts
CREATE POLICY "discussion_posts_author_update"
  ON public.discussion_posts FOR UPDATE
  USING (
    tenant_id = public.current_tenant_id()
    AND author_id = auth.uid()
  )
  WITH CHECK (
    tenant_id = public.current_tenant_id()
    AND author_id = auth.uid()
  );

-- Admin can update any post
CREATE POLICY "discussion_posts_admin_update"
  ON public.discussion_posts FOR UPDATE
  USING (
    public.current_user_role() = 'super_admin'
    AND tenant_id = public.current_tenant_id()
  )
  WITH CHECK (
    public.current_user_role() = 'super_admin'
    AND tenant_id = public.current_tenant_id()
  );

-- Authors can delete their own posts
CREATE POLICY "discussion_posts_author_delete"
  ON public.discussion_posts FOR DELETE
  USING (
    tenant_id = public.current_tenant_id()
    AND author_id = auth.uid()
  );

-- Admin can delete any post
CREATE POLICY "discussion_posts_admin_delete"
  ON public.discussion_posts FOR DELETE
  USING (
    public.current_user_role() = 'super_admin'
    AND tenant_id = public.current_tenant_id()
  );
