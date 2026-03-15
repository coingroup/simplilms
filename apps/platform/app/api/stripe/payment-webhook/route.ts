import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getStripe } from "@simplilms/core/lib/stripe";
import { getTenantId, buildTenantContext } from "@simplilms/core/lib/tenant";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

const TENANT_ID = getTenantId();

/**
 * Service-role Supabase client for webhook processing (no auth context).
 */
function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Missing Supabase service role credentials");
  }
  return createClient(url, key);
}

// ============================================================
// POST — Stripe Payment Webhook Handler
// ============================================================

export async function POST(request: NextRequest) {
  const webhookSecret = process.env.STRIPE_PAYMENT_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("STRIPE_PAYMENT_WEBHOOK_SECRET not configured");
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 }
    );
  }

  // 1. Read body and verify signature
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;
  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json(
      { error: "Invalid webhook signature" },
      { status: 400 }
    );
  }

  const supabase = getServiceClient();

  // 2. Idempotency check
  const { data: existingEvent } = await supabase
    .from("webhook_events")
    .select("id")
    .eq("event_id", event.id)
    .maybeSingle();

  if (existingEvent) {
    return NextResponse.json({ received: true, status: "already_processed" });
  }

  // 3. Store webhook event
  await supabase.from("webhook_events").insert({
    tenant_id: TENANT_ID,
    provider: "stripe",
    event_id: event.id,
    event_type: event.type,
    payload: event.data as any,
    processed: false,
  });

  // 4. Handle event
  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(
          supabase,
          event.data.object as Stripe.Checkout.Session
        );
        break;

      case "payment_intent.payment_failed":
        await handlePaymentFailed(
          supabase,
          event.data.object as Stripe.PaymentIntent
        );
        break;

      default:
        console.log(`Unhandled payment event type: ${event.type}`);
    }
  } catch (err) {
    console.error(`Error handling event ${event.type}:`, err);
    // Log to error_log table
    await supabase.from("error_log").insert({
      tenant_id: TENANT_ID,
      source: "stripe_payment_webhook",
      error_type: event.type,
      error_message: err instanceof Error ? err.message : String(err),
      stack_trace: err instanceof Error ? err.stack : undefined,
      context: { event_id: event.id },
    });
    return NextResponse.json(
      { error: "Error processing webhook" },
      { status: 500 }
    );
  }

  // 5. Mark as processed
  await supabase
    .from("webhook_events")
    .update({ processed: true, processed_at: new Date().toISOString() })
    .eq("event_id", event.id);

  return NextResponse.json({ received: true });
}

// ============================================================
// checkout.session.completed
// ============================================================

async function handleCheckoutCompleted(
  supabase: any,
  session: Stripe.Checkout.Session
) {
  const metadata = session.metadata || {};
  const applicationId = metadata.application_id;
  const paymentOption = metadata.payment_option as "full" | "split";
  const tuitionMethod = metadata.tuition_method as "full_payment" | "isa";
  const installmentNumber = metadata.installment_number;
  const userId = metadata.user_id;

  if (!applicationId || !userId) {
    console.error("Missing metadata in checkout session:", session.id);
    return;
  }

  // 1. Update payment record
  const paymentIntentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id;

  await supabase
    .from("payments")
    .update({
      status: "succeeded",
      paid_at: new Date().toISOString(),
      stripe_payment_intent_id: paymentIntentId,
      payment_method: session.payment_method_types?.[0] || "card",
    })
    .eq("stripe_checkout_session_id", session.id);

  // 2. Check if this is installment 2 of a split payment
  if (paymentOption === "split" && installmentNumber === "2") {
    await handleInstallment2Completed(supabase, applicationId, userId);
    return;
  }

  // 3. Create enrollment (for full payment or split installment 1)
  await createEnrollment(
    supabase,
    applicationId,
    userId,
    paymentOption,
    tuitionMethod
  );

  // 4. If split payment, create pending installment 2
  if (paymentOption === "split") {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30);

    await supabase.from("payments").insert({
      tenant_id: TENANT_ID,
      user_id: userId,
      application_id: applicationId,
      amount_cents: 115000, // $1,150
      currency: "usd",
      fee_type: "installment",
      status: "pending",
    });
  }

  // 5. Set temporary password and send credentials
  await provisionStudentCredentials(supabase, userId, applicationId);
}

// ============================================================
// Create Enrollment
// ============================================================

