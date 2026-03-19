"use client";

import React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import type { BadgeVariant } from "@/components/ui/Badge";

// ─── Types ────────────────────────────────────────────────────────────────────

interface DeliverySummary {
  id: string;
  reviewToken: string;
  versionNumber: number;
  label: string | null;
  status: "PENDING" | "APPROVED" | "CHANGES_REQUESTED";
  createdAt: string;
}

interface VersionSwitcherProps {
  deliveries: DeliverySummary[];
  currentToken: string;
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
  CHANGES_REQUESTED: "Changes",
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function VersionSwitcher({
  deliveries,
  currentToken,
}: VersionSwitcherProps) {
  if (deliveries.length <= 1) return null;

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs text-white/50 uppercase tracking-wider font-semibold">
        Version history
      </p>
      <ul className="flex flex-col gap-1 list-none" role="list">
        {deliveries
          .slice()
          .sort((a, b) => b.versionNumber - a.versionNumber)
          .map((d) => {
            const isCurrent = d.reviewToken === currentToken;
            return (
              <li key={d.id}>
                <Link
                  href={`/review/${d.reviewToken}`}
                  className={cn(
                    "flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl text-sm",
                    "transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60",
                    isCurrent
                      ? "bg-violet-500/[0.10] border border-violet-500/20 pointer-events-none"
                      : "hover:bg-white/[0.05] border border-transparent text-white/60 hover:text-white/80",
                  )}
                  aria-current={isCurrent ? "page" : undefined}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className={cn(
                        "text-xs font-mono font-semibold shrink-0",
                        isCurrent ? "text-violet-400" : "text-white/40",
                      )}
                    >
                      v{d.versionNumber}
                    </span>
                    <span className="truncate text-xs">
                      {d.label ?? `Version ${d.versionNumber}`}
                    </span>
                  </div>
                  <Badge variant={statusVariant[d.status]} size="sm" dot>
                    {statusLabel[d.status]}
                  </Badge>
                </Link>
              </li>
            );
          })}
      </ul>
    </div>
  );
}
