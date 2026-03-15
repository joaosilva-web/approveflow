import { createHmac } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getMPPreapproval } from "@/lib/billing/providers/mercadopago";
import { mapMPStatusToInternal } from "@/lib/billing/subscription";
import type { Prisma } from "@prisma/client";

// ─── Signature verification ───────────────────────────────────────────────────

/**
 * Verifies a Mercado Pago webhook signature using timing-safe comparison.
 *
 * MP signature format in x-signature header: "ts=<timestamp>,v1=<hmac>"
 * Manifest: "id:<data.id>;request-id:<x-request-id>;ts:<ts>;"
 */
function verifyMPSignature(
  requestId: string,
  dataId: string,
  ts: string,
  v1: string,
  secret: string,
): boolean {
  const manifest = `id:${dataId};request-id:${requestId};ts:${ts};`;
  const expected = createHmac("sha256", secret).update(manifest).digest("hex");

  // Constant-time comparison to prevent timing attacks
  if (Buffer.byteLength(expected) !== Buffer.byteLength(v1)) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= expected.charCodeAt(i) ^ v1.charCodeAt(i);
  }
  return diff === 0;
}

// ─── Handler ──────────────────────────────────────────────────────────────────

/**
 * POST /api/billing/webhook/mercadopago
 *
 * Receives Mercado Pago webhook notifications.
 * Key design decisions:
 * - Every event is logged to BillingEvent before any processing (audit trail).
 * - We re-fetch the preapproval from MP to confirm status (never trust payload alone).
 * - Processing is idempotent: upsert/update operations are safe to run twice.
 * - Signature is verified when MERCADO_PAGO_WEBHOOK_SECRET is configured.
 */
export async function POST(req: NextRequest) {
  const xSignature = req.headers.get("x-signature") ?? "";
  const xRequestId = req.headers.get("x-request-id") ?? "";

  const rawBody = await req.text();

  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(rawBody) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const eventType = (payload.type as string) ?? "";
  const dataId =
    ((payload.data as Record<string, unknown>)?.id as string) ?? "";

  // ── Signature verification ──────────────────────────────────────────────────
  const webhookSecret = process.env.MERCADO_PAGO_WEBHOOK_SECRET;
  if (webhookSecret) {
    const tsMatch = xSignature.match(/ts=([^,]+)/);
    const v1Match = xSignature.match(/v1=([^,]+)/);

    if (!tsMatch || !v1Match) {
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    const isValid = verifyMPSignature(
      xRequestId,
      dataId,
      tsMatch[1],
      v1Match[1],
      webhookSecret,
    );

    if (!isValid) {
      console.warn("[webhook/mp] Invalid signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }
  }

  // ── Log every event (immutable audit trail) ─────────────────────────────────
  await prisma.billingEvent.create({
    data: {
      provider: "mercadopago",
      eventType,
      externalId: dataId || null,
      payloadJson: payload as unknown as Prisma.InputJsonValue,
    },
  });

  // ── Only process preapproval lifecycle events ───────────────────────────────
  if (eventType !== "subscription_preapproval") {
    // Acknowledge other event types without processing
    return NextResponse.json({ received: true });
  }

  if (!dataId) {
    console.warn("[webhook/mp] subscription_preapproval event missing data.id");
    return NextResponse.json({ received: true });
  }

  // ── Re-fetch from MP to confirm current status ──────────────────────────────
  const preapproval = await getMPPreapproval(dataId);
  if (!preapproval) {
    console.error(`[webhook/mp] Could not fetch preapproval ${dataId} from MP`);
    return NextResponse.json({ received: true });
  }

  // ── Parse external_reference: "userId:planCode" ─────────────────────────────
  const parts = (preapproval.external_reference ?? "").split(":");
  const userId = parts[0];
  const planCode = parts[1];

  if (!userId || !planCode) {
    console.error(
      `[webhook/mp] Invalid external_reference: "${preapproval.external_reference}"`,
    );
    return NextResponse.json({ received: true });
  }

  const internalStatus = mapMPStatusToInternal(preapproval.status);

  // ── Build update payload ────────────────────────────────────────────────────
  const periodEnd =
    internalStatus === "ACTIVE" && preapproval.next_payment_date
      ? new Date(preapproval.next_payment_date)
      : undefined;

  await prisma.subscription.update({
    where: { userId },
    data: {
      status: internalStatus,
      providerSubscriptionId: dataId,
      ...(internalStatus === "ACTIVE"
        ? {
            currentPeriodStart: new Date(),
            currentPeriodEnd: periodEnd,
          }
        : {}),
      // When cancelled, ensure the flag is cleared
      ...(internalStatus === "CANCELLED" ? { cancelAtPeriodEnd: false } : {}),
    },
  });

  // Back-fill userId on the event we just logged (helpful for queries)
  await prisma.billingEvent.updateMany({
    where: { externalId: dataId, userId: null },
    data: { userId },
  });

  console.log(
    `[webhook/mp] user=${userId} plan=${planCode} status=${preapproval.status} → ${internalStatus}`,
  );

  return NextResponse.json({ received: true });
}
