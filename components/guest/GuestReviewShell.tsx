"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import ApprovalPanel from "@/components/review/ApprovalPanel";
import CommentSystem, {
  type CommentData,
} from "@/components/review/CommentSystem";
import ImageWithComments from "@/components/review/ImageWithComments";
import FilePreview from "@/components/review/FilePreview";
import { cn } from "@/lib/utils";
import type { BadgeVariant } from "@/components/ui/Badge";

// ─── Types ────────────────────────────────────────────────────────────────────

type Status = "PENDING" | "APPROVED" | "CHANGES_REQUESTED";

interface GuestReviewShellProps {
  token: string;
  signedUrl: string;
  fileName: string;
  mimeType: string;
  initialStatus: Status;
  initialComments: CommentData[];
  expiresAt: string; // ISO string
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const statusVariant: Record<Status, BadgeVariant> = {
  PENDING: "warning",
  APPROVED: "success",
  CHANGES_REQUESTED: "error",
};

const statusLabel: Record<Status, string> = {
  PENDING: "Awaiting review",
  APPROVED: "Approved",
  CHANGES_REQUESTED: "Changes requested",
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function GuestReviewShell({
  token,
  signedUrl,
  fileName,
  mimeType,
  initialStatus,
  initialComments,
  expiresAt,
}: GuestReviewShellProps) {
  const isImage = mimeType.startsWith("image/");
  const [status, setStatus] = useState<Status>(initialStatus);
  const [comments, setComments] = useState<CommentData[]>(initialComments);

  const pinnedComments = comments.filter(
    (c) => c.xPosition !== null && c.yPosition !== null,
  );
  const pinnedCommentNumbers: Record<string, number> = {};
  pinnedComments.forEach((c, i) => {
    pinnedCommentNumbers[c.id] = i + 1;
  });

  const [daysLeft] = useState(() =>
    Math.ceil(
      (new Date(expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
    ),
  );
  const expiringSoon = daysLeft <= 2;

  return (
    <div className="min-h-screen bg-[#06060f] flex flex-col">
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 flex items-center justify-between h-14 px-4 md:px-8 border-b border-white/[0.06] bg-[#06060f]/90 backdrop-blur-sm">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.png" alt="" width={24} height={24} className="shrink-0" />
          <span className="text-sm font-semibold">
            <span className="text-white">Approve</span>
            <span className="text-violet-400">Flow</span>
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <span className="hidden sm:block text-xs text-white/40 truncate max-w-[200px]">
            {fileName}
          </span>
          <Badge variant={statusVariant[status]} dot size="sm">
            {statusLabel[status]}
          </Badge>
        </div>
      </header>

      {/* ── Body ────────────────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden flex-col lg:flex-row">
        {/* Main preview */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {isImage ? (
            <ImageWithComments
              signedUrl={signedUrl}
              fileName={fileName}
              comments={comments}
              token={token}
              commentApiBase="/api/guest"
              onCommentAdded={(c) => setComments((prev) => [...prev, c])}
            />
          ) : (
            <FilePreview
              signedUrl={signedUrl}
              mimeType={mimeType}
              fileName={fileName}
              allowDownload={true}
            />
          )}
        </main>

        {/* ── Sidebar ─────────────────────────────────────────────────────── */}
        <aside
          className={cn(
            "w-full lg:w-80 shrink-0 border-t lg:border-t-0 lg:border-l border-white/[0.06]",
            "bg-[#080814] overflow-y-auto flex flex-col",
          )}
        >
          <div className="flex flex-col gap-6 p-5">
            {/* Approval */}
            <ApprovalPanel
              token={token}
              status={status}
              onStatusChange={setStatus}
              apiBase="/api/guest"
            />

            <hr className="border-white/[0.06]" />

            {/* Save CTA */}
            <div
              className={cn(
                "flex flex-col gap-3 p-4 rounded-xl border",
                expiringSoon
                  ? "bg-yellow-500/[0.06] border-yellow-500/20"
                  : "bg-violet-600/[0.07] border-violet-500/20",
              )}
            >
              <div>
                <p className="text-sm font-semibold text-white/80">
                  Save this project
                </p>
                <p className="text-xs text-white/45 mt-1">
                  Create a free account to keep this review permanently and
                  manage all your projects in one place.
                </p>
                <p
                  className={cn(
                    "text-xs mt-2",
                    expiringSoon ? "text-yellow-400" : "text-white/30",
                  )}
                >
                  {expiringSoon
                    ? `⚠️ Expires in ${daysLeft} day${daysLeft !== 1 ? "s" : ""}`
                    : `Free guest link · expires in ${daysLeft} days`}
                </p>
              </div>
              <div className="flex gap-2">
                <Link
                  href="/login"
                  className="flex-1 py-2 rounded-lg text-xs font-semibold text-center text-white bg-violet-600 hover:bg-violet-500 transition-colors"
                >
                  Create free account
                </Link>
                <Link
                  href="/"
                  className="px-3 py-2 rounded-lg text-xs text-white/50 hover:text-white/80 bg-white/[0.04] hover:bg-white/[0.07] transition-colors"
                >
                  Guest
                </Link>
              </div>
            </div>

            <hr className="border-white/[0.06]" />

            {/* Comments */}
            <CommentSystem
              token={token}
              initialComments={comments}
              pinnedComments={pinnedCommentNumbers}
              commentApiBase="/api/guest"
            />
          </div>
        </aside>
      </div>

      {/* ── Viral footer ────────────────────────────────────────────────────── */}
      <footer className="shrink-0 py-3 px-4 text-center border-t border-white/[0.04]">
        <p className="text-[11px] text-white/25">
          Review powered by{" "}
          <a
            href="https://approveflow.app"
            target="_blank"
            rel="noopener noreferrer"
            className="text-violet-400/60 hover:text-violet-400 transition-colors"
          >
            ApproveFlow
          </a>
          {" · "}
          <a
            href="/design-review-tool"
            className="text-violet-400/60 hover:text-violet-400 transition-colors"
          >
            Create your own review link
          </a>
        </p>
      </footer>
    </div>
  );
}
