import { createServerClient } from "@simplilms/auth/server";
import { createClient } from "@supabase/supabase-js";
import type { EligibilityStatus, ApplicationStatus, CommunicationChannel } from "@simplilms/database";

// ============================================================
// Type definitions for query results
// ============================================================

export interface ProspectRow {
  id: string;
  tenant_id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  program_interest: string | null;
  source: string | null;
  inquiry_ip_address: string | null;
  inquiry_user_agent: string | null;
  inquiry_submitted_at: string | null;
  discovery_call_date: string | null;
  discovery_call_zoom_link: string | null;
  eligibility_status: string | null;
  eligibility_marked_by: string | null;
  eligibility_marked_at: string | null;
  remarketing_eligible: boolean | null;
  notes: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface ApplicationRow {
  id: string;
  tenant_id: string;
  prospect_id: string | null;
  user_id: string | null;
  application_number: string | null;
  status: string | null;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  date_of_birth: string | null;
  program_id: string | null;
  citizenship_status: string | null;
  citizenship_document_type: string | null;
  citizenship_document_url: string | null;
  stripe_identity_session_id: string | null;
  stripe_identity_status: string | null;
  stripe_identity_verified_at: string | null;
  submitted_at: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  rejection_reason: string | null;
  created_at: string | null;
  updated_at: string | null;
  // Address fields
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  country: string | null;
  middle_name: string | null;
  mailing_address_line1: string | null;
  mailing_address_line2: string | null;
  mailing_city: string | null;
  mailing_state: string | null;
  mailing_zip: string | null;
  mailing_country: string | null;
  // ISA
  isa_consent_given: boolean | null;
  // Payment
  payment_token: string | null;
}

export interface CommunicationTemplateRow {
  id: string;
  tenant_id: string;
  name: string | null;
  channel: string | null;
  subject: string | null;
  body: string | null;
  created_by: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface CommunicationLogRow {
  id: string;
  tenant_id: string;
  template_id: string | null;
  recipient_id: string | null;
  recipient_type: string | null;
  channel: string | null;
  sent_at: string | null;
  delivered_at: string | null;
  opened_at: string | null;
  clicked_at: string | null;
  tracking_id: string | null;
  link_url: string | null;
  metadata: Record<string, unknown> | null;
}

// ============================================================
// Prospect Queries
// ============================================================

export async function getProspects(params: {
  status?: EligibilityStatus;
  search?: string;
  sort?: "newest" | "oldest";
  page?: number;
  pageSize?: number;
}): Promise<{ prospects: ProspectRow[]; totalCount: number }> {
  const supabase = await createServerClient();
  const { status, search, sort = "newest", page = 1, pageSize = 20 } = params;

  let query = (supabase as any)
    .from("prospects")
    .select("*", { count: "exact" });

  if (status) {
    query = query.eq("eligibility_status", status);
  }

  if (search) {
    query = query.or(
      `first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%`
    );
  }

  query = query.order("inquiry_submitted_at", {
    ascending: sort === "oldest",
  });

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) {
    console.error("Error fetching prospects:", error);
    return { prospects: [], totalCount: 0 };
  }

  return {
    prospects: (data || []) as ProspectRow[],
    totalCount: count || 0,
  };
}

export async function getProspectById(
  id: string
): Promise<ProspectRow | null> {
  const supabase = await createServerClient();
  const { data, error } = await (supabase as any)
    .from("prospects")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching prospect:", error);
    return null;
  }

  return data as ProspectRow;
}

// ============================================================
// Application Queries
// ============================================================

export async function getApplications(params: {
  status?: ApplicationStatus;
  search?: string;
  page?: number;
  pageSize?: number;
}): Promise<{ applications: ApplicationRow[]; totalCount: number }> {
  const supabase = await createServerClient();
  const { status, search, page = 1, pageSize = 20 } = params;

  let query = (supabase as any)
    .from("applications")
    .select("*", { count: "exact" });

  if (status) {
    query = query.eq("status", status);
  }

  if (search) {
    query = query.or(
      `first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%,application_number.ilike.%${search}%`
    );
  }

  query = query.order("created_at", { ascending: false });

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) {
    console.error("Error fetching applications:", error);
    return { applications: [], totalCount: 0 };
  }

  return {
    applications: (data || []) as ApplicationRow[],
    totalCount: count || 0,
  };
}

