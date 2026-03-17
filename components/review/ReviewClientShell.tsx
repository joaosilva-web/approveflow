"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import ApprovalPanel from "@/components/review/ApprovalPanel";
import CommentSystem, {
  type CommentData,
} from "@/components/review/CommentSystem";
import ImageWithComments from "@/components/review/ImageWithComments";
import FilePreview from "@/components/review/FilePreview";
import VersionSwitcher from "@/components/review/VersionSwitcher";
import { cn } from "@/lib/utils";
import type { BadgeVariant } from "@/components/ui/Badge";

// ─── Types ────────────────────────────────────────────────────────────────────

type Status = "PENDING" | "APPROVED" | "CHANGES_REQUESTED";

interface DeliverySummary {
  id: string;
  reviewToken: string;
  versionNumber: number;
  label: string | null;
  status: Status;
  createdAt: string;
}

interface ReviewClientShellProps {
  token: string;
  signedUrl: string;
  fileName: string;
  mimeType: string;
  allowDownload: boolean;
  initialStatus: Status;
  versionNumber: number;
  label: string | null;
  projectName: string;
  clientName: string;
  initialComments: CommentData[];
  allDeliveries: DeliverySummary[];
  isFreelancerPreview?: boolean;
  freelancerName?: string | null;
  freelancerDisplayName?: string | null;
}

// ─── Status badge map ─────────────────────────────────────────────────────────

const statusVariant: Record<Status, BadgeVariant> = {
  PENDING: "warning",
  APPROVED: "success",
  CHANGES_REQUESTED: "error",
};

const statusLabel: Record<Status, string> = {
  PENDING: "Aguardando revisão",
  APPROVED: "Aprovado",
  CHANGES_REQUESTED: "Alterações solicitadas",
};

// ─── Download helper (blob fetch bypasses cross-origin anchor restriction) ───

function DownloadFileButton({
  url,
  fileName,
}: {
  url: string;
  fileName: string;
}) {
  const [loading, setLoading] = React.useState(false);

  async function handleDownload() {
    setLoading(true);
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(objectUrl);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-white/[0.06] border border-white/[0.10] text-white/70 hover:bg-white/[0.10] hover:text-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </svg>
      {loading ? "Baixando..." : "Download"}
    </button>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ReviewClientShell({
  token,
  signedUrl,
  fileName,
  mimeType,
  allowDownload,
  initialStatus,
  versionNumber,
  label,
  projectName,
  clientName,
  initialComments,
  allDeliveries,
  isFreelancerPreview = false,
  freelancerName,
  freelancerDisplayName,
}: ReviewClientShellProps) {
  const isImage = mimeType.startsWith("image/");

  const [status, setStatus] = useState<Status>(initialStatus);
  const [comments, setComments] = useState<CommentData[]>(initialComments);

  // Build pin number map for comment system
  const pinnedComments = comments.filter(
    (c) => c.xPosition !== null && c.yPosition !== null,
  );
  const pinnedCommentNumbers: Record<string, number> = {};
  pinnedComments.forEach((c, i) => {
    pinnedCommentNumbers[c.id] = i + 1;
  });

  return (
    <div className="min-h-screen bg-[#06060f] flex flex-col">
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 flex items-center justify-between h-14 px-4 md:px-8 border-b border-white/[0.06] bg-[#06060f]/90 backdrop-blur-sm">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-sm">
            <svg
              width="10"
              height="10"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <span className="text-sm font-semibold">
            <span className="text-white">Approve</span>
            <span className="gradient-text">Flow</span>
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-xs font-semibold text-white/70 truncate max-w-[160px]">
              {projectName}
            </span>
            <span className="text-[11px] text-white/35">
              Cliente: {clientName}
            </span>
          </div>
          <Badge variant={statusVariant[status]} dot size="sm">
            {statusLabel[status]}
          </Badge>
        </div>
      </header>

      {/* ── Body ────────────────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden flex-col lg:flex-row">
        {/* Main preview */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {/* Humanized intro — shown to clients */}
          {!isFreelancerPreview && freelancerDisplayName && (
            <p className="text-sm text-white/50 mb-5">
              <span className="font-medium text-white/80">
                {freelancerDisplayName}
              </span>
              {" compartilhou "}
              <span className="font-medium text-white/80">
                &ldquo;{projectName}&rdquo;
              </span>
              {" para sua revisão"}
            </p>
          )}
          <div className="flex items-center gap-2.5 mb-5">
            <span className="text-xs font-mono text-white/40 bg-white/[0.05] border border-white/[0.08] px-2 py-0.5 rounded-md">
              v{versionNumber}
            </span>
            {label && <span className="text-xs text-white/50">{label}</span>}
            <span className="text-xs text-white/30 truncate ml-auto">
              {fileName}
            </span>
          </div>

          {isImage ? (
            <>
              <ImageWithComments
                signedUrl={signedUrl}
                fileName={fileName}
                comments={comments}
                token={token}
                onCommentAdded={(c) => setComments((prev) => [...prev, c])}
              />
              {allowDownload && (
                <div className="flex justify-center mt-4">
                  <DownloadFileButton url={signedUrl} fileName={fileName} />
                </div>
              )}
            </>
          ) : (
            <FilePreview
              signedUrl={signedUrl}
              mimeType={mimeType}
              fileName={fileName}
              allowDownload={allowDownload}
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
            {/* Approval — client only */}
            {!isFreelancerPreview && (
              <>
                <ApprovalPanel
                  token={token}
                  status={status}
                  onStatusChange={setStatus}
                />
                <hr className="border-white/[0.06]" />
              </>
            )}

            {/* Freelancer preview banner */}
            {isFreelancerPreview && (
              <div className="flex items-center gap-2.5 rounded-xl bg-violet-600/10 border border-violet-500/20 px-3.5 py-3">
                <div className="w-2 h-2 rounded-full bg-violet-400 shrink-0" />
                <p className="text-xs text-violet-300/80 leading-snug">
                  <span className="font-semibold text-violet-300">
                    Modo visualização
                  </span>
                  {" — "}
                  o cliente vê este link, você pode responder os comentários abaixo.
                </p>
              </div>
            )}

            {/* Comments */}
            <CommentSystem
              token={token}
              initialComments={comments}
              pinnedComments={pinnedCommentNumbers}
              mode={isFreelancerPreview ? "freelancer" : "client"}
              freelancerName={freelancerName ?? undefined}
            />

            {/* Version history */}
            {allDeliveries.length > 1 && (
              <>
                <hr className="border-white/[0.06]" />
                <VersionSwitcher
                  deliveries={allDeliveries}
                  currentToken={token}
                />
              </>
            )}
          </div>
        </aside>
      </div>

      {/* ── Viral footer ────────────────────────────────────────────────────── */}
      <footer className="shrink-0 py-2.5 text-center border-t border-white/[0.04]">
        <p className="text-[11px] text-white/20">
          Revisão via{" "}
          <a
            href="https://approveflow.app"
            target="_blank"
            rel="noopener noreferrer"
            className="text-violet-400/50 hover:text-violet-400 transition-colors"
          >
            ApproveFlow
          </a>
        </p>
      </footer>
    </div>
  );
}
