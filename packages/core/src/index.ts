/**
 * @simplilms/core
 *
 * Shared business logic for SimpliLMS platform deployments.
 * Contains all reusable components, queries, server actions, and utilities.
 *
 * Usage:
 *   import { getProspects, formatDateTime } from "@simplilms/core";
 *   import { ProspectTable } from "@simplilms/core/components/crm/prospect-table";
 *   import { saveDraft } from "@simplilms/core/actions/application-form";
 *   import { TenantProvider, useTenant } from "@simplilms/core/context";
 */

// Lib re-exports
export * from "./lib/queries";
export * from "./lib/formatting";
export * from "./lib/citizenship";
export {
  type PaymentOption,
  type TuitionMethod,
  ENROLLMENT_FEES,
  TOTAL_ENROLLMENT_CENTS,
  PAY_IN_FULL_CENTS,
  SPLIT_PAYMENT_CENTS,
  SPLIT_TOTAL_CENTS,
  PAYMENT_PLAN_FEE_CENTS,
  generatePaymentToken,
  getCheckoutLineItems,
  getInstallment2LineItems,
  FEE_TYPE_LABELS,
  PAYMENT_STATUS_LABELS,
  PAYMENT_STATUS_COLORS,
} from "./lib/payment";
export * from "./lib/constants";
export * from "./lib/tenant";
export * from "./lib/tenant-config";