export async function getApplicationById(
  id: string
): Promise<ApplicationRow | null> {
  const supabase = await createServerClient();
  const { data, error } = await (supabase as any)
    .from("applications")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching application:", error);
    return null;
  }

  return data as ApplicationRow;
}

// ============================================================
// Communication Queries
// ============================================================

export async function getCommunicationTemplates(
  channel?: CommunicationChannel
): Promise<CommunicationTemplateRow[]> {
  const supabase = await createServerClient();

  let query = (supabase as any)
    .from("communication_templates")
    .select("*")
    .order("name");

  if (channel) {
    query = query.eq("channel", channel);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching templates:", error);
    return [];
  }

  return (data || []) as CommunicationTemplateRow[];
}

export async function getCommunicationLog(
  recipientId: string
): Promise<CommunicationLogRow[]> {
  const supabase = await createServerClient();

  const { data, error } = await (supabase as any)
    .from("communication_log")
    .select("*")
    .eq("recipient_id", recipientId)
    .order("sent_at", { ascending: false });

  if (error) {
    console.error("Error fetching communication log:", error);
    return [];
  }

  return (data || []) as CommunicationLogRow[];
}

// ============================================================
// Program Queries
// ============================================================

export interface ProgramRow {
  id: string;
  tenant_id: string;
  name: string | null;
  description: string | null;
  tuition_amount_cents: number | null;
  enrollment_fee_cents: number | null;
  duration_weeks: number | null;
  is_active: boolean;
  created_at: string | null;
  updated_at: string | null;
}

export async function getPrograms(): Promise<ProgramRow[]> {
  const supabase = await createServerClient();
  const { data, error } = await (supabase as any)
    .from("programs")
    .select("*")
    .eq("is_active", true)
    .order("name");

  if (error) {
    console.error("Error fetching programs:", error);
    return [];
  }

  return (data || []) as ProgramRow[];
}

// ============================================================
// Public Prospect Queries (for application form — no auth required)
// ============================================================

/**
 * Fetch a prospect by ID for the public application form.
 * Only returns basic fields needed to pre-fill the application.
 * Does NOT require authentication.
 */
export async function getProspectByIdPublic(
  id: string
): Promise<ProspectRow | null> {
  const supabase = await createServerClient();
  const { data, error } = await (supabase as any)
    .from("prospects")
    .select(
      "id, tenant_id, first_name, last_name, email, phone, program_interest, eligibility_status"
    )
    .eq("id", id)
    .eq("eligibility_status", "yes")
    .single();

  if (error) {
    console.error("Error fetching prospect (public):", error);
    return null;
  }

  return data as ProspectRow;
}

/**
 * Fetch an application by prospect ID.
 * Used to check if a prospect already has a draft or submitted application.
 */
export async function getApplicationByProspectId(
  prospectId: string
): Promise<ApplicationRow | null> {
  const supabase = await createServerClient();
  const { data, error } = await (supabase as any)
    .from("applications")
    .select("*")
    .eq("prospect_id", prospectId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Error fetching application by prospect:", error);
    return null;
  }

  return data as ApplicationRow | null;
}

// ============================================================
// Dashboard Stats Queries
// ============================================================

export async function getDashboardStats(): Promise<{
  totalProspects: number;
  pendingApplications: number;
  activeEnrollments: number;
  totalRevenueCents: number;
}> {
  const supabase = await createServerClient();

  const [prospectsRes, applicationsRes, enrollmentsRes, paymentsRes] =
    await Promise.all([
      (supabase as any)
        .from("prospects")
        .select("id", { count: "exact", head: true }),
      (supabase as any)
        .from("applications")
        .select("id", { count: "exact", head: true })
        .eq("status", "submitted"),
      (supabase as any)
        .from("enrollments")
        .select("id", { count: "exact", head: true })
        .in("status", ["active", "payment_plan_active"]),
      (supabase as any)
        .from("payments")
        .select("amount_cents")
        .eq("status", "succeeded"),
    ]);

  const totalRevenueCents = (paymentsRes.data || []).reduce(
    (sum: number, p: { amount_cents: number | null }) =>
      sum + (p.amount_cents || 0),
    0
  );

  return {
    totalProspects: prospectsRes.count || 0,
    pendingApplications: applicationsRes.count || 0,
    activeEnrollments: enrollmentsRes.count || 0,
    totalRevenueCents,
  };
}

