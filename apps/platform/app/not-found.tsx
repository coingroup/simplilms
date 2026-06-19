import Link from "next/link";
import { ArrowLeft } from "lucide-react";

/**
 * Custom 404 page for the platform app.
 *
 * This is intentionally a simple component with no async data fetching.
 * The root layout (layout.tsx) calls loadTenantConfig() which is async,
 * and React 19 can throw "Minified React error #31" when the built-in
 * /_not-found page is statically rendered without an explicit not-found.tsx.
 *
 * By providing this file, Next.js uses our component instead of the default,
 * avoiding the React 19 object-as-child rendering issue on the 404 route.
 */
export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        404
      </p>
      <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        Page not found
      </h1>
      <p className="mt-4 text-base text-muted-foreground">
        Sorry, we couldn&apos;t find the page you&apos;re looking for.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow hover:bg-primary/90 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Go to dashboard
        </Link>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-muted transition-colors"
        >
          Home
        </Link>
      </div>
    </div>
  );
}
