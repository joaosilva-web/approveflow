"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import type { SubscriptionInfo } from "@/features/billing/subscription";
import type { PlanDefinition } from "@/features/billing/plans";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { useLang } from "@/features/marketing/context/lang-context";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Props {
  subscription: SubscriptionInfo;
  plans: PlanDefinition[];
  statusParam?: string;
  userEmail: string;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusBanner({ status }: { status: string }) {
  const { lang } = useLang();
  const L = {
    pt: {
      pendingTitle: "Pagamento em processamento.",
      pendingDesc: "Ativaremos seu plano assim que for confirmado pelo Stripe.",
      successTitle: "Pagamento recebido!",
      successDesc: "Seu plano agora está ativo. Bem-vindo ao novo nível!",
      failureTitle: "Pagamento não foi concluído.",
      failureDesc: "Você permanece no plano Free. Tente novamente.",
    },
    en: {
      pendingTitle: "Payment processing.",
      pendingDesc: "We'll activate your plan once confirmed by Stripe.",
      successTitle: "Payment received!",
      successDesc: "Your plan is now active. Welcome to the next tier!",
      failureTitle: "Payment was not completed.",
      failureDesc: "You remain on the Free plan. Please try again.",
    },
  } as const;

  const t = (L as any)[lang ?? "pt"];

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
          <span className="font-semibold">{t.pendingTitle}</span> {t.pendingDesc}
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
          <span className="font-semibold">{t.successTitle}</span> {t.successDesc}
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
          <span className="font-semibold">{t.failureTitle}</span> {t.failureDesc}
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
  const { lang } = useLang();
  const statusLabels: Record<string, string> = {
    ACTIVE: (lang === "pt" ? "Ativo" : "Active"),
    PENDING: (lang === "pt" ? "Pendente" : "Pending"),
    PAST_DUE: (lang === "pt" ? "Atrasado" : "Past due"),
    CANCELLED: (lang === "pt" ? "Cancelado" : "Cancelled"),
    FREE: (lang === "pt" ? "Free" : "Free"),
  };
  if (status === "ACTIVE")
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-green-400 font-medium">
        <span className="size-1.5 rounded-full bg-green-400" />
        {statusLabels["ACTIVE"]}
      </span>
    );
  if (status === "PENDING")
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-yellow-400 font-medium">
        <span className="size-1.5 rounded-full bg-yellow-400" />
        {statusLabels["PENDING"]}
      </span>
    );
  if (status === "PAST_DUE")
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-orange-400 font-medium">
        <span className="size-1.5 rounded-full bg-orange-400" />
        {statusLabels["PAST_DUE"]}
      </span>
    );
  if (status === "CANCELLED")
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-red-400 font-medium">
        <span className="size-1.5 rounded-full bg-red-400" />
        {statusLabels["CANCELLED"]}
      </span>
    );
  // Free / no subscription
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-white/40 font-medium">
      <span className="size-1.5 rounded-full bg-white/30" />
      {statusLabels["FREE"]}
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
  const [loadingPlan, setLoadingPlan] = useState<"pro" | "studio" | null>(null);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showCheckoutConfirm, setShowCheckoutConfirm] = useState(false);
  const [pendingPlan, setPendingPlan] = useState<"pro" | "studio" | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const autoStartedRef = useRef(false);
  const autoConfirmRef = useRef(false);

  // ── Pending-payment polling ─────────────────────────────────────────────────
  // If the user returns from Stripe with ?status=pending, poll until the webhook
  // updates the subscription to ACTIVE, then flip the banner to "success".
  const router = useRouter();
  const { lang } = useLang();
  const L = {
    pt: {
      billingHeading: "Faturamento e Planos",
      subtitleManage: "Gerencie sua assinatura e uso.",
      currentPlanHeading: "Plano atual",
      perMonth: "/mês",
      projectsLabel: "Projetos",
      unlimitedProjects: "Projetos ilimitados — sem restrições.",
      plansHeading: "Planos",
      mostPopular: "Mais popular",
      freeLabel: "Grátis",
      currentPlanButton: "Plano atual",
      cancelling: "Cancelando…",
      cancelsAtPeriodEnd: "Cancela no fim do período",
      downgrade: "Rebaixar",
      redirecting: "Redirecionando…",
      proceedToPayment: "Ir para pagamento",
      chooseLater: "Escolher depois",
      downgradeTitle: "Cancelar assinatura?",
      downgradeDesc:
        "Seu plano permanecerá ativo até o fim do período de cobrança e então voltará ao plano Free. Esta ação não pode ser desfeita.",
      yesDowngrade: "Sim, cancelar",
      keepPlan: "Manter plano",
      statusActive: "Ativo",
      statusPending: "Pendente",
      statusPastDue: "Atrasado",
      statusCancelled: "Cancelado",
      statusFree: "Free",
      upgradeTitle: (plan: string) => `Assinar ${plan}`,
      upgradeDesc: (plan: string) => `Você será redirecionado ao Stripe para concluir o pagamento do plano ${plan}.`,
    },
    en: {
      billingHeading: "Billing & Plans",
      subtitleManage: "Manage your subscription and usage.",
      currentPlanHeading: "Current plan",
      perMonth: "/month",
      projectsLabel: "Projects",
      unlimitedProjects: "Unlimited projects — no restrictions.",
      plansHeading: "Plans",
      mostPopular: "Most popular",
      freeLabel: "Free",
      currentPlanButton: "Current plan",
      cancelling: "Cancelling…",
      cancelsAtPeriodEnd: "Cancels at period end",
      downgrade: "Downgrade",
      redirecting: "Redirecting…",
      proceedToPayment: "Proceed to payment",
      chooseLater: "Choose later",
      downgradeTitle: "Downgrade to Free?",
      downgradeDesc:
        "Your plan will stay active until the end of the billing period, then revert to Free. This action cannot be undone.",
      yesDowngrade: "Yes, downgrade",
      keepPlan: "Keep plan",
      statusActive: "Active",
      statusPending: "Pending",
      statusPastDue: "Past due",
      statusCancelled: "Cancelled",
      statusFree: "Free",
      upgradeTitle: (plan: string) => `Upgrade to ${plan}`,
      upgradeDesc: (plan: string) => `You will be redirected to Stripe to complete payment for the ${plan} plan.`,
    },
  } as const;

  const t = (L as any)[lang ?? "pt"];
  const pollCountRef = useRef(0);
  const initialStatus =
    statusParam === "pending" && subscription.subscriptionStatus === "ACTIVE"
      ? "success"
      : (statusParam ?? "");
  const [displayStatus, setDisplayStatus] = useState(initialStatus);

  useEffect(() => {
    if (displayStatus !== "pending") return;
    const MAX_POLLS = 20; // ~60 s
    const id = setInterval(() => {
      pollCountRef.current += 1;
      if (pollCountRef.current >= MAX_POLLS) {
        clearInterval(id);
        return;
      }
      router.refresh();
    }, 3000);
    return () => clearInterval(id);
  }, [displayStatus, router]);

  useEffect(() => {
    if (
      displayStatus === "pending" &&
      subscription.subscriptionStatus === "ACTIVE"
    ) {
      setDisplayStatus("success");
    }
  }, [subscription.subscriptionStatus, displayStatus]);

  // ── Downgrade / cancel handler ──────────────────────────────────────────────
  const handleCancel = () => setShowCancelDialog(true);

  const confirmCancel = async () => {
    setCancelLoading(true);
    setApiError(null);
    try {
      const res = await fetch("/api/billing/cancel-subscription", {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to cancel.");
      setShowCancelDialog(false);
      router.refresh();
    } catch (e) {
      setApiError(
        e instanceof Error ? e.message : "Failed to cancel. Please try again.",
      );
    } finally {
      setCancelLoading(false);
    }
  };

  // ── Checkout handler ────────────────────────────────────────────────────────
  // Open confirmation dialog rather than starting checkout immediately.
  const handleUpgrade = async (planCode: "pro" | "studio") => {
    setPendingPlan(planCode);
    setShowCheckoutConfirm(true);
  };

  const confirmUpgrade = async () => {
    if (!pendingPlan) return;
    setCheckoutLoading(true);
    setApiError(null);
    setLoadingPlan(pendingPlan);
    try {
      const res = await fetch("/api/billing/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planCode: pendingPlan }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Failed to start checkout.");
      }
      // Close dialog and redirect to Stripe
      setShowCheckoutConfirm(false);
      window.location.href = data.checkoutUrl as string;
    } catch (e) {
      setApiError(
        e instanceof Error
          ? e.message
          : "Failed to start checkout. Please try again.",
      );
      setLoadingPlan(null);
    } finally {
      setCheckoutLoading(false);
    }
  };

  // ── Auto-start checkout when arriving with ?plan=pro|studio (from pricing CTA)
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (autoStartedRef.current) return;
    const params = new URLSearchParams(window.location.search);
    const plan = params.get("plan");
    if (plan === "pro" || plan === "studio") {
      // Only auto-start if it's not the current plan
      if (plan !== subscription.planCode) {
        autoStartedRef.current = true;
        setPendingPlan(plan as "pro" | "studio");
        setShowCheckoutConfirm(true);
        // auto-confirm once after a short delay to preserve UX for marketing CTAs
        if (!autoConfirmRef.current) {
          autoConfirmRef.current = true;
          setTimeout(() => {
            confirmUpgrade();
          }, 700);
        }
      }
    }
  }, [subscription.planCode]);

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

  // PT translations for plan short descriptions and features
  const planDescriptionPtMap: Record<string, string> = {
    free: "Perfeito para começar com um ou dois clientes.",
    pro: "Para freelancers e estúdios em crescimento",
    studio: "Para equipes e agências",
  };

  const featurePtMap: Record<string, string> = {
    "5 GB storage": "5 GB de armazenamento",
    "50 GB storage": "50 GB de armazenamento",
    "200 GB storage": "200 GB de armazenamento",
    "Up to 3 active projects": "Até 3 projetos ativos",
    "Unlimited active projects": "Projetos ilimitados",
    "Unlimited review links": "Links de revisão ilimitados",
    "Unlimited projects": "Projetos ilimitados",
    "Guest uploads (no client login needed)": "Uploads de clientes (sem login)",
    "Pinned comments on designs": "Comentários fixados em designs",
    "Everything in Free": "Tudo do Free",
    "Everything in Pro": "Tudo do Pro",
    "Priority support": "Suporte prioritário",
    "Priority integrations": "Integrações prioritárias",
    "Custom branding": "Branding personalizado",
    "Team members (coming soon)": "Membros da equipe (em breve)",
    "Advanced workflow (coming soon)": "Fluxo avançado (em breve)",
    "API access (coming soon)": "Acesso à API (em breve)",
  };

  return (
    <>
      <ConfirmDialog
        open={showCheckoutConfirm}
        title={pendingPlan ? t.upgradeTitle(pendingPlan.toUpperCase()) : (lang === "pt" ? "Assinar" : "Upgrade")}
        description={pendingPlan ? t.upgradeDesc(pendingPlan.toUpperCase()) : ""}
        confirmLabel={t.proceedToPayment}
        cancelLabel={t.chooseLater}
        loading={checkoutLoading}
        onConfirm={confirmUpgrade}
        onCancel={() => {
          setShowCheckoutConfirm(false);
          setPendingPlan(null);
          setLoadingPlan(null);
        }}
      />
      <ConfirmDialog
        open={showCancelDialog}
        title={t.downgradeTitle}
        description={t.downgradeDesc}
        confirmLabel={t.yesDowngrade}
        cancelLabel={t.keepPlan}
        destructive
        loading={cancelLoading}
        onConfirm={confirmCancel}
        onCancel={() => setShowCancelDialog(false)}
      />
      <div className="px-6 py-10 max-w-5xl mx-auto space-y-10">
        {/* ── Header ──────────────────────────────────────────────────────────── */}
        <div>
          <h1 className="text-2xl font-bold text-white">{t.billingHeading}</h1>
          <p className="mt-1 text-sm text-white/50">
            {t.subtitleManage} {" "}
            <span className="text-white/30">{userEmail}</span>
          </p>
        </div>

        {/* ── Status banner ───────────────────────────────────────────────────── */}
        {displayStatus && <StatusBanner status={displayStatus} />}

        {/* ── API error ───────────────────────────────────────────────────────── */}
        {apiError && (
          <div className="p-4 rounded-xl bg-red-500/[0.08] border border-red-500/20 text-red-300 text-sm">
            {apiError}
          </div>
        )}

        {/* ── Current plan card ───────────────────────────────────────────────── */}
        <section>
          <h2 className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-3">
            {t.currentPlanHeading}
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
                  <p className="text-xs text-white/40">{t.perMonth}</p>
                </div>
              )}
            </div>

            {/* Usage bar */}
            {maxProjects !== null && (
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-white/50">
                  <span>{t.projectsLabel}</span>
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
              <p className="text-xs text-white/40">{t.unlimitedProjects}</p>
            )}

            {/* Period end */}
            {periodEndStr && (
              <p className="text-xs text-white/40">
                {subscription.cancelAtPeriodEnd
                  ? (lang === "pt" ? `Cancela em ${periodEndStr}` : `Cancels on ${periodEndStr}`)
                  : (lang === "pt" ? `Renova em ${periodEndStr}` : `Renews on ${periodEndStr}`)}
              </p>
            )}
          </div>
        </section>

        {/* ── Plan cards ──────────────────────────────────────────────────────── */}
        <section>
            <h2 className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-3">
            {t.plansHeading}
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
                      {t.mostPopular}
                    </span>
                  )}

                  {/* Plan info */}
                  <div className="mb-4">
                    <p className="text-sm font-semibold text-white">
                      {plan.name}
                    </p>
                    <p className="text-xs text-white/40 mt-0.5">
                      {lang === "pt"
                        ? planDescriptionPtMap[plan.code] ?? plan.description
                        : plan.description}
                    </p>
                  </div>

                  {/* Price */}
                  <div className="mb-5">
                    {plan.priceBrl === 0 ? (
                      <p className="text-2xl font-bold text-white">{t.freeLabel}</p>
                    ) : (
                      <div>
                        <span className="text-2xl font-bold text-white">
                          R${plan.priceBrl.toFixed(2).replace(".", ",")}
                        </span>
                        <span className="text-xs text-white/40">{t.perMonth}</span>
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
                        {lang === "pt" ? featurePtMap[feature] ?? feature : feature}
                      </li>
                    ))}
                  </ul>

                  {/* CTA button */}
                  {isCurrent ? (
                    <button
                      disabled
                      className="w-full rounded-xl py-2.5 text-sm font-semibold text-white/30 bg-white/[0.04] border border-white/[0.06] cursor-default"
                    >
                      {t.currentPlanButton}
                    </button>
                  ) : plan.code === "free" ? (
                    <button
                      onClick={handleCancel}
                      disabled={cancelLoading || subscription.cancelAtPeriodEnd}
                      className="w-full rounded-xl py-2.5 text-sm font-semibold text-center text-violet-400 border border-violet-500/30 hover:bg-violet-500/10 transition-colors disabled:opacity-50 disabled:cursor-default"
                    >
                      {cancelLoading
                        ? t.cancelling
                        : subscription.cancelAtPeriodEnd
                          ? t.cancelsAtPeriodEnd
                          : t.downgrade}
                    </button>
                  ) : (
                    <button
                      onClick={() =>
                        handleUpgrade(plan.code as "pro" | "studio")
                      }
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
                          {t.redirecting}
                        </span>
                      ) : (
                        lang === "pt" ? t.upgradeTitle(plan.name) : `Upgrade to ${plan.name}`
                      )}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </>
  );
}
