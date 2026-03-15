import crypto from "crypto";

// ============================================================
// Types
// ============================================================

export type PaymentOption = "full" | "split";
export type TuitionMethod = "full_payment" | "isa";

// ============================================================
// Enrollment Fee Constants
// ============================================================

export const ENROLLMENT_FEES = [
  {
    key: "registration",
    label: "Registration Fee",
    cents: 7500,
    feeType: "registration" as const,
  },
  {
    key: "admission",
    label: "Admission Fee",
    cents: 10000,
    feeType: "admission" as const,
  },
  {
    key: "document",
    label: "Document Fee",
    cents: 2500,
    feeType: "document" as const,
  },
  {
    key: "deposit",
    label: "Non-Refundable Deposit",
    cents: 200000,
    feeType: "deposit" as const,
  },
] as const;

/** Total enrollment fees before any processing adjustments: $2,200 */
export const TOTAL_ENROLLMENT_CENTS = 220000;

/** Pay-in-full amount including Stripe processing fee: $2,270 */
export const PAY_IN_FULL_CENTS = 227000;

/** Each split payment installment: $1,150 */
export const SPLIT_PAYMENT_CENTS = 115000;

/** Total for split payments (includes $100 payment plan fee): $2,300 */
export const SPLIT_TOTAL_CENTS = 230000;

/** Payment plan administrative fee: $100 */
export const PAYMENT_PLAN_FEE_CENTS = 10000;

// ============================================================
// Token Generation
// ============================================================

/**
 * Generate a cryptographically random payment token.
 * 32 bytes → 64-character hex string.
 */
export function generatePaymentToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

// ============================================================
// Currency Formatting
// ============================================================

/**
 * Format cents to a USD currency string.
 * @example formatCurrency(227000) → "$2,270.00"
 */
export function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

// ============================================================
// Stripe Checkout Helpers
// ============================================================

/**
 * Build Stripe Checkout line items for the selected payment option.
 */
export function getCheckoutLineItems(paymentOption: PaymentOption, schoolName: string) {
  if (paymentOption === "full") {
    return [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: `${schoolName} Enrollment Fees`,
            description:
              "Registration ($75) + Admission ($100) + Document ($25) + Deposit ($2,000)",
          },
          unit_amount: PAY_IN_FULL_CENTS,
        },
        quantity: 1,
      },
    ];
  }

  // Split payment — first installment
  return [
    {
      price_data: {
        currency: "usd",
        product_data: {
          name: `${schoolName} Enrollment — Installment 1 of 2`,
          description:
            "First payment toward enrollment fees. Second payment of $1,150 due in 30 days.",
        },
        unit_amount: SPLIT_PAYMENT_CENTS,
      },
      quantity: 1,
    },
  ];
}

/**
 * Build Stripe Checkout line items for installment 2.
 */
export function getInstallment2LineItems(schoolName: string) {
  return [
    {
      price_data: {
        currency: "usd",
        product_data: {
          name: `${schoolName} Enrollment — Installment 2 of 2`,
          description: "Final payment toward enrollment fees.",
        },
        unit_amount: SPLIT_PAYMENT_CENTS,
      },
      quantity: 1,
    },
  ];
}

// ============================================================
// Fee Type Labels
// ============================================================

export const FEE_TYPE_LABELS: Record<string, string> = {
  registration: "Registration Fee",
  admission: "Admission Fee",
  document: "Document Fee",
  deposit: "Non-Refundable Deposit",
  tuition: "Tuition",
  installment: "Installment Payment",
};

// ============================================================
// Payment Status Labels
// ============================================================

export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  processing: "Processing",
  succeeded: "Paid",
  failed: "Failed",
  refunded: "Refunded",
};

export const PAYMENT_STATUS_COLORS: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  pending: "secondary",
  processing: "secondary",
  succeeded: "default",
  failed: "destructive",
  refunded: "outline",
};
