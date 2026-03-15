import type { Metadata } from "next";
import { loadTenantConfig } from "@simplilms/core/lib/load-tenant-config";

export async function generateMetadata(): Promise<Metadata> {
  const tenant = await loadTenantConfig();
  return {
    title: `Enrollment Payment — ${tenant.name}`,
    description: `Complete your enrollment payment for ${tenant.name} programs.`,
  };
}

/**
 * Minimal public layout for the payment page.
 * No sidebar, no dashboard chrome — just brand header + payment form.
 * Follows the same pattern as the application layout.
 */
export default async function PaymentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const tenant = await loadTenantConfig();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Brand Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center gap-3">
            {tenant.logoUrl ? (
              <img
                src={tenant.logoUrl}
                alt={tenant.name}
                className="h-10 w-10 rounded-lg object-cover"
              />
            ) : (
              <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-white font-bold text-lg">
                  {tenant.logoFallbackLetter}
                </span>
              </div>
            )}
            <div>
              <h1 className="text-lg font-semibold text-gray-900">
                {tenant.name}
              </h1>
              <p className="text-xs text-gray-500">Enrollment Payment</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">{children}</main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white mt-auto">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
          <p className="text-xs text-gray-500 text-center">
            {tenant.trademark || tenant.name}
            {tenant.trademark ? "\u2122" : ""}
            {tenant.location ? ` \u2022 ${tenant.location}` : ""}
            {tenant.websiteUrl ? (
              <>
                {" "}
                &bull;{" "}
                <a
                  href={tenant.websiteUrl}
                  className="text-primary hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {tenant.websiteUrl.replace(/^https?:\/\//, "")}
                </a>
              </>
            ) : null}
            {tenant.email ? (
              <>
                {" "}
                &bull;{" "}
                <a
                  href={`mailto:${tenant.email}`}
                  className="text-primary hover:underline"
                >
                  {tenant.email}
                </a>
              </>
            ) : null}
          </p>
        </div>
      </footer>
    </div>
  );
}
