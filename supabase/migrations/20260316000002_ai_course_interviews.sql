-- ============================================================
-- AI COURSE INTERVIEWS TABLE
-- Phase 12: AI Course Creator
-- ============================================================

CREATE TABLE IF NOT EXISTS ai_course_interviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  created_by uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'interviewing'
    CHECK (status IN ('interviewing', 'generating', 'review', 'completed', 'failed')),

  -- Interview configuration
  topic text NOT NULL,
  target_audience text,
  desired_length text,
  additional_context text,
  generation_mode text NOT NULL DEFAULT 'interview'
    CHECK (generation_mode IN ('interview', 'document', 'topic')),

  -- Sector module context (NULL = generic)
  sector_key text,

  -- Conversation history
  messages jsonb NOT NULL DEFAULT '[]'::jsonb,
  system_prompt text,

  -- Document upload mode: uploaded file references
  uploaded_documents jsonb DEFAULT '[]'::jsonb,
  -- [{ "name": "file.pdf", "storage_path": "...", "content_text": "extracted text..." }]

  -- Usage tracking
  total_input_tokens integer DEFAULT 0,
  total_output_tokens integer DEFAULT 0,

  -- Generated output
  generated_outline jsonb,
  generated_course_id uuid REFERENCES courses(id) ON DELETE SET NULL,
  error_message text,

  -- Timestamps
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_ai_course_interviews_tenant ON ai_course_interviews(tenant_id);
CREATE INDEX idx_ai_course_interviews_created_by ON ai_course_interviews(created_by);
CREATE INDEX idx_ai_course_interviews_status ON ai_course_interviews(status);

-- Updated_at trigger
CREATE TRIGGER set_ai_course_interviews_updated_at
  BEFORE UPDATE ON ai_course_interviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- RLS Policies
-- ============================================================

ALTER TABLE ai_course_interviews ENABLE ROW LEVEL SECURITY;

-- Tenant isolation
CREATE POLICY ai_interviews_tenant_isolation ON ai_course_interviews
  USING (tenant_id = current_tenant_id());

-- Admins can see all interviews in their tenant
CREATE POLICY ai_interviews_admin_select ON ai_course_interviews
  FOR SELECT USING (
    current_user_role() IN ('super_admin', 'school_rep')
  );

-- Users can see their own interviews
CREATE POLICY ai_interviews_own_select ON ai_course_interviews
  FOR SELECT USING (
    created_by = auth.uid()
  );

-- Admins and teachers can create interviews
CREATE POLICY ai_interviews_insert ON ai_course_interviews
  FOR INSERT WITH CHECK (
    current_user_role() IN ('super_admin', 'school_rep', 'teacher_paid', 'teacher_unpaid')
    AND tenant_id = current_tenant_id()
    AND created_by = auth.uid()
  );

-- Users can update their own interviews
CREATE POLICY ai_interviews_update ON ai_course_interviews
  FOR UPDATE USING (
    created_by = auth.uid()
    AND tenant_id = current_tenant_id()
  );

-- Admins can delete any interview in their tenant
CREATE POLICY ai_interviews_admin_delete ON ai_course_interviews
  FOR DELETE USING (
    current_user_role() = 'super_admin'
    AND tenant_id = current_tenant_id()
  );
