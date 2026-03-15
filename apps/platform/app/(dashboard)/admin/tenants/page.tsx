import { requireRole } from "@simplilms/auth/server";
import { formatDate } from "@simplilms/core";
import { getWhitelabelTenants } from "@simplilms/core/actions/tenants";
import { Badge } from "@simplilms/ui";
import { Building2, Plus } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Tenants -- Admin",
};

const STATUS_LABELS: Record<string, string> = {
  active: "Active",
  suspended: "Suspended",
  provisioning: "Provisioning",
};

const STATUS_COLORS: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  active: "default",
  suspended: "destructive",
  provisioning: "secondary",
};

export default async function AdminTenantsPage() {
  await requireRole(["super_admin"]);

  const tenants = await getWhitelabelTenants();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            White-Label Tenants
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {tenants.length} tenant{tenants.length !== 1 ? "s" : ""} managed
          </p>
        </div>
        <Link
          href="/admin/tenants/new"
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Tenant
        </Link>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {tenants.length === 0 ? (
          <div className="text-center py-12">
            <Building2 className="h-8 w-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">No tenants found.</p>
            <p className="text-xs text-gray-400 mt-1">
              Click &quot;Add Tenant&quot; to create your first white-label
              tenant.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">
                    Name
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">
                    Contact
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">
                    Domain
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">
                    Status
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">
                    Created
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {tenants.map((tenant) => (
                  <tr key={tenant.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <Link
                        href={`/admin/tenants/${tenant.id}`}
                        className="text-sm font-medium text-gray-900 hover:text-primary transition-colors"
                      >
                        {tenant.name}
                      </Link>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm text-gray-700">
                        {tenant.contact_name || "\u2014"}
                      </div>
                      {tenant.contact_email && (
                        <div className="text-xs text-gray-500">
                          {tenant.contact_email}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-700">
                      {tenant.domain || "\u2014"}
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        variant={STATUS_COLORS[tenant.status] || "secondary"}
                      >
                        {STATUS_LABELS[tenant.status] || tenant.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-500">
                      {formatDate(tenant.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
