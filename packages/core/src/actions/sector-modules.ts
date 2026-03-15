"use server";

import { createServerClient, getUser } from "@simplilms/auth/server";
import { getTenantId } from "../lib/tenant";

// ============================================================
// Types
// ============================================================

export interface SectorModuleRow {
  id: string;
  sector_key: string;
  display_name: string;
  description: string | null;
  icon_name: string | null;
  ai_system_prompt: string | null;
  compliance_frameworks: string[];
  curriculum_standards: string[];
  monthly_price_cents: number;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface TenantSectorSubscriptionRow {
  id: string;
  tenant_id: string;
  sector_module_id: string;
  status: string;
  subscribed_at: string;
  expires_at: string | null;
  stripe_subscription_id: string | null;
  created_at: string;
  updated_at: string;
  // Joined fields
  sector_module?: SectorModuleRow;
}

export interface SectorQuestionBankRow {
  id: string;
  sector_module_id: string;
  topic: string;
  subtopic: string | null;
  difficulty: string;
  blooms_level: string;
  question_type: string;
  question_text: string;
  explanation: string | null;
  options: { id: string; text: string; is_correct: boolean }[];
  tags: string[];
  regulatory_reference: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

// ============================================================
// Sector Module Queries
// ============================================================

/**
 * Get all available sector modules (global catalog)
 */
export async function getSectorModules(): Promise<SectorModuleRow[]> {
  const supabase = await createServerClient();
  const { data, error } = await (supabase as any)
    .from("sector_modules")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("Failed to fetch sector modules:", error);
    return [];
  }

  return data || [];
}

/**
 * Get a single sector module by key
 */
export async function getSectorModuleByKey(
  sectorKey: string
): Promise<SectorModuleRow | null> {
  const supabase = await createServerClient();
  const { data, error } = await (supabase as any)
    .from("sector_modules")
    .select("*")
    .eq("sector_key", sectorKey)
    .single();

  if (error) return null;
  return data;
}

/**
 * Get tenant's active sector subscriptions with module details
 */
export async function getTenantSectorSubscriptions(): Promise<
  TenantSectorSubscriptionRow[]
> {
  const supabase = await createServerClient();
  const { data, error } = await (supabase as any)
    .from("tenant_sector_subscriptions")
    .select("*, sector_module:sector_modules(*)")
    .eq("tenant_id", getTenantId())
    .in("status", ["active", "trial"])
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Failed to fetch sector subscriptions:", error);
    return [];
  }

  return (data || []).map((row: any) => ({
    ...row,
    sector_module: row.sector_module || undefined,
  }));
}

/**
 * Get all tenant sector subscriptions (including expired/cancelled) for admin view
 */
export async function getAllTenantSectorSubscriptions(): Promise<
  TenantSectorSubscriptionRow[]
> {
  const supabase = await createServerClient();
  const { data, error } = await (supabase as any)
    .from("tenant_sector_subscriptions")
    .select("*, sector_module:sector_modules(*)")
    .eq("tenant_id", getTenantId())
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Failed to fetch sector subscriptions:", error);
    return [];
  }

  return (data || []).map((row: any) => ({
    ...row,
    sector_module: row.sector_module || undefined,
  }));
}

// ============================================================
// Sector Subscription Management
// ============================================================

/**
 * Activate a sector module for the current tenant
 */
export async function activateSectorModule(sectorModuleId: string): Promise<{
  success?: boolean;
  error?: string;
}> {
  const { user, error: authError } = await getUser();
  if (authError || !user) return { error: "Not authenticated" };

  const supabase = await createServerClient();
  const tenantId = getTenantId();

  // Check if already subscribed
  const { data: existing } = await (supabase as any)
    .from("tenant_sector_subscriptions")
    .select("id, status")
    .eq("tenant_id", tenantId)
    .eq("sector_module_id", sectorModuleId)
    .single();

  if (existing && existing.status === "active") {
    return { error: "Already subscribed to this sector module" };
  }

  if (existing) {
    // Reactivate
    const { error } = await (supabase as any)
      .from("tenant_sector_subscriptions")
      .update({ status: "active", subscribed_at: new Date().toISOString() })
      .eq("id", existing.id);

    if (error) return { error: error.message };
  } else {
    // Create new
    const { error } = await (supabase as any)
      .from("tenant_sector_subscriptions")
      .insert({
        tenant_id: tenantId,
        sector_module_id: sectorModuleId,
        status: "active",
      });

    if (error) return { error: error.message };
  }

  return { success: true };
}

