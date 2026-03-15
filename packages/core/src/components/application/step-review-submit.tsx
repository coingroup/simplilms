"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button, Separator } from "@simplilms/ui";
import { submitApplication } from "../../actions/application-form";
import type { ApplicationFormData } from "../../lib/validations/application-schema";
import type { ProgramRow } from "../../lib/queries";
import {
  CITIZENSHIP_LABELS,
  type CitizenshipStatus,
} from "../../lib/citizenship";
import {
  CheckCircle,
  AlertCircle,
  Edit,
  Loader2,
  Send,
} from "lucide-react";
import { toast } from "sonner";

interface StepReviewSubmitProps {
  data: ApplicationFormData;
  programs: ProgramRow[];
  applicationId: string;
  prospectId: string;
  onBack: () => void;
  onGoToStep: (step: number) => void;
}

export function StepReviewSubmit({
  data,
  programs,
  applicationId,
  prospectId,
  onBack,
  onGoToStep,
}: StepReviewSubmitProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [submitted, setSubmitted] = useState(false);

  const selectedProgram = programs.find((p) => p.id === data.program_id);
  const kycComplete = data.stripe_identity_status === "verified";
  const hasDocument = !!data.citizenship_document_url;

  const handleSubmit = () => {
    startTransition(async () => {
      const result = await submitApplication(applicationId, data);

      if (result.success) {
        setSubmitted(true);
        toast.success("Application submitted successfully!");
        router.push(`/application/success?prospect=${prospectId}`);
      } else {
        toast.error(result.error || "Failed to submit application");
      }
    });
  };

  if (submitted) {
    return (
      <div className="text-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-[#F26822] mx-auto mb-4" />
        <p className="text-gray-600">Redirecting to confirmation page...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">
          Review Your Application
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Please review all the information below before submitting. Click the
          edit icon to make changes.
        </p>
      </div>

      {/* Personal Information */}
      <ReviewSection
        title="Personal Information"
        stepNumber={1}
        onEdit={() => onGoToStep(1)}
      >
        <ReviewField label="First Name" value={data.first_name} />
        <ReviewField label="Last Name" value={data.last_name} />
        <ReviewField label="Middle Name" value={data.middle_name} />
        <ReviewField label="Date of Birth" value={data.date_of_birth} />
        <ReviewField label="Email" value={data.email} />
        <ReviewField label="Phone" value={data.phone} />
      </ReviewSection>

      {/* Address */}
      <ReviewSection
        title="Address"
        stepNumber={2}
        onEdit={() => onGoToStep(2)}
      >
        <ReviewField
          label="Residential"
          value={formatAddress(
            data.address_line1,
            data.address_line2,
            data.city,
            data.state,
            data.zip_code,
            data.country
          )}
          fullWidth
        />
        <ReviewField
          label="Mailing"
          value={
            data.mailing_address_line1
              ? formatAddress(
                  data.mailing_address_line1,
                  data.mailing_address_line2,
                  data.mailing_city,
                  data.mailing_state,
                  data.mailing_zip,
                  data.mailing_country
                )
              : "Same as residential"
          }
          fullWidth
        />
      </ReviewSection>

      {/* Program */}
      <ReviewSection
        title="Program"
        stepNumber={3}
        onEdit={() => onGoToStep(3)}
      >
        <ReviewField
          label="Program"
          value={selectedProgram?.name || "Not selected"}
          fullWidth
        />
        <ReviewField
          label="Tuition Preference"
          value={
            data.tuition_payment_preference === "full_payment"
              ? "Pay in Full"
              : data.tuition_payment_preference === "isa"
                ? "Income Share Agreement (ISA)"
                : "Undecided"
          }
        />
        {data.isa_consent_given && (
          <ReviewField
            label="ISA Consent"
            value="Consent given"
            icon={<CheckCircle className="h-3.5 w-3.5 text-green-600" />}
          />
        )}
      </ReviewSection>

      {/* Identity & Citizenship */}
      <ReviewSection
        title="Identity & Citizenship"
        stepNumber={4}
        onEdit={() => onGoToStep(4)}
      >
        <ReviewField
          label="Citizenship Status"
          value={
            CITIZENSHIP_LABELS[data.citizenship_status as CitizenshipStatus] ||
            data.citizenship_status
          }
        />
        <ReviewField
          label="Document"
          value={hasDocument ? "Uploaded" : "Not uploaded"}
          icon={
            hasDocument ? (
              <CheckCircle className="h-3.5 w-3.5 text-green-600" />
            ) : (
              <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
            )
          }
        />
        <ReviewField
          label="KYC Verification"
          value={
            kycComplete
              ? "Verified"
              : data.stripe_identity_status === "processing"
                ? "Processing"
                : "Not completed"
          }
          icon={
            kycComplete ? (
              <CheckCircle className="h-3.5 w-3.5 text-green-600" />
            ) : (
              <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
            )
          }
        />
      </ReviewSection>

      {/* Warnings */}
      {(!kycComplete || !hasDocument) && (
        <div className="rounded-md border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-amber-800">
              <p className="font-medium">Optional items not completed:</p>
              <ul className="mt-1 text-xs space-y-0.5 list-disc list-inside">
                {!kycComplete && (
                  <li>Identity verification (KYC) is not yet verified</li>
                )}
                {!hasDocument && (
                  <li>Citizenship supporting document not uploaded</li>
                )}
              </ul>
              <p className="mt-2 text-xs">
                You can still submit your application. These items can be
                completed later during the review process.
              </p>
            </div>
          </div>
        </div>
      )}

      <Separator />

      {/* Submit */}
      <div className="rounded-md border border-gray-200 bg-gray-50 p-4">
        <p className="text-xs text-gray-600">
          By submitting this application, I confirm that all information
          provided is accurate and complete to the best of my knowledge. I
          understand that providing false information may result in
          disqualification.
        </p>
      </div>

      <div className="flex justify-between pt-2">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={isPending}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Submit Application
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

// ============================================================
// Helper Components
// ============================================================

function ReviewSection({
  title,
  stepNumber,
  onEdit,
  children,
}: {
  title: string;
  stepNumber: number;
  onEdit: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
        <h4 className="text-sm font-semibold text-gray-900">
          Step {stepNumber}: {title}
        </h4>
        <button
          type="button"
          onClick={onEdit}
          className="flex items-center gap-1 text-xs text-[#F26822] hover:text-[#d4571b] font-medium"
        >
          <Edit className="h-3 w-3" />
          Edit
        </button>
      </div>
      <div className="p-4 grid grid-cols-2 gap-3">{children}</div>
    </div>
  );
}

function ReviewField({
  label,
  value,
  fullWidth,
  icon,
}: {
  label: string;
  value?: string | null;
  fullWidth?: boolean;
  icon?: React.ReactNode;
}) {
  return (
    <div className={fullWidth ? "col-span-2" : ""}>
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
        {label}
      </p>
      <div className="flex items-center gap-1.5 mt-0.5">
        {icon}
        <p className="text-sm text-gray-900">{value || "—"}</p>
      </div>
    </div>
  );
}

function formatAddress(
  line1?: string | null,
  line2?: string | null,
  city?: string | null,
  state?: string | null,
  zip?: string | null,
  country?: string | null
): string {
  const parts = [line1, line2, [city, state, zip].filter(Boolean).join(", "), country].filter(
    Boolean
  );
  return parts.join(", ");
}
