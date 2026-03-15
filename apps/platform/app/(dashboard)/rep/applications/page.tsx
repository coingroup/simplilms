import { requireRole } from "@simplilms/auth/server";
import { getApplications } from "@simplilms/core";
import { ApplicationTable } from "@simplilms/core/components/crm/application-table";
import type { ApplicationStatus } from "@simplilms/database";

export const metadata = {
  title: "Applications — Admissions",
};

export default async function RepApplicationsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  await requireRole(["super_admin", "school_rep"]);

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
          View submitted applications and their review status.
        </p>
      </div>

      <ApplicationTable
        applications={applications}
        totalCount={totalCount}
        page={page}
        pageSize={pageSize}
        canReview={false}
      />
    </div>
  );
}