/**
 * Deactivate a sector module for the current tenant
 */
export async function deactivateSectorModule(
  sectorModuleId: string
): Promise<{ success?: boolean; error?: string }> {
  const { user, error: authError } = await getUser();
  if (authError || !user) return { error: "Not authenticated" };

  const supabase = await createServerClient();
  const { error } = await (supabase as any)
    .from("tenant_sector_subscriptions")
    .update({ status: "cancelled" })
    .eq("tenant_id", getTenantId())
    .eq("sector_module_id", sectorModuleId);

  if (error) return { error: error.message };
  return { success: true };
}

// ============================================================
// Question Bank Queries
// ============================================================

/**
 * Get questions from the sector question bank, with filtering
 */
export async function getSectorQuestions(params: {
  sectorModuleId: string;
  topic?: string;
  difficulty?: string;
  questionType?: string;
  limit?: number;
  offset?: number;
}): Promise<{
  questions: SectorQuestionBankRow[];
  total: number;
}> {
  const supabase = await createServerClient();
  const limit = params.limit || 25;
  const offset = params.offset || 0;

  let query = (supabase as any)
    .from("sector_question_banks")
    .select("*", { count: "exact" })
    .eq("sector_module_id", params.sectorModuleId)
    .eq("is_active", true);

  if (params.topic) {
    query = query.eq("topic", params.topic);
  }
  if (params.difficulty) {
    query = query.eq("difficulty", params.difficulty);
  }
  if (params.questionType) {
    query = query.eq("question_type", params.questionType);
  }

  query = query
    .order("topic", { ascending: true })
    .order("sort_order", { ascending: true })
    .range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) {
    console.error("Failed to fetch sector questions:", error);
    return { questions: [], total: 0 };
  }

  return { questions: data || [], total: count || 0 };
}

/**
 * Get unique topics for a sector module's question bank
 */
export async function getSectorQuestionTopics(
  sectorModuleId: string
): Promise<string[]> {
  const supabase = await createServerClient();
  const { data, error } = await (supabase as any)
    .from("sector_question_banks")
    .select("topic")
    .eq("sector_module_id", sectorModuleId)
    .eq("is_active", true)
    .order("topic", { ascending: true });

  if (error) {
    console.error("Failed to fetch sector question topics:", error);
    return [];
  }

  // Deduplicate
  const topics = Array.from(
    new Set<string>((data || []).map((d: any) => d.topic as string))
  );
  return topics;
}

/**
 * Import questions from sector bank into a tenant's quiz
 */
export async function importQuestionsToQuiz(params: {
  questionIds: string[];
  quizId: string;
}): Promise<{ imported?: number; error?: string }> {
  const { user, error: authError } = await getUser();
  if (authError || !user) return { error: "Not authenticated" };

  const supabase = await createServerClient();
  const tenantId = getTenantId();

  // Fetch source questions
  const { data: sourceQuestions, error: fetchError } = await (supabase as any)
    .from("sector_question_banks")
    .select("*")
    .in("id", params.questionIds);

  if (fetchError || !sourceQuestions?.length) {
    return { error: "No questions found to import" };
  }

  // Get existing count for sort_order
  const { count } = await (supabase as any)
    .from("quiz_questions")
    .select("id", { count: "exact" })
    .eq("quiz_id", params.quizId);

  const startOrder = (count || 0) + 1;

  // Map to quiz_questions format
  const quizQuestions = sourceQuestions.map((q: any, i: number) => ({
    tenant_id: tenantId,
    quiz_id: params.quizId,
    question_type: q.question_type,
    question_text: q.question_text,
    explanation: q.explanation,
    options: q.options,
    points: 1,
    sort_order: startOrder + i,
  }));

  const { error: insertError } = await (supabase as any)
    .from("quiz_questions")
    .insert(quizQuestions);

  if (insertError) return { error: insertError.message };
  return { imported: quizQuestions.length };
}

/**
 * Get the active sector keys for the current tenant
 * Used to filter the sector dropdown in AI Course Creator
 */
export async function getActiveSectorKeys(): Promise<string[]> {
  const supabase = await createServerClient();
  const { data, error } = await (supabase as any)
    .from("tenant_sector_subscriptions")
    .select("sector_module:sector_modules(sector_key)")
    .eq("tenant_id", getTenantId())
    .in("status", ["active", "trial"]);

  if (error || !data) return [];

  return data
    .map((d: any) => d.sector_module?.sector_key)
    .filter(Boolean) as string[];
}
