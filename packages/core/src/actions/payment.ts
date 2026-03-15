"use server";

import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@simplilms/auth/server";
import { getUser } from "@simplilms/auth/server";
import { revalidatePath } from "next/cache";
import { getStripe } from "../lib/stripe";
import {
  getCheckoutLineItems,
  getInstallment2LineItems,
  PAY_IN_FULL_CENTS,
  SPLIT_PAYMENT_CENTS,
  type PaymentOption,
  type TuitionMethod,
} from "../lib/payment";
import { getTenantId, getTenantName } from "../lib/tenant";

// ============================================================
// Service-role client (bypasses RLS for semi-public operations)
// ============================================================

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Missing Supabase service role credentials");
  }
  return createClient(url, key);
}

// ============================================================
// Create Checkout Session (semi-public — called from payment page)
// ============================================================

export async function createCheckoutSession(
  paymentToken: string,
  paymentOption: PaymentOption,
  tuitionMethod: TuitionMethod
): Promise<{ success: boolean; checkoutUrl?: string; error?: string }> {
  try {
    const supabase = getServiceClient();
    const stripe = getStripe();
    const tenantId = getTenantId();
    const schoolName = getTenantName();

    // 1. Validate payment token
    const { data: application, error: appError } = await supabase
      .from("applications")
      .select("*")
      .eq("payment_token", paymentToken)
      .single();

    if (appError || !application) {
      return { success: false, error: "Invalid or expired payment link" };
    }

    if (application.status === "enrolled") {
      return { success: false, error: "You are already enrolled" };
    }

    if (application.status !== "approved") {
      return { success: false, error: "This application is not approved for payment" };
    }

    // 2. Check for existing successful payments (prevent double payment)
    const { data: existingPayments } = await supabase
      .from("payments")
      .select("id, status")
      .eq("application_id", application.id)
      .eq("status", "succeeded");

    if (existingPayments && existingPayments.length > 0) {
      return { success: false, error: "Payment has already been processed" };
    }

    // 3. Create or find user account
    let userId = application.user_id;

    if (!userId) {
      // Check if user already exists by email
      const { data: existingUsers } = await supabase.auth.admin.listUsers();
      const existingUser = existingUsers?.users?.find(
        (u) => u.email === application.email
      );

      if (existingUser) {
        userId = existingUser.id;
      } else {
        // Create new auth user (no password yet — set after payment)
        const { data: newUser, error: createError } =
          await supabase.auth.admin.createUser({
            email: application.email!,
            email_confirm: true,
            user_metadata: {
              first_name: application.first_name,
              last_name: application.last_name,
            },
          });

        if (createError || !newUser.user) {
          console.error("Error creating user:", createError);
          return { success: false, error: "Failed to create user account" };
        }

        userId = newUser.user.id;

        // Create profile
        await supabase.from("profiles").insert({
          id: userId,
          tenant_id: tenantId,
          role: "student",
          first_name: application.first_name,
          last_name: application.last_name,
          email: application.email,
          phone: application.phone,
          date_of_birth: application.date_of_birth,
          citizenship_status: application.citizenship_status,
          program_of_interest: application.program_id,
          address: [
            application.address_line1,
            application.address_line2,
            application.city,
            application.state,
            application.zip_code,
          ]
            .filter(Boolean)
            .join(", "),
          mailing_address: [
            application.mailing_address_line1,
            application.mailing_address_line2,
            application.mailing_city,
            application.mailing_state,
            application.mailing_zip,
          ]
            .filter(Boolean)
            .join(", "),
        });
      }

      // Link user to application
      await supabase
        .from("applications")
        .update({ user_id: userId })
        .eq("id", application.id);
    }

    // 4. Build Stripe Checkout Session
    const portalUrl =
      process.env.NEXT_PUBLIC_PORTAL_URL || "http://localhost:3001";

    const amountCents =
      paymentOption === "full" ? PAY_IN_FULL_CENTS : SPLIT_PAYMENT_CENTS;
    const installmentNumber = paymentOption === "split" ? "1" : null;

    const session = await stripe.checkout.sessions.create(
      {
        mode: "payment",
        customer_email: application.email || undefined,
        line_items: getCheckoutLineItems(paymentOption, schoolName),
        metadata: {
          application_id: application.id,
          payment_token: paymentToken,
          payment_option: paymentOption,
          tuition_method: tuitionMethod,
          installment_number: installmentNumber || "null",
          user_id: userId,
          tenant_id: tenantId,
        },
        success_url: `${portalUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${portalUrl}/payment?token=${paymentToken}&canceled=true`,
        payment_intent_data: {
          metadata: {
            application_id: application.id,
            payment_option: paymentOption,
            installment_number: installmentNumber || "null",
          },
        },
      },
      {
        idempotencyKey: `checkout_${application.id}_${paymentOption}_${installmentNumber || "full"}`,
      }
    );

    // 5. Create pending payment record
    const feeType =
      paymentOption === "full" ? "deposit" : ("installment" as const);

    await supabase.from("payments").insert({
      tenant_id: tenantId,
      user_id: userId,
      application_id: application.id,
      stripe_checkout_session_id: session.id,
      amount_cents: amountCents,
      currency: "usd",
      fee_type: feeType,
      status: "pending",
    });

    return { success: true, checkoutUrl: session.url || undefined };
  } catch (err) {
    console.error("createCheckoutSession error:", err);
    return { success: false, error: "An unexpected error occurred" };
  }
}

// ============================================================
// Create Installment 2 Checkout (authenticated — student pays)
// ============================================================

export async function createInstallmentCheckout(
  paymentId: string
): Promise<{ success: boolean; checkoutUrl?: string; error?: string }> {
  try {
    const { user, error: authError } = await getUser();
    if (authError || !user) {
      return { success: false, error: "Unauthorized" };
    }

    const supabase = await createServerClient();
    const tenantId = getTenantId();

    // Fetch the pending payment
    const { data: payment, error: paymentError } = await (supabase as any)
      .from("payments")
      .select("*")
      .eq("id", paymentId)
      .eq("user_id", user.user.id)
      .eq("status", "pending")
      .eq("fee_type", "installment")
      .single();

    if (paymentError || !payment) {
      return { success: false, error: "Pending payment not found" };
    }

    const stripe = getStripe();
    const portalUrl =
      process.env.NEXT_PUBLIC_PORTAL_URL || "http://localhost:3001";

    const session = await stripe.checkout.sessions.create(
      {
        mode: "payment",
        customer_email: user.user.email || undefined,
        line_items: getInstallment2LineItems(getTenantName()),
        metadata: {
          application_id: payment.application_id || "",
          payment_id: paymentId,
          payment_option: "split",
          tuition_method: "full_payment",
          installment_number: "2",
          user_id: user.user.id,
          tenant_id: user.tenantId || tenantId,
        },
        success_url: `${portalUrl}/student/payments?paid=true`,
        cancel_url: `${portalUrl}/student/payments?canceled=true`,
        payment_intent_data: {
          metadata: {
            application_id: payment.application_id || "",
            payment_option: "split",
            installment_number: "2",
          },
        },
      },
      {
        idempotencyKey: `checkout_installment2_${paymentId}`,
      }
    );

    // Update the pending payment with the checkout session ID
    await (supabase as any)
      .from("payments")
      .update({ stripe_checkout_session_id: session.id })
      .eq("id", paymentId);

    revalidatePath("/student/payments");

    return { success: true, checkoutUrl: session.url || undefined };
  } catch (err) {
    console.error("createInstallmentCheckout error:", err);
    return { success: false, error: "An unexpected error occurred" };
  }
}
