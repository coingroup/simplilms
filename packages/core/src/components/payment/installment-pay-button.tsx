"use client";

import { useState, useTransition } from "react";
import { createInstallmentCheckout } from "../../actions/payment";
import { CreditCard, Loader2 } from "lucide-react";

interface InstallmentPayButtonProps {
  paymentId: string;
}

export function InstallmentPayButton({ paymentId }: InstallmentPayButtonProps) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handlePay = () => {
    setError(null);
    startTransition(async () => {
      const result = await createInstallmentCheckout(paymentId);
      if (result.success && result.checkoutUrl) {
        window.location.href = result.checkoutUrl;
      } else {
        setError(result.error || "Something went wrong");
      }
    });
  };

  return (
    <div>
      <button
        onClick={handlePay}
        disabled={isPending}
        className="inline-flex items-center gap-2 rounded-md bg-[#F26822] px-4 py-2 text-sm font-medium text-white hover:bg-[#d4571b] transition-colors disabled:opacity-50"
      >
        {isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <CreditCard className="h-4 w-4" />
            Pay Now
          </>
        )}
      </button>
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
}
