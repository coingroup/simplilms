import { Suspense } from "react";
import { requireRole } from "@simplilms/auth/server";
import { getProspects } from "@simplilms/core";
import { ProspectTable } from "@simplilms/core/components/crm/prospect-table";
import { ProspectFilters } from "@simplilms/core/components/crm/prospect-filters";
import { Skeleton } from "@simplilms/ui";
import type { EligibilityStatus } from "@simplilms/database";

export const metadata = {
  title: "Prospects — Admissions",
};

export default async function RepProspectsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  await requireRole(["super_admin", "school_rep"]);

  const status = (searchParams.status as EligibilityStatus) || undefined;
  const search = (searchParams.search as string) || undefined;
  const sort = (searchParams.sort as "newest" | "oldest") || "newest";
  const page = Number(searchParams.page) || 1;
  const pageSize = 20;

  const { prospects, totalCount } = await getProspects({
    status,
    search,
    sort,
    page,
    pageSize,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">Prospects</h1>
        <p className="text-sm text-muted-foreground">
          View and manage your prospect pipeline.
        </p>
      </div>

      <Suspense fallback={<Skeleton className="h-10 w-full" />}>
        <ProspectFilters
          currentStatus={status}
          currentSearch={search}
          currentSort={sort}
        />
      </Suspense>

      <ProspectTable
        prospects={prospects}
        totalCount={totalCount}
        page={page}
        pageSize={pageSize}
        showIpAddress={false}
      />
    </div>
  );
}
