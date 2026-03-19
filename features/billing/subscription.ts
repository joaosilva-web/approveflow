import { prisma } from "@/lib/prisma";
import { PLANS } from "@/features/billing/plans";

// ─── Types ────────────────────────────────────────────────────────────────────

export type SubscriptionStatusValue =
  | "ACTIVE"
  | "PENDING"
  | "PAST_DUE"
  | "CANCELLED"
  | "INACTIVE";

export interface SubscriptionInfo {
  /** Effective plan code — what the user actually gets. Falls back to "free"
   *  for any non-ACTIVE state so limit enforcement is always safe. */
  planCode: string;
  /** Human-readable plan name for display. */
  planName: string;
  /** The raw DB status, used for UI messaging. */
  subscriptionStatus: SubscriptionStatusValue | null;
  /** The plan code in the subscription record (may differ from planCode when
   *  status is not ACTIVE, e.g. user is in PENDING checkout for Pro). */
  subscribedPlanCode: string;
  /** null = unlimited */
  maxProjects: number | null;
  /** How many projects the user currently has. */
  projectCount: number;
  /** ISO string of period end; null for free plan. */
  currentPeriodEnd: string | null;
  /** Whether the subscription will cancel at the end of the current period. */
  cancelAtPeriodEnd: boolean;
  /** Price of the effective plan in BRL. */
  priceBrl: number;
}

// ─── Query ────────────────────────────────────────────────────────────────────

/**
 * Source of truth for a user's billing state.
 * Safe to call from Server Components, API routes, and Server Actions.
 */
export async function getSubscriptionInfo(
  userId: string,
): Promise<SubscriptionInfo> {
  const [sub, projectCount] = await Promise.all([
    prisma.subscription.findUnique({
      where: { userId },
      include: {
        plan: { select: { code: true, name: true, priceBrl: true } },
      },
    }),
    prisma.project.count({ where: { userId } }),
  ]);

  const rawStatus = (sub?.status ?? null) as SubscriptionStatusValue | null;
  const subscribedPlanCode = sub?.plan?.code ?? "free";

  // Effective plan: only granted when ACTIVE
  const planCode =
    rawStatus === "ACTIVE" && subscribedPlanCode !== "free"
      ? subscribedPlanCode
      : "free";

  const planDef = PLANS[planCode] ?? PLANS.free;

  return {
    planCode,
    planName: planDef.name,
    subscriptionStatus: rawStatus,
    subscribedPlanCode,
    maxProjects: planDef.maxProjects,
    projectCount,
    currentPeriodEnd: sub?.currentPeriodEnd?.toISOString() ?? null,
    cancelAtPeriodEnd: sub?.cancelAtPeriodEnd ?? false,
    priceBrl: planDef.priceBrl,
  };
}
