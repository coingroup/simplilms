import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { updateSession } from "@simplilms/auth/server";
import {
  PUBLIC_ROUTES,
  ROLE_ROUTES,
  ROLE_DASHBOARD_PATHS,
} from "@simplilms/auth";
import type { UserRole } from "@simplilms/database";

async function getUserRole(
  supabase: ReturnType<Awaited<ReturnType<typeof updateSession>>["supabase"] extends infer T ? () => T : never>,
  user: NonNullable<Awaited<ReturnType<typeof updateSession>>["user"]>
): Promise<UserRole | null> {
  // Try JWT claims first
  const jwtRole = user.app_metadata?.user_role as UserRole | undefined;
  if (jwtRole) return jwtRole;

  // Fallback to profile table
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (supabase as any)
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  return (profile?.role as UserRole) ?? null;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Refresh the auth session (keeps cookies alive)
  const { supabaseResponse, user, supabase } = await updateSession(request);

  // Check if the current route is public
  const isPublicRoute = PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  // If public route, allow access but redirect authenticated users away from auth pages
  if (isPublicRoute) {
    if (user && (pathname === "/login" || pathname === "/register")) {
      // Authenticated users shouldn't see login/register — redirect to their dashboard
      const role = await getUserRole(supabase as never, user);
      const dashboardPath =
        ROLE_DASHBOARD_PATHS[(role ?? "student") as UserRole] ?? "/student";

      return NextResponse.redirect(new URL(dashboardPath, request.url));
    }
    return supabaseResponse;
  }

  // Protected route — require authentication
  if (!user) {
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Check role-based access for role-specific routes
  for (const [routePrefix, allowedRoles] of Object.entries(ROLE_ROUTES)) {
    if (pathname.startsWith(routePrefix)) {
      const role = await getUserRole(supabase as never, user);

      if (!role || !allowedRoles.includes(role)) {
        return NextResponse.redirect(
          new URL("/unauthorized", request.url)
        );
      }
      break;
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - Public assets (images, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
