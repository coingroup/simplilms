-- Fix certificates_public_verify RLS policy
-- Previously allowed ANY unauthenticated user to read ALL certificates
-- where verification_code IS NOT NULL, exposing student names and PDF URLs.
--
-- New approach: Remove the overly broad public policy. Certificate verification
-- should be handled via a dedicated API route that accepts a verification_code
-- parameter and returns only the matching certificate's public fields.

DROP POLICY IF EXISTS "certificates_public_verify" ON public.certificates;

-- Allow students to read their own certificates
CREATE POLICY "certificates_student_read_own"
  ON public.certificates FOR SELECT
  USING (
    student_id = auth.uid()
    AND tenant_id = public.current_tenant_id()
  );
