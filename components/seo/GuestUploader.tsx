"use client";

import React, { useState, useRef, useCallback } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const MAX_SIZE = 20 * 1024 * 1024;
const ALLOWED_PREFIXES = ["image/", "application/pdf", "video/"];
const ACCEPT = "image/*,application/pdf,video/*";

function validateFile(file: File): string | null {
  if (file.size > MAX_SIZE) return "File too large. Maximum size is 20 MB.";
  if (!ALLOWED_PREFIXES.some((p) => file.type.startsWith(p))) {
    return "Unsupported file type. Upload an image, PDF, or video.";
  }
  return null;
}

type State = "idle" | "uploading" | "done" | "error";

interface Result {
  reviewUrl: string;
  fileName: string;
}

export default function GuestUploader() {
  const [state, setState] = useState<State>("idle");
  const [error, setError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedWa, setCopiedWa] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const doUpload = async (file: File) => {
    const err = validateFile(file);
    if (err) {
      setError(err);
      setState("error");
      return;
    }

    setState("uploading");
    setError("");

    const fd = new FormData();
    fd.append("file", file);

    try {
      const res = await fetch("/api/guest/upload", {
        method: "POST",
        body: fd,
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Upload failed. Please try again.");
      }
      const data = await res.json();
      setResult({ reviewUrl: data.reviewUrl, fileName: file.name });
      setState("done");
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Upload failed. Please try again.",
      );
      setState("error");
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) doUpload(file);
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) doUpload(file);
  };

  const copyLink = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.reviewUrl).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    });
  };

  const copyWhatsApp = () => {
    if (!result) return;
    const msg = `Hey! Please review the design here:\n\n${result.reviewUrl}\n\nYou can approve or request changes directly on the page.`;
    navigator.clipboard.writeText(msg).then(() => {
      setCopiedWa(true);
      setTimeout(() => setCopiedWa(false), 2000);
    });
  };

  // ── Done state ────────────────────────────────────────────────────────────
  if (state === "done" && result) {
    return (
      <div className="flex flex-col gap-5 p-6 rounded-2xl bg-[#080814] border border-white/[0.08]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-500/15 flex items-center justify-center shrink-0">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-emerald-400"
              aria-hidden="true"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <div>
            <p className="text-base font-bold text-white">Review link ready!</p>
            <p className="text-xs text-white/45 truncate max-w-[240px]">
              {result.fileName}
            </p>
          </div>
        </div>

        {/* URL box */}
        <div className="flex items-center gap-2 p-3 bg-white/[0.03] border border-white/[0.08] rounded-xl">
          <span className="flex-1 text-xs text-white/60 truncate select-all">
            {result.reviewUrl}
          </span>
          <button
            onClick={copyLink}
            className={cn(
              "shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
              copiedLink
                ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25"
                : "bg-violet-600 hover:bg-violet-500 text-white",
            )}
          >
            {copiedLink ? "✓ Copied!" : "Copy"}
          </button>
        </div>

        {/* Share */}
        <div className="flex gap-2">
          <button
            onClick={copyWhatsApp}
            className={cn(
              "flex-1 py-2.5 rounded-xl text-sm font-medium transition-all border",
              copiedWa
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/25"
                : "bg-white/[0.05] text-white/70 border-white/[0.08] hover:bg-white/[0.08] hover:text-white",
            )}
          >
            {copiedWa ? "✓ Copied!" : "📱 Copy WhatsApp message"}
          </button>
        </div>

        <a
          href={result.reviewUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="py-2.5 rounded-xl text-sm font-semibold text-center text-white bg-violet-600 hover:bg-violet-500 transition-colors"
        >
          Open review page ↗
        </a>

        <hr className="border-white/[0.06]" />

        {/* Upsell */}
        <div className="flex flex-col gap-3">
          <div>
            <p className="text-sm font-semibold text-white/80">
              💾 Save this project permanently
            </p>
            <p className="text-xs text-white/40 mt-1">
              Free guest links expire in 7 days. Create a free account to keep
              them and manage all your projects in one place.
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/login"
              className="flex-1 py-2 rounded-xl text-xs font-semibold text-center text-white bg-violet-600 hover:bg-violet-500 transition-colors"
            >
              Sign up free →
            </Link>
            <button
              onClick={() => {
                setState("idle");
                setResult(null);
              }}
              className="px-4 py-2 rounded-xl text-xs text-white/45 hover:text-white/70 bg-white/[0.04] hover:bg-white/[0.06] transition-colors"
            >
              New upload
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Uploading state ───────────────────────────────────────────────────────
  if (state === "uploading") {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-12 rounded-2xl bg-[#080814] border border-violet-500/20 min-h-[240px]">
        <div className="w-10 h-10 rounded-full border-2 border-violet-500/30 border-t-violet-500 animate-spin" />
        <p className="text-sm text-white/60">Uploading your file…</p>
      </div>
    );
  }

  // ── Idle / Error state ────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-3">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={() => setIsDragging(false)}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        aria-label="Upload file for review"
        onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
        className={cn(
          "flex flex-col items-center justify-center gap-4 p-10 rounded-2xl",
          "cursor-pointer transition-all duration-200 border-2 border-dashed select-none",
          isDragging
            ? "border-violet-500/70 bg-violet-500/[0.06]"
            : state === "error"
              ? "border-red-400/40 bg-red-500/[0.03] hover:border-red-400/60"
              : "border-white/[0.10] bg-white/[0.02] hover:border-violet-500/40 hover:bg-violet-500/[0.03]",
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          className="hidden"
          onChange={handleChange}
        />

        <div
          className={cn(
            "w-14 h-14 rounded-2xl flex items-center justify-center transition-colors",
            isDragging ? "bg-violet-500/20" : "bg-white/[0.05]",
          )}
        >
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={isDragging ? "text-violet-400" : "text-white/35"}
            aria-hidden="true"
          >
            <polyline points="16 16 12 12 8 16" />
            <line x1="12" y1="12" x2="12" y2="21" />
            <path d="M20.39 18.39A5 5 0 0018 9h-1.26A8 8 0 103 16.3" />
          </svg>
        </div>

        <div className="text-center">
          <p className="text-sm font-medium text-white/70">
            {isDragging ? "Drop it!" : "Drop your file here"}
          </p>
          <p className="text-xs text-white/35 mt-0.5">
            or{" "}
            <span className="text-violet-400 underline underline-offset-2">
              browse files
            </span>
          </p>
        </div>

        <p className="text-[11px] text-white/25">
          Images · PDFs · Videos · Max 20 MB
        </p>
      </div>

      {state === "error" && (
        <p className="text-xs text-red-400 px-1">{error}</p>
      )}
    </div>
  );
}
