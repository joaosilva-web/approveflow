"use client";
/* eslint-disable @next/next/no-img-element */

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/Badge";
import ApprovalPanel from "@/features/review/components/ApprovalPanel";
import CommentSystem, {
  type CommentData,
} from "@/features/review/components/CommentSystem";
import ImageWithComments from "@/features/review/components/ImageWithComments";
import FilePreview from "@/features/review/components/FilePreview";
import VersionSwitcher from "@/features/review/components/VersionSwitcher";
import { cn } from "@/lib/utils";
import type { BadgeVariant } from "@/components/ui/Badge";
import { Button } from "@/components/ui";
import { ChevronLeft } from "lucide-react";
import {
  DEFAULT_PRIMARY_COLOR,
  DEFAULT_SECONDARY_COLOR,
  hexToRgba,
  type FreelancerBranding,
} from "@/lib/freelancer-branding-shared";
import type { SubscriptionInfo } from "@/features/billing/subscription";

// Types

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
  deliveryId: string;
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
  branding?: FreelancerBranding | null;
  reviewPathSlug?: string | null;
  subscription?: SubscriptionInfo | null;
}

// Status badge map

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

// Download helper (blob fetch bypasses cross-origin anchor restriction)

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

// Component

export default function ReviewClientShell({
  token,
  deliveryId,
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
  branding,
  reviewPathSlug,
  subscription,
}: ReviewClientShellProps) {
  const isImage = mimeType.startsWith("image/");
  const isStudio = subscription?.planCode === "studio";
  const primaryColor = isStudio
    ? (branding?.primaryColor ?? DEFAULT_PRIMARY_COLOR)
    : DEFAULT_PRIMARY_COLOR;
  const secondaryColor = isStudio
    ? (branding?.secondaryColor ?? DEFAULT_SECONDARY_COLOR)
    : DEFAULT_SECONDARY_COLOR;
  const brandName = isStudio
    ? (branding?.displayName ?? freelancerDisplayName ?? "ApproveFlow")
    : "ApproveFlow";
  const brandLogo = isStudio ? branding?.logoUrl : null;

  const [status, setStatus] = useState<Status>(initialStatus);
  const [comments, setComments] = useState<CommentData[]>(initialComments);
  const [showChat, setShowChat] = useState(false);
  const [openPinCommentId, setOpenPinCommentId] = useState<string | null>(null);

  // Build pin number map for comment system
  const pinnedComments = comments.filter(
    (c) => c.xPosition !== null && c.yPosition !== null,
  );
  const pinnedCommentNumbers: Record<string, number> = {};
  pinnedComments.forEach((c, i) => {
    pinnedCommentNumbers[c.id] = i + 1;
  });

  return (
    <div
      className="h-auto lg:h-screen bg-[#06060f] flex flex-col"
      style={{
        backgroundImage: `radial-gradient(circle at top right, ${hexToRgba(primaryColor, 0.1)}, transparent 28%)`,
      }}
    >
      {/* Header  */}
      <header className="sticky top-0 z-40 flex items-center justify-between h-14 px-4 md:px-8 border-b border-white/[0.06] bg-[#06060f]/90 backdrop-blur-sm">
        <Link href="/" className="flex items-center gap-2.5">
          {brandLogo ? (
            <img
              src={brandLogo}
              alt={brandName}
              className="h-6 w-6 shrink-0 rounded-md object-cover"
            />
          ) : (
            <Image
              src="/logo.png"
              alt=""
              width={24}
              height={24}
              className="shrink-0"
            />
          )}
          <span className="text-sm font-semibold text-white">{brandName}</span>
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

      {/* Body */}
      <div className="flex flex-1 lg:overflow-hidden flex-col lg:flex-row lg:max-h-[calc(100vh-100px)]">
        <main className="flex-1 overflow-y-auto p-4 md:p-4">
          <div className="flex items-center gap-2.5 mb-5">
            <span
              className="rounded-md border px-2 py-0.5 text-xs font-mono"
              style={{
                color: primaryColor,
                backgroundColor: hexToRgba(primaryColor, 0.12),
                borderColor: hexToRgba(primaryColor, 0.3),
              }}
            >
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
                openPinCommentId={openPinCommentId}
                onPinClick={(id) => {
                  setShowChat(true);
                  setOpenPinCommentId(id);
                }}
                primaryColor={primaryColor}
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

        {/* Sidebar */}
        <aside
          className={cn(
            "w-full lg:w-80 shrink-0 border-t lg:border-t-0 lg:border-l border-white/[0.06]",
            "bg-[#080814] flex flex-col lg:h-[calc(100vh-112px)] overflow-y-auto",
          )}
        >
          {showChat ? (
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between px-2 py-2 border-b border-white/[0.06]">
                <Button
                  onClick={() => setShowChat(false)}
                  variant="outline"
                  className="p-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-base font-semibold text-white">
                  Conversa
                </span>
                <span className="w-12" />
              </div>

              <div className="flex-1 min-h-0 flex flex-col p-1">
                <CommentSystem
                  token={token}
                  deliveryId={deliveryId}
                  initialComments={comments}
                  pinnedComments={pinnedCommentNumbers}
                  mode={isFreelancerPreview ? "freelancer" : "client"}
                  freelancerName={freelancerName ?? undefined}
                  onCommentsChange={setComments}
                  onOpenPin={(id) => setOpenPinCommentId(id)}
                  openCommentId={openPinCommentId}
                  scrollable
                  primaryColor={primaryColor}
                  subscription={subscription}
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-6 p-5 h-full">
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

              {isFreelancerPreview && (
                <div
                  className="flex items-center gap-2.5 rounded-xl border px-3.5 py-3"
                  style={{
                    backgroundColor: hexToRgba(primaryColor, 0.1),
                    borderColor: hexToRgba(primaryColor, 0.24),
                  }}
                >
                  <div
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: primaryColor }}
                  />
                  <p
                    className="text-xs leading-snug"
                    style={{ color: hexToRgba(primaryColor, 0.88) }}
                  >
                    <span
                      className="font-semibold"
                      style={{ color: primaryColor }}
                    >
                      Modo de visualização
                    </span>
                    {" — "} o cliente vê este link; você pode responder os
                    comentários abaixo.
                  </p>
                </div>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowChat(true)}
                style={{
                  borderColor: hexToRgba(primaryColor, 0.45),
                  color: primaryColor,
                  backgroundColor: hexToRgba(primaryColor, 0.06),
                }}
              >
                Abrir conversa
              </Button>

              {allDeliveries.length > 1 && (
                <>
                  <hr className="border-white/[0.06]" />
                  <VersionSwitcher
                    deliveries={allDeliveries}
                    currentToken={token}
                    slug={reviewPathSlug}
                    preview={isFreelancerPreview}
                  />
                </>
              )}
            </div>
          )}
        </aside>
      </div>

      {/* Viral footer */}
      <footer className="shrink-0 py-2.5 text-center border-t border-white/[0.04]">
        <p className="text-[11px] text-white/20">
          Revisão via{" "}
          <a
            href="https://approveflow.app"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors"
            style={{ color: hexToRgba(secondaryColor, 0.72) }}
          >
            {brandName}
          </a>
        </p>
      </footer>
    </div>
  );
}
