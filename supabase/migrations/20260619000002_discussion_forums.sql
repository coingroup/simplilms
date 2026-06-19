-- ============================================================================
-- Migration: Discussion Forums
-- ============================================================================
-- Phase 18: Threaded discussion forums per course.
-- 2 tables: discussion_threads and discussion_posts.
-- All tables are multi-tenant with tenant_id + RLS.
-- ============================================================================

-- ============================================================================
-- 1. discussion_threads — One thread per topic within a course
-- ============================================================================

CREATE TABLE public.discussion_threads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id),
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title text NOT NULL,
  body text NOT NULL,
  author_id uuid NOT NULL REFERENCES public.profiles(id),
  is_pinned boolean NOT NULL DEFAULT false,
  is_locked boolean NOT NULL DEFAULT false,
  reply_count integer NOT NULL DEFAULT 0,
  last_reply_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER set_discussion_threads_updated_at
  BEFORE UPDATE ON public.discussion_threads
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE INDEX idx_discussion_threads_course ON public.discussion_threads(course_id);
CREATE INDEX idx_discussion_threads_tenant ON public.discussion_threads(tenant_id);
CREATE INDEX idx_discussion_threads_author ON public.discussion_threads(author_id);
CREATE INDEX idx_discussion_threads_pinned_reply
  ON public.discussion_threads(course_id, is_pinned DESC, last_reply_at DESC NULLS LAST);

-- ============================================================================
-- 2. discussion_posts — Replies within a thread
-- ============================================================================

CREATE TABLE public.discussion_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id),
  thread_id uuid NOT NULL REFERENCES public.discussion_threads(id) ON DELETE CASCADE,
  author_id uuid NOT NULL REFERENCES public.profiles(id),
  body text NOT NULL,
  is_instructor_post boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER set_discussion_posts_updated_at
  BEFORE UPDATE ON public.discussion_posts
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE INDEX idx_discussion_posts_thread ON public.discussion_posts(thread_id);
CREATE INDEX idx_discussion_posts_tenant ON public.discussion_posts(tenant_id);
CREATE INDEX idx_discussion_posts_author ON public.discussion_posts(author_id);

-- ============================================================================
-- 3. Trigger: auto-update reply_count and last_reply_at on thread
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_discussion_post_insert()
RETURNS trigger AS $$
BEGIN
  UPDATE public.discussion_threads
  SET
    reply_count = reply_count + 1,
    last_reply_at = NEW.created_at
  WHERE id = NEW.thread_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.handle_discussion_post_delete()
RETURNS trigger AS $$
BEGIN
  UPDATE public.discussion_threads
  SET
    reply_count = GREATEST(reply_count - 1, 0),
    last_reply_at = (
      SELECT MAX(created_at)
      FROM public.discussion_posts
      WHERE thread_id = OLD.thread_id
    )
  WHERE id = OLD.thread_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_discussion_post_insert
  AFTER INSERT ON public.discussion_posts
  FOR EACH ROW EXECUTE FUNCTION public.handle_discussion_post_insert();

CREATE TRIGGER on_discussion_post_delete
  AFTER DELETE ON public.discussion_posts
  FOR EACH ROW EXECUTE FUNCTION public.handle_discussion_post_delete();

-- ============================================================================
-- 4. Enable RLS
-- ============================================================================

ALTER TABLE public.discussion_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discussion_posts ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 5. RLS Policies — discussion_threads
-- ============================================================================

-- Admins can read all threads in their tenant
CREATE POLICY "discussion_threads_admin_read"
  ON public.discussion_threads
  FOR SELECT
  USING (
    tenant_id = public.current_tenant_id()
    AND public.current_user_role() IN ('super_admin', 'school_rep')
  );

-- Students/teachers can read threads for courses they're part of
-- (coarse policy — fine-grained enrollment check is done at app layer)
CREATE POLICY "discussion_threads_student_teacher_read"
  ON public.discussion_threads
  FOR SELECT
  USING (
    tenant_id = public.current_tenant_id()
    AND public.current_user_role() IN ('student', 'teacher_paid', 'teacher_unpaid')
  );

-- Students and teachers can create threads
CREATE POLICY "discussion_threads_student_teacher_create"
  ON public.discussion_threads
  FOR INSERT
  WITH CHECK (
    tenant_id = public.current_tenant_id()
    AND author_id = auth.uid()
    AND public.current_user_role() IN ('student', 'teacher_paid', 'teacher_unpaid', 'super_admin')
  );

-- Admins can update (pin, lock, etc.)
CREATE POLICY "discussion_threads_admin_update"
  ON public.discussion_threads
  FOR UPDATE
  USING (
    tenant_id = public.current_tenant_id()
    AND public.current_user_role() IN ('super_admin', 'school_rep')
  );

-- Admins can delete threads
CREATE POLICY "discussion_threads_admin_delete"
  ON public.discussion_threads
  FOR DELETE
  USING (
    tenant_id = public.current_tenant_id()
    AND public.current_user_role() IN ('super_admin', 'school_rep')
  );

-- ============================================================================
-- 6. RLS Policies — discussion_posts
-- ============================================================================

-- Admins can read all posts
CREATE POLICY "discussion_posts_admin_read"
  ON public.discussion_posts
  FOR SELECT
  USING (
    tenant_id = public.current_tenant_id()
    AND public.current_user_role() IN ('super_admin', 'school_rep')
  );

-- Students and teachers can read posts
CREATE POLICY "discussion_posts_student_teacher_read"
  ON public.discussion_posts
  FOR SELECT
  USING (
    tenant_id = public.current_tenant_id()
    AND public.current_user_role() IN ('student', 'teacher_paid', 'teacher_unpaid')
  );

-- Any authenticated user in tenant can create posts
CREATE POLICY "discussion_posts_create"
  ON public.discussion_posts
  FOR INSERT
  WITH CHECK (
    tenant_id = public.current_tenant_id()
    AND author_id = auth.uid()
    AND public.current_user_role() IN ('student', 'teacher_paid', 'teacher_unpaid', 'super_admin')
  );

-- Authors and admins can delete posts
CREATE POLICY "discussion_posts_author_delete"
  ON public.discussion_posts
  FOR DELETE
  USING (
    tenant_id = public.current_tenant_id()
    AND (
      author_id = auth.uid()
      OR public.current_user_role() IN ('super_admin', 'school_rep')
    )
  );
