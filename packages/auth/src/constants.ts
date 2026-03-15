import type { UserRole } from "@simplilms/database";

/**
 * Public routes that don't require authentication.
 */
export const PUBLIC_ROUTES = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/auth/callback",
  "/auth/confirm",
  "/application",
  "/payment",
] as const;

/**
 * Role-based route access control.
 * Maps route prefixes to the roles that can access them.
 * super_admin has access to all role-specific routes.
 */
export const ROLE_ROUTES: Record<string, UserRole[]> = {
  "/admin": ["super_admin"],
  "/rep": ["super_admin", "school_rep"],
  "/teacher": ["super_admin", "teacher_paid", "teacher_unpaid"],
  "/student": ["super_admin", "student"],
};

/**
 * Maps a user role to their default dashboard path.
 */
export const ROLE_DASHBOARD_PATHS: Record<UserRole, string> = {
  super_admin: "/admin",
  school_rep: "/rep",
  teacher_paid: "/teacher",
  teacher_unpaid: "/teacher",
  student: "/student",
};

/**
 * Human-readable labels for each role.
 */
export const ROLE_LABELS: Record<UserRole, string> = {
  super_admin: "Administrator",
  school_rep: "Admissions Representative",
  teacher_paid: "Instructor",
  teacher_unpaid: "Instructor",
  student: "Student",
};

/**
 * Default tenant ID for the default tenant.
 */
export const DEFAULT_TENANT_ID = "00000000-0000-0000-0000-000000000001";
