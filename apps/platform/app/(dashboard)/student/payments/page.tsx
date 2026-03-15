import { getUser } from "@simplilms/auth/server";
import { redirect } from "next/navigation";
import { getPaymentsByUserId, getEnrollmentsByUserId, formatCurrency } from "@simplilms/core";
import { PaymentHistoryTable } from "@simplilms/core/components/payment/payment-history-table";
import { InstallmentPayButton } from "@simplilms/core/components/payment/installment-pay-button";
import { DollarSign, AlertTriangle, CheckCircle2 } from "lucide-react";

export default async function StudentPaymentsPage() {
  const { user, error } = await getUser();
  if (error || !user) redirect("/login");

  const [payments, enrollments] = await Promise.all([
    getPaymentsByUserId(user.user.id),
    getEnrollmentsByUserId(user.user.id),
  ]);

  const totalPaid = payments
    .filter((p) => p.status === "succeeded")
    .reduce((sum, p) => sum + p.amount_cents, 0);

  const pendingInstallment = payments.find(
    (p) => p.status === "pending" && p.fee_type === "installment"
  );

  const hasPaymentPlan = enrollments.some(
    (e) => e.status === "payment_plan_active"
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
        <p className="text-sm text-gray-500 mt-1">
          View your payment history and outstanding balances.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Total Paid</p>
              <p className="text-lg font-bold text-gray-900">
                {formatCurrency(totalPaid)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div
              className={`h-10 w-10 rounded-full flex items-center justify-center ${
                pendingInstallment ? "bg-amber-100" : "bg-green-100"
              }`}
            >
              {pendingInstallment ? (
                <AlertTriangle className="h-5 w-5 text-amber-600" />
              ) : (
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              )}
            </div>
            <div>
              <p className="text-xs text-gray-500">Outstanding</p>
              <p className="text-lg font-bold text-gray-900">
                {pendingInstallment
                  ? formatCurrency(pendingInstallment.amount_cents)
                  : "$0.00"}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div
              className={`h-10 w-10 rounded-full flex items-center justify-center ${
                hasPaymentPlan ? "bg-amber-100" : "bg-green-100"
              }`}
            >
              <CheckCircle2
                className={`h-5 w-5 ${hasPaymentPlan ? "text-amber-600" : "text-green-600"}`}
              />
            </div>
            <div>
              <p className="text-xs text-gray-500">Status</p>
              <p className="text-sm font-semibold text-gray-900">
                {hasPaymentPlan ? "Payment Plan Active" : "Paid in Full"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Installment CTA */}
      {pendingInstallment && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-amber-900">
              Installment 2 Due
            </p>
            <p className="text-xs text-amber-700 mt-0.5">
              Pay {formatCurrency(pendingInstallment.amount_cents)} to complete
              your enrollment fees.
            </p>
          </div>
          <InstallmentPayButton paymentId={pendingInstallment.id} />
        </div>
      )}

      {/* Payment History */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-4 py-3 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-900">
            Payment History
          </h2>
        </div>
        <PaymentHistoryTable payments={payments} />
      </div>
    </div>
  );
}
