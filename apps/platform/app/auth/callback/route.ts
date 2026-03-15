import { NextResponse } from "next/server";
import { createServerClient } from "@simplilms/auth/server";

/**
 * Auth callback handler for Supabase Auth.
 *
 * Handles:
 * - Email confirmation after registration
 * - Magic link sign-in
 * - Password reset redirect
 *
 * Exchanges the auth code for a session and redirects to the appropriate page.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = createServerClient();

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // If there's an error or no code, redirect to login with error
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
