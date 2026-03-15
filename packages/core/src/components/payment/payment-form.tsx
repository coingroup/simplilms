"use client";

import { useState, useTransition } from "react";
import { createCheckoutSession } from "../../actions/payment";
import { FeeSummary } from "./fee-summary";
import {
  formatCurrency,
  PAY_IN_FULL_CENTS,
  SPLIT_PAYMENT_CENTS,
  SPLIT_TOTAL_CENTS,
  PAYMENT_PLAN_FEE_CENTS,
  type PaymentOption,
  type TuitionMethod,
} from "../../lib/payment";
import { CreditCard, Loader2, CheckCircle2, Info } from "lucide-react";

interface PaymentFormProps {
  paymentToken: string;
  applicationId: string;
  programName: string;
  isaConsentGiven: boolean;
}

export function PaymentForm({
  paymentToken,
  programName,
  isaConsentGiven,
}: PaymentFormProps) {
  const [tuitionMethod, setTuitionMethod] = useState<TuitionMethod | null>(
    null
  );
  const [paymentOption, setPaymentOption] = useState<PaymentOption | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const canPay = tuitionMethod !== null && paymentOption !== null;

  const handlePay = () => {
    if (!canPay) return;

    setError(null);
    startTransition(async () => {
      const result = await createCheckoutSession(
        paymentToken,
        paymentOption!,
        tuitionMethod!
      );

      if (result.success && result.checkoutUrl) {
        window.location.href = result.checkoutUrl;
      } else {
        setError(result.error || "Something went wrong. Please try again.");
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Section 1: Tuition Payment Method */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">
          Step 1: Tuition Payment Method
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          How would you like to pay your tuition for {programName}?
        </p>

        <div className="grid gap-3 sm:grid-cols-2">
          {/* Full Payment */}
          <label
            className={`relative flex cursor-pointer rounded-lg border p-4 transition-all ${
              tuitionMethod === "full_payment"
                ? "border-[#F26822] bg-[#F26822]/5 ring-2 ring-[#F26822]"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <input
              type="radio"
              name="tuitionMethod"
              value="full_payment"
              checked={tuitionMethod === "full_payment"}
              onChange={() => setTuitionMethod("full_payment")}
              className="sr-only"
            />
            <div>
              <span className="text-sm font-medium text-gray-900">
                Pay Tuition in Full
              </span>
              <p className="text-xs text-gray-500 mt-1">
                A tuition invoice will be generated after enrollment.
              </p>
            </div>
            {tuitionMethod === "full_payment" && (
              <CheckCircle2 className="absolute top-3 right-3 h-5 w-5 text-[#F26822]" />
            )}
          </label>

          {/* ISA */}
          <label
            className={`relative flex cursor-pointer rounded-lg border p-4 transition-all ${
              tuitionMethod === "isa"
                ? "border-[#F26822] bg-[#F26822]/5 ring-2 ring-[#F26822]"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <input
              type="radio"
              name="tuitionMethod"
              value="isa"
              checked={tuitionMethod === "isa"}
              onChange={() => setTuitionMethod("isa")}
              className="sr-only"
            />
            <div>
              <span className="text-sm font-medium text-gray-900">
                Income Share Agreement (ISA)
              </span>
              <p className="text-xs text-gray-500 mt-1">
                Pay after you land a job, through our partner Education Funding
                Group.
              </p>
              {isaConsentGiven && (
                <span className="inline-flex items-center gap-1 mt-1 text-xs text-green-700">
                  <CheckCircle2 className="h-3 w-3" /> Consent provided
                </span>
              )}
            </div>
            {tuitionMethod === "isa" && (
              <CheckCircle2 className="absolute top-3 right-3 h-5 w-5 text-[#F26822]" />
            )}
          </label>
        </div>

        {tuitionMethod === "isa" && (
          <div className="mt-3 rounded-md bg-blue-50 border border-blue-200 p-3">
            <div className="flex gap-2">
              <Info className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-blue-700">
                After enrollment, you will receive communications from Education
                Funding Group (educationfunding.co) with an invitation to begin
                your ISA application. For questions, contact{" "}
                <a
                  href="mailto:support@educationfunding.co"
                  className="underline"
                >
                  support@educationfunding.co
                </a>
                .
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Section 2: Fee Summary */}
      <FeeSummary />

      {/* Section 3: Payment Option */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">
          Step 2: Payment Option
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          Choose how you&apos;d like to pay the enrollment fees.
        </p>

        <div className="grid gap-3 sm:grid-cols-2">
          {/* Pay in Full */}
          <label
            className={`relative flex cursor-pointer rounded-lg border p-4 transition-all ${
              paymentOption === "full"
                ? "border-[#F26822] bg-[#F26822]/5 ring-2 ring-[#F26822]"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <input
              type="radio"
              name="paymentOption"
              value="full"
              checked={paymentOption === "full"}
              onChange={() => setPaymentOption("full")}
              className="sr-only"
            />
            <div>
              <span className="text-sm font-medium text-gray-900">
                Pay in Full
              </span>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {formatCurrency(PAY_IN_FULL_CENTS)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Single payment. Includes processing fee.
              </p>
            </div>
            {paymentOption === "full" && (
              <CheckCircle2 className="absolute top-3 right-3 h-5 w-5 text-[#F26822]" />
            )}
          </label>

          {/* Split Payment */}
          <label
            className={`relative flex cursor-pointer rounded-lg border p-4 transition-all ${
              paymentOption === "split"
                ? "border-[#F26822] bg-[#F26822]/5 ring-2 ring-[#F26822]"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <input
              type="radio"
              name="paymentOption"
              value="split"
              checked={paymentOption === "split"}
              onChange={() => setPaymentOption("split")}
              className="sr-only"
            />
            <div>
              <span className="text-sm font-medium text-gray-900">
                Payment Plan
              </span>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                2 &times; {formatCurrency(SPLIT_PAYMENT_CENTS)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                First payment now, second in 30 days.
                <br />
                Total: {formatCurrency(SPLIT_TOTAL_CENTS)} (includes{" "}
                {formatCurrency(PAYMENT_PLAN_FEE_CENTS)} plan fee)
              </p>
            </div>
            {paymentOption === "split" && (
              <CheckCircle2 className="absolute top-3 right-3 h-5 w-5 text-[#F26822]" />
            )}
          </label>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Pay Now Button */}
      <div className="flex justify-center">
        <button
          onClick={handlePay}
          disabled={!canPay || isPending}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#F26822] px-10 py-3.5 text-base font-semibold text-white transition-all hover:bg-[#d4571b] disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
        >
          {isPending ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <CreditCard className="h-5 w-5" />
              Pay{" "}
              {paymentOption === "full"
                ? formatCurrency(PAY_IN_FULL_CENTS)
                : paymentOption === "split"
                  ? formatCurrency(SPLIT_PAYMENT_CENTS)
                  : "Now"}
            </>
          )}
        </button>
      </div>

      {/* Security note */}
      <p className="text-xs text-gray-400 text-center">
        Payments are securely processed by Stripe. Your card information is
        never stored on our servers.
      </p>
    </div>
  );
}
