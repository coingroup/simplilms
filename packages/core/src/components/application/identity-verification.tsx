"use client";

import { useState, useCallback } from "react";
import { Button } from "@simplilms/ui";
import {
  createIdentitySession,
  getIdentityStatus,
} from "../../actions/stripe-identity";
import {
  Shield,
  CheckCircle,
  AlertCircle,
  Loader2,
  RefreshCw,
} from "lucide-react";

interface IdentityVerificationProps {
  applicationId: string;
  prospectId: string;
  currentStatus?: string;
  currentSessionId?: string;
  onStatusChange: (sessionId: string, status: string) => void;
}

export function IdentityVerification({
  applicationId,
  prospectId,
  currentStatus,
  currentSessionId,
  onStatusChange,
}: IdentityVerificationProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState(currentStatus || "");

  const startVerification = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await createIdentitySession(applicationId, prospectId);

      if (!result.success || !result.clientSecret) {
        setError(result.error || "Failed to start verification");
        setIsLoading(false);
        return;
      }

      // Load Stripe.js and open the Identity modal
      const { loadStripe } = await import("@stripe/stripe-js");
      const stripePublicKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

      if (!stripePublicKey) {
        setError("Stripe configuration error. Please contact admissions.");
        setIsLoading(false);
        return;
      }

      const stripe = await loadStripe(stripePublicKey);
      if (!stripe) {
        setError("Failed to load payment processor.");
        setIsLoading(false);
        return;
      }

      const { error: stripeError } = await stripe.verifyIdentity(
        result.clientSecret
      );

      if (stripeError) {
        console.error("Stripe Identity error:", stripeError);
        // Don't show Stripe's internal errors — check status instead
      }

      // Check the final status after modal closes
      if (result.sessionId) {
        const statusResult = await getIdentityStatus(result.sessionId);
        if (statusResult.success && statusResult.status) {
          setStatus(statusResult.status);
          onStatusChange(result.sessionId, statusResult.status);
        }
      }
    } catch (err) {
      console.error("Identity verification error:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [applicationId, prospectId, onStatusChange]);

  const refreshStatus = useCallback(async () => {
    if (!currentSessionId) return;
    setIsLoading(true);

    const result = await getIdentityStatus(currentSessionId);
    if (result.success && result.status) {
      setStatus(result.status);
      onStatusChange(currentSessionId, result.status);
    }

    setIsLoading(false);
  }, [currentSessionId, onStatusChange]);

  // Already verified
  if (status === "verified") {
    return (
      <div className="rounded-md border border-green-200 bg-green-50 p-4">
        <div className="flex items-center gap-3">
          <CheckCircle className="h-6 w-6 text-green-600" />
          <div>
            <p className="text-sm font-medium text-green-900">
              Identity Verified
            </p>
            <p className="text-xs text-green-700">
              Your identity has been successfully verified via Stripe Identity.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Processing
  if (status === "processing") {
    return (
      <div className="rounded-md border border-blue-200 bg-blue-50 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
            <div>
              <p className="text-sm font-medium text-blue-900">
                Verification In Progress
              </p>
              <p className="text-xs text-blue-700">
                Your identity verification is being processed. This usually
                takes a few minutes.
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={refreshStatus}
            disabled={isLoading}
          >
            <RefreshCw className="h-3.5 w-3.5 mr-1" />
            Refresh
          </Button>
        </div>
      </div>
    );
  }

  // Requires input (failed/needs retry)
  if (status === "requires_input") {
    return (
      <div className="rounded-md border border-amber-200 bg-amber-50 p-4 space-y-3">
        <div className="flex items-center gap-3">
          <AlertCircle className="h-6 w-6 text-amber-600" />
          <div>
            <p className="text-sm font-medium text-amber-900">
              Verification Needs Attention
            </p>
            <p className="text-xs text-amber-700">
              We couldn&apos;t complete your verification. Please try again with a
              clear photo of your document.
            </p>
          </div>
        </div>
        <Button
          type="button"
          onClick={startVerification}
          disabled={isLoading}
          className="bg-[#F26822] hover:bg-[#d4571b] text-white"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Starting...
            </>
          ) : (
            <>
              <Shield className="h-4 w-4 mr-2" />
              Retry Verification
            </>
          )}
        </Button>
      </div>
    );
  }

  // Not started
  return (
    <div className="space-y-3">
      <div className="rounded-md border border-gray-200 bg-gray-50 p-4">
        <div className="flex items-start gap-3">
          <Shield className="h-6 w-6 text-gray-400 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-gray-900">
              Identity Verification Required
            </p>
            <p className="text-xs text-gray-600 mt-1">
              We use Stripe Identity to verify your identity. You&apos;ll need to
              provide:
            </p>
            <ul className="text-xs text-gray-600 mt-2 space-y-1 list-disc list-inside">
              <li>A photo of your government-issued ID</li>
              <li>A selfie for identity matching</li>
            </ul>
            <p className="text-xs text-gray-500 mt-2">
              Your information is securely processed by Stripe. Your ID images
              are not stored on our servers.
            </p>
          </div>
        </div>
      </div>

      <Button
        type="button"
        onClick={startVerification}
        disabled={isLoading}
        className="bg-[#F26822] hover:bg-[#d4571b] text-white"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Starting Verification...
          </>
        ) : (
          <>
            <Shield className="h-4 w-4 mr-2" />
            Begin Identity Verification
          </>
        )}
      </Button>

      {error && (
        <div className="flex items-center gap-2 text-red-600">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <p className="text-xs">{error}</p>
        </div>
      )}
    </div>
  );
}
