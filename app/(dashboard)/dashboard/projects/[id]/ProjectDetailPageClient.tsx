"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { supabaseClient } from "@/lib/supabase/browser";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import NewDeliveryModal from "@/features/deliveries/components/NewDeliveryModal";
import type { BadgeVariant } from "@/components/ui/Badge";
import { Copy } from "lucide-react";
import { getPublicReviewPath } from "@/lib/freelancer-branding-shared";

// ─── Types ────────────────────────────────────────────────────────────────────

interface DeliveryRow {
  id: string;
  versionNumber: number;
  label: string | null;
  fileName: string;
  fileSize: number;
  mimeType: string;
  status: "PENDING" | "APPROVED" | "CHANGES_REQUESTED";
  reviewToken: string;
  commentCount: number;
  viewCount: number;
  createdAt: Date;
  lastViewedAt: Date | null;
}

interface ProjectDetailClientProps {
  projectId: string;
  projectName: string;
  clientName: string;
  clientEmail: string | null | undefined;
  deliveries: DeliveryRow[];
  freelancerSlug?: string | null;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const statusVariant: Record<string, BadgeVariant> = {
  PENDING: "warning",
  APPROVED: "success",
  CHANGES_REQUESTED: "error",
};

const statusLabel: Record<string, string> = {
  PENDING: "Pending",
  APPROVED: "Approved",
  CHANGES_REQUESTED: "Changes requested",
};

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function timeAgo(date: Date): string {
  const secs = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (secs < 60) return "just now";
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

// ─── Share buttons ────────────────────────────────────────────────────────────

function ShareButtons({
  token,
  slug,
}: {
  token: string;
  slug?: string | null;
}) {
  const [copiedLink, setCopiedLink] = useState(false);

  const copyLink = () => {
    const url = `${window.location.origin}${getPublicReviewPath(token, slug)}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    });
  };

  return (
    <div className="flex items-center gap-1">
      <Button
        onClick={copyLink}
        variant={copiedLink ? "success" : "outline"}
        size="sm"
        aria-label="Copy review link"
      >
        {copiedLink ? (
          <>
            <svg
              width="10"
              height="10"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Copied!
          </>
        ) : (
          <>
            <Copy className="w-4 h-4" /> Client link
          </>
        )}
      </Button>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ProjectDetailClient({
  projectId,
  projectName,
  clientName,
  clientEmail,
  deliveries: initialDeliveries,
  freelancerSlug,
}: ProjectDetailClientProps) {
  const [liveDeliveries, setLiveDeliveries] = useState(initialDeliveries);
  const [uploadOpen, setUploadOpen] = useState(false);

  // ─── Supabase Realtime + refetch helper ────────────────────────────────────
  const refetch = React.useCallback(async () => {
    try {
      const res = await fetch(`/api/projects/${projectId}/deliveries`);
      if (!res.ok) return;
      const data: DeliveryRow[] = await res.json();
      setLiveDeliveries(
        data.map((d) => ({
          ...d,
          createdAt: new Date(d.createdAt),
          lastViewedAt: d.lastViewedAt ? new Date(d.lastViewedAt) : null,
        })),
      );
    } catch {
      // silently ignore
    }
  }, [projectId]);

  useEffect(() => {
    const channel = supabaseClient
      .channel(`project-detail-${projectId}`)
      // Status changes live on Delivery rows
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "Delivery" },
        (payload) => {
          const row = (
            payload.eventType === "DELETE" ? payload.old : payload.new
          ) as {
            projectId: string;
          };
          if (row.projectId === projectId) refetch();
        },
      )
      // View inserts → viewCount + lastViewedAt
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "View" },
        (payload) => {
          const { deliveryId } = payload.new as { deliveryId: string };
          const belongs = liveDeliveries.some((d) => d.id === deliveryId);
          if (belongs) refetch();
        },
      )
      // Comment inserts/deletes → commentCount
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "Comment" },
        (payload) => {
          const { deliveryId } = payload.new as { deliveryId: string };
          const belongs = liveDeliveries.some((d) => d.id === deliveryId);
          if (belongs) refetch();
        },
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "Comment" },
        (payload) => {
          const { deliveryId } = payload.old as { deliveryId: string };
          const belongs = liveDeliveries.some((d) => d.id === deliveryId);
          if (belongs) refetch();
        },
      )
      .subscribe();

    return () => {
      supabaseClient.removeChannel(channel);
    };
  }, [projectId, refetch, liveDeliveries]);

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 flex flex-col gap-8">
      {/* Back + header */}
      <div className="flex flex-col gap-4">
        <Link
          href="/dashboard"
          className="flex items-center gap-1.5 text-xs text-white/35 hover:text-white/70 transition-colors w-fit"
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
          All projects
        </Link>

        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">{projectName}</h1>
            <p className="text-sm text-white/40 mt-1">
              Client: {clientName}
              {clientEmail && (
                <span className="text-white/25"> · {clientEmail}</span>
              )}
            </p>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setUploadOpen(true)}
            leftIcon={
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <polyline points="16 16 12 12 8 16" />
                <line x1="12" y1="12" x2="12" y2="21" />
                <path d="M20.39 18.39A5 5 0 0018 9h-1.26A8 8 0 103 16.3" />
              </svg>
            }
          >
            Upload version
          </Button>
        </div>
      </div>

      {/* Deliveries */}
      {liveDeliveries.length > 0 ? (
        <div className="flex flex-col gap-3">
          <h2 className="text-xs font-semibold text-white/40 uppercase tracking-wider">
            {liveDeliveries.length} version
            {liveDeliveries.length !== 1 ? "s" : ""}
          </h2>
          <div className="flex flex-col gap-2">
            {liveDeliveries.map((d) => (
              <div
                key={d.id}
                className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:border-white/[0.10] transition-colors"
              >
                {/* Left: version info */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="shrink-0 font-mono text-xs text-violet-400 bg-violet-500/[0.10] border border-violet-500/25 px-2 py-0.5 rounded-md">
                    v{d.versionNumber}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white/80 truncate">
                      {d.label ?? d.fileName}
                    </p>
                    {d.label && (
                      <p className="text-xs text-white/35 truncate">
                        {d.fileName}
                      </p>
                    )}
                  </div>
                </div>

                {/* Meta */}
                <div className="flex items-center gap-3 shrink-0 flex-wrap">
                  <span className="text-xs text-white/30">
                    {formatSize(d.fileSize)}
                  </span>

                  <div className="flex items-center gap-1.5 text-xs text-white/30">
                    <svg
                      width="10"
                      height="10"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                    </svg>
                    {d.commentCount}
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-white/30">
                    <svg
                      width="10"
                      height="10"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                    {d.viewCount}
                  </div>

                  <Badge variant={statusVariant[d.status]} size="sm" dot>
                    {statusLabel[d.status]}
                  </Badge>

                  <span className="text-[10px] text-white/25">
                    {timeAgo(d.createdAt)}
                  </span>

                  {d.lastViewedAt ? (
                    <span className="flex items-center gap-1 text-[10px] text-violet-400/70">
                      👀 {timeAgo(d.lastViewedAt)}
                    </span>
                  ) : (
                    <span className="text-[10px] text-white/20 italic">
                      Not viewed
                    </span>
                  )}

                  <ShareButtons token={d.reviewToken} slug={freelancerSlug} />

                  <Link
                    href={`${getPublicReviewPath(d.reviewToken, freelancerSlug)}?preview=1`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-violet-400/70 hover:text-violet-400 transition-colors"
                  >
                    Preview ↗
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
          <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/[0.07] flex items-center justify-center">
            <svg
              width="26"
              height="26"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-white/30"
              aria-hidden="true"
            >
              <polyline points="16 16 12 12 8 16" />
              <line x1="12" y1="12" x2="12" y2="21" />
              <path d="M20.39 18.39A5 5 0 0018 9h-1.26A8 8 0 103 16.3" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-white/60">
              No versions yet
            </p>
            <p className="text-xs text-white/30 mt-1">
              Upload your first file to generate a review link
            </p>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setUploadOpen(true)}
          >
            Upload version
          </Button>
        </div>
      )}

      <NewDeliveryModal
        projectId={projectId}
        freelancerSlug={freelancerSlug}
        isOpen={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onSuccess={() => {
          refetch();
        }}
      />
    </div>
  );
}


