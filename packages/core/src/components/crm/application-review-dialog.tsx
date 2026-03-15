"use client";

import { useState, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Button,
  Label,
  Textarea,
  Separator,
} from "@simplilms/ui";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@simplilms/ui";
import { Badge } from "@simplilms/ui";
import { approveApplication, rejectApplication } from "../../actions/applications";
import { formatDateTime, formatDate, formatPhone } from "../../lib/formatting";
import { ApplicationStatusBadge } from "./application-status-badge";
import { toast } from "sonner";
import type { ApplicationRow } from "../../lib/queries";
import {
  User,
  Shield,
  ClipboardCheck,
  CheckCircle,
  XCircle,
  AlertTriangle,
  FileText,
  ExternalLink,
} from "lucide-react";
import {
  CITIZENSHIP_LABELS,
  DOCUMENT_LABELS,
  detectCitizenshipMismatch,
  type CitizenshipStatus,
  type DocumentType,
} from "../../lib/citizenship";

interface ApplicationReviewDialogProps {
  application: ApplicationRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  canReview?: boolean;
}

export function ApplicationReviewDialog({
  application,
  open,
  onOpenChange,
  canReview = false,
}: ApplicationReviewDialogProps) {
  const [rejectionReason, setRejectionReason] = useState("");
  const [isPending, startTransition] = useTransition();

  if (!application) return null;

  const isReviewable =
    canReview &&
    (application.status === "submitted" ||
      application.status === "under_review");

  const handleApprove = () => {
    startTransition(async () => {
      const result = await approveApplication(application.id);
      if (result.success) {
        if (result.paymentUrl) {
          // Copy payment URL to clipboard
          try {
            await navigator.clipboard.writeText(result.paymentUrl);
            toast.success(
              "Application approved! Payment link copied to clipboard."
            );
          } catch {
            toast.success("Application approved! Payment link generated.");
            // Show the URL if clipboard fails
            toast.info(result.paymentUrl, { duration: 10000 });
          }
        } else {
          toast.success("Application approved");
        }
        onOpenChange(false);
      } else {
        toast.error(result.error || "Failed to approve");
      }
    });
  };

  const handleReject = () => {
    if (!rejectionReason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }
    startTransition(async () => {
      const result = await rejectApplication(
        application.id,
        rejectionReason.trim()
      );
      if (result.success) {
        toast.success("Application rejected");
        onOpenChange(false);
        setRejectionReason("");
      } else {
        toast.error(result.error || "Failed to reject");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <DialogTitle>
              Application {application.application_number || ""}
            </DialogTitle>
            <ApplicationStatusBadge status={application.status} />
          </div>
        </DialogHeader>

        <Tabs defaultValue="demographics" className="mt-2">
          <TabsList>
            <TabsTrigger value="demographics" className="gap-1.5">
              <User className="h-3.5 w-3.5" />
              Demographics
            </TabsTrigger>
            <TabsTrigger value="citizenship" className="gap-1.5">
              <Shield className="h-3.5 w-3.5" />
              Citizenship
            </TabsTrigger>
            {isReviewable && (
              <TabsTrigger value="review" className="gap-1.5">
                <ClipboardCheck className="h-3.5 w-3.5" />
                Review
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="demographics" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <InfoField label="First Name" value={application.first_name} />
              <InfoField label="Last Name" value={application.last_name} />
              <InfoField label="Middle Name" value={application.middle_name} />
              <InfoField label="Date of Birth" value={formatDate(application.date_of_birth)} />
              <InfoField label="Email" value={application.email} />
              <InfoField label="Phone" value={formatPhone(application.phone)} />
            </div>

            <Separator />

            <h4 className="text-sm font-medium">Address</h4>
            <div className="grid grid-cols-2 gap-4">
              <InfoField label="Address" value={application.address_line1} />
              <InfoField label="Address 2" value={application.address_line2} />
              <InfoField label="City" value={application.city} />
              <InfoField label="State" value={application.state} />
              <InfoField label="ZIP" value={application.zip_code} />
              <InfoField label="Country" value={application.country} />
            </div>

            {application.mailing_address_line1 && (
              <>
                <Separator />
                <h4 className="text-sm font-medium">Mailing Address</h4>
                <div className="grid grid-cols-2 gap-4">
                  <InfoField label="Address" value={application.mailing_address_line1} />
                  <InfoField label="Address 2" value={application.mailing_address_line2} />
                  <InfoField label="City" value={application.mailing_city} />
                  <InfoField label="State" value={application.mailing_state} />
                  <InfoField label="ZIP" value={application.mailing_zip} />
                  <InfoField label="Country" value={application.mailing_country} />
                </div>
              </>
            )}

            <Separator />

            <div className="grid grid-cols-2 gap-4">
              <InfoField label="Submitted" value={formatDateTime(application.submitted_at)} />
              <InfoField label="IP Address" value={application.submitted_at ? "Recorded" : "—"} />
            </div>
          </TabsContent>

          <TabsContent value="citizenship" className="space-y-4 mt-4">
            {/* Declared Status */}
            <div className="grid grid-cols-2 gap-4">
              <InfoField
                label="Citizenship Status"
                value={
                  application.citizenship_status
                    ? CITIZENSHIP_LABELS[application.citizenship_status as CitizenshipStatus] ||
                      application.citizenship_status
                    : null
                }
              />
              <InfoField
                label="Document Type"
                value={
                  application.citizenship_document_type
                    ? DOCUMENT_LABELS[application.citizenship_document_type as DocumentType] ||
                      application.citizenship_document_type
                    : null
                }
              />
            </div>

            {/* Document Link */}
            {application.citizenship_document_url && (
              <div className="flex items-center gap-2 p-3 rounded-md border border-gray-200 bg-gray-50">
                <FileText className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-700 flex-1">
                  Supporting document uploaded
                </span>
                <a
                  href={`${process.env.NEXT_PUBLIC_SUPABASE_URL || ""}/storage/v1/object/sign/citizenship-documents/${application.citizenship_document_url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[#F26822] hover:underline flex items-center gap-1"
                >
                  View Document
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            )}

            {/* Mismatch Detection */}
            {(() => {
              const mismatch = detectCitizenshipMismatch(
                application.citizenship_status,
                application.citizenship_document_type
              );
              if (!mismatch.hasMismatch) return null;
              return (
                <div className="rounded-md border border-amber-200 bg-amber-50 p-3">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-amber-900">
                        Citizenship Mismatch Detected
                      </p>
                      <p className="text-xs text-amber-700 mt-1">
                        {mismatch.reason}
                      </p>
                      <Badge
                        variant="outline"
                        className="mt-2 bg-amber-100 text-amber-800 border-amber-300 text-xs"
                      >
                        Severity: {mismatch.severity}
                      </Badge>
                    </div>
                  </div>
                </div>
              );
            })()}

            <Separator />

            <h4 className="text-sm font-medium">KYC Verification (Stripe Identity)</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Status
                </p>
                <div className="mt-0.5">
                  {application.stripe_identity_status === "verified" ? (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  ) : application.stripe_identity_status === "requires_input" ? (
                    <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Requires Input
                    </Badge>
                  ) : application.stripe_identity_status === "processing" ? (
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      Processing
                    </Badge>
                  ) : application.stripe_identity_status ? (
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                      {application.stripe_identity_status}
                    </Badge>
                  ) : (
                    <span className="text-sm text-muted-foreground">Not started</span>
                  )}
                </div>
              </div>
              <InfoField
                label="Verified At"
                value={formatDateTime(application.stripe_identity_verified_at)}
              />
            </div>

            {application.stripe_identity_session_id && (
              <div className="text-xs text-muted-foreground">
                Session: <code className="font-mono">{application.stripe_identity_session_id}</code>
              </div>
            )}

            {application.isa_consent_given && (
              <>
                <Separator />
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    ISA Consent Given
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    Data sharing authorized with Education Funding Group
                  </span>
                </div>
              </>
            )}
          </TabsContent>

          {isReviewable && (
            <TabsContent value="review" className="space-y-4 mt-4">
              <div className="rounded-md border p-4 space-y-4">
                <h4 className="text-sm font-medium">Decision</h4>

                <div className="flex gap-3">
                  <Button
                    onClick={handleApprove}
                    disabled={isPending}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="mr-1.5 h-4 w-4" />
                    {isPending ? "Processing..." : "Approve Application"}
                  </Button>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>Rejection Reason (required to reject)</Label>
                  <Textarea
                    placeholder="Provide the reason for rejection..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    rows={3}
                    disabled={isPending}
                  />
                  <Button
                    variant="destructive"
                    onClick={handleReject}
                    disabled={isPending || !rejectionReason.trim()}
                  >
                    <XCircle className="mr-1.5 h-4 w-4" />
                    {isPending ? "Processing..." : "Reject Application"}
                  </Button>
                </div>
              </div>

              {application.rejection_reason && (
                <div className="rounded-md border border-red-200 bg-red-50 p-4">
                  <p className="text-xs font-medium text-red-600 uppercase tracking-wider mb-1">
                    Previous Rejection Reason
                  </p>
                  <p className="text-sm">{application.rejection_reason}</p>
                </div>
              )}
            </TabsContent>
          )}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

function InfoField({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
        {label}
      </p>
      <p className="mt-0.5 text-sm">{value || "—"}</p>
    </div>
  );
}
