"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

// ─── Logo ─────────────────────────────────────────────────────────────────────

function Logo() {
  return (
    <Link
      href="/"
      className="flex items-center gap-2 group focus-visible:outline-none"
      aria-label="ApproveFlow home"
    >
      <Image
        src="/logo.png"
        alt=""
        width={32}
        height={32}
        className="shrink-0"
      />
      {/* Wordmark */}
      <span className="text-[15px] font-semibold tracking-tight">
        <span className="text-white">Approve</span>
        <span className="gradient-text">Flow</span>
      </span>
    </Link>
  );
}

// ─── Nav links ────────────────────────────────────────────────────────────────

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Pricing", href: "#pricing" },
] as const;

// ─── Mobile menu icon ─────────────────────────────────────────────────────────

function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      {open ? (
        <>
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </>
      ) : (
        <>
          <line x1="3" y1="7" x2="21" y2="7" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="17" x2="21" y2="17" />
        </>
      )}
    </svg>
  );
}

// ─── Header ───────────────────────────────────────────────────────────────────

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change / outside click
  useEffect(() => {
    if (!mobileOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [mobileOpen]);

  return (
    <header
      className={cn(
        "fixed top-0 inset-x-0 z-40 transition-all duration-300",
        scrolled
          ? "border-b border-white/[0.06] bg-[#06060f]/80 backdrop-blur-xl"
          : "bg-transparent border-b border-transparent",
      )}
    >
      <Container>
        <nav
          className="flex items-center justify-between h-16"
          aria-label="Primary navigation"
        >
          <Logo />

          {/* Desktop nav */}
          <ul
            className="hidden md:flex items-center gap-1 list-none"
            role="list"
          >
            {navLinks.map(({ label, href }) => (
              <li key={href}>
                <Link
                  href={href}
                  className={cn(
                    "px-3 py-2 text-sm text-white/60 rounded-lg",
                    "hover:text-white/90 hover:bg-white/[0.05]",
                    "transition-colors duration-150",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60",
                  )}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/login"
              className={cn(
                "text-sm text-white/60 hover:text-white/90",
                "transition-colors duration-150 px-3 py-2",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60 rounded-lg",
              )}
            >
              Sign in
            </Link>
            <Button size="sm" variant="primary">
              Get started free
            </Button>
          </div>

          {/* Mobile menu button */}
          <button
            className={cn(
              "md:hidden p-2 rounded-lg text-white/60 hover:text-white/90",
              "hover:bg-white/[0.06] transition-colors duration-150",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60",
            )}
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            <MenuIcon open={mobileOpen} />
          </button>
        </nav>
      </Container>

      {/* Mobile menu */}
      <div
        id="mobile-menu"
        className={cn(
          "md:hidden overflow-hidden transition-all duration-300",
          "border-b border-white/[0.06] bg-[#06060f]/95 backdrop-blur-xl",
          mobileOpen ? "max-h-80 opacity-100" : "max-h-0 opacity-0",
        )}
        aria-hidden={!mobileOpen}
      >
        <Container>
          <ul className="flex flex-col py-4 gap-1 list-none" role="list">
            {navLinks.map(({ label, href }) => (
              <li key={href}>
                <Link
                  href={href}
                  className={cn(
                    "block px-3 py-2.5 text-sm text-white/70 rounded-xl",
                    "hover:text-white hover:bg-white/[0.06]",
                    "transition-colors duration-150",
                  )}
                  onClick={() => setMobileOpen(false)}
                >
                  {label}
                </Link>
              </li>
            ))}
            <li className="pt-3 border-t border-white/[0.06] flex flex-col gap-2">
              <Link
                href="/login"
                className="block px-3 py-2.5 text-sm text-white/60 rounded-xl hover:text-white hover:bg-white/[0.06] transition-colors"
              >
                Sign in
              </Link>
              <Button fullWidth variant="primary" size="md">
                Get started free
              </Button>
            </li>
          </ul>
        </Container>
      </div>
    </header>
  );
}
