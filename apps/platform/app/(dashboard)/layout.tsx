import { redirect } from "next/navigation";
import { getUser } from "@simplilms/auth/server";
import { loadTenantConfig } from "@simplilms/core/lib/load-tenant-config";
import { Sidebar } from "@simplilms/core/components/layout/sidebar";
import { Topbar } from "@simplilms/core/components/layout/topbar";

/**
 * Dashboard layout — wraps all authenticated (dashboard) pages.
 * Renders sidebar + topbar + main content area.
 * Redirects to /login if user is not authenticated.
 */
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, error } = await getUser();

  if (error || !user) {
    redirect("/login");
  }

  const config = await loadTenantConfig();

  const userName =
    user.profile?.firstName && user.profile?.lastName
      ? `${user.profile.firstName} ${user.profile.lastName}`
      : user.user.email ?? "User";
  const userEmail = user.profile?.email ?? user.user.email ?? "";

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        role={user.role}
        userName={userName}
        userEmail={userEmail}
        tenantName={config.shortName}
        tenantLogoUrl={config.logoUrl}
        tenantLogoFallback={config.logoFallbackLetter}
      />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar userName={userName} />

        <main className="flex-1 overflow-y-auto bg-muted/30 p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
