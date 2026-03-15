import Stripe from "stripe";

let _stripe: Stripe | null = null;

/**
 * Lazily initialized Stripe client singleton.
 * This avoids throwing at module load time during `next build`
 * when STRIPE_SECRET_KEY is not set.
 */
export function getStripe(): Stripe {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY environment variable is not set");
    }
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2026-02-25.clover",
      typescript: true,
    });
  }
  return _stripe;
}

/**
 * Convenience alias for backward compatibility.
 * Use `getStripe()` for the lazily initialized client.
 */
export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    return (getStripe() as any)[prop];
  },
});
