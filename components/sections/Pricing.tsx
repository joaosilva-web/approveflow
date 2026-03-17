"use client";

import React from "react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Container } from "@/components/ui/Container";
import { cn } from "@/lib/utils";
import { useLang, type Lang } from "@/lib/lang-context";

// ─── Bilingual copy ───────────────────────────────────────────────────────────

const copy = {
  pt: {
    badge: "Planos",
    h2a: "Preços simples e ",
    h2highlight: "transparentes",
    p: "Comece grátis e cresça conforme precisar. Sem cobranças surpresa, sem taxas ocultas. Cancele quando quiser.",
    footerNote:
      "Todos os planos incluem criptografia SSL, armazenamento seguro de arquivos e SLA de 99,9% de uptime.",
  },
  en: {
    badge: "Pricing",
    h2a: "Simple, transparent ",
    h2highlight: "pricing",
    p: "Start free and scale as you grow. No surprise charges, no hidden fees. Cancel anytime.",
    footerNote:
      "All plans include SSL encryption, secure file storage, and 99.9% uptime SLA.",
  },
} as const;

// ─── Plan data ────────────────────────────────────────────────────────────────

type Plan = {
  name: string;
  price: string;
  period: string;
  description: string;
  features: readonly string[];
  cta: string;
  highlight: boolean;
  badge?: string;
};

function getPlans(lang: Lang): Plan[] {
  if (lang === "pt") {
    return [
      {
        name: "Free",
        price: "R$0",
        period: "para sempre",
        description: "Perfeito para começar com um ou dois clientes.",
        features: [
          "3 projetos ativos",
          "5 GB de armazenamento",
          "Links de revisão públicos",
          "Fluxo de aprovação",
          "Histórico de versões (3 versões)",
          "Notificações por e-mail",
        ],
        cta: "Começar grátis",
        highlight: false,
      },
      {
        name: "Pro",
        price: "R$29",
        period: "/ mês",
        description:
          "Para freelancers ativos com vários projetos em andamento.",
        features: [
          "Projetos ilimitados",
          "50 GB de armazenamento",
          "Expiração de link personalizada",
          "Histórico de versões ilimitado",
          "Links protegidos por senha",
          "Notificações por e-mail",
        ],
        cta: "Assinar Pro",
        highlight: true,
        badge: "Mais Popular",
      },
      {
        name: "Studio",
        price: "R$59",
        period: "/ mês",
        description:
          "Para equipes e agências que gerenciam projetos de clientes em escala.",
        features: [
          "Tudo do Pro",
          "200 GB de armazenamento",
          "Suporte dedicado",
        ],
        cta: "Assinar Studio",
        highlight: false,
      },
    ];
  }
  return [
    {
      name: "Free",
      price: "R$0",
      period: "forever",
      description: "Perfect for getting started with one or two clients.",
      features: [
        "3 active projects",
        "5 GB storage",
        "Public review links",
        "Approval flow",
        "Version history (3 versions)",
        "Email notifications",
      ],
      cta: "Start for free",
      highlight: false,
    },
    {
      name: "Pro",
      price: "R$29",
      period: "/ month",
      description: "For active freelancers with multiple ongoing projects.",
      features: [
        "Unlimited projects",
        "50 GB storage",
        "Custom link expiration",
        "Unlimited version history",
        "Password-protected links",
        "Email notifications",
      ],
      cta: "Get Pro",
      highlight: true,
      badge: "Most Popular",
    },
    {
      name: "Studio",
      price: "R$59",
      period: "/ month",
      description: "For teams and agencies managing client projects at scale.",
      features: [
        "Everything in Pro",
        "200 GB storage",
        "Dedicated support",
      ],
      cta: "Get Studio",
      highlight: false,
    },
  ];
}

// ─── Check icon ───────────────────────────────────────────────────────────────

function CheckIcon({ highlighted }: { highlighted: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={highlighted ? "text-violet-400" : "text-emerald-500"}
      aria-hidden="true"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

// ─── Plan card ────────────────────────────────────────────────────────────────

function PlanCard({ plan }: { plan: Plan }) {
  return (
    <article
      className={cn(
        "relative flex flex-col rounded-2xl p-7 transition-all duration-300",
        plan.highlight
          ? "bg-gradient-to-b from-[#130d2a] to-[#0e0a22] border border-violet-500/30 shadow-2xl shadow-violet-900/20 scale-[1.02]"
          : "bg-[#0d0d1e] border border-white/[0.06] hover:border-white/[0.10]",
      )}
    >
      {/* Popular badge */}
      {plan.badge && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
          <Badge variant="brand" size="sm">
            {plan.badge}
          </Badge>
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <h3
          className={cn(
            "text-sm font-semibold uppercase tracking-widest mb-3",
            plan.highlight ? "text-violet-400" : "text-white/50",
          )}
        >
          {plan.name}
        </h3>

        <div className="flex items-end gap-1 mb-2">
          <span className="text-4xl font-extrabold text-white tracking-tight">
            {plan.price}
          </span>
          <span className="text-sm text-white/40 mb-1.5 ml-0.5">
            {plan.period}
          </span>
        </div>

        <p className="text-sm text-white/45 leading-relaxed">
          {plan.description}
        </p>
      </div>

      {/* CTA */}
      <Button
        variant={plan.highlight ? "primary" : "secondary"}
        fullWidth
        href="/login"
        className="mb-7"
      >
        {plan.cta}
      </Button>

      {/* Divider */}
      <div
        className={cn(
          "h-px mb-6",
          plan.highlight ? "bg-violet-500/20" : "bg-white/[0.06]",
        )}
        aria-hidden="true"
      />

      {/* Features list */}
      <ul
        className="flex flex-col gap-3.5 list-none"
        aria-label={`${plan.name} plan features`}
        role="list"
      >
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-center gap-2.5">
            <span className="shrink-0">
              <CheckIcon highlighted={plan.highlight} />
            </span>
            <span
              className={cn(
                "text-sm",
                plan.highlight ? "text-white/70" : "text-white/55",
              )}
            >
              {feature}
            </span>
          </li>
        ))}
      </ul>
    </article>
  );
}

// ─── Section ──────────────────────────────────────────────────────────────────

export default function Pricing() {
  const { lang } = useLang();
  const t = copy[lang];
  const plans = getPlans(lang);

  return (
    <section
      id="pricing"
      className="relative py-24 lg:py-32 overflow-hidden"
      aria-labelledby="pricing-heading"
    >
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-violet-900/[0.08] rounded-full blur-3xl" />
      </div>

      <Container>
        {/* Header */}
        <div className="flex flex-col items-center text-center gap-4 mb-14 lg:mb-18">
          <Badge variant="brand" dot>
            {t.badge}
          </Badge>
          <h2
            id="pricing-heading"
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight text-balance"
          >
            {t.h2a}
            <span className="gradient-text">{t.h2highlight}</span>
          </h2>
          <p className="text-base sm:text-lg text-white/50 max-w-xl leading-relaxed">
            {t.p}
          </p>
        </div>

        {/* Plans grid */}
        <div className="grid md:grid-cols-3 gap-5 lg:gap-6 items-center">
          {plans.map((plan) => (
            <PlanCard key={plan.name} plan={plan} />
          ))}
        </div>

        {/* Footer note */}
        <p className="text-center text-sm text-white/30 mt-10">
          {t.footerNote}
        </p>
      </Container>
    </section>
  );
}
