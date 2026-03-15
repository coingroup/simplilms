import { requireRole } from "@simplilms/auth/server";
import {
  getSectorModules,
  getAllTenantSectorSubscriptions,
} from "@simplilms/core/actions/sector-modules";
import { SectorSubscriptionCard } from "@simplilms/core/components/sectors/sector-subscription-card";
import { ArrowLeft, Layers } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Sector Modules -- Admin",
};

export default async function SectorModulesPage() {
  await requireRole(["super_admin"]);

  const [modules, subscriptions] = await Promise.all([
    getSectorModules(),
    getAllTenantSectorSubscriptions(),
  ]);

  // Create a map of subscribed sector_module_id -> status
  const subMap = new Map<string, string>();
  for (const sub of subscriptions) {
    subMap.set(sub.sector_module_id, sub.status);
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-3">
        <Link
          href="/admin"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Admin
        </Link>
        <span className="text-sm text-gray-300">/</span>
        <span className="text-sm text-gray-500">Sector Modules</span>
      </div>

      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <Layers className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold text-gray-900">Sector Modules</h1>
        </div>
        <p className="text-sm text-gray-500 mt-1">
          Activate industry-specific AI prompts, compliance templates, and
          pre-built question banks for your training programs.
        </p>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <span>
          {modules.length} sector{modules.length !== 1 ? "s" : ""} available
        </span>
        <span>·</span>
        <span>
          {subscriptions.filter((s) => s.status === "active").length} active
        </span>
      </div>

      {/* Module grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {modules.map((module) => {
          const status = subMap.get(module.id);
          const isSubscribed = status === "active" || status === "trial";

          return (
            <div key={module.id}>
              <SectorSubscriptionCard
                module={module}
                isSubscribed={isSubscribed}
                subscriptionStatus={status}
              />
              {isSubscribed && (
                <Link
                  href={`/admin/sectors/${module.sector_key}`}
                  className="block mt-2 text-center text-xs text-primary hover:text-primary/80 font-medium transition-colors"
                >
                  View Question Bank &rarr;
                </Link>
              )}
            </div>
          );
        })}
      </div>

      {modules.length === 0 && (
        <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
          <Layers className="h-10 w-10 text-gray-300 mx-auto mb-3" />
          <h3 className="text-sm font-medium text-gray-900">
            No sector modules available
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Sector modules will appear here once configured.
          </p>
        </div>
      )}
    </div>
  );
}
