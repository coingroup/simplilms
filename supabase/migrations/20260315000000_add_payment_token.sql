-- Add payment_token column to applications table
-- Used to generate secure, semi-public payment links for approved applicants
-- who do not yet have portal accounts.

ALTER TABLE public.applications
  ADD COLUMN payment_token text UNIQUE;

CREATE INDEX idx_applications_payment_token
  ON public.applications(payment_token)
  WHERE payment_token IS NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.applications.payment_token IS
  'Cryptographic token for semi-public payment page access. Generated on approval.';
