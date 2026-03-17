"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { useLang } from "@/lib/lang-context";

// ─── Bilingual data ───────────────────────────────────────────────────────────

const copy = {
  pt: {
    tagline: "Aprovações de arquivos sem a bagunça. Feito para freelancers.",
    allRights: "Todos os direitos reservados.",
    madeWith: "Feito com carinho para freelancers.",
    columns: [
      {
        heading: "Produto",
        links: [
          { label: "Funcionalidades", href: "#features" },
          { label: "Planos", href: "#pricing" },
          { label: "Como funciona", href: "#how-it-works" },
          { label: "Novidades", href: "/changelog" },
        ],
      },
      {
        heading: "Empresa",
        links: [
          { label: "Sobre", href: "/about" },
          { label: "Blog", href: "/blog" },
          { label: "Vagas", href: "/careers" },
          { label: "Contato", href: "/contact" },
        ],
      },
      {
        heading: "Legal",
        links: [
          { label: "Política de Privacidade", href: "/privacy" },
          { label: "Termos de Uso", href: "/terms" },
          { label: "Segurança", href: "/security" },
          { label: "Cookies", href: "/cookies" },
        ],
      },
    ],
  },
  en: {
    tagline: "File approvals without the chaos. Built for freelancers.",
    allRights: "All rights reserved.",
    madeWith: "Made with care for freelancers everywhere.",
    columns: [
      {
        heading: "Product",
        links: [
          { label: "Features", href: "#features" },
          { label: "Pricing", href: "#pricing" },
          { label: "How it works", href: "#how-it-works" },
          { label: "Changelog", href: "/changelog" },
        ],
      },
      {
        heading: "Company",
        links: [
          { label: "About", href: "/about" },
          { label: "Blog", href: "/blog" },
          { label: "Careers", href: "/careers" },
          { label: "Contact", href: "/contact" },
        ],
      },
      {
        heading: "Legal",
        links: [
          { label: "Privacy Policy", href: "/privacy" },
          { label: "Terms of Service", href: "/terms" },
          { label: "Security", href: "/security" },
          { label: "Cookies", href: "/cookies" },
        ],
      },
    ],
  },
} as const;

// ─── Logo ─────────────────────────────────────────────────────────────────────

function FooterLogo() {
  return (
    <Link href="/" className="flex items-center gap-2 group w-fit">
      <Image
        src="/logo.png"
        alt=""
        width={28}
        height={28}
        className="shrink-0"
      />
      <span className="text-sm font-semibold tracking-tight">
        <span className="text-white">Approve</span>
        <span className="gradient-text">Flow</span>
      </span>
    </Link>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function Footer() {
  const { lang } = useLang();
  const t = copy[lang];

  return (
    <footer className="border-t border-white/[0.06] py-16 mt-8">
      <Container>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 lg:gap-16">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-1 flex flex-col gap-4">
            <FooterLogo />
            <p className="text-sm text-white/45 leading-relaxed max-w-[200px]">
              {t.tagline}
            </p>
            {/* Social links */}
            <div className="flex items-center gap-3 mt-1">
              {[
                {
                  href: "https://twitter.com",
                  label: "Twitter",
                  path: "M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z",
                },
                {
                  href: "https://github.com",
                  label: "GitHub",
                  path: "M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22",
                },
              ].map(({ href, label, path }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-8 h-8 rounded-lg bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-white/40 hover:text-white/80 hover:bg-white/[0.10] transition-colors duration-150"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d={path} />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {t.columns.map(({ heading, links }) => (
            <div key={heading} className="flex flex-col gap-4">
              <h3 className="text-xs font-semibold text-white/30 uppercase tracking-widest">
                {heading}
              </h3>
              <ul className="flex flex-col gap-3 list-none" role="list">
                {links.map(({ label, href }) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className="text-sm text-white/50 hover:text-white/80 transition-colors duration-150"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-14 pt-8 border-t border-white/[0.05] flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-white/30">
            © {new Date().getFullYear()} ApproveFlow. {t.allRights}
          </p>
          <p className="text-xs text-white/25">
            {t.madeWith}
          </p>
        </div>
      </Container>
    </footer>
  );
}
