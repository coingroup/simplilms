import { redirect } from "next/navigation";
import type { UserRole } from "@simplilms/database";
import { createServerClient } from "./server";
import { ROLE_DASHBOARD_PATHS, DEFAULT_TENANT_ID } from "./constants";
import type { AuthUser, GetUserResult } from "./types";

interface ProfileRow {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  avatar_url: string | null;
  role: string | null;
  tenant_id: string | null;
}

/**
 * Gets the current authenticated user with their role and profile data.
 *
 * Attempts to extract role and tenant_id from JWT custom claims first.
 * Falls back to querying the profiles table if claims are not present
 * (e.g., if the custom_access_token_hook is not yet registered in Supabase).
 *
 * @returns The authenticated user with profile data, or null with error message
 *
 * @example
 * ```tsx
 * import { getUser } from "@simplilms/auth";
 *
 * export default async function Page() {
 *   const { user, error } = await getUser();
 *   if (error) redirect("/login");
 *   // user.role, user.tenantId, user.profile are available
 * }
 * ```
 */
export async function getUser(): Promise<GetUserResult> {
  const supabase = createServerClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { user: null, error: authError?.message ?? "Not authenticated" };
  }

  // Try to get role from JWT custom claims first
  let role: UserRole | null =
    (user.app_metadata?.user_role as UserRole) ?? null;
  let tenantId: string =
    (user.app_metadata?.tenant_id as string) ?? DEFAULT_TENANT_ID;

  // Fetch profile data (and fallback role if needed)
  // Note: Using `as any` because the Database generic type doesn't flow
  // properly through @supabase/ssr's createServerClient wrapper
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any)
    .from("profiles")
    .select("id, first_name, last_name, email, phone, avatar_url, role, tenant_id")
    .eq("id", user.id)
    .single();

  const profile = data as ProfileRow | null;

  // Use profile role as fallback if JWT claims don't have it
  if (!role && profile?.role) {
    role = profile.role as UserRole;
  }

  if (profile?.tenant_id) {
    tenantId = profile.tenant_id;
  }

  // Default to student role if no role is found anywhere
  if (!role) {
    role = "student";
  }

  const authUser: AuthUser = {
    user,
    role,
    tenantId,
    profile: profile
      ? {
          id: profile.id,
          firstName: profile.first_name,
          lastName: profile.last_name,
          email: profile.email,
          phone: profile.phone,
          avatarUrl: profile.avatar_url,
        }
      : null,
  };

  return { user: authUser, error: null };
}

/**
 * Requires the current user to have one of the specified roles.
 * Redirects to /login if not authenticated, or /unauthorized if role doesn't match.
 *
 * @param allowedRoles - Array of roles that are allowed to access this resource
 * @returns The authenticated user with verified role
 *
 * @example
 * ```tsx
 * import { requireRole } from "@simplilms/auth";
 *
 * export default async function AdminPage() {
 *   const user = await requireRole(["super_admin"]);
 *   // Only super_admin can reach this point
 * }
 * ```
 */
export async function requireRole(
  allowedRoles: UserRole[]
): Promise<AuthUser> {
  const { user, error } = await getUser();

  if (error || !user) {
    redirect("/login");
  }

  if (!allowedRoles.includes(user.role)) {
    redirect("/unauthorized");
  }

  return user;
}

/**
 * Returns the dashboard path for a given user role.
 *
 * @param role - The user's role
 * @returns The URL path for the role's dashboard
 */
export function getDashboardPath(role: UserRole): string {
  return ROLE_DASHBOARD_PATHS[role] ?? "/student";
}
