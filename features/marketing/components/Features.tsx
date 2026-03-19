"use client";

import React from "react";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { useLang } from "@/lib/lang-context";

// ─── Bilingual copy ───────────────────────────────────────────────────────────

const copy = {
  pt: {
    badge: "Funcionalidades",
    h2a: "Tudo que você precisa para ",
    h2highlight: "receber mais rápido",
    p: "Do compartilhamento seguro de arquivos ao registro digital de aprovações — o ApproveFlow cobre todo o fluxo de entrega para clientes.",
    features: [
      {
        title: "Links de Revisão Criptografados",
        description:
          "Cada entrega recebe um token seguro de 128 bits. Os links nunca expõem suas URLs de armazenamento — o acesso é sempre intermediado pela camada da aplicação.",
      },
      {
        title: "Qualquer Tipo de Arquivo",
        description:
          "Imagens, PDFs, vídeos, documentos, ZIPs. Compartilhe qualquer coisa. Limites de tamanho configuráveis por plano com entrega acelerada por CDN.",
      },
      {
        title: "Aprovação com Um Clique",
        description:
          "Clientes aprovam com um único clique, optando por assinar com nome e e-mail. O status muda para Aprovado com registro completo de data e hora.",
      },
      {
        title: "Comentários Inline",
        description:
          "Clientes deixam feedbacks com timestamp vinculados a versões específicas do arquivo. Chega de dúvida sobre em qual versão era aquele comentário.",
      },
      {
        title: "Histórico de Versões",
        description:
          "Cada upload vira uma versão rastreada. Clientes podem comparar v1 com v3, baixar qualquer iteração, e você sempre tem o histórico completo.",
      },
      {
        title: "Rastreamento de Atividade",
        description:
          "Saiba exatamente quando o cliente abriu o arquivo. Timestamp, tipo de dispositivo e IP registrado para cada visualização — perfeito para prova de entrega.",
      },
    ],
  },
  en: {
    badge: "Features",
    h2a: "Everything you need to ",
    h2highlight: "get paid faster",
    p: "From secure file sharing to digital approval trails — ApproveFlow covers the entire client delivery workflow.",
    features: [
      {
        title: "Cryptographic Review Links",
        description:
          "Every delivery gets a 128-bit secure token. Links never expose your storage URLs — access is always proxied through the application layer.",
      },
      {
        title: "Any File Type",
        description:
          "Images, PDFs, videos, documents, ZIP archives. Share anything. File size limits are configurable per plan with CDN-accelerated delivery.",
      },
      {
        title: "One-Click Approvals",
        description:
          "Clients approve with a single click, optionally signing with name and email. Status changes to Approved with a full timestamp trail.",
      },
      {
        title: "Inline Comment System",
        description:
          "Clients leave timestamped feedback tied to specific file versions. No more wondering which version that comment was about.",
      },
      {
        title: "Version History",
        description:
          "Every upload becomes a tracked version. Clients can compare v1 vs v3, download any iteration, and you always have the full audit trail.",
      },
      {
        title: "Activity Tracking",
        description:
          "Know exactly when your client opens the file. Timestamp, device type, and IP logged for every view — perfect for proof of delivery.",
      },
    ],
  },
} as const;

// ─── Feature meta (icons / colors — language-agnostic) ───────────────────────

const featureMeta = [
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
  },
] as const;

// ─── Feature card ─────────────────────────────────────────────────────────────

function FeatureCard({
  meta,
  title,
  description,
}: {
  meta: (typeof featureMeta)[number];
  title: string;
  description: string;
}) {
  return (
    <article className="relative group flex flex-col gap-4 p-6 rounded-2xl bg-[#0d0d1e] border border-white/[0.06] hover:border-white/[0.10] hover:bg-[#111122] transition-all duration-300">
      {/* Icon */}
      <div className="relative w-fit">
        <div
          className={`w-11 h-11 rounded-xl bg-gradient-to-br ${meta.gradient} flex items-center justify-center text-white shadow-md`}
        >
          {meta.icon}
        </div>
        <div
          className={`absolute inset-0 ${meta.glow} rounded-xl blur-lg -z-10 opacity-60 group-hover:opacity-100 transition-opacity duration-300`}
          aria-hidden="true"
        />
      </div>

      {/* Content */}
      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-semibold text-white/90">{title}</h3>
        <p className="text-sm text-white/50 leading-relaxed">{description}</p>
      </div>

      {/* Hover gradient accent line */}
      <div
        className={`absolute bottom-0 inset-x-6 h-px bg-gradient-to-r ${meta.gradient} opacity-0 group-hover:opacity-40 transition-opacity duration-300 rounded-full`}
        aria-hidden="true"
      />
    </article>
  );
}

// ─── Section ──────────────────────────────────────────────────────────────────

export default function Features() {
  const { lang } = useLang();
  const t = copy[lang];

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
            {t.badge}
          </Badge>
          <h2
            id="features-heading"
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight text-balance"
          >
            {t.h2a}
            <span className="gradient-text">{t.h2highlight}</span>
          </h2>
          <p className="text-base sm:text-lg text-white/50 max-w-xl leading-relaxed">
            {t.p}
          </p>
        </div>

        {/* Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
          {featureMeta.map((meta, i) => (
            <FeatureCard
              key={i}
              meta={meta}
              title={t.features[i].title}
              description={t.features[i].description}
            />
          ))}
        </div>
      </Container>
    </section>
  );
}
