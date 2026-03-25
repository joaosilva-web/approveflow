"use client";

import React, { useId } from "react";
import { cn } from "@/lib/utils";
import { hexToRgba } from "@/lib/freelancer-branding-shared";

// ─── Types ────────────────────────────────────────────────────────────────────

type InputSize = "sm" | "md" | "lg";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  inputSize?: InputSize;
  leftElement?: React.ReactNode;
  rightElement?: React.ReactNode;
  fullWidth?: boolean;
  brandColor?: string;
}

// ─── Size map ─────────────────────────────────────────────────────────────────

const sizeClasses: Record<InputSize, string> = {
  sm: "h-8 px-3 text-sm rounded-full",
  md: "h-10 px-4 text-sm rounded-full",
  lg: "h-12 px-4 text-base rounded-full",
};

const paddingLeft: Record<InputSize, string> = {
  sm: "pl-8",
  md: "pl-10",
  lg: "pl-11",
};

const paddingRight: Record<InputSize, string> = {
  sm: "pr-8",
  md: "pr-10",
  lg: "pr-11",
};

// ─── Component ────────────────────────────────────────────────────────────────

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      hint,
      error,
      inputSize = "md",
      leftElement,
      rightElement,
      fullWidth = false,
      className,
      id,
      required,
      brandColor,
      ...props
    },
    ref,
  ) => {
    const generatedId = useId();
    const inputId = id ?? `input-${generatedId}`;

    return (
      <div className={cn("flex flex-col gap-1.5", fullWidth && "w-full")}>
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-white/80 select-none"
          >
            {label}
            {required && (
              <span className="ml-1 text-red-400" aria-hidden="true">
                *
              </span>
            )}
          </label>
        )}

        <div className="relative flex items-center">
          {leftElement && (
            <div
              className="absolute left-3 flex items-center text-white/40 pointer-events-none z-10"
              aria-hidden="true"
            >
              {leftElement}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            required={required}
            className={cn(
              "w-full bg-white/[0.04] border text-white/90 placeholder:text-white/30",
              "transition-all duration-200 outline-none",
              "focus:bg-white/[0.06] focus:ring-2",
              error
                ? "border-red-500/50 focus:border-red-400/70 focus:ring-red-500/15"
                : "border-white/[0.08] focus:border-violet-500/50 focus:ring-violet-500/10",
              sizeClasses[inputSize],
              leftElement ? paddingLeft[inputSize] : undefined,
              rightElement ? paddingRight[inputSize] : undefined,
              className,
            )}
            style={
              brandColor
                ? { borderColor: hexToRgba(brandColor, 0.18) }
                : undefined
            }
            aria-describedby={
              error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined
            }
            aria-invalid={error ? "true" : undefined}
            {...props}
          />

          {rightElement && (
            <div
              className="absolute right-3 flex items-center text-white/40"
              aria-hidden="true"
            >
              {rightElement}
            </div>
          )}
        </div>

        {error && (
          <p
            id={`${inputId}-error`}
            className="text-xs text-red-400"
            role="alert"
          >
            {error}
          </p>
        )}
        {!error && hint && (
          <p id={`${inputId}-hint`} className="text-xs text-white/40">
            {hint}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";

export { Input };
export type { InputProps, InputSize };
