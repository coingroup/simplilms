import { CheckCircle, Mail, Clock, ArrowRight } from "lucide-react";
import { loadTenantConfig } from "@simplilms/core/lib/load-tenant-config";

export default async function ApplicationSuccessPage() {
  const tenant = await loadTenantConfig();

  return (
    <div className="max-w-lg mx-auto text-center py-12">
      <div className="mx-auto h-20 w-20 rounded-full bg-green-100 flex items-center justify-center mb-6">
        <CheckCircle className="h-10 w-10 text-green-600" />
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mb-3">
        Application Submitted!
      </h2>

      <p className="text-gray-600 mb-8">
        Thank you for completing your application. Our admissions team will
        review your submission and get back to you soon.
      </p>

      <div className="bg-white rounded-lg border border-gray-200 p-6 text-left space-y-4 mb-8">
        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
          What Happens Next
        </h3>

        <div className="flex items-start gap-3">
          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Clock className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">
              Application Review
            </p>
            <p className="text-sm text-gray-600">
              Our admissions team will review your application, including your
              identity verification and submitted documents.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Mail className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">
              Decision Notification
            </p>
            <p className="text-sm text-gray-600">
              You&apos;ll receive an email and SMS notification once a decision has
              been made on your application.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
            <ArrowRight className="h-4 w-4 text-green-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">
              Enrollment & Payment
            </p>
            <p className="text-sm text-gray-600">
              If approved, you&apos;ll receive a payment link to complete your
              enrollment and begin your program.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {tenant.websiteUrl && (
          <a
            href={tenant.websiteUrl}
            className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Visit {tenant.shortName}
          </a>
        )}
        <p className="text-xs text-gray-500">
          Questions? Contact us at{" "}
          <a
            href={`mailto:${tenant.email}`}
            className="text-primary hover:underline"
          >
            {tenant.email}
          </a>
        </p>
      </div>
    </div>
  );
}
