import { CheckCircle2, Mail, LogIn, GraduationCap } from "lucide-react";
import { loadTenantConfig } from "@simplilms/core/lib/load-tenant-config";

interface PaymentSuccessPageProps {
  searchParams: Promise<{ session_id?: string }>;
}

export default async function PaymentSuccessPage({
  searchParams,
}: PaymentSuccessPageProps) {
  const params = await searchParams;
  const sessionId = params.session_id;
  const tenant = await loadTenantConfig();

  return (
    <div className="max-w-2xl mx-auto py-8">
      {/* Success Icon */}
      <div className="text-center mb-8">
        <div className="mx-auto h-20 w-20 rounded-full bg-green-100 flex items-center justify-center mb-4">
          <CheckCircle2 className="h-10 w-10 text-green-500" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900">Payment Received!</h2>
        <p className="text-gray-600 mt-2">
          Your enrollment payment has been successfully processed. Welcome to{" "}
          {tenant.shortName}!
        </p>
      </div>

      {/* What Happens Next */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          What Happens Next
        </h3>

        <div className="space-y-5">
          {/* Step 1 */}
          <div className="flex gap-4">
            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Mail className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900">
                Check Your Email
              </h4>
              <p className="text-sm text-gray-600 mt-0.5">
                Your student portal login credentials will be sent to your email
                address shortly. Please check your inbox (and spam folder).
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex gap-4">
            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <LogIn className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900">
                Log In to Your Portal
              </h4>
              <p className="text-sm text-gray-600 mt-0.5">
                Use the credentials from your email to log in to the Student
                Portal. We recommend changing your password after your first
                login.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex gap-4">
            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <GraduationCap className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900">
                Begin Your Program
              </h4>
              <p className="text-sm text-gray-600 mt-0.5">
                Your program enrollment is confirmed. You will receive class
                schedule details and onboarding information via email.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Plan Notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-amber-800">
          <strong>Payment plan?</strong> If you selected the two-payment option,
          your second installment of $1,150 is due within 30 days. You can make
          this payment from your Student Portal after logging in.
        </p>
      </div>

      {/* CTA */}
      <div className="text-center">
        <a
          href="/login"
          className="inline-flex items-center justify-center rounded-md bg-primary px-8 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Go to Portal Login
        </a>
        <p className="text-xs text-gray-500 mt-3">
          Questions? Contact{" "}
          <a
            href={`mailto:${tenant.email}`}
            className="text-primary hover:underline"
          >
            {tenant.email}
          </a>
        </p>
      </div>

      {/* Reference */}
      {sessionId && (
        <p className="text-xs text-gray-400 text-center mt-8">
          Reference: {sessionId.slice(0, 20)}...
        </p>
      )}
    </div>
  );
}
