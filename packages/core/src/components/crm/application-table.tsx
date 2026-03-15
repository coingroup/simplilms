"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@simplilms/ui";
import { formatDateTime } from "../../lib/formatting";
import { ApplicationStatusBadge } from "./application-status-badge";
import { ApplicationRowActions } from "./application-row-actions";
import { ApplicationReviewDialog } from "./application-review-dialog";
import { PaginationControls } from "./pagination-controls";
import type { ApplicationRow } from "../../lib/queries";

interface ApplicationTableProps {
  applications: ApplicationRow[];
  totalCount: number;
  page: number;
  pageSize: number;
  canReview?: boolean;
}

export function ApplicationTable({
  applications,
  totalCount,
  page,
  pageSize,
  canReview = false,
}: ApplicationTableProps) {
  const [selectedApplication, setSelectedApplication] =
    useState<ApplicationRow | null>(null);
  const [reviewOpen, setReviewOpen] = useState(false);

  const totalPages = Math.ceil(totalCount / pageSize);

  const handleReview = (application: ApplicationRow) => {
    setSelectedApplication(application);
    setReviewOpen(true);
  };

  if (applications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-full bg-muted p-3 mb-3">
          <svg
            className="h-6 w-6 text-muted-foreground"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <h3 className="font-medium text-sm">No applications found</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Applications will appear here when prospects submit them.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>App #</TableHead>
              <TableHead>Applicant</TableHead>
              <TableHead className="hidden md:table-cell">Email</TableHead>
              <TableHead className="hidden lg:table-cell">Program</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden md:table-cell">KYC</TableHead>
              <TableHead className="hidden md:table-cell">Submitted</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {applications.map((app) => (
              <TableRow
                key={app.id}
                className="cursor-pointer"
                onClick={() => handleReview(app)}
              >
                <TableCell className="font-mono text-sm">
                  {app.application_number || "—"}
                </TableCell>
                <TableCell className="font-medium">
                  {app.first_name} {app.last_name}
                </TableCell>
                <TableCell className="hidden md:table-cell text-sm">
                  {app.email || "—"}
                </TableCell>
                <TableCell className="hidden lg:table-cell text-sm">
                  {app.program_id || "—"}
                </TableCell>
                <TableCell>
                  <ApplicationStatusBadge status={app.status} />
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <KYCStatusBadge status={app.stripe_identity_status} />
                </TableCell>
                <TableCell className="hidden md:table-cell text-sm">
                  {formatDateTime(app.submitted_at)}
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <ApplicationRowActions
                    application={app}
                    onReview={() => handleReview(app)}
                    canReview={canReview}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <PaginationControls
        currentPage={page}
        totalPages={totalPages}
        totalCount={totalCount}
        pageSize={pageSize}
      />

      <ApplicationReviewDialog
        application={selectedApplication}
        open={reviewOpen}
        onOpenChange={setReviewOpen}
        canReview={canReview}
      />
    </>
  );
}

function KYCStatusBadge({ status }: { status: string | null }) {
  if (!status) {
    return (
      <span className="text-xs text-muted-foreground">Not started</span>
    );
  }
  const config: Record<string, { label: string; className: string }> = {
    verified: { label: "Verified", className: "text-green-700" },
    requires_input: { label: "Needs input", className: "text-yellow-700" },
    processing: { label: "Processing", className: "text-blue-700" },
    expired: { label: "Expired", className: "text-red-700" },
  };
  const c = config[status] || { label: status, className: "text-gray-700" };
  return <span className={`text-xs font-medium ${c.className}`}>{c.label}</span>;
}
