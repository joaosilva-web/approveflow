import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { createMPCheckout } from "@/lib/billing/providers/mercadopago";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  planCode: z.enum(["pro", "studio", "test"]),
});

/**
 * POST /api/billing/create-checkout
 * Body: { planCode: "pro" | "studio" }
 *
 * Creates a Mercado Pago subscription checkout and returns the redirect URL.
 * Also upserts the subscription record to PENDING status so we can track it.
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

  // Create the MP checkout
  let checkoutUrl: string;
  let subscriptionId: string;

  try {
    const result = await createMPCheckout({
      payerEmail: session.user.email,
      payerName: session.user.name ?? undefined,
      planCode: parsed.data.planCode,
      userId: session.user.id,
      // MP redirects here after checkout — we handle status display via query param
      backUrl: `${appUrl}/dashboard/billing?status=pending`,
    });
    checkoutUrl = result.checkoutUrl;
    subscriptionId = result.subscriptionId;
  } catch (err) {
    console.error("[billing/create-checkout] Mercado Pago error:", err);
    return NextResponse.json(
      { error: "Failed to create checkout. Please try again." },
      { status: 502 },
    );
  }

  // Resolve the target plan ID
  const targetPlan = await prisma.plan.findUnique({
    where: { code: parsed.data.planCode },
    select: { id: true },
  });
  if (!targetPlan) {
    return NextResponse.json({ error: "Plan not found" }, { status: 404 });
  }

  // Upsert subscription as PENDING while awaiting webhook confirmation.
  // Business rule: user keeps Free limits until payment is confirmed (ACTIVE).
  await prisma.subscription.upsert({
    where: { userId: session.user.id },
    update: {
      planId: targetPlan.id,
      status: "PENDING",
      provider: "mercadopago",
      providerSubscriptionId: subscriptionId,
      cancelAtPeriodEnd: false,
    },
    create: {
      userId: session.user.id,
      planId: targetPlan.id,
      status: "PENDING",
      provider: "mercadopago",
      providerSubscriptionId: subscriptionId,
    },
  });

  return NextResponse.json({ checkoutUrl });
}
