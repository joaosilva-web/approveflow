import React from "react";
import Image from "next/image";
import Link from "next/link";
import GuestUploader from "@/components/seo/GuestUploader";

interface FAQ {
  q: string;
  a: string;
}

interface ToolLandingPageProps {
  headline: string;
  description: string;
  badge?: string;
  faq: FAQ[];
}

const ALL_TOOLS = [
  { label: "Design Review Tool", href: "/design-review-tool" },
  { label: "Website Feedback Tool", href: "/website-review-tool" },
  { label: "Logo Feedback Tool", href: "/logo-feedback-tool" },
  { label: "UI Feedback Tool", href: "/ui-feedback-tool" },
  { label: "Client Approval Tool", href: "/client-approval-tool" },
];

export default function ToolLandingPage({
  headline,
  description,
  badge = "Free · No account required",
  faq,
}: ToolLandingPageProps) {
  return (
    <div className="min-h-screen bg-[#06060f] text-white flex flex-col">
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <header className="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/logo.png"
            alt=""
            width={24}
            height={24}
            className="shrink-0"
          />
          <span className="text-sm font-semibold">
            <span className="text-white">Approve</span>
            <span className="text-violet-400">Flow</span>
          </span>
        </Link>
        <nav className="flex items-center gap-4">
          <a
            href="/login"
            className="text-xs text-white/50 hover:text-white transition-colors"
          >
            Sign in
          </a>
          <a
            href="/login"
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-violet-600 hover:bg-violet-500 text-white transition-colors"
          >
            Sign up free
          </a>
        </nav>
      </header>

      {/* ── Hero ────────────────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto w-full px-6 py-16 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
        {/* Left: copy */}
        <div className="flex flex-col gap-7 order-2 lg:order-1">
          <span className="text-xs uppercase tracking-widest text-violet-400/70 font-semibold">
            {badge}
          </span>

          <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight text-white">
            {headline}
          </h1>

          <p className="text-lg text-white/55 leading-relaxed">{description}</p>

          {/* How it works */}
          <div className="flex flex-col gap-4 pt-2">
            {[
              {
                n: "1",
                title: "Upload your file",
                sub: "Images, PDFs, videos — up to 20 MB",
              },
              {
                n: "2",
                title: "Get a review link instantly",
                sub: "No account needed. Share it in seconds.",
              },
              {
                n: "3",
                title: "Client reviews & decides",
                sub: "Approve, request changes, or leave pinned comments",
              },
            ].map((step) => (
              <div key={step.n} className="flex items-start gap-3">
                <span className="w-7 h-7 rounded-full bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-xs font-bold text-violet-400 shrink-0 mt-0.5">
                  {step.n}
                </span>
                <div>
                  <p className="text-sm font-semibold text-white/80">
                    {step.title}
                  </p>
                  <p className="text-xs text-white/40 mt-0.5">{step.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: uploader widget */}
        <div className="order-1 lg:order-2">
          <div className="p-1 rounded-3xl bg-gradient-to-br from-violet-600/20 to-indigo-600/10 border border-white/[0.06]">
            <div className="rounded-[20px] bg-[#080814] p-5">
              <p className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-4">
                Generate review link
              </p>
              <GuestUploader />
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ─────────────────────────────────────────────────────────────── */}
      <section className="max-w-3xl mx-auto w-full px-6 py-12">
        <h2 className="text-2xl font-bold text-white mb-8">
          Frequently asked questions
        </h2>
        <div className="flex flex-col">
          {faq.map((item, i) => (
            <details
              key={i}
              className="group border-b border-white/[0.06] py-5 cursor-pointer"
            >
              <summary className="flex items-center justify-between gap-4 list-none">
                <h3 className="text-sm font-semibold text-white/80 group-open:text-white transition-colors">
                  {item.q}
                </h3>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-white/30 shrink-0 transition-transform group-open:rotate-180"
                  aria-hidden="true"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </summary>
              <p className="mt-3 text-sm text-white/50 leading-relaxed">
                {item.a}
              </p>
            </details>
          ))}
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <footer className="border-t border-white/[0.06] px-6 py-10 mt-auto">
        <div className="max-w-6xl mx-auto flex flex-col gap-6">
          <div>
            <p className="text-[11px] text-white/25 uppercase tracking-wider mb-3">
              More free tools
            </p>
            <div className="flex flex-wrap gap-2">
              {ALL_TOOLS.map((t) => (
                <a
                  key={t.href}
                  href={t.href}
                  className="px-3 py-1.5 rounded-lg text-xs text-white/40 border border-white/[0.07] hover:text-white/70 hover:border-white/20 transition-colors"
                >
                  {t.label}
                </a>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <p className="text-[11px] text-white/20">
              © {new Date().getFullYear()} ApproveFlow · Free client approval
              tool for freelancers and agencies
            </p>
            <a
              href="/login"
              className="text-[11px] text-violet-400/50 hover:text-violet-400 transition-colors"
            >
              Create a free account →
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
