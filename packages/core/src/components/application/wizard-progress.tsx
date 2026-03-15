"use client";

import { cn } from "@simplilms/ui/lib/utils";
import { Check } from "lucide-react";

const STEPS = [
  { number: 1, label: "Personal Info" },
  { number: 2, label: "Address" },
  { number: 3, label: "Program" },
  { number: 4, label: "Identity" },
  { number: 5, label: "Review" },
];

interface WizardProgressProps {
  currentStep: number;
  completedSteps: number[];
}

export function WizardProgress({
  currentStep,
  completedSteps,
}: WizardProgressProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
      <div className="flex items-center justify-between">
        {STEPS.map((step, index) => {
          const isActive = step.number === currentStep;
          const isCompleted = completedSteps.includes(step.number);
          const isLast = index === STEPS.length - 1;

          return (
            <div key={step.number} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={cn(
                    "h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                    isCompleted
                      ? "bg-green-600 text-white"
                      : isActive
                        ? "bg-[#F26822] text-white"
                        : "bg-gray-200 text-gray-500"
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    step.number
                  )}
                </div>
                <span
                  className={cn(
                    "text-xs hidden sm:block text-center",
                    isActive
                      ? "text-[#F26822] font-medium"
                      : isCompleted
                        ? "text-green-600 font-medium"
                        : "text-gray-400"
                  )}
                >
                  {step.label}
                </span>
              </div>

              {!isLast && (
                <div
                  className={cn(
                    "flex-1 h-0.5 mx-2 sm:mx-3",
                    isCompleted ? "bg-green-600" : "bg-gray-200"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
