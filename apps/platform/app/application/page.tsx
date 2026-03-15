import { redirect } from "next/navigation";
import {
  getProspectByIdPublic,
  getApplicationByProspectId,
  getPrograms,
} from "@simplilms/core";
import { loadTenantConfig } from "@simplilms/core/lib/load-tenant-config";
import { ApplicationWizard } from "@simplilms/core/components/application/application-wizard";
import { AlertCircle } from "lucide-react";

interface ApplicationPageProps {
  searchParams: Promise<{ prospect?: string }>;
}

export default async function ApplicationPage({
  searchParams,
}: ApplicationPageProps) {
  const params = await searchParams;
  const prospectId = params.prospect;
  const tenant = await loadTenantConfig();

  // No prospect ID — show error
  if (!prospectId) {
    return <InvalidLinkMessage tenantEmail={tenant.email} />;
  }

  // Validate prospect exists and is eligible
  const prospect = await getProspectByIdPublic(prospectId);
  if (!prospect) {
    return <InvalidLinkMessage tenantEmail={tenant.email} />;
  }

  // Check for existing application
  const existingApplication = await getApplicationByProspectId(prospectId);

  // If already submitted (not draft), redirect to appropriate page
  if (
    existingApplication &&
    existingApplication.status !== "draft" &&
    existingApplication.status !== null
  ) {
    redirect(`/application/success?prospect=${prospectId}`);
  }

  // Fetch programs for the program selection step
  const programs = await getPrograms();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          Welcome, {prospect.first_name}!
        </h2>
        <p className="text-gray-600 mt-1">
          Complete the application below to begin your journey. Your progress
          will be saved automatically.
        </p>
      </div>

      <ApplicationWizard
        prospect={prospect}
        existingApplication={existingApplication}
        programs={programs}
      />
    </div>
  );
}

function InvalidLinkMessage({ tenantEmail }: { tenantEmail: string }) {
  return (
    <div className="max-w-md mx-auto text-center py-16">
      <div className="mx-auto h-16 w-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
        <AlertCircle className="h-8 w-8 text-red-500" />
      </div>
      <h2 className="text-xl font-semibold text-gray-900 mb-2">
        Invalid Application Link
      </h2>
      <p className="text-gray-600 mb-6">
        This application link is invalid or has expired. If you believe this is
        an error, please contact our admissions team.
      </p>
      <a
        href={`mailto:${tenantEmail}`}
        className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        Contact Admissions
      </a>
    </div>
  );
}
