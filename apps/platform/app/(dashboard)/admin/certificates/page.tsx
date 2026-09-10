import { requireRole } from "@simplilms/auth/server";
import {
  getAllCertificates,
  revokeCertificate,
} from "@simplilms/core/actions/certificates";
import { Badge, Button, Card } from "@simplilms/ui";
import { Award, Search, Trash2 } from "lucide-react";
import { CertificateListClient } from "./certificate-list";

export const metadata = {
  title: "Certificates -- Admin",
};

export default async function AdminCertificatesPage() {
  await requireRole(["super_admin"]);

  const certificates = await getAllCertificates();

  const boundRevoke = async (certificateId: string) => {
    "use server";
    return revokeCertificate(certificateId);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Certificates</h1>
        <p className="text-sm text-gray-500 mt-1">
          {certificates.length} certificate{certificates.length !== 1 ? "s" : ""} issued
        </p>
      </div>

      <CertificateListClient
        certificates={certificates}
        onRevoke={boundRevoke}
      />
    </div>
  );
}
