// ─── Plan definitions ─────────────────────────────────────────────────────────
// These are the source of truth for plan limits and UI copy.
// Must stay in sync with the Plan rows seeded in the database.

export interface PlanDefinition {
  code: string;
  name: string;
  priceBrl: number;
  maxProjects: number | null; // null = unlimited
  maxVersionsPerProject: number | null; // null = unlimited
  maxStorageBytes: number | null; // null = unlimited
  features: string[];
  description: string;
}

export const PLANS: Record<string, PlanDefinition> = {
  free: {
    code: "free",
    name: "Free",
    priceBrl: 0,
    maxProjects: 3,
    maxVersionsPerProject: 3,
    maxStorageBytes: 5 * 1024 * 1024 * 1024, // 5 GB
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
    priceBrl: 29.9,
    maxProjects: null,
    maxVersionsPerProject: null,
    maxStorageBytes: 50 * 1024 * 1024 * 1024, // 50 GB
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
    priceBrl: 59.9,
    maxProjects: null,
    maxVersionsPerProject: null,
    maxStorageBytes: 200 * 1024 * 1024 * 1024, // 200 GB
    features: [
      "Everything in Pro",
      "Team members (coming soon)",
      "Advanced workflow (coming soon)",
      "API access (coming soon)",
    ],
    description: "For teams and agencies",
  },
};

export const FREE_PLAN_CODE = "free";
export const FREE_PROJECT_LIMIT = 3;