export async function getRepDashboardStats(): Promise<{
  myProspects: number;
  pendingCalls: number;
  recentInquiries: number;
}> {
  const supabase = await createServerClient();
  const sevenDaysAgo = new Date(
    Date.now() - 7 * 24 * 60 * 60 * 1000
  ).toISOString();

  const [prospectsRes, pendingCallsRes, recentRes] = await Promise.all([
    (supabase as any)
      .from("prospects")
      .select("id", { count: "exact", head: true }),
    (supabase as any)
      .from("prospects")
      .select("id", { count: "exact", head: true })
      .not("discovery_call_date", "is", null)
      .eq("eligibility_status", "pending"),
    (supabase as any)
      .from("prospects")
      .select("id", { count: "exact", head: true })
      .gte("inquiry_submitted_at", sevenDaysAgo),
  ]);

  return {
    myProspects: prospectsRes.count || 0,
    pendingCalls: pendingCallsRes.count || 0,
    recentInquiries: recentRes.count || 0,
  };
}

// ============================================================
// Payment Queries
// ============================================================

export interface PaymentRow {
  id: string;
  tenant_id: string;
  user_id: string;
  application_id: string | null;
  enrollment_id: string | null;
  stripe_payment_intent_id: string | null;
  stripe_checkout_session_id: string | null;
  stripe_invoice_id: string | null;
  amount_cents: number;
  currency: string;
  fee_type: string;
  status: string;
  payment_method: string | null;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface EnrollmentRow {
  id: string;
  tenant_id: string;
  application_id: string | null;
  user_id: string;
  enrollment_number: string | null;
  program_id: string;
  status: string;
  tuition_payment_method: string | null;
  enrolled_at: string;
  created_at: string;
  updated_at: string;
}

/**
 * Create a service-role Supabase client for queries that bypass RLS.
 * Used by semi-public pages (payment, application) where there is no user session.
 */
function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Missing Supabase service role credentials");
  }
  return createClient(url, key);
}

/**
 * Fetch an application by its payment token.
 * Uses service-role client (no auth required — semi-public page).
 * Only returns applications with status 'approved' or 'enrolled'.
 */
export async function getApplicationByPaymentToken(
  token: string
): Promise<ApplicationRow | null> {
  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("applications")
    .select("*")
    .eq("payment_token", token)
    .in("status", ["approved", "enrolled"])
    .single();

  if (error) {
    console.error("Error fetching application by payment token:", error);
    return null;
  }

  return data as ApplicationRow | null;
}

/**
 * Fetch payments for an application.
 */
export async function getPaymentsByApplicationId(
  applicationId: string
): Promise<PaymentRow[]> {
  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("payments")
    .select("*")
    .eq("application_id", applicationId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching payments by application:", error);
    return [];
  }

  return (data || []) as PaymentRow[];
}

/**
 * Fetch payments for the current authenticated user.
 */
export async function getPaymentsByUserId(
  userId: string
): Promise<PaymentRow[]> {
  const supabase = await createServerClient();
  const { data, error } = await (supabase as any)
    .from("payments")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching payments by user:", error);
    return [];
  }

  return (data || []) as PaymentRow[];
}

// ============================================================
// Enrollment Queries
// ============================================================

/**
 * Fetch enrollments for the current authenticated user.
 */
export async function getEnrollmentsByUserId(
  userId: string
): Promise<EnrollmentRow[]> {
  const supabase = await createServerClient();
  const { data, error } = await (supabase as any)
    .from("enrollments")
    .select("*")
    .eq("user_id", userId)
    .order("enrolled_at", { ascending: false });

  if (error) {
    console.error("Error fetching enrollments by user:", error);
    return [];
  }

  return (data || []) as EnrollmentRow[];
}

/**
 * Fetch enrollments with pagination and filtering (admin view).
 */
