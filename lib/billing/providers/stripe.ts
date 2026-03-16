/**
 * Stripe provider — all Stripe-specific API calls live here.
 */

import Stripe from "stripe";

function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not configured");
  return new Stripe(key, { apiVersion: "2026-02-25.clover" });
}

// ─── Plan → Price ID mapping ──────────────────────────────────────────────────

export const STRIPE_PRICE_IDS: Record<string, string> = {
  pro: process.env.STRIPE_PRICE_PRO ?? "",
  studio: process.env.STRIPE_PRICE_STUDIO ?? "",
};

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CreateCheckoutParams {
  payerEmail: string;
  planCode: "pro" | "studio";
  userId: string;
  successUrl: string;
  cancelUrl: string;
}

// ─── API calls ────────────────────────────────────────────────────────────────

/**
 * Creates a Stripe Checkout Session for a subscription and returns the URL.
 * The userId and planCode are stored in metadata so the webhook can identify
 * the user without relying on sessions.
 */
export async function createStripeCheckout(
  params: CreateCheckoutParams,
): Promise<{ checkoutUrl: string; sessionId: string }> {
  const stripe = getStripe();
  const priceId = STRIPE_PRICE_IDS[params.planCode];
  if (!priceId) {
    throw new Error(`No Stripe price ID configured for plan: ${params.planCode}`);
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    customer_email: params.payerEmail,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    metadata: {
      userId: params.userId,
      planCode: params.planCode,
    },
    subscription_data: {
      metadata: {
        userId: params.userId,
        planCode: params.planCode,
      },
    },
  });

  if (!session.url) throw new Error("Stripe did not return a checkout URL");
  return { checkoutUrl: session.url, sessionId: session.id };
}

/**
 * Constructs and verifies a Stripe webhook event.
 * Throws if the signature is invalid.
 */
export function constructStripeEvent(
  rawBody: string,
  signature: string,
  secret: string,
): Stripe.Event {
  const stripe = getStripe();
  return stripe.webhooks.constructEvent(rawBody, signature, secret);
}

/**
 * Maps a Stripe subscription status to our internal status.
 */
export function mapStripeStatusToInternal(
  status: Stripe.Subscription.Status,
): "ACTIVE" | "PENDING" | "PAST_DUE" | "CANCELLED" | "INACTIVE" {
  switch (status) {
    case "active":
    case "trialing":
      return "ACTIVE";
    case "incomplete":
    case "incomplete_expired":
      return "PENDING";
    case "past_due":
    case "unpaid":
      return "PAST_DUE";
    case "canceled":
      return "CANCELLED";
    default:
      return "INACTIVE";
  }
}
