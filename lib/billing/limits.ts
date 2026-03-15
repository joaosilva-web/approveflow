import { prisma } from "@/lib/prisma";
import { PLANS } from "@/lib/billing/plans";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface LimitCheck {
  allowed: boolean;
  reason?: string;
  /** When true, the frontend should present an upgrade CTA alongside the error. */
  upgrade?: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Returns the plan code the user is EFFECTIVELY entitled to.
 *
 * Business rule: only ACTIVE subscriptions grant paid features.
 * Any other status (PENDING, PAST_DUE, CANCELLED, INACTIVE, missing) → "free".
 */
export async function getUserPlanCode(userId: string): Promise<string> {
  const sub = await prisma.subscription.findUnique({
    where: { userId },
    select: { status: true, plan: { select: { code: true } } },
  });

  if (!sub || sub.status !== "ACTIVE") return "free";
  return sub.plan.code;
}

/**
 * Returns true if the user may create another project under their current plan.
 */
export async function canCreateProject(userId: string): Promise<LimitCheck> {
  const planCode = await getUserPlanCode(userId);
  const plan = PLANS[planCode] ?? PLANS.free;

  if (plan.maxProjects === null) return { allowed: true };

  const projectCount = await prisma.project.count({ where: { userId } });

  if (projectCount >= plan.maxProjects) {
    return {
      allowed: false,
      upgrade: true,
      reason: `You've reached the limit of ${plan.maxProjects} active projects on the Free plan. Upgrade to Pro for unlimited reviews.`,
    };
  }

  return { allowed: true };
}
