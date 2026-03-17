"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface PasswordGateProps {
  token: string;
  projectName: string;
}

export default function PasswordGate({ token, projectName }: PasswordGateProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;

    startTransition(async () => {
      setError("");
      const res = await fetch(`/api/review/${token}/verify-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        router.refresh();
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error === "Incorrect password" ? "Incorrect password." : "Something went wrong. Try again.");
      }
    });
  };

  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center p-6">
      {/* Ambient glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-violet-900/[0.12] rounded-full blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      <div className="relative w-full max-w-sm">
        {/* Lock icon */}
        <div className="flex justify-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-violet-400"
              aria-hidden="true"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-xl font-bold text-white mb-1">Password required</h1>
          <p className="text-sm text-white/50">
            <span className="text-white/70">{projectName}</span> is password protected.
            Enter the password to view the file.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            type="password"
            label="Password"
            placeholder="Enter password…"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
          />

          {error && (
            <p className="text-sm text-red-400 -mt-1">{error}</p>
          )}

          <Button
            type="submit"
            variant="primary"
            fullWidth
            loading={isPending}
            disabled={!password.trim() || isPending}
          >
            Continue
          </Button>
        </form>
      </div>
    </div>
  );
}
