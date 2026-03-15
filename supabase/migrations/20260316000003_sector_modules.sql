-- ============================================================================
-- Migration: Sector Modules — Industry-specific content & question banks
-- ============================================================================
-- Phase 13: Sector module infrastructure for industry-specific AI prompts,
-- compliance templates, and pre-built question banks.
-- 3 new tables, all multi-tenant with tenant_id + RLS.
-- ============================================================================

-- ============================================================================
-- 1. sector_modules — Catalog of available sector modules
-- ============================================================================
-- One row per sector. Global catalog (no tenant_id — shared across all tenants).
-- Controls which sectors exist in the system and their pricing.

CREATE TABLE public.sector_modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sector_key text NOT NULL UNIQUE,
  display_name text NOT NULL,
  description text,
  icon_name text,
  ai_system_prompt text,
  compliance_frameworks jsonb DEFAULT '[]',
  curriculum_standards jsonb DEFAULT '[]',
  monthly_price_cents integer DEFAULT 9900,
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TRIGGER set_sector_modules_updated_at
  BEFORE UPDATE ON public.sector_modules
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================================
-- 2. tenant_sector_subscriptions — Which tenants have which sectors
-- ============================================================================

CREATE TABLE public.tenant_sector_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id),
  sector_module_id uuid NOT NULL REFERENCES public.sector_modules(id),
  status text CHECK (status IN ('active', 'trial', 'expired', 'cancelled')) DEFAULT 'active',
  subscribed_at timestamptz DEFAULT now(),
  expires_at timestamptz,
  stripe_subscription_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (tenant_id, sector_module_id)
);

CREATE TRIGGER set_tenant_sector_subscriptions_updated_at
  BEFORE UPDATE ON public.tenant_sector_subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE INDEX idx_tenant_sector_subs_tenant ON public.tenant_sector_subscriptions(tenant_id);
CREATE INDEX idx_tenant_sector_subs_module ON public.tenant_sector_subscriptions(sector_module_id);

-- ============================================================================
-- 3. sector_question_banks — Pre-built questions per sector
-- ============================================================================
-- Global question bank (no tenant_id). Available to all tenants subscribed
-- to the corresponding sector module. Questions can be imported into
-- tenant-specific quizzes via the admin UI.

CREATE TABLE public.sector_question_banks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sector_module_id uuid NOT NULL REFERENCES public.sector_modules(id) ON DELETE CASCADE,
  topic text NOT NULL,
  subtopic text,
  difficulty text CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')) DEFAULT 'intermediate',
  blooms_level text CHECK (blooms_level IN (
    'remember', 'understand', 'apply', 'analyze', 'evaluate', 'create'
  )) DEFAULT 'understand',
  question_type text CHECK (question_type IN ('multiple_choice', 'true_false', 'short_answer')) DEFAULT 'multiple_choice',
  question_text text NOT NULL,
  explanation text,
  options jsonb DEFAULT '[]',
  tags jsonb DEFAULT '[]',
  regulatory_reference text,
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TRIGGER set_sector_question_banks_updated_at
  BEFORE UPDATE ON public.sector_question_banks
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE INDEX idx_sector_qb_module ON public.sector_question_banks(sector_module_id);
CREATE INDEX idx_sector_qb_topic ON public.sector_question_banks(topic);
CREATE INDEX idx_sector_qb_difficulty ON public.sector_question_banks(difficulty);

-- ============================================================================
-- Enable RLS
-- ============================================================================

ALTER TABLE public.sector_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_sector_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sector_question_banks ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS Policies — SECTOR_MODULES (global catalog, read by all authenticated)
-- ============================================================================

CREATE POLICY "sector_modules_read_all"
  ON public.sector_modules FOR SELECT
  USING (true);

CREATE POLICY "sector_modules_admin_insert"
  ON public.sector_modules FOR INSERT
  WITH CHECK (
    public.current_user_role() = 'super_admin'
  );

CREATE POLICY "sector_modules_admin_update"
  ON public.sector_modules FOR UPDATE
  USING (
    public.current_user_role() = 'super_admin'
  )
  WITH CHECK (
    public.current_user_role() = 'super_admin'
  );

-- ============================================================================
-- RLS Policies — TENANT_SECTOR_SUBSCRIPTIONS
-- ============================================================================

CREATE POLICY "tenant_sector_subs_read_own"
  ON public.tenant_sector_subscriptions FOR SELECT
  USING (
    tenant_id = public.current_tenant_id()
  );

CREATE POLICY "tenant_sector_subs_admin_insert"
  ON public.tenant_sector_subscriptions FOR INSERT
  WITH CHECK (
    public.current_user_role() = 'super_admin'
    AND tenant_id = public.current_tenant_id()
  );

CREATE POLICY "tenant_sector_subs_admin_update"
  ON public.tenant_sector_subscriptions FOR UPDATE
  USING (
    public.current_user_role() = 'super_admin'
    AND tenant_id = public.current_tenant_id()
  )
  WITH CHECK (
    public.current_user_role() = 'super_admin'
    AND tenant_id = public.current_tenant_id()
  );

CREATE POLICY "tenant_sector_subs_admin_delete"
  ON public.tenant_sector_subscriptions FOR DELETE
  USING (
    public.current_user_role() = 'super_admin'
    AND tenant_id = public.current_tenant_id()
  );

