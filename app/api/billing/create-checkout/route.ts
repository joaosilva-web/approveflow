import { auth } from "@/auth";
import { prisma } from "@/lib/prisma/client";
import { createStripeCheckout } from "@/features/billing/providers/stripe";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  planCode: z.enum(["pro", "studio"]),
});

/**
 * POST /api/billing/create-checkout
 * Body: { planCode: "pro" | "studio" }
 *
 * Creates a Stripe Checkout Session and returns the redirect URL.
 * The subscription is upserted as PENDING; the webhook marks it ACTIVE.
 */
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id || !session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid plan code" },
      { status: 400 },
    );
  }

  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ??
    "http://localhost:3000";

  // Resolve the target plan ID first so we fail fast if plan is missing
  const targetPlan = await prisma.plan.findUnique({
    where: { code: parsed.data.planCode },
    select: { id: true },
  });
  if (!targetPlan) {
    return NextResponse.json({ error: "Plan not found" }, { status: 404 });
  }

  let checkoutUrl: string;
  let sessionId: string;

  try {
    const result = await createStripeCheckout({
      payerEmail: session.user.email,
      planCode: parsed.data.planCode,
      userId: session.user.id,
      successUrl: `${appUrl}/dashboard/billing?status=pending`,
      cancelUrl: `${appUrl}/dashboard/billing?status=cancelled`,
    });
    checkoutUrl = result.checkoutUrl;
    sessionId = result.sessionId;
  } catch (err) {
    console.error("[billing/create-checkout] Stripe error:", err);
    const message = err instanceof Error ? err.message : "Failed to create checkout.";
    return NextResponse.json(
      { error: `${message} Please contact support or check Stripe configuration.` },
      { status: 502 },
    );
  }

  // Upsert subscription as PENDING while awaiting webhook confirmation.
  // Business rule: user keeps Free limits until payment is confirmed (ACTIVE).
  await prisma.subscription.upsert({
    where: { userId: session.user.id },
    update: {
      planId: targetPlan.id,
      status: "PENDING",
      provider: "stripe",
      providerSubscriptionId: sessionId,
      cancelAtPeriodEnd: false,
    },
    create: {
      userId: session.user.id,
      planId: targetPlan.id,
      status: "PENDING",
      provider: "stripe",
      providerSubscriptionId: sessionId,
    },
  });

  return NextResponse.json({ checkoutUrl });
}