export async function getEnrollments(params: {
  status?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}): Promise<{ enrollments: EnrollmentRow[]; totalCount: number }> {
  const supabase = await createServerClient();
  const { status, search, page = 1, pageSize = 20 } = params;

  let query = (supabase as any)
    .from("enrollments")
    .select("*", { count: "exact" });

  if (status) {
    query = query.eq("status", status);
  }

  if (search) {
    query = query.or(`enrollment_number.ilike.%${search}%`);
  }

  query = query.order("enrolled_at", { ascending: false });

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) {
    console.error("Error fetching enrollments:", error);
    return { enrollments: [], totalCount: 0 };
  }

  return {
    enrollments: (data || []) as EnrollmentRow[],
    totalCount: count || 0,
  };
}

// ============================================================
// Message Queries
// ============================================================

export interface MessageRow {
  id: string;
  tenant_id: string;
  sender_id: string | null;
  recipient_id: string;
  subject: string | null;
  body: string;
  is_read: boolean;
  read_at: string | null;
  is_system: boolean;
  message_type: string;
  created_at: string;
  // Joined sender info (optional — populated when using nested select)
  sender_first_name?: string | null;
  sender_last_name?: string | null;
}

/**
 * Fetch all messages for a user (newest first).
 */
export async function getMessagesByUserId(
  userId: string
): Promise<MessageRow[]> {
  const supabase = await createServerClient();
  const { data, error } = await (supabase as any)
    .from("messages")
    .select("*")
    .eq("recipient_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching messages:", error);
    return [];
  }

  return (data || []) as MessageRow[];
}

/**
 * Get the count of unread messages for a user.
 */
export async function getUnreadMessageCount(
  userId: string
): Promise<number> {
  const supabase = await createServerClient();
  const { count, error } = await (supabase as any)
    .from("messages")
    .select("id", { count: "exact", head: true })
    .eq("recipient_id", userId)
    .eq("is_read", false);

  if (error) {
    console.error("Error fetching unread count:", error);
    return 0;
  }

  return count || 0;
}

/**
 * Fetch a single message by ID.
 */
export async function getMessageById(
  messageId: string
): Promise<MessageRow | null> {
  const supabase = await createServerClient();
  const { data, error } = await (supabase as any)
    .from("messages")
    .select("*")
    .eq("id", messageId)
    .single();

  if (error) {
    console.error("Error fetching message:", error);
    return null;
  }

  return data as MessageRow;
}

/**
 * Fetch sent messages for admin view (paginated).
 */
export async function getSentMessages(params: {
  page?: number;
  pageSize?: number;
}): Promise<{ messages: MessageRow[]; totalCount: number }> {
  const supabase = await createServerClient();
  const { page = 1, pageSize = 20 } = params;

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await (supabase as any)
    .from("messages")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    console.error("Error fetching sent messages:", error);
    return { messages: [], totalCount: 0 };
  }

  return {
    messages: (data || []) as MessageRow[],
    totalCount: count || 0,
  };
}

// ============================================================
// Class Queries
// ============================================================

export interface ClassEnrollmentWithDetails {
  id: string;
  class_id: string;
  student_id: string;
  status: string;
  enrolled_at: string;
  // Class details
  class_name: string;
  class_description: string | null;
  zoom_join_url: string | null;
  schedule: Record<string, unknown> | null;
  is_active: boolean;
  program_id: string | null;
  // Instructor
  instructor_first_name: string | null;
  instructor_last_name: string | null;
}

export interface AttendanceRow {
  id: string;
  class_id: string;
  student_id: string;
  session_date: string;
  status: string;
  marked_at: string | null;
}

/**
 * Fetch classes a student is enrolled in, with class details and instructor name.
 */
