-- White-label tenant management table (SimpliLMS admin only)
-- Tracks external tenant deployments managed by the SimpliLMS team
CREATE TABLE IF NOT EXISTS whitelabel_tenants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  contact_name text,
  contact_email text,
  domain text,
  supabase_project_url text,
  primary_color text DEFAULT '#333333',
  secondary_color text DEFAULT '#666666',
  logo_url text,
  status text CHECK (status IN ('active', 'suspended', 'provisioning')) DEFAULT 'provisioning',
  provisioned_at timestamptz,
  notes text,
  created_at timestamptz DEFAULT NOW(),
  updated_at timestamptz DEFAULT NOW()
);

-- Only super_admins can manage tenants
ALTER TABLE whitelabel_tenants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "super_admins_manage_whitelabel_tenants" ON whitelabel_tenants
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin')
  );
