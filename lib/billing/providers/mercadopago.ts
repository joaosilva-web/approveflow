/**
 * Mercado Pago provider — all MP-specific API calls live here.
 *
 * To add Stripe later:
 *   1. Create lib/billing/providers/stripe.ts with the same shape.
 *   2. Switch the factory in create-checkout/route.ts.
 */

const MP_BASE_URL = "https://api.mercadopago.com";

function getAccessToken(): string {
  const token = process.env.MERCADO_PAGO_ACCESS_TOKEN;
  if (!token) throw new Error("MERCADO_PAGO_ACCESS_TOKEN is not configured");
  return token;
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CreatePreapprovalParams {
  payerEmail: string;
  /** Full name of the payer — split into first/last for MP's anti-fraud engine. */
  payerName?: string;
  planCode: "pro" | "studio";
  userId: string;
  /** Where MP redirects after the user completes / cancels checkout. */
  backUrl: string;
}

export interface MPPreapprovalResponse {
  id: string;
  /** URL to redirect the user to in order to complete checkout. */
  init_point: string;
  status: string;
  external_reference: string;
  /** ISO date of the next scheduled charge. Available once authorized. */
  next_payment_date?: string;
  auto_recurring?: {
    transaction_amount: number;
    currency_id: string;
    frequency: number;
    frequency_type: string;
  };
}

// ─── Plan config ──────────────────────────────────────────────────────────────

const PLAN_CONFIG = {
  pro: {
    amount: 49.9,
    reason: "ApproveFlow Pro",
    descriptor: "APPROVEFLOW PRO",
  },
  studio: {
    amount: 99.9,
    reason: "ApproveFlow Studio",
    descriptor: "APPROVEFLOW STUDIO",
  },
} as const;

// ─── API calls ────────────────────────────────────────────────────────────────

/**
 * Creates a Mercado Pago subscription (preapproval) and returns the checkout URL.
 *
 * The external_reference encodes `userId:planCode` so the webhook handler can
 * identify which user completed payment without relying on sessions.
 */
export async function createMPCheckout(
  params: CreatePreapprovalParams,
): Promise<{ checkoutUrl: string; subscriptionId: string }> {
  const token = getAccessToken();
  const config = PLAN_CONFIG[params.planCode];

  // Build payer object with name parts for better approval rates
  const nameParts = (params.payerName ?? "").trim().split(/\s+/);
  const payerFirstName = nameParts[0] ?? "";
  const payerLastName = nameParts.slice(1).join(" ") || payerFirstName;

  // Webhook notification URL — MP will POST status changes here
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "";
  const notificationUrl = appUrl
    ? `${appUrl}/api/billing/webhook/mercadopago`
    : undefined;

  const payload: Record<string, unknown> = {
    reason: config.reason,
    // Soft descriptor shown on the cardholder's statement (reduces chargebacks)
    statement_descriptor: config.descriptor,
    external_reference: `${params.userId}:${params.planCode}`,
    payer_email: params.payerEmail,
    back_url: params.backUrl,
    auto_recurring: {
      frequency: 1,
      frequency_type: "months",
      transaction_amount: config.amount,
      currency_id: "BRL",
    },
  };

  // Add payer name fields when available (improves fraud detection)
  if (payerFirstName) {
    payload.payer_first_name = payerFirstName;
    payload.payer_last_name = payerLastName;
  }

  // Add notification URL when app URL is configured
  if (notificationUrl) {
    payload.notification_url = notificationUrl;
  }

  const res = await fetch(`${MP_BASE_URL}/preapproval`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "Unknown error");
    throw new Error(
      `Mercado Pago checkout creation failed (${res.status}): ${errText}`,
    );
  }

  const data = (await res.json()) as MPPreapprovalResponse;
  return { checkoutUrl: data.init_point, subscriptionId: data.id };
}

/**
 * Fetches a preapproval record directly from MP.
 * Used by the webhook handler to confirm the current state instead of
 * trusting the incoming payload alone.
 */
export async function getMPPreapproval(
  subscriptionId: string,
): Promise<MPPreapprovalResponse | null> {
  const token = getAccessToken();

  const res = await fetch(`${MP_BASE_URL}/preapproval/${subscriptionId}`, {
    headers: { Authorization: `Bearer ${token}` },
    // Always fetch fresh — never use stale cache in billing code
    cache: "no-store",
  });

  if (!res.ok) return null;
  return res.json() as Promise<MPPreapprovalResponse>;
}
