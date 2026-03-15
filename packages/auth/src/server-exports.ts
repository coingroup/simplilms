// Server-only exports for @simplilms/auth/server
// Import this in Server Components, Route Handlers, Server Actions, and middleware.
// Do NOT import this in client components ("use client").

export { createServerClient } from "./server";
export { updateSession } from "./middleware";
export { getUser, requireRole, getDashboardPath } from "./helpers";
