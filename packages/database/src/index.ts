// @simplilms/database
// Supabase client, types, and query utilities for the SimpliLMS platform.

import { createClient as supabaseCreateClient } from "@supabase/supabase-js";

// Re-export all types from the generated types file
export type {
  Database,
  Json,
  Tables,
  TablesInsert,
  TablesUpdate,
} from "./types";

import type { Database } from "./types";

// ============================================================================
// Convenience type aliases
// ============================================================================

/** All possible user roles in the SimpliLMS platform. */
export type UserRole =
  | "super_admin"
  | "school_rep"
  | "teacher_paid"
  | "teacher_unpaid"
  | "student";

/** Prospect eligibility statuses set by school reps. */
export type EligibilityStatus = "pending" | "yes" | "no" | "maybe";

/** Application lifecycle statuses. */
export type ApplicationStatus =
  | "draft"
  | "submitted"
  | "under_review"
  | "approved"
  | "rejected"
  | "enrolled";

/** Enrollment statuses. */
export type EnrollmentStatus =
  | "active"
  | "payment_plan_active"
  | "suspended"
  | "completed"
  | "withdrawn";

/** Payment fee types. */
export type FeeType =
  | "registration"
  | "admission"
  | "document"
  | "deposit"
  | "tuition"
  | "installment";

/** Payment statuses. */
export type PaymentStatus =
  | "pending"
  | "processing"
  | "succeeded"
  | "failed"
  | "refunded";

/** Communication channels. */
export type CommunicationChannel = "email" | "sms" | "whatsapp";

/** Message types for in-portal messaging. */
export type MessageType =
  | "general"
  | "payment_update"
  | "emergency"
  | "class_reminder";

/** Attendance statuses. */
export type AttendanceStatus = "present" | "absent" | "late" | "excused";

/** Consent record types. */
export type ConsentType =
  | "isa_data_sharing"
  | "marketing_email"
  | "marketing_sms"
  | "terms_of_service"
  | "privacy_policy";

/** Tuition payment method options. */
export type TuitionPaymentMethod = "full_payment" | "isa";

// ============================================================================
// Typed Supabase client factory
// ============================================================================

/**
 * Creates a typed Supabase client for the SimpliLMS database.
 *
 * @param supabaseUrl - The Supabase project URL (e.g., https://xxxx.supabase.co)
 * @param supabaseKey - The Supabase anon/service-role key
 * @param options - Optional Supabase client configuration
 * @returns A fully typed Supabase client instance
 *
 * @example
 * ```ts
 * import { createClient } from "@simplilms/database";
 *
 * const supabase = createClient(
 *   process.env.NEXT_PUBLIC_SUPABASE_URL!,
 *   process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
 * );
 *
 * // Fully typed queries
 * const { data } = await supabase.from("prospects").select("*");
 * // data is typed as Tables<"prospects">[] | null
 * ```
 */
export function createClient(
  supabaseUrl: string,
  supabaseKey: string,
  options?: Parameters<typeof supabaseCreateClient>[2]
) {
  return supabaseCreateClient<Database>(supabaseUrl, supabaseKey, options);
}
