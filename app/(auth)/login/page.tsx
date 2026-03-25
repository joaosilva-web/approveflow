"use client";

import React, { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { registerUser } from "@/features/auth/actions/auth";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

// ─── Tab helpers ──────────────────────────────────────────────────────────────

type Tab = "signin" | "register";

// ─── Sign in form ─────────────────────────────────────────────────────────────

function SignInForm({ next }: { next?: string }) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await signIn("credentials", {
        email: formData.get("email"),
        password: formData.get("password"),
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password");
      } else {
        const target = next ?? new URLSearchParams(window.location.search).get("next");
        window.location.href = target ?? "/dashboard";
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        name="email"
        label="Email"
        type="email"
        placeholder="you@example.com"
        autoComplete="email"
        required
        fullWidth
      />
      <Input
        name="password"
        label="Password"
        type="password"
        placeholder="••••••••"
        autoComplete="current-password"
        required
        fullWidth
      />
      {error && (
        <p className="text-xs text-red-400" role="alert">
          {error}
        </p>
      )}
      <Button
        type="submit"
        variant="primary"
        fullWidth
        loading={isPending}
        className="mt-1"
      >
        Sign in
      </Button>
    </form>
  );
}

// ─── Register form ────────────────────────────────────────────────────────────

function RegisterForm({ next }: { next?: string }) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      if (next) formData.set("next", next);
      const result = await registerUser(formData);
      if (result?.error) {
        setError(result.error);
      }
      // registerUser will redirect on success based on `next`
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <input type="hidden" name="next" value={next ?? ""} />
      <Input
        name="name"
        label="Full name"
        placeholder="Jane Smith"
        autoComplete="name"
        required
        fullWidth
      />
      <Input
        name="email"
        label="Email"
        type="email"
        placeholder="you@example.com"
        autoComplete="email"
        required
        fullWidth
      />
      <Input
        name="password"
        label="Password"
        type="password"
        placeholder="Min. 8 characters"
        autoComplete="new-password"
        required
        fullWidth
        hint="At least 8 characters"
      />
      {error && (
        <p className="text-xs text-red-400" role="alert">
          {error}
        </p>
      )}
      <Button
        type="submit"
        variant="primary"
        fullWidth
        loading={isPending}
        className="mt-1"
      >
        Create account
      </Button>
    </form>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState<Tab>("signin");
  const searchParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  const next = searchParams.get("next") ?? undefined;

  return (
    <div className="w-full max-w-sm flex flex-col gap-8">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2.5 justify-center">
        <Image
          src="/logo.png"
          alt=""
          width={32}
          height={32}
          className="shrink-0"
        />
        <span className="text-lg font-bold tracking-tight">
          <span className="text-white">Approve</span>
          <span className="gradient-text">Flow</span>
        </span>
      </Link>

      {/* Card */}
      <div className="glass rounded-2xl p-7 border border-white/[0.06]">
        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-white/[0.04] rounded-xl mb-6">
          {(["signin", "register"] as Tab[]).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={cn(
                "flex-1 py-1.5 rounded-lg text-sm font-medium transition-all duration-150",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/50",
                activeTab === tab
                  ? "bg-violet-600/80 text-white shadow-sm"
                  : "text-white/50 hover:text-white/80",
              )}
            >
              {tab === "signin" ? "Sign in" : "Create account"}
            </button>
          ))}
        </div>

        {activeTab === "signin" ? <SignInForm next={next} /> : <RegisterForm next={next} />}
      </div>

      <p className="text-center text-xs text-white/25">
        By continuing you agree to our{" "}
        <Link
          href="/"
          className="text-violet-400/70 hover:text-violet-400 transition-colors"
        >
          Terms of Service
        </Link>
        .
      </p>
    </div>
  );
}
