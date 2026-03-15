import { requireRole } from "@simplilms/auth/server";
import { formatDateTime } from "@simplilms/core";
import {
  getWhitelabelTenantById,
  updateWhitelabelTenant,
} from "@simplilms/core/actions/tenants";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TenantEditForm } from "./form";

export const metadata = {
  title: "Tenant Details -- Admin",
};

interface TenantDetailPageProps {
  params: Promise<{ tenantId: string }>;
}

export default async function TenantDetailPage({
  params,
}: TenantDetailPageProps) {
  await requireRole(["super_admin"]);

  const { tenantId } = await params;
  const tenant = await getWhitelabelTenantById(tenantId);

  if (!tenant) {
    notFound();
  }

  const updateAction = updateWhitelabelTenant.bind(null, tenantId);

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

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{tenant.name}</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage tenant configuration and branding.
          </p>
        </div>
      </div>

      {/* Timestamps */}
      <div className="flex flex-wrap gap-6 text-sm text-gray-500">
        <div>
          <span className="font-medium text-gray-700">Created:</span>{" "}
          {formatDateTime(tenant.created_at)}
        </div>
        {tenant.provisioned_at && (
          <div>
            <span className="font-medium text-gray-700">Provisioned:</span>{" "}
            {formatDateTime(tenant.provisioned_at)}
          </div>
        )}
        {tenant.updated_at && (
          <div>
            <span className="font-medium text-gray-700">Last Updated:</span>{" "}
            {formatDateTime(tenant.updated_at)}
          </div>
        )}
      </div>

      <TenantEditForm tenant={tenant} action={updateAction} />
    </div>
  );
}
