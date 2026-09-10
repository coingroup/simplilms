"use server";

import { revalidatePath } from "next/cache";
import { createServerClient, getUser } from "@simplilms/auth/server";
import { getStripe } from "../lib/stripe";

// ============================================================
// Types
// ============================================================

export interface ConnectAccountStatus {
  isConnected: boolean;
  accountId: string | null;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  detailsSubmitted: boolean;
}

// ============================================================
// Queries
// ============================================================

export async function getConnectAccountStatus(
  instructorId: string
): Promise<ConnectAccountStatus> {
  const supabase = await createServerClient();
  const { data: profile } = await (supabase as any)
    .from("profiles")
    .select("stripe_connect_id")
    .eq("id", instructorId)
    .single();

  if (!profile?.stripe_connect_id) {
    return {
      isConnected: false,
      accountId: null,
      chargesEnabled: false,
      payoutsEnabled: false,
      detailsSubmitted: false,
    };
  }

  try {
    const stripe = getStripe();
    const account = await stripe.accounts.retrieve(profile.stripe_connect_id);
    return {
      isConnected: true,
      accountId: profile.stripe_connect_id,
      chargesEnabled: account.charges_enabled || false,
      payoutsEnabled: account.payouts_enabled || false,
      detailsSubmitted: account.details_submitted || false,
    };
  } catch {
    return {
      isConnected: true,
      accountId: profile.stripe_connect_id,
      chargesEnabled: false,
      payoutsEnabled: false,
      detailsSubmitted: false,
    };
  }
}

// ============================================================
// Mutations
// ============================================================

export async function createConnectOnboardingLink(): Promise<{
  success: boolean;
  url?: string;
  error?: string;
}> {
  try {
    const { user, error: authError } = await getUser();
    if (authError || !user) return { success: false, error: "Unauthorized" };

    if (!["teacher_paid", "super_admin"].includes(user.role)) {
      return { success: false, error: "Only paid instructors can connect Stripe" };
    }

    const stripe = getStripe();
    const supabase = await createServerClient();

    // Check if instructor already has a Connect account
    const { data: profile } = await (supabase as any)
      .from("profiles")
      .select("stripe_connect_id, email, first_name, last_name")
      .eq("id", user.user.id)
      .single();

    let accountId = profile?.stripe_connect_id;

    if (!accountId) {
      // Create a new Connect account
      const account = await stripe.accounts.create({
        type: "express",
        email: profile?.email || user.user.email,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        business_profile: {
          name: `${profile?.first_name || ""} ${profile?.last_name || ""}`.trim() || undefined,
        },
      });

      accountId = account.id;

      // Save the account ID to the profile
      await (supabase as any)
        .from("profiles")
        .update({ stripe_connect_id: accountId })
        .eq("id", user.user.id);
    }

    // Create onboarding link
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${appUrl}/teacher/earnings`,
      return_url: `${appUrl}/teacher/earnings`,
      type: "account_onboarding",
    });

    revalidatePath("/teacher/earnings");
    return { success: true, url: accountLink.url };
  } catch (err) {
    console.error("createConnectOnboardingLink error:", err);
    return { success: false, error: "Failed to create onboarding link" };
  }
}

export async function createConnectDashboardLink(): Promise<{
  success: boolean;
  url?: string;
  error?: string;
}> {
  try {
    const { user, error: authError } = await getUser();
    if (authError || !user) return { success: false, error: "Unauthorized" };

    if (!["teacher_paid", "super_admin"].includes(user.role)) {
      return { success: false, error: "Only paid instructors can access Stripe dashboard" };
    }

    const supabase = await createServerClient();
    const { data: profile } = await (supabase as any)
      .from("profiles")
      .select("stripe_connect_id")
      .eq("id", user.user.id)
      .single();

    if (!profile?.stripe_connect_id) {
      return { success: false, error: "No Stripe account connected" };
    }

    const stripe = getStripe();
    const loginLink = await stripe.accounts.createLoginLink(
      profile.stripe_connect_id
    );

    return { success: true, url: loginLink.url };
  } catch (err) {
    console.error("createConnectDashboardLink error:", err);
    return { success: false, error: "Failed to create dashboard link" };
  }
}
