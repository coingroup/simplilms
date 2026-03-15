import {
  getApplicationByPaymentToken,
  getPaymentsByApplicationId,
  getPrograms,
} from "@simplilms/core";
import { loadTenantConfig } from "@simplilms/core/lib/load-tenant-config";
import { PaymentForm } from "@simplilms/core/components/payment/payment-form";
import { AlertCircle, CheckCircle2 } from "lucide-react";

interface PaymentPageProps {
  searchParams: Promise<{ token?: string; canceled?: string }>;
}

export default async function PaymentPage({ searchParams }: PaymentPageProps) {
  const params = await searchParams;
  const token = params.token;
  const canceled = params.canceled;
  const tenant = await loadTenantConfig();

  // No token provided
  if (!token) {
    return <InvalidTokenMessage tenantEmail={tenant.email} />;
  }

  // Fetch application by payment token
  const application = await getApplicationByPaymentToken(token);

  if (!application) {
    return <InvalidTokenMessage tenantEmail={tenant.email} />;
  }

  // Already enrolled
  if (application.status === "enrolled") {
    return <AlreadyEnrolledMessage />;
  }

  // Check for existing successful payments
  const payments = await getPaymentsByApplicationId(application.id);
  const hasSuccessfulPayment = payments.some((p) => p.status === "succeeded");

  if (hasSuccessfulPayment) {
    return <AlreadyPaidMessage />;
  }

  // Fetch program info
  const programs = await getPrograms();
  const program = programs.find((p) => p.id === application.program_id);

  return (
    <div className="space-y-6">
      {/* Canceled banner */}
      {canceled && (
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
          <p className="text-sm text-yellow-800">
            Your payment was canceled. You can try again whenever you&apos;re
            ready.
          </p>
        </div>
      )}

      {/* Welcome */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          Welcome, {application.first_name}!
        </h2>
        <p className="text-gray-600 mt-1">
          Your application has been approved. Complete your enrollment payment
          below to secure your spot in{" "}
          <strong>{program?.name || "your program"}</strong>.
        </p>
      </div>

      {/* Payment Form */}
      <PaymentForm
        paymentToken={token}
        applicationId={application.id}
        programName={program?.name || "Program"}
        isaConsentGiven={application.isa_consent_given || false}
      />
    </div>
  );
}

function InvalidTokenMessage({ tenantEmail }: { tenantEmail: string }) {
  return (
    <div className="max-w-md mx-auto text-center py-16">
      <div className="mx-auto h-16 w-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
        <AlertCircle className="h-8 w-8 text-red-500" />
      </div>
      <h2 className="text-xl font-semibold text-gray-900 mb-2">
        Invalid Payment Link
      </h2>
      <p className="text-gray-600 mb-6">
        This payment link is invalid or has expired. If you believe this is an
        error, please contact our admissions team.
      </p>
      <a
        href={`mailto:${tenantEmail}`}
        className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        Contact Admissions
      </a>
    </div>
  );
}

function AlreadyEnrolledMessage() {
  return (
    <div className="max-w-md mx-auto text-center py-16">
      <div className="mx-auto h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
        <CheckCircle2 className="h-8 w-8 text-green-500" />
      </div>
      <h2 className="text-xl font-semibold text-gray-900 mb-2">
        Already Enrolled
      </h2>
      <p className="text-gray-600 mb-6">
        You are already enrolled. Log in to your student portal to view your
        dashboard.
      </p>
      <a
        href="/login"
        className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        Go to Portal Login
      </a>
    </div>
  );
}

function AlreadyPaidMessage() {
  return (
    <div className="max-w-md mx-auto text-center py-16">
      <div className="mx-auto h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
        <CheckCircle2 className="h-8 w-8 text-green-500" />
      </div>
      <h2 className="text-xl font-semibold text-gray-900 mb-2">
        Payment Already Received
      </h2>
      <p className="text-gray-600 mb-6">
        We&apos;ve already received your payment. Your enrollment is being
        processed. Check your email for login credentials.
      </p>
      <a
        href="/login"
        className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        Go to Portal Login
      </a>
    </div>
  );
}
