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
import { formatDateTime, formatPhone } from "../../lib/formatting";
import { EligibilityBadge } from "./eligibility-badge";
import { EligibilitySelect } from "./eligibility-select";
import { ProspectRowActions } from "./prospect-row-actions";
import { ProspectDetailDialog } from "./prospect-detail-dialog";
import { PaginationControls } from "./pagination-controls";
import type { ProspectRow } from "../../lib/queries";

interface ProspectTableProps {
  prospects: ProspectRow[];
  totalCount: number;
  page: number;
  pageSize: number;
  showIpAddress?: boolean;
}

export function ProspectTable({
  prospects,
  totalCount,
  page,
  pageSize,
  showIpAddress = false,
}: ProspectTableProps) {
  const [selectedProspect, setSelectedProspect] = useState<ProspectRow | null>(
    null
  );
  const [detailOpen, setDetailOpen] = useState(false);

  const totalPages = Math.ceil(totalCount / pageSize);

  const handleViewProspect = (prospect: ProspectRow) => {
    setSelectedProspect(prospect);
    setDetailOpen(true);
  };

  if (prospects.length === 0) {
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
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
        </div>
        <h3 className="font-medium text-sm">No prospects found</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Prospects will appear here when visitors submit the interest form.
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
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead className="hidden md:table-cell">Phone</TableHead>
              <TableHead className="hidden lg:table-cell">Program</TableHead>
              <TableHead className="hidden md:table-cell">Inquiry Date</TableHead>
              {showIpAddress && (
                <TableHead className="hidden xl:table-cell">IP</TableHead>
              )}
              <TableHead>Status</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {prospects.map((prospect) => (
              <TableRow
                key={prospect.id}
                className="cursor-pointer"
                onClick={() => handleViewProspect(prospect)}
              >
                <TableCell className="font-medium">
                  {prospect.first_name} {prospect.last_name}
                </TableCell>
                <TableCell className="text-sm">
                  {prospect.email || "—"}
                </TableCell>
                <TableCell className="hidden md:table-cell text-sm">
                  {formatPhone(prospect.phone)}
                </TableCell>
                <TableCell className="hidden lg:table-cell text-sm">
                  {prospect.program_interest || "—"}
                </TableCell>
                <TableCell className="hidden md:table-cell text-sm">
                  {formatDateTime(prospect.inquiry_submitted_at)}
                </TableCell>
                {showIpAddress && (
                  <TableCell className="hidden xl:table-cell text-xs font-mono">
                    {prospect.inquiry_ip_address || "—"}
                  </TableCell>
                )}
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <EligibilitySelect
                    prospectId={prospect.id}
                    currentStatus={prospect.eligibility_status}
                  />
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <ProspectRowActions
                    prospect={prospect}
                    onView={() => handleViewProspect(prospect)}
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

      <ProspectDetailDialog
        prospect={selectedProspect}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </>
  );
}
