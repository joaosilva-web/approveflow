"use client";

import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

type ButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "outline"
  | "danger"
  | "success";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  href?: string;
}

// ─── Variant & size maps ──────────────────────────────────────────────────────

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-gradient-to-r from-violet-600 to-indigo-600 text-white " +
    "hover:from-violet-500 hover:to-indigo-500 " +
    "shadow-lg shadow-violet-900/30 border border-violet-500/20",
  secondary:
    "bg-white/[0.06] text-white/90 border border-white/10 " +
    "hover:bg-white/[0.10] hover:border-white/20",
  ghost:
    "text-white/70 hover:text-white hover:bg-white/[0.06] border border-transparent",
  outline:
    "border border-violet-500/40 text-violet-400 " +
    "hover:border-violet-400/70 hover:bg-violet-500/[0.08] hover:text-violet-300",
  danger:
    "bg-red-500/10 text-red-400 border border-red-500/30 " +
    "hover:bg-red-500/20 hover:border-red-400/60",
  success:
    "bg-gradient-to-r from-emerald-600 to-teal-600 text-white " +
    "hover:from-emerald-500 hover:to-teal-500 " +
    "shadow-lg shadow-emerald-900/30 border border-emerald-500/20",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-8 px-3.5 text-xs rounded-lg gap-1.5",
  md: "h-11 px-3 text-sm rounded-xl gap-2",
  lg: "h-12 px-7 text-base rounded-xl gap-2.5",
};

const spinnerSizes: Record<ButtonSize, number> = {
  sm: 14,
  md: 15,
  lg: 17,
};

// ─── Spinner ──────────────────────────────────────────────────────────────────

function Spinner({ size }: { size: number }) {
  return (
    <svg
      className="animate-spin"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle
        className="opacity-20"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-80"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading = false,
      fullWidth = false,
      leftIcon,
      rightIcon,
      className,
      children,
      disabled,
      href,
      ...props
    },
    ref,
  ) => {
    const classes = cn(
      "inline-flex items-center justify-center font-medium",
      "transition-all duration-200 cursor-pointer select-none",
      "focus-visible:outline-none focus-visible:ring-2",
      "focus-visible:ring-violet-500/60 focus-visible:ring-offset-2",
      "focus-visible:ring-offset-[#06060f]",
      "disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none",
      "active:scale-[0.97]",
      variantClasses[variant],
      sizeClasses[size],
      fullWidth && "w-full",
      className,
    );

    const inner = (
      <>
        {loading ? (
          <Spinner size={spinnerSizes[size]} />
        ) : (
          leftIcon && <span className="shrink-0">{leftIcon}</span>
        )}
        {children}
        {!loading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </>
    );

    if (href) {
      return (
        <Link href={href} className={classes}>
          {inner}
        </Link>
      );
    }

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={classes}
        {...props}
      >
        {inner}
      </button>
    );
  },
);

Button.displayName = "Button";

export { Button };
export type { ButtonProps, ButtonVariant, ButtonSize };
