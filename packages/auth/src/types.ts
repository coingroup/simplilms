import type { User } from "@supabase/supabase-js";
import type { UserRole } from "@simplilms/database";

/**
 * Authenticated user with profile data extracted from JWT claims
 * or fetched from the profiles table as a fallback.
 */
export interface AuthUser {
  /** Supabase Auth user object */
  user: User;
  /** User's role in the platform */
  role: UserRole;
  /** Tenant ID for multi-tenant isolation */
  tenantId: string;
  /** Profile data from the profiles table (may be null if profile hasn't been created yet) */
  profile: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string | null;
    phone: string | null;
    avatarUrl: string | null;
  } | null;
}

/**
 * Result from getUser() — either an authenticated user or null.
 */
export type GetUserResult =
  | { user: AuthUser; error: null }
  | { user: null; error: string };
