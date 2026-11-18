-- Supabase advisor lint 0029 (signed-in users can execute SECURITY DEFINER
-- functions through /rest/v1/rpc). Owner decision 11-18-2026 (items 3366 and
-- 4067, option A): move the SECURITY DEFINER functions out of the exposed
-- public schema into a private schema. Functions the app calls through rpc()
-- keep a SECURITY INVOKER wrapper in public with the same signature.
--
-- ALTER FUNCTION ... SET SCHEMA keeps the OID, so the RLS policies that call
-- current_tenant_id() / current_user_role() and the existing grants follow the
-- functions without being rewritten.
--
-- Not moved: public.custom_access_token_hook(jsonb). It is not a lint 0029
-- finding (only supabase_auth_admin and service_role can execute it), and the
-- Supabase Auth hook setting names it by schema, so moving it would need an
-- Auth configuration change. Left for the owner to decide.

CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC;
GRANT USAGE ON SCHEMA private TO authenticated, service_role;

-- RLS helpers (used by policies only; no wrapper needed).
ALTER FUNCTION public.current_tenant_id() SET SCHEMA private;
ALTER FUNCTION public.current_user_role() SET SCHEMA private;

-- Signed-in self-service updates (called by the app through rpc()).
ALTER FUNCTION public.update_student_profile(text, text, text, text) SET SCHEMA private;
ALTER FUNCTION public.update_notification_preferences(boolean, boolean) SET SCHEMA private;

ALTER FUNCTION private.current_tenant_id() SET search_path = private, public, pg_temp;
ALTER FUNCTION private.current_user_role() SET search_path = private, public, pg_temp;
ALTER FUNCTION private.update_student_profile(text, text, text, text) SET search_path = private, public, pg_temp;
ALTER FUNCTION private.update_notification_preferences(boolean, boolean) SET search_path = private, public, pg_temp;

-- Grants on the moved functions: unchanged in intent (20261026000000 already
-- revoked PUBLIC and anon). Restated so this file stands on its own.
REVOKE EXECUTE ON FUNCTION private.current_tenant_id() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION private.current_user_role() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION private.update_student_profile(text, text, text, text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION private.update_notification_preferences(boolean, boolean) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.current_tenant_id() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION private.current_user_role() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION private.update_student_profile(text, text, text, text) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION private.update_notification_preferences(boolean, boolean) TO authenticated, service_role;

-- SECURITY INVOKER wrappers with the same names, argument names, defaults
-- and return type as before, so supabase.rpc(...) callers are unchanged.
CREATE FUNCTION public.update_student_profile(
  p_address text DEFAULT NULL::text,
  p_mailing_address text DEFAULT NULL::text,
  p_phone text DEFAULT NULL::text,
  p_email text DEFAULT NULL::text
)
RETURNS void
LANGUAGE sql
SECURITY INVOKER
SET search_path = ''
AS $$
  SELECT private.update_student_profile(p_address, p_mailing_address, p_phone, p_email);
$$;

CREATE FUNCTION public.update_notification_preferences(
  p_general_messages boolean DEFAULT true,
  p_class_reminders boolean DEFAULT true
)
RETURNS void
LANGUAGE sql
SECURITY INVOKER
SET search_path = ''
AS $$
  SELECT private.update_notification_preferences(p_general_messages, p_class_reminders);
$$;

REVOKE EXECUTE ON FUNCTION public.update_student_profile(text, text, text, text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.update_notification_preferences(boolean, boolean) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.update_student_profile(text, text, text, text) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.update_notification_preferences(boolean, boolean) TO authenticated, service_role;

NOTIFY pgrst, 'reload schema';
