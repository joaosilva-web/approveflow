// ─── Plan definitions ─────────────────────────────────────────────────────────
// These are the source of truth for plan limits and UI copy.
// Must stay in sync with the Plan rows seeded in the database.

export interface PlanDefinition {
  code: string;
  name: string;
  priceBrl: number;
  maxProjects: number | null; // null = unlimited
  features: string[];
  description: string;
}

export const PLANS: Record<string, PlanDefinition> = {
  free: {
    code: "free",
    name: "Free",
    priceBrl: 0,
    maxProjects: 3,
    features: [
      "Up to 3 active projects",
      "Unlimited review links",
      "Pinned comments on designs",
      "Guest uploads (no client login needed)",
    ],
    description: "For individuals getting started",
  },
  pro: {
    code: "pro",
    name: "Pro",
    priceBrl: 49.9,
    maxProjects: null,
    features: [
      "Unlimited active projects",
      "Everything in Free",
      "Priority support",
      "Custom branding (coming soon)",
    ],
    description: "For freelancers and growing studios",
  },
  studio: {
    code: "studio",
    name: "Studio",
    priceBrl: 99.9,
    maxProjects: null,
    features: [
      "Everything in Pro",
      "Team members (coming soon)",
      "Advanced workflow (coming soon)",
      "API access (coming soon)",
    ],
    description: "For teams and agencies",
  },
};

// Test plan — only visible when NEXT_PUBLIC_MP_TEST_MODE=true
export const TEST_PLAN: PlanDefinition = {
  code: "test",
  name: "Test (R$0,50)",
  priceBrl: 1.0,
  maxProjects: null,
  features: ["Payment flow test", "Same as Pro during testing"],
  description: "Internal test — do not share",
};

export const FREE_PLAN_CODE = "free";
export const FREE_PROJECT_LIMIT = 3;
