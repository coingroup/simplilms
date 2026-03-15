import { requireRole } from "@simplilms/auth/server";
import { getApplications } from "@simplilms/core";
import { ApplicationTable } from "@simplilms/core/components/crm/application-table";
import type { ApplicationStatus } from "@simplilms/database";

export const metadata = {
  title: "Applications — Admin",
};

export default async function AdminApplicationsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  await requireRole(["super_admin"]);

  const status = (searchParams.status as ApplicationStatus) || undefined;
  const search = (searchParams.search as string) || undefined;
  const page = Number(searchParams.page) || 1;
  const pageSize = 20;

  const { applications, totalCount } = await getApplications({
    status,
    search,
    page,
    pageSize,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">Applications</h1>
        <p className="text-sm text-muted-foreground">
          Review, approve, or reject student applications.
        </p>
      </div>

      <ApplicationTable
        applications={applications}
        totalCount={totalCount}
        page={page}
        pageSize={pageSize}
        canReview={true}
      />
    </div>
  );
}
