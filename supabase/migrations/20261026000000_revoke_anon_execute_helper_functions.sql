-- Migration: Remove anonymous/PUBLIC EXECUTE from SECURITY DEFINER helpers
--
-- Supabase security advisors flagged four SECURITY DEFINER functions in the
-- public schema as callable by anon (via the PUBLIC default grant) and by
-- authenticated:
--   current_tenant_id(), current_user_role()          -- RLS helpers
--   update_notification_preferences(boolean, boolean) -- own-row update
--   update_student_profile(text, text, text, text)    -- own-row update
--
-- Both update functions only touch the row where id = auth.uid(); with no
-- session auth.uid() is NULL and nothing matches, so they were not exploitable,
-- but anonymous callers have no reason to reach them.
--
-- authenticated keeps EXECUTE: RLS policies call the two helpers, and the app
-- calls the two update functions from signed-in pages. service_role keeps it
-- for backend jobs. The Auth hook (custom_access_token_hook) is unaffected.

REVOKE EXECUTE ON FUNCTION public.current_tenant_id() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.current_user_role() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.update_notification_preferences(boolean, boolean) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.update_student_profile(text, text, text, text) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.current_tenant_id() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.current_user_role() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.update_notification_preferences(boolean, boolean) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.update_student_profile(text, text, text, text) TO authenticated, service_role;
