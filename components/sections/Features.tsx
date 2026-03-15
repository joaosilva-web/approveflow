import React from "react";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";

// ─── Feature data ─────────────────────────────────────────────────────────────

const features = [
  {
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0110 0v4" />
      </svg>
    ),
    gradient: "from-violet-600 to-indigo-600",
    glow: "bg-violet-600/20",
    title: "Cryptographic Review Links",
    description:
      "Every delivery gets a 128-bit secure token. Links never expose your storage URLs — access is always proxied through the application layer.",
  },
  {
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z" />
        <polyline points="13 2 13 9 20 9" />
      </svg>
    ),
    gradient: "from-indigo-600 to-blue-600",
    glow: "bg-indigo-600/20",
    title: "Any File Type",
    description:
      "Images, PDFs, videos, documents, ZIP archives. Share anything. File size limits are configurable per plan with CDN-accelerated delivery.",
  },
  {
    icon: (
      <svg
        width="20"
        height="20"
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
    gradient: "from-emerald-600 to-teal-600",
    glow: "bg-emerald-600/20",
    title: "One-Click Approvals",
    description:
      "Clients approve with a single click, optionally signing with name and email. Status changes to Approved with a full timestamp trail.",
  },
  {
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
      </svg>
    ),
    gradient: "from-amber-500 to-orange-600",
    glow: "bg-amber-600/20",
    title: "Inline Comment System",
    description:
      "Clients leave timestamped feedback tied to specific file versions. No more &ldquo;which version was that comment about?&rdquo;",
  },
  {
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
    gradient: "from-pink-600 to-rose-600",
    glow: "bg-pink-600/20",
    title: "Version History",
    description:
      "Every upload becomes a tracked version. Clients can compare v1 vs v3, download any iteration, and you always have the full audit trail.",
  },
  {
    icon: (
      <svg
        width="20"
        height="20"
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
    gradient: "from-cyan-600 to-sky-600",
    glow: "bg-cyan-600/20",
    title: "Activity Tracking",
    description:
      "Know exactly when your client opens the file. Timestamp, device type, and IP logged for every view — perfect for proof of delivery.",
  },
] as const;

// ─── Feature card ─────────────────────────────────────────────────────────────

function FeatureCard({ feature }: { feature: (typeof features)[number] }) {
  return (
    <article className="relative group flex flex-col gap-4 p-6 rounded-2xl bg-[#0d0d1e] border border-white/[0.06] hover:border-white/[0.10] hover:bg-[#111122] transition-all duration-300">
      {/* Icon */}
      <div className="relative w-fit">
        <div
          className={`w-11 h-11 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center text-white shadow-md`}
        >
          {feature.icon}
        </div>
        <div
          className={`absolute inset-0 ${feature.glow} rounded-xl blur-lg -z-10 opacity-60 group-hover:opacity-100 transition-opacity duration-300`}
          aria-hidden="true"
        />
      </div>

      {/* Content */}
      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-semibold text-white/90">{feature.title}</h3>
        <p className="text-sm text-white/50 leading-relaxed">
          {feature.description}
        </p>
      </div>

      {/* Hover gradient accent line */}
      <div
        className={`absolute bottom-0 inset-x-6 h-px bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-40 transition-opacity duration-300 rounded-full`}
        aria-hidden="true"
      />
    </article>
  );
}

// ─── Section ──────────────────────────────────────────────────────────────────

export default function Features() {
  return (
    <section
      id="features"
      className="relative py-24 lg:py-32 overflow-hidden"
      aria-labelledby="features-heading"
    >
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-0 right-0 w-[700px] h-[500px] bg-indigo-900/[0.06] rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[400px] bg-violet-900/[0.06] rounded-full blur-3xl" />
      </div>

      <Container>
        {/* Header */}
        <div className="flex flex-col items-center text-center gap-4 mb-14 lg:mb-18">
          <Badge variant="brand" dot>
            Features
          </Badge>
          <h2
            id="features-heading"
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight text-balance"
          >
            Everything you need to{" "}
            <span className="gradient-text">get paid faster</span>
          </h2>
          <p className="text-base sm:text-lg text-white/50 max-w-xl leading-relaxed">
            From secure file sharing to digital approval trails — ApproveFlow
            covers the entire client delivery workflow.
          </p>
        </div>

        {/* Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
          {features.map((feature) => (
            <FeatureCard key={feature.title} feature={feature} />
          ))}
        </div>
      </Container>
    </section>
  );
}
