import { requireRole } from "@simplilms/auth/server";
import { createWhitelabelTenant } from "@simplilms/core/actions/tenants";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { TenantCreateForm } from "./form";

export const metadata = {
  title: "New Tenant -- Admin",
};

export default async function NewTenantPage() {
  await requireRole(["super_admin"]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/admin/tenants"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Tenants
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-gray-900">Add New Tenant</h1>
        <p className="text-sm text-gray-500 mt-1">
          Create a new white-label tenant deployment.
        </p>
      </div>

      <TenantCreateForm action={createWhitelabelTenant} />
    </div>
  );
}
