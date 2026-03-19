"use client";

import React from "react";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { useLang } from "@/lib/lang-context";

const copy = {
  pt: {
    eyebrow: "Comece hoje",
    h2a: "Chega de correr atrás de aprovações.",
    h2highlight: "Entregue com confiança.",
    p: "Junte-se a centenas de freelancers que substituíram threads confusas de WhatsApp por fluxos de aprovação limpos e profissionais.",
    cta1: "Criar meu primeiro projeto",
    cta2: "Ver demonstração",
    trust: "Plano gratuito disponível. Sem cartão de crédito.",
  },
  en: {
    eyebrow: "Get started today",
    h2a: "Stop chasing approvals.",
    h2highlight: "Start delivering with confidence.",
    p: "Join hundreds of freelancers who replaced messy WhatsApp threads with clean, professional approval workflows.",
    cta1: "Create your first project",
    cta2: "View live demo",
    trust: "Free forever plan available. No credit card required.",
  },
} as const;

export default function CTA() {
  const { lang } = useLang();
  const t = copy[lang];
  return (
    <section
      className="relative py-24 lg:py-32 overflow-hidden"
      aria-labelledby="cta-heading"
    >
      <Container>
        <div className="relative rounded-3xl overflow-hidden">
          {/* Background gradient */}
          <div
            className="absolute inset-0 bg-gradient-to-br from-violet-900/60 via-indigo-900/40 to-[#0d0d1e]"
            aria-hidden="true"
          />

          {/* Grid texture overlay */}
          <div
            className="absolute inset-0 bg-dot-grid opacity-20"
            aria-hidden="true"
          />

          {/* Orbs */}
          <div
            className="absolute -top-20 -right-20 w-64 h-64 bg-violet-600/30 rounded-full blur-3xl pointer-events-none"
            aria-hidden="true"
          />
          <div
            className="absolute -bottom-10 -left-10 w-48 h-48 bg-indigo-600/25 rounded-full blur-3xl pointer-events-none"
            aria-hidden="true"
          />

          {/* Border */}
          <div
            className="absolute inset-0 rounded-3xl border border-violet-500/20 pointer-events-none"
            aria-hidden="true"
          />

          {/* Content */}
          <div className="relative flex flex-col items-center text-center gap-6 px-6 py-20 lg:py-24">
            {/* Eyebrow */}
            <p className="text-xs font-semibold text-violet-400/80 uppercase tracking-[0.2em]">
              {t.eyebrow}
            </p>

            <h2
              id="cta-heading"
              className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-extrabold text-white tracking-tight leading-tight text-balance max-w-3xl"
            >
              {t.h2a}
              <br />
              <span className="gradient-text">{t.h2highlight}</span>
            </h2>

            <p className="text-base sm:text-lg text-white/55 max-w-lg leading-relaxed">
              {t.p}
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center justify-center gap-3.5 mt-2">
              <Button size="lg" variant="primary" href="/login">
                {t.cta1}
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="ml-1"
                  aria-hidden="true"
                >
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </Button>
              <Button size="lg" variant="ghost" href="#how-it-works">
                {t.cta2}
              </Button>
            </div>

            {/* Trust line */}
            <p className="text-xs text-white/30 mt-1">{t.trust}</p>
          </div>
        </div>
      </Container>
    </section>
  );
}
