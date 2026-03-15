import React from "react";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";

// ─── Data ─────────────────────────────────────────────────────────────────────

const steps = [
  {
    number: "01",
    title: "Upload your file",
    description:
      "Drag and drop images, PDFs, videos, or any document. ApproveFlow stores it securely and generates a shareable review link instantly.",
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <polyline points="16 16 12 12 8 16" />
        <line x1="12" y1="12" x2="12" y2="21" />
        <path d="M20.39 18.39A5 5 0 0018 9h-1.26A8 8 0 103 16.3" />
      </svg>
    ),
    color: "from-violet-600 to-indigo-600",
    glow: "bg-violet-600/20",
  },
  {
    number: "02",
    title: "Client reviews online",
    description:
      "Share the secure link by email or message. No accounts, no installs. The client opens the link and sees your file on any device.",
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
    color: "from-indigo-600 to-blue-600",
    glow: "bg-indigo-600/20",
  },
  {
    number: "03",
    title: "Approve or request changes",
    description:
      "Client clicks Approve or leaves feedback. You get notified instantly. Every interaction is logged with timestamps for your records.",
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
    color: "from-emerald-600 to-teal-600",
    glow: "bg-emerald-600/20",
  },
] as const;

// ─── Step card ────────────────────────────────────────────────────────────────

function StepCard({
  step,
  index,
}: {
  step: (typeof steps)[number];
  index: number;
}) {
  return (
    <div className="relative flex flex-col gap-5">
      {/* Icon circle */}
      <div className="relative w-fit">
        <div
          className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-lg text-white`}
        >
          {step.icon}
        </div>
        {/* Glow */}
        <div
          className={`absolute inset-0 ${step.glow} rounded-2xl blur-xl -z-10`}
          aria-hidden="true"
        />
        {/* Step number badge */}
        <div className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-[#06060f] border border-white/10 flex items-center justify-center text-[10px] font-bold text-white/60">
          {index + 1}
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-2">
        <p className="text-xs font-mono text-white/30 tracking-wider">
          {step.number}
        </p>
        <h3 className="text-lg font-semibold text-white/90">{step.title}</h3>
        <p className="text-sm text-white/50 leading-relaxed">
          {step.description}
        </p>
      </div>
    </div>
  );
}

// ─── Section ──────────────────────────────────────────────────────────────────

export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="relative py-24 lg:py-32 overflow-hidden"
      aria-labelledby="how-it-works-heading"
    >
      {/* Subtle gradient backdrop */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-violet-900/[0.07] rounded-full blur-3xl" />
      </div>

      <Container>
        {/* Header */}
        <div className="flex flex-col items-center text-center gap-4 mb-16 lg:mb-20">
          <Badge variant="brand" dot>
            How it works
          </Badge>
          <h2
            id="how-it-works-heading"
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight text-balance"
          >
            Three steps to{" "}
            <span className="gradient-text">clean approvals</span>
          </h2>
          <p className="text-base sm:text-lg text-white/50 max-w-xl leading-relaxed">
            From upload to approval in minutes. No setup required for your
            client — they just click, review, and respond.
          </p>
        </div>

        {/* Steps grid */}
        <div className="relative grid md:grid-cols-3 gap-10 lg:gap-16">
          {/* Connecting line (desktop only) */}
          <div
            className="absolute top-7 left-[calc(16.66%+2rem)] right-[calc(16.66%+2rem)] h-px hidden md:block"
            style={{
              background:
                "linear-gradient(90deg, rgba(124,58,237,0.4) 0%, rgba(99,102,241,0.4) 50%, rgba(16,185,129,0.4) 100%)",
            }}
            aria-hidden="true"
          />

          {steps.map((step, i) => (
            <StepCard key={step.number} step={step} index={i} />
          ))}
        </div>

        {/* Bottom note */}
        <p className="text-center text-sm text-white/30 mt-14">
          Clients never need to create an account. Ever.
        </p>
      </Container>
    </section>
  );
}
