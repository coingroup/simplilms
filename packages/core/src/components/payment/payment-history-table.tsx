import type { PaymentRow } from "../../lib/queries";
import {
  FEE_TYPE_LABELS,
  PAYMENT_STATUS_LABELS,
  PAYMENT_STATUS_COLORS,
  formatCurrency,
} from "../../lib/payment";
import { formatDateTime } from "../../lib/formatting";
import { Badge } from "@simplilms/ui";

interface PaymentHistoryTableProps {
  payments: PaymentRow[];
}

export function PaymentHistoryTable({ payments }: PaymentHistoryTableProps) {
  if (payments.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-sm">No payment history yet.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">
              Date
            </th>
            <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">
              Description
            </th>
            <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">
              Amount
            </th>
            <th className="text-center text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">
              Status
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {payments.map((payment) => (
            <tr key={payment.id} className="hover:bg-gray-50">
              <td className="py-3 px-4 text-sm text-gray-700">
                {payment.paid_at
                  ? formatDateTime(payment.paid_at)
                  : payment.created_at
                    ? formatDateTime(payment.created_at)
                    : "—"}
              </td>
              <td className="py-3 px-4 text-sm text-gray-900">
                {FEE_TYPE_LABELS[payment.fee_type] || payment.fee_type}
              </td>
              <td className="py-3 px-4 text-sm font-medium text-gray-900 text-right">
                {formatCurrency(payment.amount_cents)}
              </td>
              <td className="py-3 px-4 text-center">
                <Badge
                  variant={
                    PAYMENT_STATUS_COLORS[payment.status] || "secondary"
                  }
                >
                  {PAYMENT_STATUS_LABELS[payment.status] || payment.status}
                </Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
