import React from "react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Container } from "@/components/ui/Container";

// ─── App mockup card ──────────────────────────────────────────────────────────

function AppMockup() {
  return (
    <div className="relative">
      {/* Glow behind card */}
      <div
        className="absolute -inset-8 bg-violet-600/20 rounded-full blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      {/* Floating decoration card */}
      <div
        className="absolute -top-5 -right-4 z-20 flex items-center gap-2 px-3 py-2 rounded-xl bg-[#111122] border border-white/10 shadow-xl shadow-black/40"
        aria-hidden="true"
      >
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-xs text-white/70 font-medium">Approved</span>
      </div>

      {/* Main mockup */}
      <div className="relative rounded-2xl border border-white/[0.08] bg-[#0d0d1e] overflow-hidden shadow-2xl shadow-black/50">
        {/* Title bar */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.06] bg-[#111122]">
          <div className="flex gap-1.5" aria-hidden="true">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/60" />
          </div>
          <div className="flex-1 text-center">
            <span className="text-[11px] text-white/35 font-mono">
              review.approveflow.com/r/8f4K2jLm
            </span>
          </div>
          <Badge variant="brand" size="sm">
            v2
          </Badge>
        </div>

        {/* File preview */}
        <div
          className="relative h-44 flex items-center justify-center bg-gradient-to-br from-violet-900/25 via-indigo-900/15 to-[#0d0d1e] border-b border-white/[0.06] overflow-hidden"
          aria-label="File preview area"
        >
          {/* Grid dots */}
          <div
            className="absolute inset-0 bg-dot-grid opacity-30"
            aria-hidden="true"
          />
          {/* PDF icon */}
          <div className="relative flex flex-col items-center gap-2">
            <div className="w-14 h-18 rounded-lg bg-red-500/15 border border-red-500/30 flex flex-col items-center justify-center gap-1 px-2 py-3">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                className="text-red-400"
                aria-hidden="true"
              >
                <path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z" />
                <polyline points="13 2 13 9 20 9" />
              </svg>
              <span className="text-[9px] font-bold text-red-400 tracking-wider">
                PDF
              </span>
            </div>
            <span className="text-[11px] text-white/50">
              brand-guidelines-v2.pdf
            </span>
          </div>
        </div>

        {/* Version bar */}
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/[0.04] bg-[#111122]/50">
          {["v1", "v2", "v3"].map((v, i) => (
            <button
              key={v}
              aria-label={`Version ${v}`}
              className={
                i === 1
                  ? "px-2.5 py-1 text-[10px] font-semibold rounded-md bg-violet-500/20 text-violet-300 border border-violet-500/30"
                  : "px-2.5 py-1 text-[10px] text-white/35 rounded-md hover:text-white/60 transition-colors"
              }
            >
              {v}
            </button>
          ))}
          <span className="ml-auto text-[10px] text-white/30">3 versions</span>
        </div>

        {/* Comment */}
        <div className="px-4 py-3.5 border-b border-white/[0.04]">
          <div className="flex gap-2.5">
            <div
              className="w-6 h-6 rounded-full bg-gradient-to-br from-pink-500 to-rose-600 shrink-0 flex items-center justify-center text-[9px] font-bold text-white"
              aria-hidden="true"
            >
              S
            </div>
            <div>
              <p className="text-[10px] text-white/35">Sarah Chen · 2m ago</p>
              <p className="text-xs text-white/75 mt-0.5">
                Can you adjust the brand colors? 🎨
              </p>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="px-4 py-3.5 flex gap-2.5">
          <button
            aria-label="Approve"
            className="flex-1 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-emerald-500/20 transition-colors"
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Approve
          </button>
          <button
            aria-label="Request changes"
            className="flex-1 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white/50 text-xs font-medium hover:bg-white/[0.07] transition-colors"
          >
            Request Changes
          </button>
        </div>
      </div>

      {/* Floating notification card */}
      <div
        className="absolute -bottom-5 -left-4 z-20 flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-[#111122] border border-white/10 shadow-xl shadow-black/40 max-w-44"
        aria-hidden="true"
      >
        <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shrink-0">
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" />
          </svg>
        </div>
        <div>
          <p className="text-[10px] font-semibold text-white/80">New comment</p>
          <p className="text-[9px] text-white/40">from Sarah Chen</p>
        </div>
      </div>
    </div>
  );
}

// ─── Avatar stack ─────────────────────────────────────────────────────────────

const avatarColors = [
  "from-violet-500 to-indigo-600",
  "from-pink-500 to-rose-600",
  "from-amber-500 to-orange-600",
  "from-emerald-500 to-teal-600",
];
const avatarLabels = ["A", "M", "J", "R"];

function AvatarStack() {
  return (
    <div className="flex -space-x-2" role="img" aria-label="User avatars">
      {avatarLabels.map((letter, i) => (
        <div
          key={letter}
          className={`w-7 h-7 rounded-full bg-gradient-to-br ${avatarColors[i]} flex items-center justify-center text-[10px] font-bold text-white border-2 border-[#06060f]`}
          aria-hidden="true"
        >
          {letter}
        </div>
      ))}
    </div>
  );
}

// ─── Hero section ─────────────────────────────────────────────────────────────

export default function Hero() {
  return (
    <section
      className="relative min-h-screen flex items-center overflow-hidden pt-20"
      aria-labelledby="hero-headline"
    >
      {/* Background gradient orbs */}
      <div
        className="absolute inset-0 pointer-events-none overflow-hidden"
        aria-hidden="true"
      >
        <div className="absolute -top-20 left-[10%] w-[600px] h-[600px] bg-violet-700/15 rounded-full blur-[120px]" />
        <div className="absolute top-[40%] right-[5%] w-[450px] h-[450px] bg-indigo-600/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 left-[40%] w-[500px] h-[300px] bg-violet-800/10 rounded-full blur-[80px]" />
        {/* Grid texture */}
        <div className="absolute inset-0 bg-dot-grid opacity-40" />
      </div>

      <Container>
        <div className="grid lg:grid-cols-2 gap-16 xl:gap-24 items-center py-24 lg:py-32">
          {/* ── Left: copy ───────────────────────────────────────────────── */}
          <div className="flex flex-col">
            <Badge variant="brand" dot className="mb-7 w-fit">
              Currently in beta — free forever
            </Badge>

            <h1
              id="hero-headline"
              className="text-[2.8rem] sm:text-6xl lg:text-[4rem] xl:text-[4.5rem] font-extrabold tracking-tight leading-[1.08] text-white text-balance mb-6"
            >
              File approvals <span className="gradient-text">without</span>
              <br />
              the chaos
            </h1>

            <p className="text-lg sm:text-xl text-white/55 leading-relaxed mb-10 max-w-[520px]">
              Send files to clients and get structured approvals — no WhatsApp
              threads, no confusing email chains. Just clean, trackable reviews
              with a single link.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-3.5">
              <Button size="lg" variant="primary" href="/login">
                Start for free
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
                See how it works
              </Button>
            </div>

            {/* Social proof */}
            <div className="flex items-center gap-4 mt-10">
              <AvatarStack />
              <p className="text-sm text-white/45">
                <span className="text-white/75 font-semibold">500+</span>{" "}
                freelancers already using it
              </p>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap items-center gap-5 mt-8 pt-8 border-t border-white/[0.06]">
              {[
                "No credit card required",
                "Free forever plan",
                "No client login needed",
              ].map((text) => (
                <div
                  key={text}
                  className="flex items-center gap-1.5 text-xs text-white/40"
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-emerald-500"
                    aria-hidden="true"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  {text}
                </div>
              ))}
            </div>
          </div>

          {/* ── Right: app mockup ─────────────────────────────────────────── */}
          <div className="relative flex items-center justify-center lg:justify-end">
            <AppMockup />
          </div>
        </div>
      </Container>
    </section>
  );
}
