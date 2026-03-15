import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@simplilms/core/lib/stripe";
import { getTenantId } from "@simplilms/core/lib/tenant";
import { createClient } from "@supabase/supabase-js";
import { detectCitizenshipMismatch } from "@simplilms/core/lib/citizenship";

const WEBHOOK_SECRET = process.env.STRIPE_IDENTITY_WEBHOOK_SECRET;

// Use a service role client for webhook processing (no auth context)
function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Missing Supabase service role credentials");
  }
  return createClient(url, key);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("stripe-signature");

    if (!signature || !WEBHOOK_SECRET) {
      return NextResponse.json(
        { error: "Missing webhook signature or secret" },
        { status: 400 }
      );
    }

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, WEBHOOK_SECRET);
    } catch (err: any) {
      console.error("Webhook signature verification failed:", err.message);
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 400 }
      );
    }

    const supabase = getServiceClient();
    const tenantId = getTenantId();

    // Idempotency check — skip if already processed
    const { data: existingEvent } = await supabase
      .from("webhook_events")
      .select("id")
      .eq("event_id", event.id)
      .single();

    if (existingEvent) {
      return NextResponse.json({ received: true, status: "already_processed" });
    }

    // Store webhook event for idempotency
    await supabase.from("webhook_events").insert({
      tenant_id: tenantId,
      provider: "stripe",
      event_id: event.id,
      event_type: event.type,
      payload: event.data.object as any,
      processed: false,
    });

    // Handle verification events
    switch (event.type) {
      case "identity.verification_session.verified": {
        const session = event.data
          .object as Stripe.Identity.VerificationSession;
        await handleVerified(supabase, session, tenantId);
        break;
      }
      case "identity.verification_session.requires_input": {
        const session = event.data
          .object as Stripe.Identity.VerificationSession;
        await handleRequiresInput(supabase, session);
        break;
      }
      case "identity.verification_session.canceled": {
        const session = event.data
          .object as Stripe.Identity.VerificationSession;
        await handleCanceled(supabase, session);
        break;
      }
      default:
        console.log(`Unhandled identity event: ${event.type}`);
    }

    // Mark as processed
    await supabase
      .from("webhook_events")
      .update({ processed: true, processed_at: new Date().toISOString() })
      .eq("event_id", event.id);

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Stripe Identity webhook error:", err);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}

// ============================================================
// Verification Handlers
// ============================================================

async function handleVerified(
  supabase: any,
  session: Stripe.Identity.VerificationSession,
  tenantId: string
) {
  const applicationId = session.metadata?.application_id;
  if (!applicationId) {
    console.error("No application_id in verification session metadata");
    return;
  }

  // Update application with verified status
  const { data: app, error: updateError } = await supabase
    .from("applications")
    .update({
      stripe_identity_status: "verified",
      stripe_identity_verified_at: new Date().toISOString(),
    })
    .eq("id", applicationId)
    .select("citizenship_status, citizenship_document_type")
    .single();

  if (updateError) {
    console.error("Failed to update application:", updateError);
    return;
  }

  // Cross-reference declared citizenship with document type
  if (app) {
    const mismatch = detectCitizenshipMismatch(
      app.citizenship_status,
      app.citizenship_document_type
    );

    if (mismatch.hasMismatch) {
      // Log the mismatch for admin review
      await supabase.from("audit_log").insert({
        tenant_id: tenantId,
        action: "citizenship_mismatch_detected",
        entity_type: "application",
        entity_id: applicationId,
        new_values: {
          mismatch_reason: mismatch.reason,
          severity: mismatch.severity,
          declared_status: app.citizenship_status,
          document_type: app.citizenship_document_type,
        },
      });
    }
  }
}

async function handleRequiresInput(
  supabase: any,
  session: Stripe.Identity.VerificationSession
) {
  const applicationId = session.metadata?.application_id;
  if (!applicationId) return;

  await supabase
    .from("applications")
    .update({
      stripe_identity_status: "requires_input",
    })
    .eq("id", applicationId);
}

async function handleCanceled(
  supabase: any,
  session: Stripe.Identity.VerificationSession
) {
  const applicationId = session.metadata?.application_id;
  if (!applicationId) return;

  await supabase
    .from("applications")
    .update({
      stripe_identity_status: "canceled",
    })
    .eq("id", applicationId);
}