export async function getStudentClasses(
  userId: string
): Promise<ClassEnrollmentWithDetails[]> {
  const supabase = await createServerClient();

  // First get class enrollments
  const { data: enrollments, error: enrollError } = await (supabase as any)
    .from("class_enrollments")
    .select("*")
    .eq("student_id", userId)
    .eq("status", "enrolled");

  if (enrollError || !enrollments || enrollments.length === 0) {
    if (enrollError) console.error("Error fetching class enrollments:", enrollError);
    return [];
  }

  // Get class IDs and fetch class + instructor details
  const classIds = enrollments.map((e: { class_id: string }) => e.class_id);
  const { data: classes, error: classError } = await (supabase as any)
    .from("classes")
    .select("*")
    .in("id", classIds);

  if (classError || !classes) {
    console.error("Error fetching classes:", classError);
    return [];
  }

  // Fetch instructor profiles
  const instructorIds = [
    ...new Set(
      classes
        .map((c: { instructor_id: string | null }) => c.instructor_id)
        .filter(Boolean)
    ),
  ] as string[];

  let instructorMap: Record<string, { first_name: string | null; last_name: string | null }> = {};
  if (instructorIds.length > 0) {
    const { data: instructors } = await (supabase as any)
      .from("profiles")
      .select("id, first_name, last_name")
      .in("id", instructorIds);

    if (instructors) {
      instructorMap = Object.fromEntries(
        instructors.map((i: { id: string; first_name: string | null; last_name: string | null }) => [
          i.id,
          { first_name: i.first_name, last_name: i.last_name },
        ])
      );
    }
  }

  // Combine the data
  const classMap = Object.fromEntries(
    classes.map((c: Record<string, unknown>) => [c.id, c])
  );

  return enrollments.map(
    (enrollment: { id: string; class_id: string; student_id: string; status: string; enrolled_at: string }) => {
      const cls = classMap[enrollment.class_id] || {};
      const instructor = instructorMap[cls.instructor_id as string] || {};
      return {
        id: enrollment.id,
        class_id: enrollment.class_id,
        student_id: enrollment.student_id,
        status: enrollment.status,
        enrolled_at: enrollment.enrolled_at,
        class_name: cls.name || "Unnamed Class",
        class_description: cls.description || null,
        zoom_join_url: cls.zoom_join_url || null,
        schedule: cls.schedule || null,
        is_active: cls.is_active ?? true,
        program_id: cls.program_id || null,
        instructor_first_name: instructor.first_name || null,
        instructor_last_name: instructor.last_name || null,
      } as ClassEnrollmentWithDetails;
    }
  );
}

/**
 * Fetch attendance records for a student.
 */
export async function getAttendanceByStudent(
  userId: string
): Promise<AttendanceRow[]> {
  const supabase = await createServerClient();
  const { data, error } = await (supabase as any)
    .from("attendance")
    .select("id, class_id, student_id, session_date, status, marked_at")
    .eq("student_id", userId)
    .order("session_date", { ascending: false });

  if (error) {
    console.error("Error fetching attendance:", error);
    return [];
  }

  return (data || []) as AttendanceRow[];
}

/**
 * Fetch all student profiles (for admin message recipient selector).
 */
export async function getStudentProfiles(): Promise<
  { id: string; first_name: string | null; last_name: string | null; email: string | null }[]
> {
  const supabase = await createServerClient();
  const { data, error } = await (supabase as any)
    .from("profiles")
    .select("id, first_name, last_name, email")
    .eq("role", "student")
    .order("last_name");

  if (error) {
    console.error("Error fetching student profiles:", error);
    return [];
  }

  return (data || []) as { id: string; first_name: string | null; last_name: string | null; email: string | null }[];
}

// ============================================================
// Instructor / Teacher Queries
// ============================================================

export interface InstructorClassRow {
  id: string;
  tenant_id: string;
  program_id: string | null;
  instructor_id: string;
  name: string;
  description: string | null;
  zoom_meeting_id: string | null;
  zoom_join_url: string | null;
  zoom_start_url: string | null;
  schedule: Record<string, unknown> | null;
  max_students: number | null;
  commission_rate: number | null;
  price_cents: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Computed
  enrolled_count: number;
}

export interface ClassStudentRow {
  id: string;
  student_id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  enrolled_at: string;
  status: string;
}

/**
 * Fetch classes taught by an instructor.
 */
export async function getInstructorClasses(
  instructorId: string
): Promise<InstructorClassRow[]> {
  const supabase = await createServerClient();

  // Get classes assigned to this instructor
  const { data: classes, error } = await (supabase as any)
    .from("classes")
    .select("*")
    .eq("instructor_id", instructorId)
    .order("is_active", { ascending: false })
    .order("name");

  if (error || !classes) {
    console.error("Error fetching instructor classes:", error);
    return [];
  }

  if (classes.length === 0) return [];

  // Get enrolled student counts per class
  const classIds = classes.map((c: { id: string }) => c.id);
  const { data: enrollments } = await (supabase as any)
    .from("class_enrollments")
    .select("class_id")
    .in("class_id", classIds)
    .eq("status", "enrolled");

  const countMap: Record<string, number> = {};
  (enrollments || []).forEach((e: { class_id: string }) => {
    countMap[e.class_id] = (countMap[e.class_id] || 0) + 1;
  });

  return classes.map((c: Record<string, unknown>) => ({
    ...c,
    enrolled_count: countMap[c.id as string] || 0,
  })) as InstructorClassRow[];
}