-- ============================================================================
-- RLS Policies — SECTOR_QUESTION_BANKS (read by subscribed tenants)
-- ============================================================================

-- Admins/teachers can read questions for sectors their tenant is subscribed to
CREATE POLICY "sector_qb_read_subscribed"
  ON public.sector_question_banks FOR SELECT
  USING (
    public.current_user_role() IN ('super_admin', 'teacher_paid', 'teacher_unpaid')
    AND EXISTS (
      SELECT 1 FROM public.tenant_sector_subscriptions tss
      WHERE tss.sector_module_id = sector_module_id
        AND tss.tenant_id = public.current_tenant_id()
        AND tss.status IN ('active', 'trial')
    )
  );

-- Super admin can manage question banks (for platform-level management)
CREATE POLICY "sector_qb_admin_insert"
  ON public.sector_question_banks FOR INSERT
  WITH CHECK (
    public.current_user_role() = 'super_admin'
  );

CREATE POLICY "sector_qb_admin_update"
  ON public.sector_question_banks FOR UPDATE
  USING (
    public.current_user_role() = 'super_admin'
  )
  WITH CHECK (
    public.current_user_role() = 'super_admin'
  );

CREATE POLICY "sector_qb_admin_delete"
  ON public.sector_question_banks FOR DELETE
  USING (
    public.current_user_role() = 'super_admin'
  );

-- ============================================================================
-- Seed the 8 sector modules
-- ============================================================================

INSERT INTO public.sector_modules (sector_key, display_name, description, icon_name, monthly_price_cents, sort_order, compliance_frameworks, curriculum_standards) VALUES
  ('real_estate', 'Real Estate', 'Pre-licensing, CE, and exam prep for real estate schools. TREC, GREC, FREC, DRE compliance.', 'Building2', 14900, 1,
    '["TREC (Texas)", "GREC (Georgia)", "FREC (Florida)", "DRE (California)", "ARELLO Standards"]'::jsonb,
    '["State pre-licensing hour requirements", "Continuing education modules", "Broker vs agent content levels", "State exam objective mapping"]'::jsonb
  ),
  ('insurance', 'Insurance & Financial Services', 'Pre-licensing, CE, and compliance training for insurance and financial services. State DOI, NAIC, FINRA.', 'Shield', 14900, 2,
    '["State DOI Requirements", "NAIC Model Act", "FINRA Series Exams", "NMLS Pre-licensing"]'::jsonb,
    '["Property & Casualty", "Life & Health", "Ethics & Compliance", "State-specific endorsements"]'::jsonb
  ),
  ('healthcare', 'Healthcare Training', 'CNA, MA, phlebotomy, and allied health programs. Nursing boards, CMS, NAACLS compliance.', 'HeartPulse', 19900, 3,
    '["State Nursing Boards", "CMS Requirements", "NAACLS Standards", "ABHES Competencies", "OSHA Bloodborne Pathogens"]'::jsonb,
    '["Theory vs Clinical vs Lab hours", "Competency-based skill validation", "Patient safety modules", "HIPAA compliance"]'::jsonb
  ),
  ('cdl_trucking', 'CDL / Trucking', 'ELDT-compliant CDL training programs. FMCSA, DOT, TPR documentation.', 'Truck', 14900, 4,
    '["FMCSA ELDT Requirements", "DOT Regulations", "Training Provider Registry (TPR)", "PTDI Standards"]'::jsonb,
    '["Theory hours tracking", "Behind-the-Wheel (BTW) hours", "Class A/B endorsements", "Pre-trip inspection competencies"]'::jsonb
  ),
  ('cosmetology', 'Cosmetology & Beauty', 'State board-approved cosmetology, esthetics, nail tech, and barbering programs. NIC, NACCAS.', 'Scissors', 9900, 5,
    '["State Cosmetology Boards", "NIC Exam Standards", "NACCAS Accreditation"]'::jsonb,
    '["Theory vs Practical hour splits", "Sanitation & infection control", "Specialty tracks", "Practical competency documentation"]'::jsonb
  ),
  ('it_tech', 'IT & Technology', 'Certification-aligned IT training. CompTIA, AWS, Azure, Cisco exam prep.', 'Monitor', 9900, 6,
    '["CompTIA Exam Objectives", "AWS Certification Paths", "Azure Certification Paths", "Cisco CCNA/CCNP"]'::jsonb,
    '["Exam objective mapping", "Hands-on lab exercises", "Performance-based question formats", "Career pathway mapping"]'::jsonb
  ),
  ('corporate_compliance', 'Corporate Compliance', 'OSHA, HIPAA, harassment prevention, SOX, and workplace safety training.', 'FileCheck', 9900, 7,
    '["OSHA 10/30-hour Programs", "HIPAA Privacy & Security Rules", "State Harassment Prevention Laws", "SOX Compliance"]'::jsonb,
    '["Regulatory requirement tracking", "Certification expiration/renewal", "Audit readiness documentation", "Industry-specific safety"]'::jsonb
  ),
  ('government', 'Government Agencies', 'Federal and state mandated training. OPM, EEOC, CISA, Section 508.', 'Landmark', 19900, 8,
    '["OPM Mandated Training", "EEOC Requirements", "CISA Cybersecurity (NIST 800-50)", "Section 508 Accessibility"]'::jsonb,
    '["Annual mandatory refresh tracking", "IDP alignment", "Ethics training", "WCAG 2.1 AA compliance"]'::jsonb
  );
