import { requireRole } from "@simplilms/auth/server";
import {
  getSectorModuleByKey,
  getTenantSectorSubscriptions,
} from "@simplilms/core/actions/sector-modules";
import { QuestionBankBrowser } from "@simplilms/core/components/sectors/question-bank-browser";
import { Badge, Card, CardContent, CardHeader, CardTitle } from "@simplilms/ui";
import { ArrowLeft, Layers, FileCheck, BookOpen } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Sector Detail -- Admin",
};

interface SectorDetailPageProps {
  params: Promise<{ sectorKey: string }>;
}

export default async function SectorDetailPage({
  params,
}: SectorDetailPageProps) {
  await requireRole(["super_admin"]);

  const { sectorKey } = await params;
  const module = await getSectorModuleByKey(sectorKey);

  if (!module) {
    redirect("/admin/sectors");
  }

  // Verify tenant is subscribed
  const subscriptions = await getTenantSectorSubscriptions();
  const isSubscribed = subscriptions.some(
    (s) => s.sector_module_id === module.id
  );

  const frameworks = Array.isArray(module.compliance_frameworks)
    ? module.compliance_frameworks
    : [];

  const standards = Array.isArray(module.curriculum_standards)
    ? module.curriculum_standards
    : [];

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
        <Link
          href="/admin/sectors"
          className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          Sector Modules
        </Link>
        <span className="text-sm text-gray-300">/</span>
        <span className="text-sm text-gray-700 font-medium">
          {module.display_name}
        </span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold text-gray-900">
              {module.display_name}
            </h1>
            {isSubscribed && (
              <Badge className="text-xs">Active</Badge>
            )}
          </div>
          {module.description && (
            <p className="text-sm text-gray-500 mt-1">{module.description}</p>
          )}
        </div>
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Compliance Frameworks */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
              <FileCheck className="h-4 w-4 text-muted-foreground" />
              Compliance Frameworks
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {frameworks.length > 0 ? (
              <ul className="space-y-1">
                {frameworks.map((fw: string, i: number) => (
                  <li
                    key={i}
                    className="text-xs text-muted-foreground flex items-start gap-1.5"
                  >
                    <span className="text-primary mt-0.5">&#8226;</span>
                    {fw}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-muted-foreground italic">
                No frameworks configured
              </p>
            )}
          </CardContent>
        </Card>

        {/* Curriculum Standards */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
              <BookOpen className="h-4 w-4 text-muted-foreground" />
              Curriculum Standards
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {standards.length > 0 ? (
              <ul className="space-y-1">
                {standards.map((std: string, i: number) => (
                  <li
                    key={i}
                    className="text-xs text-muted-foreground flex items-start gap-1.5"
                  >
                    <span className="text-primary mt-0.5">&#8226;</span>
                    {std}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-muted-foreground italic">
                No standards configured
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Question Bank */}
      {isSubscribed ? (
        <QuestionBankBrowser
          sectorModuleId={module.id}
          sectorName={module.display_name}
        />
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Layers className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              Activate this sector module to access the question bank.
            </p>
            <Link
              href="/admin/sectors"
              className="inline-flex items-center gap-1.5 mt-4 text-sm text-primary hover:text-primary/80 font-medium transition-colors"
            >
              Go to Sector Modules
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