/**
 * Fetch a single class by ID (for instructor detail page).
 */
export async function getClassById(
  classId: string
): Promise<InstructorClassRow | null> {
  const supabase = await createServerClient();
  const { data, error } = await (supabase as any)
    .from("classes")
    .select("*")
    .eq("id", classId)
    .single();

  if (error || !data) {
    console.error("Error fetching class:", error);
    return null;
  }

  // Get enrolled count
  const { count } = await (supabase as any)
    .from("class_enrollments")
    .select("id", { count: "exact", head: true })
    .eq("class_id", classId)
    .eq("status", "enrolled");

  return { ...data, enrolled_count: count || 0 } as InstructorClassRow;
}

/**
 * Fetch students enrolled in a class (first name + last initial per CLAUDE.md spec).
 */
export async function getClassStudents(
  classId: string
): Promise<ClassStudentRow[]> {
  const supabase = await createServerClient();

  // Get enrollment records
  const { data: enrollments, error } = await (supabase as any)
    .from("class_enrollments")
    .select("id, student_id, status, enrolled_at")
    .eq("class_id", classId)
    .eq("status", "enrolled");

  if (error || !enrollments || enrollments.length === 0) {
    if (error) console.error("Error fetching class students:", error);
    return [];
  }

  // Get student profiles
  const studentIds = enrollments.map((e: { student_id: string }) => e.student_id);
  const { data: profiles } = await (supabase as any)
    .from("profiles")
    .select("id, first_name, last_name, email")
    .in("id", studentIds);

  const profileMap = Object.fromEntries(
    (profiles || []).map((p: { id: string; first_name: string | null; last_name: string | null; email: string | null }) => [p.id, p])
  );

  return enrollments.map(
    (e: { id: string; student_id: string; status: string; enrolled_at: string }) => ({
      id: e.id,
      student_id: e.student_id,
      first_name: profileMap[e.student_id]?.first_name || null,
      last_name: profileMap[e.student_id]?.last_name || null,
      email: profileMap[e.student_id]?.email || null,
      enrolled_at: e.enrolled_at,
      status: e.status,
    })
  ) as ClassStudentRow[];
}

/**
 * Fetch attendance records for a specific class, optionally filtered by session date.
 */
export async function getClassAttendance(
  classId: string,
  sessionDate?: string
): Promise<AttendanceRow[]> {
  const supabase = await createServerClient();

  let query = (supabase as any)
    .from("attendance")
    .select("id, class_id, student_id, session_date, status, marked_at")
    .eq("class_id", classId)
    .order("session_date", { ascending: false });

  if (sessionDate) {
    query = query.eq("session_date", sessionDate);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching class attendance:", error);
    return [];
  }

  return (data || []) as AttendanceRow[];
}

/**
 * Get unique session dates for a class (for attendance date selector).
 */
export async function getClassSessionDates(
  classId: string
): Promise<string[]> {
  const supabase = await createServerClient();
  const { data, error } = await (supabase as any)
    .from("attendance")
    .select("session_date")
    .eq("class_id", classId)
    .order("session_date", { ascending: false });

  if (error || !data) {
    console.error("Error fetching session dates:", error);
    return [];
  }

  // Deduplicate session dates
  const dates = [...new Set((data as { session_date: string }[]).map((d) => d.session_date))];
  return dates;
}

/**
 * Fetch instructor dashboard stats.
 */
