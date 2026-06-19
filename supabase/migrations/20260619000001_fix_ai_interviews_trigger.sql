-- Fix ai_course_interviews updated_at trigger
-- The original migration referenced update_updated_at() which doesn't exist.
-- The correct function is public.handle_updated_at() used by all other tables.

DROP TRIGGER IF EXISTS set_ai_course_interviews_updated_at ON ai_course_interviews;

CREATE TRIGGER set_ai_course_interviews_updated_at
  BEFORE UPDATE ON ai_course_interviews
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
