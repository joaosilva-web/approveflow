import React from "react";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

type BadgeVariant =
  | "default"
  | "brand"
  | "success"
  | "warning"
  | "error"
  | "info";

type BadgeSize = "sm" | "md";

interface BadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  /** Renders a small colored dot on the left */
  dot?: boolean;
  children: React.ReactNode;
  className?: string;
}

// ─── Variant maps ─────────────────────────────────────────────────────────────

const variantClasses: Record<BadgeVariant, string> = {
  default: "bg-white/[0.08] text-white/70 border-white/[0.10]",
  brand: "bg-violet-500/[0.12] text-violet-300 border-violet-500/25",
  success: "bg-emerald-500/[0.12] text-emerald-400 border-emerald-500/25",
  warning: "bg-amber-500/[0.12] text-amber-400 border-amber-500/25",
  error: "bg-red-500/[0.12] text-red-400 border-red-500/25",
  info: "bg-blue-500/[0.12] text-blue-400 border-blue-500/25",
};

const dotClasses: Record<BadgeVariant, string> = {
  default: "bg-white/50",
  brand: "bg-violet-400",
  success: "bg-emerald-400",
  warning: "bg-amber-400",
  error: "bg-red-400",
  info: "bg-blue-400",
};

const sizeClasses: Record<BadgeSize, string> = {
  sm: "px-2 py-0.5 text-[11px] rounded-md",
  md: "px-2.5 py-1 text-xs rounded-lg",
};

// ─── Component ────────────────────────────────────────────────────────────────

function Badge({
  variant = "default",
  size = "md",
  dot = false,
  children,
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 font-medium border",
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
    >
      {dot && (
        <span
          className={cn(
            "w-1.5 h-1.5 rounded-full shrink-0",
            dotClasses[variant],
          )}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
}

export { Badge };
export type { BadgeProps, BadgeVariant, BadgeSize };
