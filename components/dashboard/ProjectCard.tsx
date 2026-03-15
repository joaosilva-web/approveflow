import React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import type { BadgeVariant } from "@/components/ui/Badge";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ProjectCardProps {
  id: string;
  name: string;
  clientName: string;
  clientEmail?: string | null;
  totalDeliveries: number;
  latestStatus: "PENDING" | "APPROVED" | "CHANGES_REQUESTED" | null;
  updatedAt: Date;
  lastViewedAt?: Date | null;
}

// ─── Status helpers ───────────────────────────────────────────────────────────

const statusLabel: Record<string, string> = {
  PENDING: "Pending",
  APPROVED: "Approved",
  CHANGES_REQUESTED: "Changes requested",
};

const statusVariant: Record<string, BadgeVariant> = {
  PENDING: "warning",
  APPROVED: "success",
  CHANGES_REQUESTED: "error",
};

function timeAgo(date: Date): string {
  const secs = Math.floor((Date.now() - date.getTime()) / 1000);
  if (secs < 60) return "just now";
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ProjectCard({
  id,
  name,
  clientName,
  totalDeliveries,
  latestStatus,
  updatedAt,
  lastViewedAt,
}: ProjectCardProps) {
  const variant = latestStatus ? statusVariant[latestStatus] : "default";
  const label = latestStatus ? statusLabel[latestStatus] : "No deliveries";

  return (
    <Link
      href={`/dashboard/projects/${id}`}
      className={cn(
        "group flex flex-col gap-4 p-5 rounded-2xl",
        "bg-[#0d0d1e] border border-white/[0.06]",
        "hover:border-violet-500/25 hover:bg-[#111122]",
        "transition-all duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60",
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-white/90 truncate group-hover:text-white transition-colors">
            {name}
          </h3>
          <p className="text-xs text-white/45 mt-0.5 truncate">
            Client: {clientName}
          </p>
        </div>
        <Badge variant={variant} dot size="sm">
          {label}
        </Badge>
      </div>

      {/* Stats row */}
      <div className="flex flex-col gap-1.5 pt-3 border-t border-white/[0.05]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-white/35">
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z" />
              <polyline points="13 2 13 9 20 9" />
            </svg>
            {totalDeliveries} version{totalDeliveries !== 1 ? "s" : ""}
          </div>
          <span className="text-[10px] text-white/25">{timeAgo(updatedAt)}</span>
        </div>
        {lastViewedAt ? (
          <span className="text-[10px] text-violet-400/60">
            👀 Client viewed {timeAgo(lastViewedAt)}
          </span>
        ) : (
          <span className="text-[10px] text-white/20">👀 Not yet viewed</span>
        )}
      </div>
    </Link>
  );
}
