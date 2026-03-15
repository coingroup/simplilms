"use server";

import { stripe } from "../lib/stripe";
import { createServerClient } from "@simplilms/auth/server";

// ============================================================
// Create Stripe Identity Verification Session
// ============================================================

/**
 * Create a Stripe Identity verification session for a prospect.
 * Returns the client secret needed to open the embedded verification modal.
 */
export async function createIdentitySession(
  applicationId: string,
  prospectId: string
): Promise<{
  success: boolean;
  clientSecret?: string;
  sessionId?: string;
  error?: string;
}> {
  try {
    const verificationSession =
      await stripe.identity.verificationSessions.create({
        type: "document",
        options: {
          document: {
            require_matching_selfie: true,
          },
        },
        metadata: {
          application_id: applicationId,
          prospect_id: prospectId,
          platform: "simplilms",
        },
      });

    // Update application with session ID
    const supabase = await createServerClient();
    await (supabase as any)
      .from("applications")
      .update({
        stripe_identity_session_id: verificationSession.id,
        stripe_identity_status: verificationSession.status,
      })
      .eq("id", applicationId);

    return {
      success: true,
      clientSecret: verificationSession.client_secret!,
      sessionId: verificationSession.id,
    };
  } catch (err: any) {
    console.error("createIdentitySession error:", err);
    return {
      success: false,
      error: err.message || "Failed to create verification session",
    };
  }
}

// ============================================================
// Get Identity Verification Status
// ============================================================

/**
 * Check the current status of a Stripe Identity verification session.
 */
export async function getIdentityStatus(sessionId: string): Promise<{
  success: boolean;
  status?: string;
  lastError?: string;
  error?: string;
}> {
  try {
    const session = await stripe.identity.verificationSessions.retrieve(
      sessionId
    );

    return {
      success: true,
      status: session.status,
      lastError:
        session.last_error?.code ||
        undefined,
    };
  } catch (err: any) {
    console.error("getIdentityStatus error:", err);
    return {
      success: false,
      error: err.message || "Failed to check verification status",
    };
  }
}
