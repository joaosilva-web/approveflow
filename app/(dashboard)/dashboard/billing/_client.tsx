"use client";

import { useState } from "react";
import Link from "next/link";
import type { SubscriptionInfo } from "@/lib/billing/subscription";
import type { PlanDefinition } from "@/lib/billing/plans";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Props {
  subscription: SubscriptionInfo;
  plans: PlanDefinition[];
  statusParam?: string;
  userEmail: string;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusBanner({ status }: { status: string }) {
  if (status === "pending") {
    return (
      <div className="flex items-center gap-3 p-4 rounded-xl bg-yellow-500/[0.08] border border-yellow-500/20 text-yellow-300">
        <svg
          className="shrink-0"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
        <p className="text-sm">
          <span className="font-semibold">Payment processing.</span> We&apos;ll
          activate your plan once confirmed by Mercado Pago.
        </p>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="flex items-center gap-3 p-4 rounded-xl bg-green-500/[0.08] border border-green-500/20 text-green-300">
        <svg
          className="shrink-0"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
        <p className="text-sm">
          <span className="font-semibold">Payment received!</span> Your plan is
          now active. Welcome to the next tier!
        </p>
      </div>
    );
  }

  if (status === "failure") {
    return (
      <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/[0.08] border border-red-500/20 text-red-300">
        <svg
          className="shrink-0"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="15" y1="9" x2="9" y2="15" />
          <line x1="9" y1="9" x2="15" y2="15" />
        </svg>
        <p className="text-sm">
          <span className="font-semibold">Payment was not completed.</span> You
          remain on the Free plan. Please try again.
        </p>
      </div>
    );
  }

  return null;
}

function StatusDot({
  status,
}: {
  status: SubscriptionInfo["subscriptionStatus"];
}) {
  if (status === "ACTIVE")
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-green-400 font-medium">
        <span className="size-1.5 rounded-full bg-green-400" />
        Active
      </span>
    );
  if (status === "PENDING")
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-yellow-400 font-medium">
        <span className="size-1.5 rounded-full bg-yellow-400" />
        Pending
      </span>
    );
  if (status === "PAST_DUE")
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-orange-400 font-medium">
        <span className="size-1.5 rounded-full bg-orange-400" />
        Past due
      </span>
    );
  if (status === "CANCELLED")
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-red-400 font-medium">
        <span className="size-1.5 rounded-full bg-red-400" />
        Cancelled
      </span>
    );
  // Free / no subscription
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-white/40 font-medium">
      <span className="size-1.5 rounded-full bg-white/30" />
      Free
    </span>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function BillingPageClient({
  subscription,
  plans,
  statusParam,
  userEmail,
}: Props) {
  const [loadingPlan, setLoadingPlan] = useState<"pro" | "studio" | "test" | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  // ── Checkout handler ────────────────────────────────────────────────────────
  const handleUpgrade = async (planCode: "pro" | "studio" | "test") => {
    setLoadingPlan(planCode);
    setApiError(null);
    try {
      const res = await fetch("/api/billing/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planCode }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Failed to start checkout.");
      }
      window.location.href = data.checkoutUrl as string;
    } catch (e) {
      setApiError(
        e instanceof Error
          ? e.message
          : "Failed to start checkout. Please try again.",
      );
      setLoadingPlan(null);
    }
  };

  // ── Usage calculations ──────────────────────────────────────────────────────
  const usedProjects = subscription.projectCount;
  const maxProjects = subscription.maxProjects;
  const usagePercent =
    maxProjects !== null
      ? Math.min(100, Math.round((usedProjects / maxProjects) * 100))
      : 0;

  const periodEndStr = subscription.currentPeriodEnd
    ? new Date(subscription.currentPeriodEnd).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : null;

  return (
    <div className="px-6 py-10 max-w-5xl mx-auto space-y-10">
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-bold text-white">Billing &amp; Plans</h1>
        <p className="mt-1 text-sm text-white/50">
          Manage your subscription and usage.{" "}
          <span className="text-white/30">{userEmail}</span>
        </p>
      </div>

      {/* ── Status banner ───────────────────────────────────────────────────── */}
      {statusParam && <StatusBanner status={statusParam} />}

      {/* ── API error ───────────────────────────────────────────────────────── */}
      {apiError && (
        <div className="p-4 rounded-xl bg-red-500/[0.08] border border-red-500/20 text-red-300 text-sm">
          {apiError}
        </div>
      )}

      {/* ── Current plan card ───────────────────────────────────────────────── */}
      <section>
        <h2 className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-3">
          Current plan
        </h2>
        <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-lg font-semibold text-white">
                {subscription.planName}
              </p>
              <StatusDot status={subscription.subscriptionStatus} />
            </div>
            {subscription.priceBrl > 0 && (
              <div className="text-right">
                <p className="text-xl font-bold text-white">
                  R${subscription.priceBrl.toFixed(2).replace(".", ",")}
                </p>
                <p className="text-xs text-white/40">per month</p>
              </div>
            )}
          </div>

          {/* Usage bar */}
          {maxProjects !== null && (
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-white/50">
                <span>Projects</span>
                <span>
                  {usedProjects} / {maxProjects}
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    usagePercent >= 100
                      ? "bg-red-500"
                      : usagePercent >= 80
                        ? "bg-yellow-500"
                        : "bg-violet-500"
                  }`}
                  style={{ width: `${usagePercent}%` }}
                />
              </div>
            </div>
          )}

          {maxProjects === null && (
            <p className="text-xs text-white/40">
              Unlimited projects &mdash; no restrictions.
            </p>
          )}

          {/* Period end */}
          {periodEndStr && (
            <p className="text-xs text-white/40">
              {subscription.cancelAtPeriodEnd
                ? `Cancels on ${periodEndStr}`
                : `Renews on ${periodEndStr}`}
            </p>
          )}
        </div>
      </section>

      {/* ── Plan cards ──────────────────────────────────────────────────────── */}
      <section>
        <h2 className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-3">
          Plans
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {plans.map((plan) => {
            const isCurrent = plan.code === subscription.planCode;
            const isPro = plan.code === "pro";
            const isLoading = loadingPlan === plan.code;

            return (
              <div
                key={plan.code}
                className={`relative flex flex-col rounded-2xl p-6 border transition-colors ${
                  isPro
                    ? "border-violet-500/40 bg-violet-500/[0.04]"
                    : "border-white/[0.08] bg-white/[0.02]"
                }`}
              >
                {plan.code === "test" && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 rounded-full bg-yellow-600 px-3 py-0.5 text-xs font-semibold text-white">
                    🧪 Test mode
                  </span>
                )}
                {isPro && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 rounded-full bg-violet-600 px-3 py-0.5 text-xs font-semibold text-white">
                    <svg
                      width="10"
                      height="10"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                    Most popular
                  </span>
                )}

                {/* Plan info */}
                <div className="mb-4">
                  <p className="text-sm font-semibold text-white">
                    {plan.name}
                  </p>
                  <p className="text-xs text-white/40 mt-0.5">
                    {plan.description}
                  </p>
                </div>

                {/* Price */}
                <div className="mb-5">
                  {plan.priceBrl === 0 ? (
                    <p className="text-2xl font-bold text-white">Free</p>
                  ) : (
                    <div>
                      <span className="text-2xl font-bold text-white">
                        R${plan.priceBrl.toFixed(2).replace(".", ",")}
                      </span>
                      <span className="text-xs text-white/40">/month</span>
                    </div>
                  )}
                </div>

                {/* Features */}
                <ul className="flex-1 space-y-2 mb-6">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-2 text-xs text-white/60"
                    >
                      <svg
                        className="shrink-0 mt-0.5 text-violet-400"
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* CTA button */}
                {isCurrent ? (
                  <button
                    disabled
                    className="w-full rounded-xl py-2.5 text-sm font-semibold text-white/30 bg-white/[0.04] border border-white/[0.06] cursor-default"
                  >
                    Current plan
                  </button>
                ) : plan.code === "free" ? (
                  <Link
                    href="/dashboard/billing"
                    className="w-full rounded-xl py-2.5 text-sm font-semibold text-center text-violet-400 border border-violet-500/30 hover:bg-violet-500/10 transition-colors block"
                  >
                    Downgrade
                  </Link>
                ) : (
                  <button
                    onClick={() => handleUpgrade(plan.code as "pro" | "studio" | "test")}
                    disabled={loadingPlan !== null}
                    className={`w-full rounded-xl py-2.5 text-sm font-semibold transition-colors ${
                      isPro
                        ? "bg-violet-600 hover:bg-violet-500 text-white disabled:opacity-60"
                        : "bg-white/[0.06] hover:bg-white/[0.1] text-white border border-white/[0.1] disabled:opacity-60"
                    }`}
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg
                          className="animate-spin"
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          aria-hidden="true"
                        >
                          <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                        </svg>
                        Redirecting…
                      </span>
                    ) : (
                      `Upgrade to ${plan.name}`
                    )}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
