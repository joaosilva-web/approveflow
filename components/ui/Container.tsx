import React from "react";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

type ContainerSize = "sm" | "md" | "lg" | "xl" | "full";

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: ContainerSize;
  /** Centers horizontally via `mx-auto` (default: true) */
  centered?: boolean;
}

// ─── Size map ─────────────────────────────────────────────────────────────────

const sizeClasses: Record<ContainerSize, string> = {
  sm: "max-w-2xl",
  md: "max-w-4xl",
  lg: "max-w-5xl",
  xl: "max-w-7xl",
  full: "max-w-full",
};

// ─── Component ────────────────────────────────────────────────────────────────

function Container({
  size = "xl",
  centered = true,
  className,
  children,
  ...props
}: ContainerProps) {
  return (
    <div
      className={cn(
        "w-full px-4 sm:px-6 lg:px-8",
        sizeClasses[size],
        centered && "mx-auto",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export { Container };
export type { ContainerProps, ContainerSize };
