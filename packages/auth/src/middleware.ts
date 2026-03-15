import { createServerClient as createSSRServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { Database } from "@simplilms/database";

/**
 * Refreshes the user's auth session in middleware.
 *
 * This function MUST be called in the middleware to keep the auth session alive.
 * It reads the auth cookies, refreshes the session if needed, and writes
 * the updated cookies to the response.
 *
 * @param request - The incoming Next.js middleware request
 * @returns The NextResponse with updated auth cookies
 *
 * @example
 * ```ts
 * // middleware.ts
 * import { updateSession } from "@simplilms/auth";
 *
 * export async function middleware(request: NextRequest) {
 *   return await updateSession(request);
 * }
 * ```
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createSSRServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(
          cookiesToSet: {
            name: string;
            value: string;
            options?: Record<string, unknown>;
          }[]
        ) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options as Record<string, unknown>)
          );
        },
      },
    }
  );

  // IMPORTANT: Do NOT use getSession() here as it doesn't validate the JWT.
  // Use getUser() which contacts the Supabase Auth server to validate.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { supabaseResponse, user, supabase };
}
