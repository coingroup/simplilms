import { ENROLLMENT_FEES, formatCurrency, TOTAL_ENROLLMENT_CENTS } from "../../lib/payment";

/**
 * Enrollment fee breakdown table.
 */
export function FeeSummary() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
        <h3 className="text-sm font-semibold text-gray-900">
          Enrollment Fee Breakdown
        </h3>
      </div>

      <div className="divide-y divide-gray-100">
        {ENROLLMENT_FEES.map((fee) => (
          <div
            key={fee.key}
            className="flex items-center justify-between px-4 py-3"
          >
            <span className="text-sm text-gray-700">{fee.label}</span>
            <span className="text-sm font-medium text-gray-900">
              {formatCurrency(fee.cents)}
            </span>
          </div>
        ))}
      </div>

      {/* Total */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-t border-gray-200">
        <span className="text-sm font-semibold text-gray-900">Subtotal</span>
        <span className="text-sm font-bold text-gray-900">
          {formatCurrency(TOTAL_ENROLLMENT_CENTS)}
        </span>
      </div>

      <div className="px-4 py-2 bg-gray-50">
        <p className="text-xs text-gray-500">
          All fees are non-refundable. The deposit is applied toward tuition.
        </p>
      </div>
    </div>
  );
}