async function createEnrollment(
  supabase: any,
  applicationId: string,
  userId: string,
  paymentOption: "full" | "split",
  tuitionMethod: "full_payment" | "isa"
) {
  // Fetch application to get program_id
  const { data: application } = await supabase
    .from("applications")
    .select("program_id, tenant_id")
    .eq("id", applicationId)
    .single();

  if (!application) {
    console.error("Application not found for enrollment:", applicationId);
    return;
  }

  // Generate enrollment number via PostgreSQL function
  const { data: enrollmentNumber } = await supabase.rpc(
    "generate_enrollment_number"
  );

  const enrollmentStatus =
    paymentOption === "full" ? "active" : "payment_plan_active";

  // Create enrollment record
  const { error: enrollError } = await supabase.from("enrollments").insert({
    tenant_id: application.tenant_id || TENANT_ID,
    application_id: applicationId,
    user_id: userId,
    enrollment_number: enrollmentNumber || `EN-${Date.now()}`,
    program_id: application.program_id,
    status: enrollmentStatus,
    tuition_payment_method: tuitionMethod,
    enrolled_at: new Date().toISOString(),
  });

  if (enrollError) {
    console.error("Error creating enrollment:", enrollError);
    return;
  }

  // Update application status to enrolled
  await supabase
    .from("applications")
    .update({ status: "enrolled" })
    .eq("id", applicationId);

  // Audit log
  await supabase.from("audit_log").insert({
    tenant_id: application.tenant_id || TENANT_ID,
    actor_id: userId,
    action: "enrollment_created",
    entity_type: "enrollment",
    entity_id: applicationId,
    new_values: {
      enrollment_number: enrollmentNumber,
      status: enrollmentStatus,
      tuition_payment_method: tuitionMethod,
    },
  });
}

// ============================================================
// Handle Installment 2 Completed
// ============================================================

async function handleInstallment2Completed(
  supabase: any,
  applicationId: string,
  userId: string
) {
  // Update enrollment status from payment_plan_active to active
  const { error } = await supabase
    .from("enrollments")
    .update({ status: "active" })
    .eq("application_id", applicationId)
    .eq("user_id", userId);

  if (error) {
    console.error("Error updating enrollment for installment 2:", error);
  }

  // Audit log
  await supabase.from("audit_log").insert({
    tenant_id: TENANT_ID,
    actor_id: userId,
    action: "installment_2_completed",
    entity_type: "enrollment",
    entity_id: applicationId,
    new_values: { status: "active", installment: 2 },
  });

  // Fire n8n webhook for installment 2 confirmation
  const webhookUrl = process.env.N8N_WEBHOOK_ENROLLMENT_CONFIRMED;
  if (webhookUrl) {
    fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event: "installment_2_completed",
        application_id: applicationId,
        user_id: userId,
        tenant_context: buildTenantContext(),
      }),
    }).catch((err) =>
      console.error("Failed to fire installment 2 webhook:", err)
    );
  }
}

// ============================================================
// Provision Student Credentials
// ============================================================

async function provisionStudentCredentials(
  supabase: any,
  userId: string,
  applicationId: string
) {
  // Generate temporary password
  const tempPassword = crypto.randomBytes(12).toString("base64url");

  // Set password on the user account
  const { error: pwError } = await supabase.auth.admin.updateUserById(userId, {
    password: tempPassword,
  });

  if (pwError) {
    console.error("Error setting temporary password:", pwError);
    return;
  }

  // Fetch application for notification data
  const { data: application } = await supabase
    .from("applications")
    .select("first_name, last_name, email, phone, program_id")
    .eq("id", applicationId)
    .single();

  // Fire n8n webhook for enrollment confirmation + credentials
  const webhookUrl = process.env.N8N_WEBHOOK_ENROLLMENT_CONFIRMED;
  if (webhookUrl) {
    const portalUrl =
      process.env.NEXT_PUBLIC_PORTAL_URL || "http://localhost:3000";
    fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event: "enrollment_confirmed",
        application_id: applicationId,
        user_id: userId,
        first_name: application?.first_name,
        last_name: application?.last_name,
        email: application?.email,
        phone: application?.phone,
        program_id: application?.program_id,
        temp_password: tempPassword,
        login_url: `${portalUrl}/login`,
        tenant_context: buildTenantContext(),
      }),
    }).catch((err) =>
      console.error("Failed to fire enrollment webhook:", err)
    );
  }

  // Audit log
  await supabase.from("audit_log").insert({
    tenant_id: TENANT_ID,
    actor_id: userId,
    action: "student_credentials_provisioned",
    entity_type: "profile",
    entity_id: userId,
    new_values: { credentials_sent: true },
  });
}

// ============================================================
// payment_intent.payment_failed
// ============================================================

async function handlePaymentFailed(
  supabase: any,
  paymentIntent: Stripe.PaymentIntent
) {
  const metadata = paymentIntent.metadata || {};

  // Update payment record if we can match it
  if (paymentIntent.id) {
    await supabase
      .from("payments")
      .update({
        status: "failed",
        stripe_payment_intent_id: paymentIntent.id,
      })
      .eq("stripe_payment_intent_id", paymentIntent.id);
  }

  // Audit log
  await supabase.from("audit_log").insert({
    tenant_id: TENANT_ID,
    actor_id: metadata.user_id || null,
    action: "payment_failed",
    entity_type: "payment",
    entity_id: metadata.application_id || null,
    new_values: {
      payment_intent_id: paymentIntent.id,
      failure_message:
        paymentIntent.last_payment_error?.message || "Unknown error",
    },
  });

  // Fire n8n webhook for payment failure notification
  const webhookUrl = process.env.N8N_WEBHOOK_ENROLLMENT_CONFIRMED;
  if (webhookUrl) {
    fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event: "payment_failed",
        application_id: metadata.application_id,
        payment_intent_id: paymentIntent.id,
        failure_message:
          paymentIntent.last_payment_error?.message || "Unknown error",
        tenant_context: buildTenantContext(),
      }),
    }).catch((err) =>
      console.error("Failed to fire payment failure webhook:", err)
    );
  }
}
