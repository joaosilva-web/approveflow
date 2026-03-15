import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign in — ApproveFlow",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-canvas flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Gradient orb */}
      <div
        aria-hidden="true"
        className="absolute -top-64 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(139,92,246,0.14) 0%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />
      {children}
    </div>
  );
}
