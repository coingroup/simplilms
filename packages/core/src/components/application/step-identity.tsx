"use client";

import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Label, Separator } from "@simplilms/ui";
import {
  identitySchema,
  type IdentityData,
} from "../../lib/validations/application-schema";
import type { ApplicationFormData } from "../../lib/validations/application-schema";
import {
  CITIZENSHIP_STATUSES,
  CITIZENSHIP_LABELS,
  REQUIRED_DOCUMENTS,
  DOCUMENT_LABELS,
  type CitizenshipStatus,
  type DocumentType,
} from "../../lib/citizenship";
import { DocumentUpload } from "./document-upload";
import { IdentityVerification } from "./identity-verification";
import { useCallback } from "react";

interface StepIdentityProps {
  data: ApplicationFormData;
  prospectId: string;
  applicationId: string;
  onNext: (data: Partial<ApplicationFormData>) => void;
  onBack: () => void;
}

export function StepIdentity({
  data,
  prospectId,
  applicationId,
  onNext,
  onBack,
}: StepIdentityProps) {
  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<IdentityData>({
    resolver: zodResolver(identitySchema),
    defaultValues: {
      citizenship_status: data.citizenship_status as any,
      citizenship_document_type: data.citizenship_document_type || "",
      citizenship_document_url: data.citizenship_document_url || "",
      stripe_identity_session_id: data.stripe_identity_session_id || "",
      stripe_identity_status: data.stripe_identity_status || "",
    },
  });

  const citizenshipStatus = useWatch({
    control,
    name: "citizenship_status",
  }) as CitizenshipStatus;

  const requiredDocs =
    REQUIRED_DOCUMENTS[citizenshipStatus] || [];

  const handleDocUpload = useCallback(
    (path: string) => {
      setValue("citizenship_document_url", path);
    },
    [setValue]
  );

  const handleIdentityStatus = useCallback(
    (sessionId: string, status: string) => {
      setValue("stripe_identity_session_id", sessionId);
      setValue("stripe_identity_status", status);
    },
    [setValue]
  );

  const onSubmit = (formData: IdentityData) => {
    onNext(formData);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">
          Identity & Citizenship Verification
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          We verify your identity and citizenship status as part of the
          admissions process.
        </p>
      </div>

      {/* Citizenship Status */}
      <div className="space-y-1.5">
        <Label htmlFor="citizenship_status">
          Citizenship Status <span className="text-red-500">*</span>
        </Label>
        <select
          id="citizenship_status"
          {...register("citizenship_status")}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          {CITIZENSHIP_STATUSES.map((status) => (
            <option key={status} value={status}>
              {CITIZENSHIP_LABELS[status]}
            </option>
          ))}
        </select>
        {errors.citizenship_status && (
          <p className="text-xs text-red-500">
            {errors.citizenship_status.message}
          </p>
        )}
      </div>

      {/* Required Document Type */}
      {requiredDocs.length > 0 && (
        <div className="space-y-1.5">
          <Label htmlFor="citizenship_document_type">
            Supporting Document Type
          </Label>
          <select
            id="citizenship_document_type"
            {...register("citizenship_document_type")}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <option value="">Select document type</option>
            {requiredDocs.map((docType: DocumentType) => (
              <option key={docType} value={docType}>
                {DOCUMENT_LABELS[docType]}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500">
            Required for {CITIZENSHIP_LABELS[citizenshipStatus]} status.
          </p>
        </div>
      )}

      {/* Document Upload */}
      <DocumentUpload
        prospectId={prospectId}
        onUploadComplete={handleDocUpload}
        currentPath={data.citizenship_document_url || undefined}
        label="Upload Supporting Document"
      />

      <Separator />

      {/* Stripe Identity Verification */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-gray-900">
          Identity Verification (KYC)
        </h4>
        <p className="text-sm text-gray-600">
          Complete the identity verification below. This confirms you are who
          you claim to be through document and selfie matching.
        </p>

        <IdentityVerification
          applicationId={applicationId}
          prospectId={prospectId}
          currentStatus={data.stripe_identity_status || undefined}
          currentSessionId={data.stripe_identity_session_id || undefined}
          onStatusChange={handleIdentityStatus}
        />
      </div>

      <div className="flex justify-between pt-4">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button
          type="submit"
          className="bg-[#F26822] hover:bg-[#d4571b] text-white"
        >
          Next: Review & Submit
        </Button>
      </div>
    </form>
  );
}
