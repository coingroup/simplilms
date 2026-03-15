import { createBrowserClient as createSSRBrowserClient } from "@supabase/ssr";
import type { Database } from "@simplilms/database";

/**
 * Creates a typed Supabase client for use in browser/client components.
 *
 * Uses @supabase/ssr for proper cookie-based session management.
 * Must be called in a client component ("use client").
 *
 * @example
 * ```tsx
 * "use client";
 * import { createBrowserClient } from "@simplilms/auth";
 *
 * function MyComponent() {
 *   const supabase = createBrowserClient();
 *   // Use supabase for auth operations, queries, etc.
 * }
 * ```
 */
export function createBrowserClient() {
  return createSSRBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