export async function getInstructorDashboardStats(
  instructorId: string
): Promise<{
  totalClasses: number;
  activeClasses: number;
  totalStudents: number;
}> {
  const supabase = await createServerClient();

  // Get all classes for this instructor
  const { data: classes, error } = await (supabase as any)
    .from("classes")
    .select("id, is_active")
    .eq("instructor_id", instructorId);

  if (error || !classes) {
    return { totalClasses: 0, activeClasses: 0, totalStudents: 0 };
  }

  const totalClasses = classes.length;
  const activeClasses = classes.filter((c: { is_active: boolean }) => c.is_active).length;

  // Get enrolled student count across all classes
  const classIds = classes.map((c: { id: string }) => c.id);
  let totalStudents = 0;
  if (classIds.length > 0) {
    const { count } = await (supabase as any)
      .from("class_enrollments")
      .select("id", { count: "exact", head: true })
      .in("class_id", classIds)
      .eq("status", "enrolled");
    totalStudents = count || 0;
  }

  return { totalClasses, activeClasses, totalStudents };
}

/**
 * Fetch earnings data for a paid instructor.
 * Computes commission based on class price_cents * commission_rate * enrolled students.
 */
export async function getInstructorEarnings(
  instructorId: string
): Promise<{
  classes: {
    id: string;
    name: string;
    price_cents: number;
    commission_rate: number;
    enrolled_count: number;
    total_revenue_cents: number;
    instructor_share_cents: number;
  }[];
  totalRevenueCents: number;
  totalInstructorShareCents: number;
}> {
  const supabase = await createServerClient();

  // Get active classes with pricing
  const { data: classes, error } = await (supabase as any)
    .from("classes")
    .select("id, name, price_cents, commission_rate, is_active")
    .eq("instructor_id", instructorId)
    .order("name");

  if (error || !classes || classes.length === 0) {
    return { classes: [], totalRevenueCents: 0, totalInstructorShareCents: 0 };
  }

  // Get enrolled student counts per class
  const classIds = classes.map((c: { id: string }) => c.id);
  const { data: enrollments } = await (supabase as any)
    .from("class_enrollments")
    .select("class_id")
    .in("class_id", classIds)
    .eq("status", "enrolled");

  const countMap: Record<string, number> = {};
  (enrollments || []).forEach((e: { class_id: string }) => {
    countMap[e.class_id] = (countMap[e.class_id] || 0) + 1;
  });

  let totalRevenueCents = 0;
  let totalInstructorShareCents = 0;

  const classEarnings = classes.map(
    (c: { id: string; name: string; price_cents: number | null; commission_rate: number | null }) => {
      const enrolledCount = countMap[c.id] || 0;
      const priceCents = c.price_cents || 0;
      const commissionRate = c.commission_rate ?? 0.5;
      const totalRevenue = priceCents * enrolledCount;
      const instructorShare = Math.round(totalRevenue * commissionRate);

      totalRevenueCents += totalRevenue;
      totalInstructorShareCents += instructorShare;

      return {
        id: c.id,
        name: c.name,
        price_cents: priceCents,
        commission_rate: commissionRate,
        enrolled_count: enrolledCount,
        total_revenue_cents: totalRevenue,
        instructor_share_cents: instructorShare,
      };
    }
  );

  return {
    classes: classEarnings,
    totalRevenueCents,
    totalInstructorShareCents,
  };
}

/**
 * Fetch students for an instructor's classes (for teacher messaging recipient selector).
 */
export async function getInstructorStudents(
  instructorId: string
): Promise<{ id: string; first_name: string | null; last_name: string | null; email: string | null }[]> {
  const supabase = await createServerClient();

  // Get instructor's class IDs
  const { data: classes } = await (supabase as any)
    .from("classes")
    .select("id")
    .eq("instructor_id", instructorId);

  if (!classes || classes.length === 0) return [];

  const classIds = classes.map((c: { id: string }) => c.id);

  // Get enrolled student IDs
  const { data: enrollments } = await (supabase as any)
    .from("class_enrollments")
    .select("student_id")
    .in("class_id", classIds)
    .eq("status", "enrolled");

  if (!enrollments || enrollments.length === 0) return [];

  const studentIds = [...new Set(enrollments.map((e: { student_id: string }) => e.student_id))] as string[];

  // Get student profiles
  const { data: profiles } = await (supabase as any)
    .from("profiles")
    .select("id, first_name, last_name, email")
    .in("id", studentIds)
    .order("last_name");

  return (profiles || []) as { id: string; first_name: string | null; last_name: string | null; email: string | null }[];
}
