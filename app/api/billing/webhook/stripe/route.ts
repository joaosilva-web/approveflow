import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  constructStripeEvent,
  mapStripeStatusToInternal,
} from "@/lib/billing/providers/stripe";
import type { Prisma } from "@prisma/client";
import type Stripe from "stripe";

/**
 * POST /api/billing/webhook/stripe
 *
 * Receives Stripe webhook events.
 * - Every event is logged to BillingEvent (audit trail).
 * - Signature is always verified using STRIPE_WEBHOOK_SECRET.
 * - Processing is idempotent.
 */
export async function POST(req: NextRequest) {
  const signature = req.headers.get("stripe-signature") ?? "";
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("[webhook/stripe] STRIPE_WEBHOOK_SECRET is not configured");
    return NextResponse.json(
      { error: "Webhook not configured" },
      { status: 500 },
    );
  }

  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    event = constructStripeEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    console.warn("[webhook/stripe] Signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // ── Log every event (immutable audit trail) ─────────────────────────────────
  await prisma.billingEvent.create({
    data: {
      provider: "stripe",
      eventType: event.type,
      externalId: event.id,
      payloadJson: event as unknown as Prisma.InputJsonValue,
    },
  });

  // ── Handle relevant events ──────────────────────────────────────────────────
  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }
      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(sub);
        break;
      }
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(sub);
        break;
      }
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentFailed(invoice);
        break;
      }
      default:
        // Acknowledge unknown events without processing
        break;
    }
  } catch (err) {
    console.error(`[webhook/stripe] Error handling ${event.type}:`, err);
    // Return 200 so Stripe doesn't keep retrying for processing errors
    return NextResponse.json({ received: true, error: "Processing error" });
  }

  return NextResponse.json({ received: true });
}

// ─── Event handlers ───────────────────────────────────────────────────────────

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId;
  const planCode = session.metadata?.planCode;
  const stripeSubscriptionId = session.subscription as string | null;

  if (!userId || !planCode || !stripeSubscriptionId) {
    console.warn(
      "[webhook/stripe] checkout.session.completed missing metadata",
      {
        userId,
        planCode,
        stripeSubscriptionId,
      },
    );
    return;
  }

  const targetPlan = await prisma.plan.findUnique({
    where: { code: planCode },
    select: { id: true },
  });
  if (!targetPlan) {
    console.error(`[webhook/stripe] Plan not found in DB: ${planCode}`);
    return;
  }

  // Update to ACTIVE and store the real subscription ID (replaces session ID)
  await prisma.subscription.upsert({
    where: { userId },
    update: {
      planId: targetPlan.id,
      status: "ACTIVE",
      provider: "stripe",
      providerSubscriptionId: stripeSubscriptionId,
      cancelAtPeriodEnd: false,
      currentPeriodStart: new Date(),
    },
    create: {
      userId,
      planId: targetPlan.id,
      status: "ACTIVE",
      provider: "stripe",
      providerSubscriptionId: stripeSubscriptionId,
    },
  });
}

async function handleSubscriptionUpdated(sub: Stripe.Subscription) {
  const userId = sub.metadata?.userId;
  if (!userId) {
    console.warn(
      "[webhook/stripe] subscription.updated missing userId metadata",
    );
    return;
  }

  const internalStatus = mapStripeStatusToInternal(sub.status);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const subAny = sub as any;
  const periodEnd = subAny.current_period_end
    ? new Date(subAny.current_period_end * 1000)
    : undefined;

  await prisma.subscription
    .update({
      where: { userId },
      data: {
        status: internalStatus,
        providerSubscriptionId: sub.id,
        cancelAtPeriodEnd: sub.cancel_at_period_end,
        ...(periodEnd ? { currentPeriodEnd: periodEnd } : {}),
        ...(internalStatus === "ACTIVE" && subAny.current_period_start
          ? { currentPeriodStart: new Date(subAny.current_period_start * 1000) }
          : {}),
      },
    })
    .catch((err) => {
      // Subscription row may not exist yet if webhook fires before checkout handler
      console.warn(
        "[webhook/stripe] subscription.update failed (may be race):",
        err,
      );
    });
}

async function handleSubscriptionDeleted(sub: Stripe.Subscription) {
  const userId = sub.metadata?.userId;
  if (!userId) return;

  await prisma.subscription
    .update({
      where: { userId },
      data: {
        status: "CANCELLED",
        cancelAtPeriodEnd: false,
      },
    })
    .catch(() => {
      // Row may not exist
    });
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const invoiceAny = invoice as any;
  const subId =
    typeof invoiceAny.subscription === "string"
      ? invoiceAny.subscription
      : null;
  if (!subId) return;

  await prisma.subscription.updateMany({
    where: { providerSubscriptionId: subId },
    data: { status: "PAST_DUE" },
  });
}
