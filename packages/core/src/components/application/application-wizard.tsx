"use client";

import { useState, useCallback, useTransition } from "react";
import { WizardProgress } from "./wizard-progress";
import { StepPersonalInfo } from "./step-personal-info";
import { StepAddress } from "./step-address";
import { StepProgram } from "./step-program";
import { StepIdentity } from "./step-identity";
import { StepReviewSubmit } from "./step-review-submit";
import { saveDraft } from "../../actions/application-form";
import type { ApplicationFormData } from "../../lib/validations/application-schema";
import { DEFAULT_FORM_DATA } from "../../lib/validations/application-schema";
import type { ProspectRow, ApplicationRow, ProgramRow } from "../../lib/queries";
import { toast } from "sonner";

interface ApplicationWizardProps {
  prospect: ProspectRow;
  existingApplication: ApplicationRow | null;
  programs: ProgramRow[];
}

/**
 * Pre-fill form data from prospect record and/or existing application draft.
 */
function buildInitialData(
  prospect: ProspectRow,
  application: ApplicationRow | null
): ApplicationFormData {
  if (application) {
    // Restore from draft
    return {
      first_name: application.first_name || prospect.first_name || "",
      last_name: application.last_name || prospect.last_name || "",
      middle_name: application.middle_name || "",
      email: application.email || prospect.email || "",
      phone: application.phone || prospect.phone || "",
      date_of_birth: application.date_of_birth || "",
      address_line1: application.address_line1 || "",
      address_line2: application.address_line2 || "",
      city: application.city || "",
      state: application.state || "",
      zip_code: application.zip_code || "",
      country: application.country || "United States",
      mailing_address_line1: application.mailing_address_line1 || "",
      mailing_address_line2: application.mailing_address_line2 || "",
      mailing_city: application.mailing_city || "",
      mailing_state: application.mailing_state || "",
      mailing_zip: application.mailing_zip || "",
      mailing_country: application.mailing_country || "",
      program_id: application.program_id || "",
      isa_consent_given: application.isa_consent_given || false,
      isa_consent_text: "",
      tuition_payment_preference: "undecided",
      citizenship_status:
        (application.citizenship_status as any) || "us_citizen",
      citizenship_document_type: application.citizenship_document_type || "",
      citizenship_document_url: application.citizenship_document_url || "",
      stripe_identity_session_id:
        application.stripe_identity_session_id || "",
      stripe_identity_status: application.stripe_identity_status || "",
    };
  }

  // Pre-fill from prospect
  return {
    ...DEFAULT_FORM_DATA,
    first_name: prospect.first_name || "",
    last_name: prospect.last_name || "",
    email: prospect.email || "",
    phone: prospect.phone || "",
  };
}

export function ApplicationWizard({
  prospect,
  existingApplication,
  programs,
}: ApplicationWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [formData, setFormData] = useState<ApplicationFormData>(() =>
    buildInitialData(prospect, existingApplication)
  );
  const [applicationId, setApplicationId] = useState<string | null>(
    existingApplication?.id || null
  );
  const [isSaving, startSaving] = useTransition();

  /**
   * Handle step completion — merge data, save draft, advance.
   */
  const handleNext = useCallback(
    (stepData: Partial<ApplicationFormData>) => {
      const updatedData = { ...formData, ...stepData };
      setFormData(updatedData);

      // Mark current step as completed
      setCompletedSteps((prev) =>
        prev.includes(currentStep) ? prev : [...prev, currentStep]
      );

      // Save draft in background
      startSaving(async () => {
        const result = await saveDraft(
          prospect.id,
          updatedData,
          applicationId || undefined
        );
        if (result.success && result.applicationId) {
          setApplicationId(result.applicationId);
        } else if (result.error) {
          toast.error("Failed to save progress: " + result.error);
        }
      });

      // Advance to next step
      setCurrentStep((prev) => Math.min(prev + 1, 5));
    },
    [formData, currentStep, prospect.id, applicationId]
  );

  const handleBack = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  }, []);

  const handleGoToStep = useCallback((step: number) => {
    setCurrentStep(step);
  }, []);

  return (
    <div className="space-y-6">
      <WizardProgress
        currentStep={currentStep}
        completedSteps={completedSteps}
      />

      {isSaving && (
        <div className="text-xs text-gray-400 text-right">
          Saving progress...
        </div>
      )}

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        {currentStep === 1 && (
          <StepPersonalInfo data={formData} onNext={handleNext} />
        )}

        {currentStep === 2 && (
          <StepAddress
            data={formData}
            onNext={handleNext}
            onBack={handleBack}
          />
        )}

        {currentStep === 3 && (
          <StepProgram
            data={formData}
            programs={programs}
            onNext={handleNext}
            onBack={handleBack}
          />
        )}

        {currentStep === 4 && (
          <StepIdentity
            data={formData}
            prospectId={prospect.id}
            applicationId={applicationId || ""}
            onNext={handleNext}
            onBack={handleBack}
          />
        )}

        {currentStep === 5 && (
          <StepReviewSubmit
            data={formData}
            programs={programs}
            applicationId={applicationId || ""}
            prospectId={prospect.id}
            onBack={handleBack}
            onGoToStep={handleGoToStep}
          />
        )}
      </div>
    </div>
  );
}
