"use client";

import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Label, Separator } from "@simplilms/ui";
import {
  programSchema,
  type ProgramData,
} from "../../lib/validations/application-schema";
import type { ApplicationFormData } from "../../lib/validations/application-schema";
import type { ProgramRow } from "../../lib/queries";
import { AlertCircle, Info } from "lucide-react";

const ISA_CONSENT_TEXT = `Authorization to Share Information with ISA Partner

By checking this box, I authorize this institution to share my first name, last name, and email address with the designated Income Share Agreement partner for the sole purpose of initiating my ISA application process.

I understand that:
- Only my name and email address will be shared
- The ISA partner will contact me directly to begin the ISA application
- This authorization does not obligate me to enter into an ISA
- I may revoke this authorization at any time by contacting the admissions office

This consent is provided voluntarily and is required only if I wish to pursue the ISA payment option.`;

interface StepProgramProps {
  data: ApplicationFormData;
  programs: ProgramRow[];
  onNext: (data: Partial<ApplicationFormData>) => void;
  onBack: () => void;
}

export function StepProgram({
  data,
  programs,
  onNext,
  onBack,
}: StepProgramProps) {
  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<ProgramData>({
    resolver: zodResolver(programSchema),
    defaultValues: {
      program_id: data.program_id,
      isa_consent_given: data.isa_consent_given,
      isa_consent_text: data.isa_consent_text || "",
      tuition_payment_preference: data.tuition_payment_preference || "undecided",
    },
  });

  const selectedProgramId = useWatch({ control, name: "program_id" });
  const paymentPreference = useWatch({
    control,
    name: "tuition_payment_preference",
  });

  const selectedProgram = programs.find((p) => p.id === selectedProgramId);

  const onSubmit = (formData: ProgramData) => {
    // If ISA consent is given, store the consent text
    if (formData.isa_consent_given) {
      formData.isa_consent_text = ISA_CONSENT_TEXT;
    }
    onNext(formData);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">
          Program Selection
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Select the program you would like to enroll in.
        </p>
      </div>

      {/* Program Selection */}
      <div className="space-y-1.5">
        <Label htmlFor="program_id">
          Program <span className="text-red-500">*</span>
        </Label>
        <select
          id="program_id"
          {...register("program_id")}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <option value="">Select a program</option>
          {programs.map((program) => (
            <option key={program.id} value={program.id}>
              {program.name}
              {program.tuition_amount_cents
                ? ` — $${(program.tuition_amount_cents / 100).toLocaleString()}`
                : ""}
            </option>
          ))}
        </select>
        {errors.program_id && (
          <p className="text-xs text-red-500">{errors.program_id.message}</p>
        )}
      </div>

      {/* Program Details */}
      {selectedProgram && (
        <div className="rounded-md border border-blue-200 bg-blue-50 p-4">
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-blue-900">
                {selectedProgram.name}
              </p>
              {selectedProgram.description && (
                <p className="text-blue-700 mt-1">
                  {selectedProgram.description}
                </p>
              )}
              <div className="flex gap-4 mt-2 text-blue-800">
                {selectedProgram.duration_weeks && (
                  <span>{selectedProgram.duration_weeks} weeks</span>
                )}
                {selectedProgram.tuition_amount_cents && (
                  <span>
                    Tuition: $
                    {(
                      selectedProgram.tuition_amount_cents / 100
                    ).toLocaleString()}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <Separator />

      {/* Tuition Payment Preference */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-gray-900">
          Tuition Payment Preference
        </h4>
        <p className="text-sm text-gray-600">
          How would you like to pay for tuition? You can finalize this later.
        </p>

        <div className="space-y-2">
          <label className="flex items-start gap-3 p-3 rounded-md border border-gray-200 hover:border-gray-300 cursor-pointer">
            <input
              type="radio"
              value="full_payment"
              {...register("tuition_payment_preference")}
              className="mt-0.5 h-4 w-4 text-[#F26822] focus:ring-[#F26822]"
            />
            <div>
              <p className="text-sm font-medium text-gray-900">
                Pay Tuition in Full
              </p>
              <p className="text-xs text-gray-500">
                Pay the full tuition amount upon enrollment.
              </p>
            </div>
          </label>

          <label className="flex items-start gap-3 p-3 rounded-md border border-gray-200 hover:border-gray-300 cursor-pointer">
            <input
              type="radio"
              value="isa"
              {...register("tuition_payment_preference")}
              className="mt-0.5 h-4 w-4 text-[#F26822] focus:ring-[#F26822]"
            />
            <div>
              <p className="text-sm font-medium text-gray-900">
                Income Share Agreement (ISA)
              </p>
              <p className="text-xs text-gray-500">
                Pay a percentage of your income after completing the program.
                Provided by our partner, Education Funding Group.
              </p>
            </div>
          </label>

          <label className="flex items-start gap-3 p-3 rounded-md border border-gray-200 hover:border-gray-300 cursor-pointer">
            <input
              type="radio"
              value="undecided"
              {...register("tuition_payment_preference")}
              className="mt-0.5 h-4 w-4 text-[#F26822] focus:ring-[#F26822]"
            />
            <div>
              <p className="text-sm font-medium text-gray-900">
                Decide Later
              </p>
              <p className="text-xs text-gray-500">
                You can choose your payment method after your application is
                approved.
              </p>
            </div>
          </label>
        </div>
      </div>

      {/* ISA Consent */}
      {paymentPreference === "isa" && (
        <div className="rounded-md border border-amber-200 bg-amber-50 p-4 space-y-3">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm font-medium text-amber-900">
              ISA Data Sharing Consent Required
            </p>
          </div>

          <div className="bg-white rounded border border-amber-200 p-3 text-xs text-gray-700 max-h-48 overflow-y-auto whitespace-pre-line">
            {ISA_CONSENT_TEXT}
          </div>

          <label className="flex items-start gap-2 cursor-pointer">
            <input
              type="checkbox"
              {...register("isa_consent_given")}
              className="mt-0.5 h-4 w-4 rounded border-gray-300 text-[#F26822] focus:ring-[#F26822]"
            />
            <span className="text-sm text-gray-900">
              I have read and agree to the above authorization to share my
              information with Education Funding Group.
            </span>
          </label>
        </div>
      )}

      <div className="flex justify-between pt-4">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button
          type="submit"
          className="bg-[#F26822] hover:bg-[#d4571b] text-white"
        >
          Next: Identity Verification
        </Button>
      </div>
    </form>
  );
}
