// @simplilms/auth
// Shared exports safe for both client and server components.
//
// For client components ("use client"):
//   import { createBrowserClient } from "@simplilms/auth/client";
//
// For server components / route handlers / middleware:
//   import { createServerClient, getUser, requireRole } from "@simplilms/auth/server";

// Client-side Supabase client (safe for "use client" components)
export { createBrowserClient } from "./client";

// Types (safe everywhere)
export type { AuthUser, GetUserResult } from "./types";

// Constants (safe everywhere)
export {
  PUBLIC_ROUTES,
  ROLE_ROUTES,
  ROLE_DASHBOARD_PATHS,
  ROLE_LABELS,
  DEFAULT_TENANT_ID,
} from "./constants";
