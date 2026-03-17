import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "404 — Page Not Found · ApproveFlow",
  description: "The page you were looking for doesn't exist.",
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-canvas flex flex-col">
      {/* Minimal header */}
      <header className="border-b border-white/[0.06]">
        <Container>
          <div className="h-16 flex items-center">
            <Link
              href="/"
              className="flex items-center gap-2 focus-visible:outline-none"
              aria-label="ApproveFlow home"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo.png"
                alt=""
                width={28}
                height={28}
                className="shrink-0"
              />
              <span className="text-[15px] font-semibold tracking-tight">
                <span className="text-white">Approve</span>
                <span className="gradient-text">Flow</span>
              </span>
            </Link>
          </div>
        </Container>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center relative overflow-hidden">
        {/* Background glows */}
        <div
          className="absolute inset-0 pointer-events-none"
          aria-hidden="true"
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-violet-900/[0.12] rounded-full blur-3xl" />
          <div className="absolute top-1/4 right-1/4 w-[300px] h-[300px] bg-indigo-900/[0.08] rounded-full blur-3xl" />
        </div>

        <Container>
          <div className="flex flex-col items-center text-center gap-8 py-24">
            {/* 404 number */}
            <div className="relative select-none" aria-hidden="true">
              <span className="text-[10rem] sm:text-[14rem] font-extrabold leading-none tracking-tighter bg-gradient-to-b from-white/10 to-white/[0.02] bg-clip-text text-transparent">
                404
              </span>
              {/* Glow behind number */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-48 h-24 bg-violet-600/20 rounded-full blur-3xl" />
              </div>
            </div>

            {/* Text */}
            <div className="flex flex-col items-center gap-4 -mt-6">
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Page not found
              </h1>
              <p className="text-base text-white/50 max-w-sm leading-relaxed">
                The page you&apos;re looking for doesn&apos;t exist or was
                moved. Let&apos;s get you back on track.
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Button variant="primary" size="md" href="/">
                Back to home
              </Button>
              <Button variant="secondary" size="md" href="/login">
                Go to dashboard
              </Button>
            </div>

            {/* Subtle help line */}
            <p className="text-xs text-white/25 mt-2">
              If you believe this is a mistake,{" "}
              <Link
                href="/contact"
                className="text-white/40 hover:text-white/60 underline underline-offset-2 transition-colors duration-150"
              >
                contact support
              </Link>
              .
            </p>
          </div>
        </Container>
      </main>
    </div>
  );
}
