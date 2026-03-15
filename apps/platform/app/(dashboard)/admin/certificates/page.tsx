import { requireRole } from "@simplilms/auth/server";
import { Award } from "lucide-react";

export const metadata = {
  title: "Certificates -- Admin",
};

export default async function AdminCertificatesPage() {
  await requireRole(["super_admin"]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Certificates</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage certificate templates and issued certificates.
        </p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="text-center py-12">
          <Award className="h-8 w-8 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-500">
            Certificate management coming soon.
          </p>
        </div>
      </div>
    </div>
  );
}
