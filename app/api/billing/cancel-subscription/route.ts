import { auth } from "@/auth";
import { prisma } from "@/lib/prisma/client";
import { cancelStripeSubscription } from "@/features/billing/providers/stripe";
import { NextResponse } from "next/server";

/**
 * POST /api/billing/cancel-subscription
 * Schedules the active subscription to cancel at period end.
 */
export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sub = await prisma.subscription.findUnique({
    where: { userId: session.user.id },
  });

  if (!sub || !sub.providerSubscriptionId) {
    return NextResponse.json(
      { error: "No active subscription found" },
      { status: 400 },
    );
  }

  if (sub.status !== "ACTIVE") {
    return NextResponse.json(
      { error: "Subscription is not active" },
      { status: 400 },
    );
  }

  try {
    await cancelStripeSubscription(sub.providerSubscriptionId);

    await prisma.subscription.update({
      where: { userId: session.user.id },
      data: { cancelAtPeriodEnd: true },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[billing/cancel-subscription] Error:", err);
    return NextResponse.json(
      { error: "Failed to cancel subscription" },
      { status: 500 },
    );
  }
}
