import { createServerClient as createSSRServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@simplilms/database";

/**
 * Creates a typed Supabase client for use in server components, server actions,
 * and route handlers.
 *
 * Uses @supabase/ssr for proper cookie-based session management with Next.js.
 * Must be called in a server context (Server Components, Route Handlers, Server Actions).
 *
 * @example
 * ```tsx
 * // In a Server Component
 * import { createServerClient } from "@simplilms/auth";
 *
 * export default async function Page() {
 *   const supabase = createServerClient();
 *   const { data: { user } } = await supabase.auth.getUser();
 *   // ...
 * }
 * ```
 */
export function createServerClient() {
  const cookieStore = cookies();

  return createSSRServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(
          cookiesToSet: {
            name: string;
            value: string;
            options?: Record<string, unknown>;
          }[]
        ) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options as Record<string, unknown>)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
}
